from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import api_router
from app.core.config import settings
from pathlib import Path

app = FastAPI(
    title="Historias Vivientes Aymara API",
    description="API para preservar la cultura aymara mediante relatos orales georreferenciados",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear directorio de almacenamiento si no existe
storage_path = Path("storage")
storage_path.mkdir(exist_ok=True)

# Montar directorio de archivos estáticos para servir audios y QR
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

# Incluir routers de API
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Historias Vivientes Aymara API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
