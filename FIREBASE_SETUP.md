# Configuración de Firebase

Este documento explica cómo configurar los índices de Firebase necesarios para el proyecto.

## Índices de Firestore Requeridos

El proyecto requiere los siguientes índices compuestos en Firestore:

### 1. Índice para Stories (status + createdAt)
**Colección:** `stories`
**Campos:**
- `status` (Ascending)
- `createdAt` (Descending)

**Crear automáticamente:** [Click aquí](https://console.firebase.google.com/v1/r/project/aimara-47e2b/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9haW1hcmEtNDdlMmIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3N0b3JpZXMvaW5kZXhlcy9fEAEaCgoGc3RhdHVzEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg)

### 2. Índice para Stories con Categoría (status + category + createdAt)
**Colección:** `stories`
**Campos:**
- `status` (Ascending)
- `category` (Ascending)
- `createdAt` (Descending)

### 3. Índice para Chat Messages (roomId + timestamp)
**Colección:** `chatMessages`
**Campos:**
- `roomId` (Ascending)
- `timestamp` (Descending)

**Crear automáticamente:** [Click aquí](https://console.firebase.google.com/v1/r/project/aimara-47e2b/firestore/indexes?create_composite=ClFwcm9qZWN0cy9haW1hcmEtNDdlMmIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NoYXRNZXNzYWdlcy9pbmRleGVzL18QARoKCgZyb29tSWQQARoNCgl0aW1lc3RhbXAQAhoMCghfX25hbWVfXxAC)

## Métodos de Creación

### Método 1: Usando los Links de Arriba (Recomendado)
1. Haz click en los links proporcionados arriba
2. Inicia sesión en Firebase Console
3. Confirma la creación del índice
4. Espera a que se construya (generalmente toma 1-5 minutos)

### Método 2: Desde Firebase Console Manualmente
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: `aimara-47e2b`
3. En el menú lateral, ve a **Firestore Database**
4. Selecciona la pestaña **Indexes**
5. Haz click en **Create Index**
6. Configura cada índice según los campos especificados arriba
7. Haz click en **Create**

### Método 3: Usando Firebase CLI
Si tienes Firebase CLI instalado, puedes desplegar los índices automáticamente:

```bash
# Instalar Firebase CLI (si no está instalado)
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar el proyecto (solo la primera vez)
firebase init firestore

# Desplegar índices
firebase deploy --only firestore:indexes
```

El archivo `firestore.indexes.json` en la raíz del proyecto contiene la configuración completa.

## Verificar Estado de los Índices

1. Ve a Firebase Console > Firestore Database > Indexes
2. Verifica que todos los índices estén en estado **Enabled**
3. Si alguno está en **Building**, espera a que termine (puede tardar varios minutos)

## Solución de Problemas

### Error: "The query requires an index"
- Esto significa que falta crear uno de los índices de arriba
- Usa los links proporcionados o créalos manualmente
- Espera a que el índice termine de construirse

### Los índices no aparecen
- Asegúrate de estar en el proyecto correcto (`aimara-47e2b`)
- Verifica que tengas permisos de administrador en el proyecto
- Intenta cerrar sesión y volver a iniciar

### El índice está en "Building" por mucho tiempo
- Los índices grandes pueden tardar hasta 30 minutos
- Si pasa más de 1 hora, contacta al soporte de Firebase

## Configuración Adicional

### Reglas de Seguridad
Las reglas de Firestore están definidas en `firestore.rules`. Para desplegarlas:

```bash
firebase deploy --only firestore:rules
```

### Backup de Índices
El archivo `firestore.indexes.json` sirve como backup de la configuración. Manténlo actualizado cuando crees nuevos índices.
