import os
import uuid
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
from app.core.config import settings

class LocalStorageService:
    """
    Servicio de almacenamiento local para archivos de audio
    Alternativa gratuita a Firebase Storage
    """

    def __init__(self):
        # Directorio base para almacenamiento
        self.base_dir = Path("storage")
        self.audio_dir = self.base_dir / "audios"
        self.qr_dir = self.base_dir / "qr"

        # Crear directorios si no existen
        self.audio_dir.mkdir(parents=True, exist_ok=True)
        self.qr_dir.mkdir(parents=True, exist_ok=True)

    async def upload_audio(
        self,
        file: UploadFile,
        story_id: Optional[str] = None
    ) -> dict:
        """
        Subir archivo de audio al almacenamiento local

        Args:
            file: Archivo de audio (UploadFile de FastAPI)
            story_id: ID del relato (opcional)

        Returns:
            dict con información del archivo subido
        """
        try:
            # Generar nombre único
            if story_id:
                filename = f"{story_id}_{uuid.uuid4().hex[:8]}.webm"
            else:
                filename = f"{uuid.uuid4().hex}.webm"

            # Ruta completa
            file_path = self.audio_dir / filename

            # Guardar archivo
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Obtener tamaño
            file_size = os.path.getsize(file_path)

            # Generar URL pública (relativa al servidor)
            public_url = f"/storage/audios/{filename}"

            return {
                "filename": filename,
                "path": str(file_path),
                "url": public_url,
                "size": file_size,
                "content_type": file.content_type or "audio/webm"
            }

        except Exception as e:
            print(f"Error subiendo audio: {e}")
            raise Exception(f"Failed to upload audio: {str(e)}")

    async def upload_qr(
        self,
        image_bytes: bytes,
        story_id: str,
        filename_suffix: str = ""
    ) -> str:
        """
        Guardar código QR generado

        Args:
            image_bytes: Bytes de la imagen QR
            story_id: ID del relato
            filename_suffix: Sufijo para el nombre (ej: "_printable")

        Returns:
            URL pública del QR
        """
        try:
            # Nombre del archivo
            filename = f"{story_id}{filename_suffix}.png"
            file_path = self.qr_dir / filename

            # Guardar imagen
            with open(file_path, "wb") as f:
                f.write(image_bytes)

            # URL pública
            public_url = f"/storage/qr/{filename}"

            return public_url

        except Exception as e:
            print(f"Error guardando QR: {e}")
            raise Exception(f"Failed to save QR: {str(e)}")

    def get_audio_path(self, filename: str) -> Path:
        """Obtener ruta completa de un audio"""
        return self.audio_dir / filename

    def get_qr_path(self, filename: str) -> Path:
        """Obtener ruta completa de un QR"""
        return self.qr_dir / filename

    def delete_audio(self, filename: str) -> bool:
        """Eliminar archivo de audio"""
        try:
            file_path = self.audio_dir / filename
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            print(f"Error eliminando audio: {e}")
            return False

    def delete_qr(self, filename: str) -> bool:
        """Eliminar archivo QR"""
        try:
            file_path = self.qr_dir / filename
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            print(f"Error eliminando QR: {e}")
            return False

    def get_audio_url(self, filename: str) -> str:
        """Obtener URL pública de un audio"""
        return f"{settings.BASE_URL}/storage/audios/{filename}"

    def get_qr_url(self, filename: str) -> str:
        """Obtener URL pública de un QR"""
        return f"{settings.BASE_URL}/storage/qr/{filename}"

# Singleton instance
local_storage = LocalStorageService()
