from fastapi import APIRouter
from app.api.v1.endpoints import stories, audio, qr, upload

api_router = APIRouter()

api_router.include_router(stories.router, prefix="/stories", tags=["stories"])
api_router.include_router(audio.router, prefix="/audio", tags=["audio"])
api_router.include_router(qr.router, prefix="/qr", tags=["qr"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
