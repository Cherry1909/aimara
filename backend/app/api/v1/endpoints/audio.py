from fastapi import APIRouter, HTTPException, BackgroundTasks, status
from app.schemas.groq import AudioProcessRequest, AudioProcessResponse, AudioProcessStatus
from app.services.groq_service import groq_service
from app.services.firebase_service import firebase_service
from app.services.qr_generator import qr_generator
from app.schemas.story import StoryStatus
from app.core.config import settings
import uuid
from typing import Dict
from datetime import datetime

router = APIRouter()

# In-memory job storage (en producción usar Redis o Firestore)
processing_jobs: Dict[str, AudioProcessStatus] = {}

async def process_audio_background(job_id: str, story_id: str, audio_url: str, language: str = "ay"):
    """
    Procesar audio en background

    1. Transcribir con Groq
    2. Analizar contenido
    3. Actualizar Firestore
    4. Generar QR
    5. Cambiar status a published
    """
    try:
        # Actualizar status a processing
        processing_jobs[job_id].status = "processing"
        processing_jobs[job_id].progress = 10

        # Convertir URL relativa a URL completa si es necesario
        if audio_url.startswith('/'):
            # URL relativa, agregar BASE_URL
            full_audio_url = f"{settings.BASE_URL}{audio_url}"
        elif not audio_url.startswith('http://') and not audio_url.startswith('https://'):
            # No tiene protocolo, agregar BASE_URL
            full_audio_url = f"{settings.BASE_URL}/{audio_url}"
        else:
            # Ya es una URL completa
            full_audio_url = audio_url

        print(f"Audio URL convertida: {audio_url} -> {full_audio_url}")

        # Paso 1: Pipeline completo de Groq (transcripción + análisis)
        processing_jobs[job_id].progress = 30
        groq_result = await groq_service.full_pipeline(full_audio_url, language)

        processing_jobs[job_id].progress = 60

        # Paso 2: Actualizar story en Firestore
        update_data = {
            'transcription': groq_result['transcription'],
            'keywords': groq_result['keywords'],
            'category': groq_result['category'],
            'culturalSignificance': groq_result['culturalSignificance'],
            'title': groq_result['title'],
            'description': groq_result['description'],
            'status': StoryStatus.PUBLISHED.value,
            'publishedAt': datetime.utcnow()
        }

        await firebase_service.update_story(story_id, update_data)
        processing_jobs[job_id].progress = 80

        # Paso 3: Generar QR code
        story = await firebase_service.get_story(story_id)
        qr_url = await qr_generator.generate_qr_code(story_id)

        # Generar también versión imprimible
        printable_qr_url = await qr_generator.generate_printable_qr(
            story_id=story_id,
            story_title=story['title'],
            narrator_name=story['narrator']['name'],
            community=story['narrator']['community']
        )

        # Actualizar con URLs de QR
        await firebase_service.update_story(story_id, {
            'qrCodeUrl': qr_url,
            'printableQrUrl': printable_qr_url
        })

        processing_jobs[job_id].progress = 100
        processing_jobs[job_id].status = "completed"
        processing_jobs[job_id].result = {
            "story_id": story_id,
            "title": groq_result['title'],
            "category": groq_result['category'],
            "qr_url": qr_url,
            "public_url": story.get('publicUrl')
        }

    except Exception as e:
        processing_jobs[job_id].status = "failed"
        processing_jobs[job_id].error = str(e)
        print(f"Error procesando audio: {e}")

@router.post("/process", response_model=AudioProcessResponse, status_code=status.HTTP_202_ACCEPTED)
async def process_audio(
    request: AudioProcessRequest,
    background_tasks: BackgroundTasks
):
    """
    Procesar audio con Groq API (async)

    Inicia un job de procesamiento en background que:
    1. Transcribe el audio
    2. Analiza el contenido
    3. Actualiza el story en Firestore
    4. Genera el código QR

    Retorna un job_id para hacer tracking del progreso.
    """
    try:
        # Verificar que el story existe
        story = await firebase_service.get_story(request.story_id)
        if not story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Story not found"
            )

        # Crear job ID
        job_id = str(uuid.uuid4())

        # Inicializar job status
        processing_jobs[job_id] = AudioProcessStatus(
            job_id=job_id,
            story_id=request.story_id,
            status="pending",
            progress=0
        )

        # Lanzar tarea en background
        background_tasks.add_task(
            process_audio_background,
            job_id,
            request.story_id,
            request.audio_url,
            request.language
        )

        return AudioProcessResponse(
            job_id=job_id,
            status="pending",
            message="Audio processing started. Use /audio/status/{job_id} to check progress."
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start audio processing: {str(e)}"
        )

@router.get("/status/{job_id}", response_model=AudioProcessStatus)
async def get_processing_status(job_id: str):
    """
    Obtener el status de un job de procesamiento

    Retorna el progreso actual y el resultado si está completo.
    """
    if job_id not in processing_jobs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    return processing_jobs[job_id]

@router.delete("/status/{job_id}")
async def clear_job_status(job_id: str):
    """
    Limpiar un job completado o fallido de memoria

    Útil para liberar recursos.
    """
    if job_id not in processing_jobs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    del processing_jobs[job_id]

    return {
        "message": "Job status cleared successfully"
    }
