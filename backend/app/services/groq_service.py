import httpx
from groq import Groq
from app.core.config import settings
from app.schemas.groq import (
    GroqTranscriptionResponse,
    GroqAnalysisResponse
)
from app.schemas.story import StoryCategory, CulturalSignificance
from typing import Optional, Dict, Any
import json

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = Groq(api_key=self.api_key)
        # Usar modelo Whisper de Groq para transcripción
        self.whisper_model = "whisper-large-v3"
        # Usar Llama para análisis (actualizado - el modelo 3.1-70b fue descontinuado)
        self.llama_model = "llama-3.3-70b-versatile"

    async def transcribe_audio(self, audio_url: str, language: str = "ay") -> GroqTranscriptionResponse:
        """
        Transcribir audio usando Groq Whisper API

        Args:
            audio_url: URL del audio en Firebase Storage
            language: Código de idioma (ay para aymara, es para español)

        Returns:
            GroqTranscriptionResponse con el texto transcrito
        """
        try:
            # Descargar el audio temporalmente
            async with httpx.AsyncClient(timeout=300.0) as client:
                audio_response = await client.get(audio_url)
                audio_response.raise_for_status()
                audio_bytes = audio_response.content

            # Mapear códigos de idioma
            # Nota: Aymara (ay) no está en los 99 idiomas oficiales de Whisper
            # Para aymara, usamos auto-detección primero, luego fallback a español
            detected_language = None
            transcription_text = None

            if language == "ay":
                # Estrategia 1: Intentar con auto-detección (sin especificar idioma)
                # Whisper puede detectar el idioma automáticamente
                try:
                    print("Intentando transcripción con auto-detección de idioma para aymara...")
                    transcription = self.client.audio.transcriptions.create(
                        file=("audio.webm", audio_bytes),
                        model=self.whisper_model,
                        response_format="verbose_json"
                    )
                    transcription_text = transcription.text
                    detected_language = transcription.language if hasattr(transcription, 'language') else "unknown"
                    print(f"Transcripción exitosa con auto-detección. Idioma detectado: {detected_language}")

                except Exception as e:
                    print(f"Auto-detección falló: {e}. Intentando con español como fallback...")
                    # Estrategia 2: Fallback a español
                    transcription = self.client.audio.transcriptions.create(
                        file=("audio.webm", audio_bytes),
                        model=self.whisper_model,
                        language="es",
                        response_format="verbose_json"
                    )
                    transcription_text = transcription.text
                    detected_language = "es"
                    print("Transcripción exitosa con español como fallback")
            else:
                # Para otros idiomas soportados, usar directamente
                print(f"Transcribiendo con idioma especificado: {language}")
                transcription = self.client.audio.transcriptions.create(
                    file=("audio.webm", audio_bytes),
                    model=self.whisper_model,
                    language=language,
                    response_format="verbose_json"
                )
                transcription_text = transcription.text
                detected_language = language

            return GroqTranscriptionResponse(
                text=transcription_text or transcription.text,
                confidence=1.0,  # Groq no proporciona confidence score
                language=detected_language or language,
                duration=transcription.duration if hasattr(transcription, 'duration') else None
            )

        except Exception as e:
            print(f"Error en transcripción Groq: {e}")
            raise Exception(f"Failed to transcribe audio: {str(e)}")

    async def analyze_content(
        self,
        transcription: str,
        language: str = "aymara"
    ) -> GroqAnalysisResponse:
        """
        Analizar el contenido transcrito para extraer metadata cultural usando Llama

        Args:
            transcription: Texto transcrito del audio
            language: Idioma del texto

        Returns:
            GroqAnalysisResponse con análisis cultural
        """
        try:
            prompt = f"""Analiza este relato oral aymara y extrae información cultural.

Transcripción (en Aymara/Español):
{transcription}

Por favor analiza y proporciona:
1. Palabras clave culturales (en español) - conceptos culturales importantes, deidades, rituales, lugares mencionados
2. Categoría del relato: elige UNA de [ritual, legend, personal_story, historical, myth, other]
3. Nivel de significancia cultural: elige UNO de [high, medium, low]
4. Un título descriptivo (en español, máximo 200 caracteres)
5. Una descripción breve/resumen (en español, máximo 1000 caracteres)
6. Traducción al español si el texto está en aymara

Devuelve SOLO un objeto JSON con esta estructura exacta:
{{
    "keywords": ["palabra1", "palabra2", ...],
    "category": "ritual|legend|personal_story|historical|myth|other",
    "cultural_significance": "high|medium|low",
    "title": "Título del relato",
    "description": "Resumen breve",
    "spanish_translation": "Traducción al español (opcional)"
}}
"""

            # Llamar a Groq con Llama
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "Eres un experto en cultura, idioma y tradiciones orales aymaras. Especializas en analizar y categorizar relatos culturales."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.llama_model,
                temperature=0.4,
                max_tokens=1500,
                response_format={"type": "json_object"}
            )

            # Extraer la respuesta
            content = chat_completion.choices[0].message.content

            # Parsear JSON
            analysis_data = json.loads(content)

            # Mapear categoría a enum
            category_map = {
                "ritual": StoryCategory.RITUAL,
                "legend": StoryCategory.LEGEND,
                "personal_story": StoryCategory.PERSONAL_STORY,
                "historical": StoryCategory.HISTORICAL,
                "myth": StoryCategory.MYTH,
                "other": StoryCategory.OTHER
            }

            significance_map = {
                "high": CulturalSignificance.HIGH,
                "medium": CulturalSignificance.MEDIUM,
                "low": CulturalSignificance.LOW
            }

            return GroqAnalysisResponse(
                keywords=analysis_data.get('keywords', []),
                category=category_map.get(
                    analysis_data.get('category', 'other'),
                    StoryCategory.OTHER
                ),
                cultural_significance=significance_map.get(
                    analysis_data.get('cultural_significance', 'medium'),
                    CulturalSignificance.MEDIUM
                ),
                title=analysis_data.get('title', 'Untitled Story'),
                description=analysis_data.get('description', ''),
                spanish_translation=analysis_data.get('spanish_translation')
            )

        except Exception as e:
            print(f"Error en análisis Groq: {e}")
            raise Exception(f"Failed to analyze content: {str(e)}")

    async def full_pipeline(
        self,
        audio_url: str,
        language: str = "ay"
    ) -> Dict[str, Any]:
        """
        Pipeline completo: transcribir y analizar con Groq

        Args:
            audio_url: URL del audio
            language: Código ISO del idioma (ay=aymara, es=español)

        Returns:
            Dict con transcripción y análisis completo
        """
        try:
            # Paso 1: Transcribir con Whisper
            transcription_result = await self.transcribe_audio(audio_url, language)

            # Paso 2: Analizar con Llama
            analysis_result = await self.analyze_content(
                transcription_result.text
            )

            return {
                "transcription": {
                    "aymara": transcription_result.text,
                    "spanish": analysis_result.spanish_translation,
                    "confidence": transcription_result.confidence
                },
                "keywords": analysis_result.keywords,
                "category": analysis_result.category.value,
                "culturalSignificance": analysis_result.cultural_significance.value,
                "title": analysis_result.title,
                "description": analysis_result.description
            }

        except Exception as e:
            print(f"Error en pipeline Groq: {e}")
            raise Exception(f"Failed to process audio: {str(e)}")

# Singleton instance
groq_service = GroqService()
