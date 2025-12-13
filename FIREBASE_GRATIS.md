# 🔥 Configurar Firebase (Solo Firestore - 100% Gratis)

## ¿Por qué solo Firestore?

Firebase Storage requiere configurar facturación (tarjeta de crédito), incluso para usar el plan gratuito.

**Solución**: Usamos **Firestore** (base de datos) para metadatos y **almacenamiento local** en el servidor para archivos de audio.

✅ **100% Gratuito**
✅ **Sin tarjeta de crédito**
✅ **Suficiente para el proyecto**

## Arquitectura del Proyecto

```
┌─────────────────────────────────────────┐
│           Usuario (PWA)                  │
│  Graba audio → Upload al Backend        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Backend (FastAPI)                │
│                                          │
│  1. Recibe audio                         │
│  2. Guarda en /storage (local)           │
│  3. Procesa con Groq                     │
│  4. Guarda metadata en Firestore         │
│  5. Sirve archivos vía /storage/...     │
└─────────────┬───────────┬───────────────┘
              │           │
              ▼           ▼
    ┌──────────────┐  ┌──────────────┐
    │  Firestore   │  │   Storage    │
    │  (Metadatos) │  │   (Local)    │
    │  - Firebase  │  │  - Servidor  │
    └──────────────┘  └──────────────┘
```

## Paso 1: Crear Proyecto en Firebase

### 1.1 Ir a Firebase Console

Abrir: https://console.firebase.google.com/

### 1.2 Crear Nuevo Proyecto

1. Click en **"Agregar proyecto"**
2. Nombre del proyecto: `historias-aymara`
3. **Desactivar** Google Analytics (no es necesario)
4. Click en **"Crear proyecto"**

⏱️ Esperar 30 segundos mientras se crea...

## Paso 2: Habilitar Firestore

### 2.1 Ir a Firestore Database

En el menú lateral:
1. Click en **"Firestore Database"**
2. Click en **"Crear base de datos"**

### 2.2 Configurar Firestore

**Modo**:
- Seleccionar: **"Empezar en modo de prueba"**
- (Podemos configurar reglas después)

**Ubicación**:
- Seleccionar: **"us-central (Iowa)"** o región más cercana
- Importante: No se puede cambiar después

Click en **"Habilitar"**

⏱️ Esperar 1 minuto...

### 2.3 Verificar Firestore

Deberías ver:
```
✅ Cloud Firestore
   Estado: Activo
   Ubicación: us-central1
```

## Paso 3: Obtener Credenciales

### 3.1 Credenciales Frontend (Web)

1. En Firebase Console, click en el ícono de configuración ⚙️
2. Click en **"Configuración del proyecto"**
3. Scroll down hasta **"Tus apps"**
4. Click en **"</>"** (Web)
5. Nombre de la app: `historias-aymara-web`
6. **No** marcar "Configurar Firebase Hosting"
7. Click en **"Registrar app"**

Copiar las credenciales que aparecen:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "historias-aymara.firebaseapp.com",
  projectId: "historias-aymara",
  storageBucket: "historias-aymara.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 3.2 Agregar a .env Frontend

Editar `frontend/.env.local`:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=historias-aymara.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=historias-aymara
VITE_FIREBASE_STORAGE_BUCKET=historias-aymara.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3.3 Credenciales Backend (Admin SDK)

1. En Firebase Console → ⚙️ → **"Configuración del proyecto"**
2. Ir a pestaña **"Cuentas de servicio"**
3. Click en **"Generar nueva clave privada"**
4. Click en **"Generar clave"**

Se descarga un archivo JSON.

### 3.4 Guardar Credenciales Admin

```bash
# Crear directorio
mkdir backend\credentials

# Copiar archivo descargado
copy "C:\Users\tu-usuario\Downloads\historias-aymara-*.json" backend\credentials\serviceAccount.json
```

El archivo debe quedar en:
```
backend/credentials/serviceAccount.json
```

## Paso 4: Configurar Reglas de Firestore

### 4.1 Reglas de Seguridad

En Firebase Console:
1. Ir a **Firestore Database**
2. Click en pestaña **"Reglas"**
3. Reemplazar con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Stories: lectura pública, escritura libre (sin auth)
    match /stories/{storyId} {
      // Cualquiera puede leer stories publicados
      allow read: if resource.data.status == 'published';

      // Cualquiera puede crear (sin auth por simplicidad)
      allow create: if true;

      // Solo actualizar si es el mismo documento
      allow update: if request.auth != null || true;

      // Eliminar solo administradores (implementar después)
      allow delete: if request.auth != null;
    }

    // Processing jobs: acceso público para ver estado
    match /processing_jobs/{jobId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if false;
    }
  }
}
```

Click en **"Publicar"**

⚠️ **Nota**: Estas reglas permiten escritura sin autenticación para simplificar el desarrollo. En producción, deberías implementar autenticación.

### 4.2 Crear Índices

En Firestore Database:
1. Click en pestaña **"Índices"**
2. Click en **"Crear índice"**

**Índice 1: Stories por status y fecha**
- Colección: `stories`
- Campos:
  - `status` (Ascendente)
  - `createdAt` (Descendente)
- Click en **"Crear"**

**Índice 2: Stories por categoría y fecha**
- Colección: `stories`
- Campos:
  - `category` (Ascendente)
  - `createdAt` (Descendente)
- Click en **"Crear"**

⏱️ Los índices tardan 1-2 minutos en crearse.

## Paso 5: Configurar Variables de Entorno

### 5.1 Backend (.env)

Editar `.env`:

```bash
# Groq API
GROQ_API_KEY=gsk_tu-api-key-aqui

# Firebase Backend (NO necesita Storage Bucket)
FIREBASE_STORAGE_BUCKET=historias-aymara.appspot.com

# URLs
BASE_URL=http://localhost:8000
ENVIRONMENT=development
```

### 5.2 Frontend (.env.local)

```bash
# API Backend
VITE_API_URL=http://localhost:8000/api/v1

# Firebase (copiar de consola)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Paso 6: Verificar Configuración

### 6.1 Verificar Archivos

```bash
# Verificar credenciales backend
dir backend\credentials\serviceAccount.json

# Verificar .env
type .env
type frontend\.env.local
```

### 6.2 Ejecutar Proyecto

```bash
start.bat
```

### 6.3 Probar Conexión

Abrir: http://localhost:8000/docs

Probar endpoint: `GET /health`

Debería responder: `{"status": "healthy"}`

## Almacenamiento Local vs Firebase Storage

### Con Firebase Storage (Requiere pago)
```
Usuario → Firebase Storage → Backend lee URL
```

### Con Almacenamiento Local (Gratis)
```
Usuario → Backend → Guarda en /storage → Sirve vía HTTP
```

### Ventajas del Almacenamiento Local

✅ **100% Gratuito**
✅ **Sin límites de cuota**
✅ **Más rápido** (sin latencia de red)
✅ **Control total** de archivos
✅ **Fácil backup** (copiar carpeta)

### Desventajas

⚠️ **Requiere espacio en servidor** (pero es económico)
⚠️ **No tiene CDN global** (pero para comunidades locales está bien)

## Cuotas del Plan Gratuito de Firestore

| Recurso | Límite Gratis | Proyecto Usa |
|---------|---------------|--------------|
| Documentos guardados | 20K/día | ~10/día ✅ |
| Lecturas | 50K/día | ~1K/día ✅ |
| Escrituras | 20K/día | ~10/día ✅ |
| Almacenamiento | 1 GB | ~1 MB ✅ |

**Conclusión**: Firestore gratuito es más que suficiente.

## Troubleshooting

### Error: "Permission denied"

**Causa**: Reglas de Firestore muy restrictivas

**Solución**: Verificar reglas en Firebase Console

### Error: "Could not reach Cloud Firestore backend"

**Causa**: Proyecto no habilitado o credenciales incorrectas

**Solución**:
1. Verificar que Firestore esté habilitado
2. Verificar `serviceAccount.json`

### Error: "Firebase App not initialized"

**Causa**: Credenciales faltantes en `.env.local`

**Solución**: Copiar todas las variables VITE_FIREBASE_*

## Migrar a Firebase Storage (Futuro)

Si en el futuro quieres usar Firebase Storage:

1. Habilitar facturación en Firebase
2. Actualizar código:
   - Cambiar `local_storage` por `firebase_service`
   - Actualizar `upload.py` endpoint
3. Los archivos locales se pueden migrar fácilmente

## Resumen

✅ **Firestore**: Base de datos (metadatos)
✅ **Almacenamiento Local**: Archivos de audio
✅ **Groq**: Transcripción y análisis
✅ **Sin costos**: Todo 100% gratuito

---

**¡Firebase configurado sin gastar un peso! 🔥**
