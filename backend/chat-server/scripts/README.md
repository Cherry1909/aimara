# Scripts de Chat Server

Este directorio contiene scripts de utilidad para el servidor de chat.

## Inicialización de Salas

### `initRooms.js`

Script para inicializar las 6 salas temáticas del chat en Firestore.

#### Uso

**Inicializar o actualizar salas:**
```bash
npm run init:rooms
```

Este comando:
- ✅ Crea las salas si no existen
- ✅ Actualiza la información si ya existen (preservando mensajes y estadísticas)
- ✅ Configura metadata inicial (isActive, isPublic, welcomeMessage)

**Verificar salas existentes:**
```bash
npm run verify:rooms
```

Este comando muestra todas las salas existentes en Firestore con sus estadísticas.

#### Salas que se crean

1. **General** (`general`) - Conversaciones generales sobre cultura Aymara 💬
2. **Rituales y Ceremonias** (`rituales`) - Discusión sobre prácticas espirituales 🎭
3. **Festividades** (`festividades`) - Preguntas sobre fiestas y celebraciones 🎉
4. **Idioma Aymara** (`idioma`) - Ayuda con traducción y aprendizaje 📚
5. **Tradiciones** (`tradiciones`) - Costumbres, vestimenta, gastronomía 🏛️
6. **Ayuda/Soporte** (`soporte`) - Soporte técnico de la plataforma ❓

#### Estructura de datos en Firestore

Cada sala se guarda en la colección `chatRooms` con la siguiente estructura:

```javascript
{
  id: 'general',
  name: 'General',
  description: 'Conversaciones generales sobre cultura Aymara',
  icon: '💬',
  order: 1,
  messageCount: 0,
  activeUsers: 0,
  lastMessage: {
    text: 'Último mensaje...',
    userName: 'Usuario',
    timestamp: Date
  },
  createdAt: Date,
  updatedAt: Date,
  metadata: {
    isActive: true,
    isPublic: true,
    maxUsers: null,
    welcomeMessage: 'Bienvenido a General!...'
  }
}
```

#### Cuándo ejecutar

- **Primera vez**: Al configurar el servidor por primera vez
- **Actualizaciones**: Cuando se modifica la información de las salas (nombres, descripciones, etc.)
- **Verificación**: Para revisar el estado actual de las salas en Firestore

#### Requisitos previos

1. Archivo `.env` configurado con:
   - `FIREBASE_CREDENTIALS_PATH`: Ruta al archivo serviceAccount.json
   - `FIREBASE_STORAGE_BUCKET`: Bucket de Firebase Storage

2. Firebase Admin SDK inicializado correctamente

#### Solución de problemas

**Error: "Error al conectar con Firebase"**
- Verifica que el archivo serviceAccount.json existe en la ruta especificada
- Confirma que las credenciales de Firebase son válidas

**Error: "Permission denied"**
- Verifica que el service account tiene permisos de escritura en Firestore

**Las salas no aparecen en el chat**
- Ejecuta `npm run verify:rooms` para confirmar que existen en Firestore
- Verifica que el RoomManager.js tiene las mismas IDs de salas

## Otros scripts

_(Aquí se pueden documentar futuros scripts)_
