from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.story import StoryCategory, CulturalSignificance

class GrokTranscriptionRequest(BaseModel):
    audio_url: str
    language: str = "ay"  # Código ISO para aymara

class GrokTranscriptionResponse(BaseModel):
    text: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    language: str
    duration: Optional[float] = None

class GrokAnalysisRequest(BaseModel):
    transcription: str
    language: str = "aymara"

class GrokAnalysisResponse(BaseModel):
    keywords: List[str] = Field(..., description="Palabras clave culturales")
    category: StoryCategory
    cultural_significance: CulturalSignificance
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    spanish_translation: Optional[str] = None

class AudioProcessRequest(BaseModel):
    story_id: str
    audio_url: str

class AudioProcessResponse(BaseModel):
    job_id: str
    status: str
    message: str

class AudioProcessStatus(BaseModel):
    job_id: str
    story_id: str
    status: str  # pending, processing, completed, failed
    progress: int = Field(..., ge=0, le=100)
    result: Optional[dict] = None
    error: Optional[str] = None
