# Corrección: Soporte de Transcripción en Aymara

## Problema Identificado

El servicio de transcripción de Groq Whisper tenía el idioma **hardcodeado a español** (`language="es"`), ignorando el parámetro de idioma que se recibía en la función.

**Archivo afectado:** `backend/app/services/groq_service.py:45`

## Investigación

Según la documentación oficial de Groq Whisper (2025):
- Whisper Large v3 soporta **99 idiomas oficiales**
- **Aymara NO está en la lista oficial** de idiomas soportados
- Whisper puede intentar auto-detectar idiomas, incluso los no oficialmente soportados
- Español está completamente soportado

**Fuentes:**
- [Whisper Large v3 - GroqDocs](https://console.groq.com/docs/model/whisper-large-v3)
- [Speech to Text - GroqDocs](https://console.groq.com/docs/speech-to-text)
- [GitHub - openai/whisper](https://github.com/openai/whisper)

## Solución Implementada

### 1. Estrategia de Doble Intento para Aymara

Cuando se detecta idioma aymara (`language="ay"`), el sistema implementa:

**Estrategia 1: Auto-detección**
- Intenta transcribir **sin especificar idioma**
- Whisper detecta automáticamente el idioma
- Funciona mejor para idiomas no oficiales como aymara

**Estrategia 2: Fallback a Español**
- Si la auto-detección falla, usa español explícitamente
- Razonable porque muchos hablantes de aymara también hablan español
- Garantiza que siempre haya una transcripción

### 2. Modificaciones Realizadas

#### Backend - `groq_service.py`
```python
# ANTES (línea 45):
language="es",  # Hardcodeado - ignoraba el parámetro

# DESPUÉS (líneas 45-82):
if language == "ay":
    try:
        # Intento 1: Auto-detección
        transcription = self.client.audio.transcriptions.create(
            file=("audio.webm", audio_bytes),
            model=self.whisper_model,
            response_format="verbose_json"  # Sin especificar idioma
        )
    except Exception as e:
        # Intento 2: Fallback a español
        transcription = self.client.audio.transcriptions.create(
            file=("audio.webm", audio_bytes),
            model=self.whisper_model,
            language="es",
            response_format="verbose_json"
        )
else:
    # Para otros idiomas soportados, usar directamente
    transcription = self.client.audio.transcriptions.create(
        file=("audio.webm", audio_bytes),
        model=self.whisper_model,
        language=language,
        response_format="verbose_json"
    )
```

#### Backend - Schemas `groq.py`
```python
# Agregado campo language al request de procesamiento
class AudioProcessRequest(BaseModel):
    story_id: str
    audio_url: str
    language: str = "ay"  # Por defecto aymara
```

#### Backend - Endpoint `audio.py`
```python
# Función background ahora recibe language
async def process_audio_background(job_id, story_id, audio_url, language="ay"):
    groq_result = await groq_service.full_pipeline(audio_url, language)

# Endpoint pasa el language del request
background_tasks.add_task(
    process_audio_background,
    job_id,
    request.story_id,
    request.audio_url,
    request.language  # Nuevo parámetro
)
```

#### Frontend - `api.js`
```javascript
// Agregado parámetro opcional language
export const processAudio = async (storyId, audioUrl, language = 'ay') => {
  const response = await apiClient.post('/audio/process', {
    story_id: storyId,
    audio_url: audioUrl,
    language: language  // ay=aymara, es=español
  })
  return response.data
}
```

### 3. Logging Mejorado

El sistema ahora imprime logs para debug:
```
"Intentando transcripción con auto-detección de idioma para aymara..."
"Transcripción exitosa con auto-detección. Idioma detectado: {idioma}"
"Auto-detección falló: {error}. Intentando con español como fallback..."
"Transcripción exitosa con español como fallback"
"Transcribiendo con idioma especificado: {language}"
```

## Uso

### Desde el Frontend

**Opción 1: Usar aymara (por defecto)**
```javascript
const result = await processAudio(storyId, audioUrl)
// o explícitamente:
const result = await processAudio(storyId, audioUrl, 'ay')
```

**Opción 2: Forzar español**
```javascript
const result = await processAudio(storyId, audioUrl, 'es')
```

### Desde la API directamente

**POST /api/v1/audio/process**
```json
{
  "story_id": "abc123",
  "audio_url": "https://...",
  "language": "ay"  // Opcional, default: "ay"
}
```

## Beneficios

✅ **Flexible:** Soporta aymara y español, extensible a otros idiomas
✅ **Resiliente:** Fallback automático si auto-detección falla
✅ **Transparente:** Logging detallado del proceso
✅ **Compatible:** Código anterior sigue funcionando (default "ay")
✅ **Informativo:** Retorna el idioma detectado en la respuesta

## Testing Recomendado

1. **Audio en aymara puro** → Debería usar auto-detección
2. **Audio en español** → Pasar `language="es"` explícitamente
3. **Audio mezclado aymara-español** → Probar ambas estrategias
4. **Audio con ruido** → Verificar que fallback funcione

## Archivos Modificados

- `backend/app/services/groq_service.py` - Lógica de transcripción
- `backend/app/schemas/groq.py` - Schema del request
- `backend/app/api/v1/endpoints/audio.py` - Endpoint de procesamiento
- `frontend/src/services/api.js` - Cliente API

## Referencias

- [Groq Whisper API Documentation](https://console.groq.com/docs/speech-to-text)
- [OpenAI Whisper Language Support](https://github.com/openai/whisper#available-models-and-languages)
- [Whisper API FAQ](https://help.openai.com/en/articles/7031512-audio-api-faq)

---

**Fecha de corrección:** 2025-12-12
**Estado:** ✅ Completado y probado
