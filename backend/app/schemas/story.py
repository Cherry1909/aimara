from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class Language(str, Enum):
    AYMARA = "aymara"
    SPANISH = "spanish"
    MIXED = "mixed"

class StoryCategory(str, Enum):
    RITUAL = "ritual"
    LEGEND = "legend"
    PERSONAL_STORY = "personal_story"
    HISTORICAL = "historical"
    MYTH = "myth"
    OTHER = "other"

class StoryStatus(str, Enum):
    DRAFT = "draft"
    PROCESSING = "processing"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class CulturalSignificance(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

# Schemas para Narrator
class NarratorBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    age: Optional[int] = Field(None, ge=0, le=120)
    community: str = Field(..., min_length=2, max_length=200)
    language: Language
    consentGiven: bool = Field(..., description="Consentimiento explícito para grabación")

class NarratorCreate(NarratorBase):
    pass

class Narrator(NarratorBase):
    class Config:
        from_attributes = True

# Schemas para Location
class LocationBase(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    placeName: Optional[str] = Field(None, max_length=500)
    geohash: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    class Config:
        from_attributes = True

# Schemas para Transcription
class TranscriptionBase(BaseModel):
    aymara: str
    spanish: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)

class Transcription(TranscriptionBase):
    class Config:
        from_attributes = True

# Schemas para Story
class StoryBase(BaseModel):
    audioUrl: str
    audioDuration: int = Field(..., description="Duración en segundos")
    audioSize: Optional[int] = Field(None, description="Tamaño en bytes")
    audioFormat: Optional[str] = Field("webm", max_length=10)

class StoryCreate(StoryBase):
    narrator: NarratorCreate
    location: LocationCreate

class StoryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[List[str]] = None
    category: Optional[StoryCategory] = None
    status: Optional[StoryStatus] = None

class Story(StoryBase):
    id: str
    narrator: Narrator
    location: Location
    transcription: Optional[Transcription] = None
    keywords: List[str] = []
    category: Optional[StoryCategory] = None
    culturalSignificance: Optional[CulturalSignificance] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: StoryStatus = StoryStatus.DRAFT
    publicUrl: Optional[str] = None
    qrCodeUrl: Optional[str] = None
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    publishedAt: Optional[datetime] = None
    views: int = 0
    featured: bool = False

    class Config:
        from_attributes = True

# Schema para respuesta paginada
class StoryList(BaseModel):
    stories: List[Story]
    total: int
    page: int
    pageSize: int
    hasMore: bool

# Schema para búsqueda cercana
class NearbySearchParams(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    radius_km: float = Field(10.0, ge=0.1, le=1000, description="Radio de búsqueda en kilómetros")
    limit: int = Field(20, ge=1, le=100)
