# Solución de Problemas - Historias Vivientes Aymara

Este documento contiene soluciones a problemas comunes del proyecto.

## 🔴 Problema 1: Error al cargar relatos - "The query requires an index"

### Descripción del Error
```
Error al cargar
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

### Causa
Firestore requiere índices compuestos para consultas que usan múltiples campos (`where` + `orderBy`).

### Solución

**Opción A: Crear índices automáticamente (RECOMENDADO)**

1. **Para historias (stories):** Click en este link directo:
   ```
   https://console.firebase.google.com/v1/r/project/aimara-47e2b/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9haW1hcmEtNDdlMmIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3N0b3JpZXMvaW5kZXhlcy9fEAEaCgoGc3RhdHVzEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
   ```

2. **Para mensajes de chat (chatMessages):** Click en este link directo:
   ```
   https://console.firebase.google.com/v1/r/project/aimara-47e2b/firestore/indexes?create_composite=ClFwcm9qZWN0cy9haW1hcmEtNDdlMmIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NoYXRNZXNzYWdlcy9pbmRleGVzL18QARoKCgZyb29tSWQQARoNCgl0aW1lc3RhbXAQAhoMCghfX25hbWVfXxAC
   ```

3. En cada página, haz click en **"Create"** o **"Crear índice"**

4. Espera 1-5 minutos mientras se construye el índice

5. Recarga la página de tu aplicación

**Opción B: Crear índices usando Firebase CLI**

```bash
# Desde la raíz del proyecto
firebase deploy --only firestore:indexes
```

El archivo `firestore.indexes.json` ya está configurado con todos los índices necesarios.

### Verificar que funcionó
- Ve a Firebase Console > Firestore Database > Indexes
- Todos los índices deben mostrar estado **"Enabled"** (verde)
- Si muestran "Building", espera unos minutos más

---

## 🔴 Problema 2: Audio no reproduce / Error al cargar audio

### Posibles Causas y Soluciones

#### Causa 1: URLs de audio incorrectas

**Verificar:**
1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña **Network**
3. Intenta reproducir un audio
4. Busca requests con código 404 o errores

**Solución:**
- Asegúrate de que el backend esté corriendo en `http://localhost:8000`
- Verifica que la variable `VITE_API_URL` en `frontend/.env` apunte al backend correcto:
  ```
  VITE_API_URL=http://localhost:8000/api/v1
  ```

#### Causa 2: CORS issues

**Síntomas:**
- Error en consola: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solución:**
Verifica que el backend tenga CORS habilitado en `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Causa 3: Archivos de audio no existen

**Verificar:**
```bash
# Listar audios almacenados
ls backend/storage/audios/
```

**Solución:**
- Si la carpeta está vacía, sube nuevos relatos desde la interfaz
- Los audios se guardan en `backend/storage/audios/`

#### Causa 4: Formato de audio incompatible

**Verificar:**
- Los audios deben estar en formato WebM o MP3
- Chrome/Edge: Soportan WebM nativamente
- Safari: Puede requerir MP3

**Solución temporal:**
Actualiza `AudioPlayer.jsx` para mostrar mensaje de error:

```jsx
<audio
  ref={audioRef}
  src={src}
  preload="metadata"
  onError={(e) => {
    console.error('Audio error:', e)
    alert('Error al cargar el audio. Verifica que el archivo existe.')
  }}
/>
```

#### Causa 5: Backend no está sirviendo archivos estáticos

**Verificar:**
Abre directamente la URL del audio en el navegador:
```
http://localhost:8000/storage/audios/temp_XXXXXXX.webm
```

Si da 404, el backend no está configurado correctamente.

**Solución:**
Verifica en `backend/app/main.py` que esté montada la carpeta storage:

```python
from fastapi.staticfiles import StaticFiles

app.mount("/storage", StaticFiles(directory="storage"), name="storage")
```

---

## 🔴 Problema 3: El chat no funciona / Mensajes no aparecen

### Causa: Índice de Firebase faltante

Ya está incluido en la solución del Problema 1. Asegúrate de crear el índice de `chatMessages`.

### Verificar conexión de Socket.io

1. Abre DevTools > Console
2. Busca mensajes de Socket.io:
   ```
   Socket connected: xxx-xxx-xxx
   ```

Si no aparece:

**Solución:**
```bash
# Verifica que el chat-server esté corriendo
cd backend/chat-server
node server.js
```

---

## 🔴 Problema 4: Servidores no inician

### Backend no inicia

**Error común:**
```
ValueError: GROQ_API_KEY es requerida
```

**Solución:**
1. Crea o actualiza `backend/.env`:
   ```bash
   GROQ_API_KEY=gsk_tu_api_key_aqui
   FIREBASE_STORAGE_BUCKET=aimara-47e2b.firebasestorage.app
   FIREBASE_CREDENTIALS_PATH=credentials/serviceAccount.json
   ```

2. Verifica que el archivo de credenciales de Firebase existe:
   ```bash
   ls backend/credentials/serviceAccount.json
   ```

### Frontend no inicia

**Error común:**
```
ENOENT: no such file or directory, open 'package.json'
```

**Solución:**
```bash
cd frontend
npm install
npm run dev
```

### Chat-server no inicia

**Error común:**
```
Error: Firebase credentials not found
```

**Solución:**
```bash
cd backend/chat-server
npm install
# Asegúrate de que las credenciales existan
ls ../credentials/serviceAccount.json
node server.js
```

---

## 🔴 Problema 5: CSS no se aplica correctamente

### Síntoma
- Los estilos de glassmorphism no aparecen
- Los colores son los predeterminados de Tailwind

### Solución

1. **Reinicia el servidor de Vite:**
   ```bash
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

2. **Limpia caché de Tailwind:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Verifica que `tailwind.config.js` esté correcto:**
   - Debe tener la sección `extend` con colores custom
   - Debe tener las animaciones configuradas

---

## 🔴 Problema 6: No puedo subir nuevos relatos

### Verificaciones:

1. **Backend debe estar corriendo:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Permisos de escritura en carpeta storage:**
   ```bash
   ls -la backend/storage/
   # Debe permitir escritura
   ```

3. **GROQ API Key válida:**
   - Debe comenzar con `gsk_`
   - Verifica que no esté expirada en https://console.groq.com

4. **Firebase configurado:**
   - Credenciales válidas
   - Storage bucket configurado

---

## Comandos Útiles para Debugging

### Ver logs del backend
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Los logs aparecerán en la consola
```

### Ver logs del chat-server
```bash
cd backend/chat-server
node server.js
# Los logs aparecerán en la consola con emojis
```

### Ver logs del frontend
```bash
cd frontend
npm run dev
# Abre el navegador y ve a DevTools > Console
```

### Verificar estado de Firebase
```bash
firebase projects:list
firebase firestore:indexes
```

### Limpiar todo y empezar de nuevo
```bash
# Detener todos los servidores (Ctrl+C en cada terminal)

# Backend
cd backend
rm -rf __pycache__
pip install -r requirements.txt

# Frontend
cd ../frontend
rm -rf node_modules .vite
npm install

# Chat-server
cd ../backend/chat-server
rm -rf node_modules
npm install

# Reiniciar todo
# Terminal 1: backend
cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: frontend
cd frontend && npm run dev

# Terminal 3: chat-server
cd backend/chat-server && node server.js
```

---

## Contacto

Si ninguna de estas soluciones funciona, verifica:
- Los logs completos en cada servidor
- La consola del navegador (F12)
- Las versiones de Node.js (v24.11.0) y Python (3.11.9)
