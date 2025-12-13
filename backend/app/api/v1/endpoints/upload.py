from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.services.local_storage import local_storage
from app.services.firebase_service import firebase_service
from datetime import datetime

router = APIRouter()

@router.post("/audio", status_code=status.HTTP_201_CREATED)
async def upload_audio(
    file: UploadFile = File(...),
    story_id: str = Form(None)
):
    """
    Subir archivo de audio al almacenamiento local del servidor

    Alternativa gratuita a Firebase Storage
    """
    try:
        # Validar tipo de archivo
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an audio file"
            )

        # Validar tamaño (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        file.file.seek(0, 2)  # Ir al final
        file_size = file.file.tell()
        file.file.seek(0)  # Volver al inicio

        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Max size: {max_size / 1024 / 1024}MB"
            )

        # Subir archivo
        result = await local_storage.upload_audio(file, story_id)

        return {
            "success": True,
            "message": "Audio uploaded successfully",
            "data": result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload audio: {str(e)}"
        )

@router.get("/audio/{filename}")
async def get_audio_info(filename: str):
    """
    Obtener información de un archivo de audio
    """
    try:
        file_path = local_storage.get_audio_path(filename)

        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio file not found"
            )

        return {
            "filename": filename,
            "url": local_storage.get_audio_url(filename),
            "size": file_path.stat().st_size,
            "exists": True
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get audio info: {str(e)}"
        )

@router.delete("/audio/{filename}")
async def delete_audio(filename: str):
    """
    Eliminar archivo de audio
    """
    try:
        success = local_storage.delete_audio(filename)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio file not found"
            )

        return {
            "success": True,
            "message": "Audio deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete audio: {str(e)}"
        )
