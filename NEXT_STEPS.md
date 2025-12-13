# Próximos Pasos - Historias Vivientes Aymara

## Estado Actual del Proyecto ✅

Se ha completado la configuración base del proyecto:

### Backend (FastAPI) - COMPLETADO
- ✅ Estructura de directorios
- ✅ Configuración FastAPI con CORS
- ✅ Schemas Pydantic (Story, Narrator, Location, Grok)
- ✅ Servicio Firebase (Firestore + Storage)
- ✅ Servicio Grok (transcripción + análisis)
- ✅ Servicio QR Generator
- ✅ Endpoints API completos:
  - `/api/v1/stories/` - CRUD completo
  - `/api/v1/audio/process` - Procesamiento async
  - `/api/v1/qr/{id}` - Generación de QR

### Frontend (React + Vite) - COMPLETADO
- ✅ Configuración Vite con PWA
- ✅ TailwindCSS configurado
- ✅ React Router setup
- ✅ Servicios Firebase (upload, get, list)
- ✅ Cliente API (axios)
- ✅ Estructura de carpetas para componentes

## Archivos Críticos Creados (21 archivos)

### Backend (11 archivos)
1. `backend/app/main.py` - Entry point FastAPI
2. `backend/app/core/config.py` - Configuración
3. `backend/app/schemas/story.py` - Schemas Pydantic
4. `backend/app/schemas/grok.py` - Schemas Grok
5. `backend/app/services/firebase_service.py` - Firebase Admin
6. `backend/app/services/grok_service.py` - Integración Grok
7. `backend/app/services/qr_generator.py` - QR codes
8. `backend/app/api/v1/endpoints/stories.py` - API Stories
9. `backend/app/api/v1/endpoints/audio.py` - API Audio
10. `backend/app/api/v1/endpoints/qr.py` - API QR
11. `backend/requirements.txt` - Dependencias Python

### Frontend (10 archivos)
12. `frontend/vite.config.js` - Config Vite + PWA
13. `frontend/package.json` - Dependencias npm
14. `frontend/tailwind.config.js` - Config Tailwind
15. `frontend/src/main.jsx` - Entry point React
16. `frontend/src/App.jsx` - App principal
17. `frontend/src/styles/global.css` - Estilos globales
18. `frontend/src/services/firebase.js` - Firebase client
19. `frontend/src/services/api.js` - API client
20. `frontend/public/manifest.json` - PWA manifest
21. `frontend/index.html` - HTML principal

## Lo Que Falta Implementar

### Componentes Frontend (PRIORIDAD ALTA)

#### 1. AudioRecorder Component
```
frontend/src/components/audio/AudioRecorder.jsx
- Usar MediaRecorder API
- Controles de grabación (play/pause/stop)
- Visualización de tiempo
- Límite de 10 minutos
- Export como Blob
```

#### 2. MapSelector Component
```
frontend/src/components/map/MapSelector.jsx
- Integrar react-leaflet
- Geolocalización automática
- Marcador draggable
- Tiles OpenStreetMap
- Zoom en región Bolivia
```

#### 3. NarratorForm Component
```
frontend/src/components/forms/NarratorForm.jsx
- React Hook Form
- Validaciones
- Campos: nombre, edad, comunidad, idioma
- Checkbox consentimiento
```

#### 4. Páginas Principales

**Home.jsx**
```jsx
frontend/src/pages/Home.jsx
- Grid de StoryCard
- Filtros (categoría, ubicación)
- Link a /upload
- Paginación
```

**UploadStory.jsx**
```jsx
frontend/src/pages/UploadStory.jsx
- Wizard multi-paso:
  1. AudioRecorder
  2. MapSelector
  3. NarratorForm
  4. Preview & Submit
- Progress bar
- Llamar a createStory() + processAudio()
- Mostrar QR al finalizar
```

**StoryPage.jsx**
```jsx
frontend/src/pages/StoryPage.jsx
- Audio player
- Transcripción (aymara/español)
- Mapa con ubicación
- Perfil narrador
- Botón compartir
- QR code display
- SEO meta tags (react-helmet-async)
```

### Configuración Firebase (REQUERIDO)

1. **Crear proyecto en Firebase Console**
   - Ir a https://console.firebase.google.com/
   - Crear nuevo proyecto

2. **Habilitar servicios**
   - Firestore Database
   - Storage

3. **Configurar reglas de seguridad**
   ```
   // Firestore rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /stories/{storyId} {
         allow read: if resource.data.visibility == 'public';
         allow create: if request.auth != null;
       }
     }
   }
   ```

   ```
   // Storage rules
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /audios/{fileName} {
         allow read: if true;
         allow write: if request.auth != null &&
                      request.resource.size < 50 * 1024 * 1024;
       }
     }
   }
   ```

4. **Descargar credenciales**
   - Frontend: Copiar config a `.env.local`
   - Backend: Descargar `serviceAccount.json`

### Obtener API Key de Grok

1. Ir a https://x.ai/
2. Crear cuenta / login
3. Obtener API key
4. Agregar a `backend/.env`

## Cómo Ejecutar el Proyecto

### Primera Vez: Instalar Dependencias

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### Configurar Variables de Entorno

**Backend: crear `backend/.env`**
```
GROK_API_KEY=xai-tu-api-key
FIREBASE_CREDENTIALS_PATH=./serviceAccount.json
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
BASE_URL=http://localhost:5173
ENVIRONMENT=development
```

**Frontend: crear `frontend/.env.local`**
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Ejecutar en Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Abrir: http://localhost:5173

## Orden de Implementación Recomendado

### Semana 1: Componentes Core
1. AudioRecorder.jsx
2. AudioPlayer.jsx
3. MapSelector.jsx
4. NarratorForm.jsx

### Semana 2: Páginas Principales
5. Home.jsx con StoryCard
6. UploadStory.jsx (wizard completo)
7. StoryPage.jsx

### Semana 3: Features Avanzadas
8. QRDisplay.jsx
9. Búsqueda y filtros
10. Optimización PWA

### Semana 4: Testing y Deploy
11. Testing end-to-end
12. Deploy frontend (Vercel)
13. Deploy backend (Railway)
14. Configurar dominios

## Recursos Útiles

- **Firebase Docs**: https://firebase.google.com/docs
- **Leaflet.js**: https://leafletjs.com/
- **React Leaflet**: https://react-leaflet.js.org/
- **MediaRecorder API**: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- **Grok API**: https://docs.x.ai/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Vite PWA Plugin**: https://vite-pwa-org.netlify.app/

## Notas Importantes

⚠️ **Antes de comenzar el desarrollo:**
1. Configurar Firebase y obtener credenciales
2. Obtener API key de Grok
3. Instalar todas las dependencias
4. Probar que backend y frontend se conectan

⚠️ **Durante el desarrollo:**
- Commitear frecuentemente
- Probar en dispositivos móviles
- Verificar funcionamiento offline (PWA)
- Optimizar tamaño de audios

⚠️ **Para producción:**
- Configurar dominios personalizados
- Habilitar HTTPS
- Configurar rate limiting
- Backup de Firestore
- Monitoring con Firebase Analytics

## Contacto y Soporte

Si necesitas ayuda con la implementación:
- Revisar documentación en `/docs`
- Consultar el plan completo en `C:\Users\user\.claude\plans\floating-singing-flute.md`
- Revisar README.md para guías generales

---

**Estado del Proyecto**: ✅ Base completada - Listo para desarrollo de componentes

**Próximo Paso**: Configurar Firebase y comenzar con AudioRecorder component
