from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
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
    FIREBASE_CREDENTIALS_PATH: str = Field(
        default_factory=lambda: os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccount.json")
    )
    FIREBASE_STORAGE_BUCKET: str = Field(
        default_factory=lambda: os.getenv("FIREBASE_STORAGE_BUCKET", "")
    )

    # Groq API
    GROQ_API_KEY: str = Field(
        default_factory=lambda: os.getenv("GROQ_API_KEY", "")
    )

    # URLs
    BASE_URL: str = Field(
        default_factory=lambda: os.getenv("BASE_URL", "http://localhost:5173")
    )

    # Configuraciones de procesamiento
    MAX_AUDIO_SIZE_MB: int = 50
    MAX_AUDIO_DURATION_MINUTES: int = 10

    @field_validator('GROQ_API_KEY')
    @classmethod
    def validate_groq_api_key(cls, v: str) -> str:
        if not v or v == "":
            raise ValueError(
                "GROQ_API_KEY es requerida. Por favor configúrala en el archivo .env"
            )
        if not v.startswith("gsk_"):
            raise ValueError(
                "GROQ_API_KEY debe comenzar con 'gsk_'. Verifica que sea una API key válida de Groq"
            )
        return v

    @field_validator('FIREBASE_STORAGE_BUCKET')
    @classmethod
    def validate_firebase_bucket(cls, v: str) -> str:
        if not v or v == "":
            raise ValueError(
                "FIREBASE_STORAGE_BUCKET es requerida. Por favor configúrala en el archivo .env"
            )
        return v

    @field_validator('FIREBASE_CREDENTIALS_PATH')
    @classmethod
    def validate_credentials_path(cls, v: str) -> str:
        if not v:
            raise ValueError(
                "FIREBASE_CREDENTIALS_PATH es requerida. Por favor configúrala en el archivo .env"
            )
        # Verificar que el archivo existe
        if not os.path.exists(v):
            raise ValueError(
                f"El archivo de credenciales de Firebase no existe en la ruta: {v}"
            )
        return v

settings = Settings()
