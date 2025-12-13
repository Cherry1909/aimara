from fastapi import APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse
from app.services.qr_generator import qr_generator
from app.services.firebase_service import firebase_service

router = APIRouter()

@router.get("/{story_id}")
async def get_qr_code(story_id: str, size: int = 512):
    """
    Generar o obtener código QR para un relato

    Si ya existe, retorna la URL existente.
    Si no existe, lo genera y lo sube a Firebase Storage.
    """
    try:
        # Verificar que el story existe
        story = await firebase_service.get_story(story_id)
        if not story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Story not found"
            )

        # Si ya tiene QR, retornarlo
        if story.get('qrCodeUrl'):
            return RedirectResponse(url=story['qrCodeUrl'])

        # Generar nuevo QR
        qr_url = await qr_generator.generate_qr_code(
            story_id=story_id,
            size=size
        )

        # Actualizar story con URL del QR
        await firebase_service.update_story(story_id, {
            'qrCodeUrl': qr_url
        })

        return RedirectResponse(url=qr_url)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate QR code: {str(e)}"
        )

@router.get("/{story_id}/print")
async def get_printable_qr(story_id: str):
    """
    Obtener versión imprimible del código QR

    Incluye el QR con información del relato (título, narrador, comunidad).
    """
    try:
        # Verificar que el story existe
        story = await firebase_service.get_story(story_id)
        if not story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Story not found"
            )

        # Si ya tiene QR imprimible, retornarlo
        if story.get('printableQrUrl'):
            return RedirectResponse(url=story['printableQrUrl'])

        # Generar nuevo QR imprimible
        printable_qr_url = await qr_generator.generate_printable_qr(
            story_id=story_id,
            story_title=story.get('title', 'Untitled Story'),
            narrator_name=story['narrator']['name'],
            community=story['narrator']['community']
        )

        # Actualizar story con URL del QR imprimible
        await firebase_service.update_story(story_id, {
            'printableQrUrl': printable_qr_url
        })

        return RedirectResponse(url=printable_qr_url)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate printable QR code: {str(e)}"
        )

@router.post("/{story_id}/regenerate")
async def regenerate_qr(story_id: str):
    """
    Regenerar códigos QR para un relato

    Útil si se cambió el título o información del relato.
    """
    try:
        # Verificar que el story existe
        story = await firebase_service.get_story(story_id)
        if not story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Story not found"
            )

        # Generar nuevo QR normal
        qr_url = await qr_generator.generate_qr_code(story_id=story_id)

        # Generar nuevo QR imprimible
        printable_qr_url = await qr_generator.generate_printable_qr(
            story_id=story_id,
            story_title=story.get('title', 'Untitled Story'),
            narrator_name=story['narrator']['name'],
            community=story['narrator']['community']
        )

        # Actualizar story
        await firebase_service.update_story(story_id, {
            'qrCodeUrl': qr_url,
            'printableQrUrl': printable_qr_url
        })

        return {
            "message": "QR codes regenerated successfully",
            "qr_url": qr_url,
            "printable_qr_url": printable_qr_url
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to regenerate QR codes: {str(e)}"
        )
