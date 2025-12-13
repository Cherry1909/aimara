from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        env_ignore_empty=True,
        extra='ignore'
    )

    # Aplicación
    PROJECT_NAME: str = "Historias Vivientes Aymara"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # CORS - No se lee desde env, solo código
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return [
            "http://localhost:5173",  # Vite dev
            "http://localhost:3000",
            "https://historias-aymara.vercel.app"
        ]

    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccount.json")
    FIREBASE_STORAGE_BUCKET: str = os.getenv("FIREBASE_STORAGE_BUCKET", "")

    # Groq API
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    # URLs
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:5173")

    # Configuraciones de procesamiento
    MAX_AUDIO_SIZE_MB: int = 50
    MAX_AUDIO_DURATION_MINUTES: int = 10

settings = Settings()
