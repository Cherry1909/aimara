from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from app.schemas.story import (
    Story,
    StoryCreate,
    StoryUpdate,
    StoryList,
    NearbySearchParams,
    StoryStatus
)
from app.services.firebase_service import firebase_service
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_story(story_data: StoryCreate):
    """
    Crear un nuevo relato

    Crea un documento en Firestore con status 'draft'.
    El procesamiento de audio se hace en un endpoint separado.
    """
    try:
        # Convertir a dict
        story_dict = story_data.model_dump()

        # Agregar campos adicionales
        story_dict['status'] = StoryStatus.DRAFT.value
        story_dict['views'] = 0
        story_dict['featured'] = False
        story_dict['keywords'] = []

        # Crear en Firestore
        story_id = await firebase_service.create_story(story_dict)

        # Generar URL pública
        public_url = f"{firebase_service.bucket.name}/story/{story_id}"

        # Actualizar con URL pública
        await firebase_service.update_story(story_id, {
            'publicUrl': public_url
        })

        return {
            "id": story_id,
            "message": "Story created successfully",
            "status": "draft",
            "publicUrl": public_url
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create story: {str(e)}"
        )

@router.get("/{story_id}", response_model=Story)
async def get_story(story_id: str):
    """
    Obtener un relato específico por ID

    También incrementa el contador de vistas.
    """
    try:
        story = await firebase_service.get_story(story_id)

        if not story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Story not found"
            )

        # Incrementar vistas en background (no bloquear respuesta)
        await firebase_service.increment_views(story_id)

        return story

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get story: {str(e)}"
        )

@router.get("/", response_model=StoryList)
async def list_stories(
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(20, ge=1, le=100, description="Tamaño de página"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    category: Optional[str] = Query(None, description="Filtrar por categoría")
):
    """
    Listar relatos con paginación y filtros

    Por defecto solo muestra relatos publicados.
    """
    try:
        # Si no se especifica status, mostrar solo publicados
        if status is None:
            status = StoryStatus.PUBLISHED.value

        result = await firebase_service.list_stories(
            page=page,
            page_size=page_size,
            status=status,
            category=category
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list stories: {str(e)}"
        )

@router.get("/nearby/search")
async def find_nearby_stories(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(10.0, ge=0.1, le=1000),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Buscar relatos cercanos a una ubicación

    Usa geohashes para búsqueda eficiente.
    """
    try:
        stories = await firebase_service.find_nearby_stories(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            limit=limit
        )

        return {
            "stories": stories,
            "count": len(stories),
            "search_location": {
                "latitude": latitude,
                "longitude": longitude,
                "radius_km": radius_km
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search nearby stories: {str(e)}"
        )

@router.put("/{story_id}", response_model=dict)
async def update_story(story_id: str, update_data: StoryUpdate):
    """
    Actualizar metadata de un relato

    Solo permite actualizar ciertos campos.
    """
    try:
        # Verificar que existe
        story = await firebase_service.get_story(story_id)
        if not story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Story not found"
            )

        # Actualizar solo campos no None
        update_dict = update_data.model_dump(exclude_none=True)

        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        success = await firebase_service.update_story(story_id, update_dict)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update story"
            )

        return {
            "id": story_id,
            "message": "Story updated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update story: {str(e)}"
        )

@router.delete("/{story_id}", response_model=dict)
async def delete_story(story_id: str):
    """
    Eliminar un relato (soft delete)

    Cambia el status a 'archived' en lugar de eliminar físicamente.
    """
    try:
        story = await firebase_service.get_story(story_id)
        if not story:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Story not found"
            )

        success = await firebase_service.delete_story(story_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete story"
            )

        return {
            "id": story_id,
            "message": "Story archived successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete story: {str(e)}"
        )
