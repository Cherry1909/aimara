# Historias Vivientes Aymara

Sistema comunitario para preservar la cultura aymara mediante la recolección de relatos orales, creando un archivo digital vivo y georreferenciado.

## Descripción del Proyecto

"Historias Vivientes Aymara" es un sistema accesible que permite a las comunidades aymaras preservar su cultura mediante relatos orales. El sistema:

- Permite grabar o subir audios de relatos
- Georreferencia cada historia en un mapa
- Procesa automáticamente los audios con IA (Grok) para transcripción y análisis cultural
- Genera páginas públicas para cada relato con audio, texto, mapa y perfil del narrador
- Crea códigos QR imprimibles para compartir físicamente

## Stack Tecnológico

### Frontend (PWA)
- React 18 + Vite 5
- TailwindCSS para estilos
- Leaflet.js para mapas interactivos
- Firebase SDK (Storage + Firestore)
- vite-plugin-pwa para funcionalidad offline
- React Router para navegación
- Zustand para gestión de estado

### Backend
- FastAPI (Python)
- Firebase Admin SDK
- Grok API para transcripción y análisis
- qrcode para generación de códigos QR

### Infraestructura
- Firebase Storage (audios)
- Firebase Firestore (metadatos)
- Vercel/Netlify (frontend)
- Railway/Render (backend)

## 🚀 Inicio Rápido con Docker (Recomendado)

**La forma más fácil de ejecutar el proyecto completo:**

```bash
# 1. Configurar variables de entorno
copy .env.docker.example .env
# Editar .env con tus credenciales

# 2. Copiar credenciales de Firebase
# Descargar serviceAccount.json desde Firebase Console
# Guardar en: backend/credentials/serviceAccount.json

# 3. Ejecutar
start.bat         # Windows
./start.sh        # Linux/Mac
```

**Aplicación disponible en:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

📖 **Ver guía completa**: [DOCKER_README.md](DOCKER_README.md)

---

## Requisitos Previos

### Con Docker (Opción Recomendada)
- Docker Desktop instalado
- Cuenta de Firebase
- API Key de Grok (x.ai)

### Sin Docker (Instalación Manual)

#### Frontend
- Node.js 18+ y npm
- Cuenta de Firebase

#### Backend
- Python 3.11+
- Cuenta de Firebase (misma del frontend)
- API Key de Grok (x.ai)

## Instalación Manual (Sin Docker)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/historias-vivientes-aymara.git
cd historias-vivientes-aymara
```

### 2. Configurar Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env.local`:
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales de Firebase:
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 3. Configurar Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Crear archivo `.env`:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```
GROK_API_KEY=xai-tu-api-key
FIREBASE_CREDENTIALS_PATH=./serviceAccount.json
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
BASE_URL=http://localhost:5173
ENVIRONMENT=development
```

Descargar las credenciales de Firebase Admin:
1. Ir a Firebase Console → Project Settings → Service Accounts
2. Generar nueva clave privada
3. Guardar el archivo JSON como `serviceAccount.json` en `/backend`

### 4. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Firestore Database**
3. Habilitar **Storage**
4. Configurar reglas de seguridad (ver `docs/firebase-setup.md`)

## Ejecutar en Desarrollo

### Terminal 1 - Frontend
```bash
cd frontend
npm run dev
```
Abre http://localhost:5173

### Terminal 2 - Backend
```bash
cd backend
source venv/bin/activate  # En Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
API disponible en http://localhost:8000

## Arquitectura del Sistema

### Flujo de Usuario

1. **Grabar Relato**: Usuario graba o sube audio desde la PWA
2. **Ubicación**: Selecciona ubicación en mapa (geolocalización automática)
3. **Datos**: Completa formulario con datos del narrador
4. **Procesamiento**:
   - Audio se sube a Firebase Storage
   - Backend procesa con Grok API (transcripción + análisis)
   - Se extraen palabras clave culturales y categoría
5. **Publicación**:
   - Se genera página pública con audio, texto, mapa
   - Se crea código QR imprimible
6. **Compartir**: Usuario puede imprimir QR o compartir URL

### Estructura de Datos (Firestore)

Colección `stories`:
```javascript
{
  id: "auto-generated",
  audioUrl: "gs://bucket/audio.webm",
  audioDuration: 342,

  narrator: {
    name: "Juan Mamani",
    age: 67,
    community: "Comunidad Qullana",
    language: "aymara",
    consentGiven: true
  },

  location: {
    latitude: -16.5000,
    longitude: -68.1500,
    placeName: "Lago Titicaca, Bolivia",
    geohash: "6mwd9y5h"
  },

  transcription: {
    aymara: "Texto en aymara...",
    spanish: "Traducción...",
    confidence: 0.92
  },

  keywords: ["Pachamama", "Ritual"],
  category: "ritual",
  title: "Ritual de la Pachamama",

  status: "published",
  publicUrl: "https://app.com/story/id",
  qrCodeUrl: "https://storage/qr.png",

  createdAt: Timestamp,
  views: 0
}
```

## API Endpoints

### Stories
- `POST /api/v1/stories/` - Crear relato
- `GET /api/v1/stories/` - Listar relatos (paginado)
- `GET /api/v1/stories/{id}` - Obtener relato
- `GET /api/v1/stories/nearby` - Relatos cercanos

### Audio Processing
- `POST /api/v1/audio/process` - Procesar audio con Grok
- `GET /api/v1/audio/status/{job_id}` - Estado del procesamiento

### QR Codes
- `GET /api/v1/qr/{story_id}` - Generar QR (PNG)
- `GET /api/v1/qr/{story_id}/print` - Versión imprimible

## Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel --prod
```

Variables de entorno en Vercel:
- `VITE_API_URL`
- `VITE_FIREBASE_*` (todas las credenciales)

### Backend (Railway)

1. Conectar repositorio en Railway
2. Configurar variables de entorno
3. Deploy automático desde GitHub

O usar Docker:
```bash
cd backend
docker build -t historias-aymara-backend .
docker run -p 8000:8000 historias-aymara-backend
```

## Características Especiales

### Optimización para Internet Básico
- Compresión agresiva de audio
- Lazy loading de componentes
- Cache estratégico con Service Worker
- Assets optimizados

### Accesibilidad Comunitaria
- Interfaz bilingüe (español/aymara)
- Sin registro obligatorio para ver contenido
- Diseño mobile-first
- Botones grandes y claros

### PWA (Progressive Web App)
- Funciona offline
- Instalable en dispositivos móviles
- Sincronización automática cuando hay conexión

## Contribuir

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para más detalles.

## Contacto

Proyecto Historias Vivientes Aymara
- Email: contacto@historias-aymara.org
- Website: https://historias-aymara.vercel.app

## Agradecimientos

- Comunidades aymaras de Bolivia
- x.ai (Grok API)
- Firebase
- Contribuidores del proyecto

---

**Preservando la cultura aymara para futuras generaciones** 🌾
