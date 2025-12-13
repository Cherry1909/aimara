# 🚀 Configuración de Groq API

## ¿Qué es Groq?

**Groq** (https://groq.com/) es una plataforma de inferencia de IA ultra-rápida que ofrece acceso a modelos de última generación como:
- **Whisper** (transcripción de audio)
- **Llama 3.1** (análisis de texto y chat)
- **Mixtral** y otros modelos

Es **mucho más rápido** que otras plataformas gracias a su hardware LPU (Language Processing Unit).

## Modelos Utilizados en el Proyecto

### 1. Whisper Large V3
- **Uso**: Transcripción de audio a texto
- **Modelo**: `whisper-large-v3`
- **Características**:
  - Soporta 99+ idiomas
  - Alta precisión incluso con dialectos
  - Procesa audio en formato webm, mp3, wav, etc.

### 2. Llama 3.1 70B Versatile
- **Uso**: Análisis cultural y extracción de metadata
- **Modelo**: `llama-3.1-70b-versatile`
- **Características**:
  - Excelente para análisis de contenido
  - Soporta JSON mode para respuestas estructuradas
  - Comprende contexto cultural complejo

## Obtener API Key

### Paso 1: Crear Cuenta

1. Ir a https://console.groq.com/
2. Click en **"Sign Up"** o **"Get Started"**
3. Registrarse con email o GitHub

### Paso 2: Generar API Key

1. Una vez logueado, ir a **"API Keys"** en el menú
2. Click en **"Create API Key"**
3. Dar un nombre descriptivo: `historias-aymara-dev`
4. Copiar la API key (comienza con `gsk_...`)

⚠️ **IMPORTANTE**: La API key solo se muestra una vez. Guárdala en un lugar seguro.

### Paso 3: Configurar en el Proyecto

Editar el archivo `.env`:

```bash
GROQ_API_KEY=gsk_tu-api-key-aqui
```

## Plan Gratuito de Groq

Groq ofrece un plan gratuito muy generoso:

- ✅ **Límite de requests**: 30 requests/minuto
- ✅ **Límite de tokens**: 6,000 tokens/minuto
- ✅ **Límite diario**: 14,400 requests/día
- ✅ **Sin tarjeta de crédito requerida**

Perfecto para desarrollo y proyectos comunitarios como Historias Aymara.

## Uso en el Proyecto

### Pipeline Completo

```python
# 1. Transcripción (Whisper)
audio_url → Groq Whisper → Texto en aymara/español

# 2. Análisis (Llama)
Texto → Groq Llama → {
    keywords: [...],
    category: "ritual",
    title: "...",
    description: "..."
}
```

### Ejemplo de Flujo

1. **Usuario graba relato** (3 minutos de audio)
2. **Frontend sube a Firebase Storage**
3. **Backend llama a Groq**:
   - Whisper transcribe: ~10 segundos
   - Llama analiza: ~5 segundos
4. **Total**: ~15 segundos de procesamiento

## Ventajas de Groq vs Otras Plataformas

| Característica | Groq | OpenAI | Google Cloud |
|---------------|------|---------|--------------|
| Velocidad | ⚡ Ultra-rápido (70x) | Medio | Medio |
| Plan Gratuito | ✅ Generoso | ⚠️ Limitado | ⚠️ Complejo |
| Whisper | ✅ Incluido | ✅ Incluido | ❌ No |
| Llama 3.1 | ✅ Incluido | ❌ No | ❌ No |
| Precio | 💚 Barato | 💛 Moderado | 💛 Moderado |

## Limitaciones del Plan Gratuito

### Límites de Rate
- 30 requests/minuto
- 6,000 tokens/minuto

Para el proyecto:
- 1 relato = 2 requests (transcripción + análisis)
- **Capacidad**: ~15 relatos/minuto
- **Uso esperado**: 2-5 relatos/hora

✅ **Conclusión**: El plan gratuito es más que suficiente.

### Si Excedes los Límites

```python
# Error típico
groq.error.RateLimitError: Rate limit exceeded

# Solución: Implementar retry con backoff
import time
from groq import RateLimitError

try:
    result = groq_service.transcribe(audio)
except RateLimitError:
    time.sleep(60)  # Esperar 1 minuto
    result = groq_service.transcribe(audio)
```

## Modelos Alternativos

Si necesitas optimizar costos o velocidad:

### Para Transcripción
- `whisper-large-v3` (mejor calidad) ← **Actual**
- `whisper-large-v2` (más rápido)

### Para Análisis
- `llama-3.1-70b-versatile` (mejor calidad) ← **Actual**
- `llama-3.1-8b-instant` (más rápido, menor calidad)
- `mixtral-8x7b-32768` (alternativa)

Cambiar en `backend/app/services/groq_service.py`:

```python
self.whisper_model = "whisper-large-v2"  # Más rápido
self.llama_model = "llama-3.1-8b-instant"  # Más rápido
```

## Monitoreo de Uso

### Dashboard de Groq

1. Ir a https://console.groq.com/
2. Ver sección **"Usage"**
3. Monitorear:
   - Requests por día
   - Tokens consumidos
   - Errores

### Logs en el Proyecto

Los errores de Groq se logguean en el backend:

```bash
# Ver logs
docker-compose logs -f backend | grep Groq

# Ejemplo de log
Error en transcripción Groq: Rate limit exceeded
```

## Troubleshooting

### Error: "Invalid API Key"

**Solución**: Verificar que la API key está correcta en `.env`

```bash
# Ver variable de entorno en contenedor
docker-compose exec backend env | grep GROQ
```

### Error: "Rate limit exceeded"

**Solución**: Esperar 1 minuto o implementar queue

```python
# Implementar cola simple
from collections import deque
processing_queue = deque()
```

### Error: "Model not found"

**Solución**: Verificar nombre del modelo

```python
# Modelos válidos
"whisper-large-v3"
"llama-3.1-70b-versatile"
```

## Mejores Prácticas

### 1. Manejo de Errores

```python
try:
    result = await groq_service.full_pipeline(audio_url)
except Exception as e:
    # Log error
    logger.error(f"Groq error: {e}")
    # Notificar usuario
    return {"error": "Procesamiento falló, intenta de nuevo"}
```

### 2. Timeouts

```python
# Ya implementado en groq_service.py
async with httpx.AsyncClient(timeout=300.0) as client:
    # 5 minutos para audio largo
```

### 3. Caché

Para reducir llamadas a Groq:

```python
# Cachear transcripciones
from functools import lru_cache

@lru_cache(maxsize=100)
def get_cached_transcription(audio_hash):
    return groq_service.transcribe(audio_url)
```

## Recursos

- **Documentación**: https://console.groq.com/docs
- **Modelos disponibles**: https://console.groq.com/docs/models
- **Status**: https://status.groq.com/
- **Comunidad**: https://github.com/groq

## Costo en Producción

Si el proyecto crece y necesitas plan de pago:

| Modelo | Precio |
|--------|--------|
| Whisper Large V3 | $0.111 / millón de tokens |
| Llama 3.1 70B | $0.59 / millón de tokens |

**Ejemplo**: 1000 relatos/mes
- Transcripción: ~$5
- Análisis: ~$10
- **Total**: ~$15/mes

Aún más barato que Firebase Storage o hosting.

---

**¡Groq está listo para transcribir y analizar relatos aymaras! 🚀**
