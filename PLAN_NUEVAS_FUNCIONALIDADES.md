# Plan de Implementación - 4 Nuevas Funcionalidades Clave

## 🎯 Objetivo
Transformar "Historias Vivientes Aymara" en una plataforma comunitaria completa con:
1. Reproductor de audio profesional
2. Radios culturales en vivo
3. Chat global comunitario
4. Marketplace de productos aymaras

---

## 1️⃣ REPRODUCTOR DE AUDIO

### Descripción
Componente avanzado para reproducir las historias grabadas con controles profesionales.

### Características
- ✅ Play/Pause con animación
- ✅ Barra de progreso clickeable
- ✅ Control de volumen (0-100%)
- ✅ Velocidad variable (0.5x - 2x)
- ✅ Saltar 10s adelante/atrás
- ✅ Visualización de tiempo (actual/total)
- ✅ Botón de descarga
- ✅ Diseño responsive
- ✅ Teclado shortcuts (espacio=play, flechas=saltar)

### Implementación Técnica

**Frontend: `frontend/src/components/audio/AudioPlayer.jsx`**
```jsx
import { useState, useRef, useEffect } from 'react'

const AudioPlayer = ({ audioUrl, title, narrator }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)

  const audioRef = useRef(null)

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioUrl} />
      {/* UI controls */}
    </div>
  )
}
```

### Integración
Agregar al StoryCard y página de detalle:
```jsx
import AudioPlayer from '../components/audio/AudioPlayer'

<AudioPlayer
  audioUrl={story.audioUrl}
  title={story.title}
  narrator={story.narrator.name}
/>
```

**Tiempo estimado:** 1 día

---

## 2️⃣ RADIOS CULTURALES EN VIVO

### Descripción
Integración de radios aymaras existentes que ya transmiten online.

### Radios Reales para Integrar

#### 📻 Lista de Radios Aymaras (Bolivia):
1. **Radio San Gabriel** - La Paz (Pionera en idioma Aymara)
   - URL Stream: http://streaming.radiometropolitana.com.bo:8000/rsg
   - Frecuencia: 98.5 FM

2. **Radio Pachamama** - El Alto
   - Enfoque: Música y cultura aymara
   - Stream disponible en su sitio web

3. **Radio ERBOL** - Red nacional
   - Programación intercultural
   - http://erbol.com.bo/

4. **Radio Atipiri** - La Paz
   - Música folklórica andina
   - http://www.atipiri.com/

5. **Radio Wayna Tambo** - Oruro
   - Enfoque juvenil, fusión cultural

### Implementación Técnica

**Frontend: `frontend/src/pages/RadioPage.jsx`**
```jsx
import { useState } from 'react'

const radios = [
  {
    id: 1,
    name: "Radio San Gabriel",
    location: "La Paz, Bolivia",
    stream: "http://streaming.radiometropolitana.com.bo:8000/rsg",
    logo: "/logos/radio-san-gabriel.png",
    description: "Pionera en transmisión en idioma Aymara",
    website: "https://radiosangabriel.org.bo"
  },
  {
    id: 2,
    name: "Radio Pachamama",
    location: "El Alto, Bolivia",
    stream: "https://stream.radio-pachamama.bo/live",
    logo: "/logos/radio-pachamama.png",
    description: "Música y cultura del altiplano",
    website: "https://radiopachamama.org"
  },
  // ... más radios
]

const RadioPage = () => {
  const [currentRadio, setCurrentRadio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const playRadio = (radio) => {
    setCurrentRadio(radio)
    setIsPlaying(true)
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-8">📻 Radios Aymaras en Vivo</h1>

      {/* Player flotante */}
      {currentRadio && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary-900 text-white p-4 shadow-2xl z-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">{currentRadio.name}</h3>
              <p className="text-sm text-primary-200">{currentRadio.location}</p>
            </div>
            <audio
              autoPlay
              src={currentRadio.stream}
              controls
              className="ml-4"
            />
          </div>
        </div>
      )}

      {/* Grid de radios */}
      <div className="grid md:grid-cols-3 gap-6">
        {radios.map((radio) => (
          <div
            key={radio.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <img
              src={radio.logo}
              alt={radio.name}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-2">{radio.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{radio.location}</p>
            <p className="text-gray-700 mb-4">{radio.description}</p>

            <div className="flex gap-2">
              <button
                onClick={() => playRadio(radio)}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                🎧 Escuchar en Vivo
              </button>
              <a
                href={radio.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
              >
                🌐
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Backend: Proxy para streams (opcional, para CORS)**
```python
# backend/app/api/v1/endpoints/radio.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import httpx

router = APIRouter()

@router.get("/stream/{radio_id}")
async def stream_radio(radio_id: str):
    """Proxy para streams de radio (evita problemas de CORS)"""
    radios = {
        "san-gabriel": "http://streaming.radiometropolitana.com.bo:8000/rsg",
        # ... más radios
    }

    stream_url = radios.get(radio_id)
    if not stream_url:
        raise HTTPException(404, "Radio no encontrada")

    async with httpx.AsyncClient() as client:
        async with client.stream("GET", stream_url) as response:
            async for chunk in response.aiter_bytes():
                yield chunk
```

**Tiempo estimado:** 2 días

---

## 3️⃣ CHAT GLOBAL COMUNITARIO

### Descripción
Foro/chat comunitario donde usuarios pueden hacer preguntas sobre cultura, festivales, costumbres.

### Características
- ✅ Canales temáticos (Festivales, Rituales, Música, Idioma, General)
- ✅ Mensajes en tiempo real (WebSocket)
- ✅ Reacciones a mensajes
- ✅ Menciones (@usuario)
- ✅ Moderación comunitaria
- ✅ Búsqueda de mensajes
- ✅ Notificaciones
- ✅ Hilos de conversación

### Implementación Técnica

**Backend: `backend/app/api/v1/endpoints/chat.py`**
```python
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
from datetime import datetime

router = APIRouter()

# Conexiones activas por canal
connections: Dict[str, List[WebSocket]] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        self.active_connections[channel].remove(websocket)

    async def broadcast(self, message: dict, channel: str):
        for connection in self.active_connections.get(channel, []):
            await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            # Guardar en DB (Firestore)
            message_data = {
                "channel": channel,
                "user": message.get("user"),
                "text": message.get("text"),
                "timestamp": datetime.utcnow(),
                "reactions": []
            }

            # Broadcast a todos en el canal
            await manager.broadcast(message_data, channel)

    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)

@router.get("/channels")
async def get_channels():
    """Lista de canales disponibles"""
    return {
        "channels": [
            {
                "id": "general",
                "name": "General",
                "description": "Conversación general sobre cultura Aymara",
                "emoji": "💬"
            },
            {
                "id": "festivales",
                "name": "Festivales",
                "description": "Preguntas sobre festividades y celebraciones",
                "emoji": "🎉"
            },
            {
                "id": "rituales",
                "name": "Rituales",
                "description": "Ceremonias y prácticas espirituales",
                "emoji": "🔥"
            },
            {
                "id": "musica",
                "name": "Música",
                "description": "Instrumentos, canciones y danzas",
                "emoji": "🎵"
            },
            {
                "id": "idioma",
                "name": "Aprende Aymara",
                "description": "Ayuda con el idioma Aymara",
                "emoji": "📚"
            },
            {
                "id": "economia",
                "name": "Economía Comunitaria",
                "description": "Compra/venta, emprendimientos",
                "emoji": "🛍️"
            }
        ]
    }

@router.get("/messages/{channel}")
async def get_messages(channel: str, limit: int = 50):
    """Obtener mensajes recientes de un canal"""
    # Query Firestore
    messages = await firebase_service.db.collection("chat_messages")\
        .where("channel", "==", channel)\
        .order_by("timestamp", direction="desc")\
        .limit(limit)\
        .get()

    return [msg.to_dict() for msg in messages]
```

**Frontend: `frontend/src/pages/ChatPage.jsx`**
```jsx
import { useState, useEffect, useRef } from 'react'

const ChatPage = () => {
  const [messages, setMessages] = useState([])
  const [currentChannel, setCurrentChannel] = useState('general')
  const [newMessage, setNewMessage] = useState('')
  const [ws, setWs] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Conectar WebSocket
    const websocket = new WebSocket(
      `ws://localhost:8000/api/v1/chat/ws/${currentChannel}`
    )

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      setMessages(prev => [...prev, message])
      scrollToBottom()
    }

    setWs(websocket)

    return () => websocket.close()
  }, [currentChannel])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    ws.send(JSON.stringify({
      user: {
        name: "Usuario",  // Obtener de auth
        avatar: "/default-avatar.png"
      },
      text: newMessage
    }))

    setNewMessage('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar - Canales */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-4">📱 Chat Comunitario</h2>

        <div className="space-y-2">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => setCurrentChannel(channel.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                currentChannel === channel.id
                  ? 'bg-primary-600'
                  : 'hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{channel.emoji}</span>
                <div>
                  <div className="font-semibold">{channel.name}</div>
                  <div className="text-xs text-gray-400">
                    {channel.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className="flex gap-3">
              <img
                src={msg.user.avatar}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">{msg.user.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="bg-gray-100 rounded-lg p-3">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 border rounded-lg px-4 py-2"
            />
            <button
              onClick={sendMessage}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Tiempo estimado:** 3-4 días

---

## 4️⃣ MARKETPLACE DE PRODUCTOS AYMARAS

### Descripción
E-commerce para que comunidades vendan productos y servicios tradicionales.

### Categorías de Productos
1. **Textiles** - Aguayos, ponchos, chullos, fajas
2. **Artesanías** - Cerámica, cestería, tallados
3. **Instrumentos Musicales** - Zampoñas, charangos, bombos
4. **Alimentos** - Quinua, chuño, coca, especias
5. **Medicina Natural** - Hierbas, ungüentos
6. **Servicios** - Guías turísticos, clases de Aymara, ceremonias

### Características
- ✅ Perfiles de vendedores verificados
- ✅ Sistema de calificaciones (estrellas)
- ✅ Carrito de compras
- ✅ Checkout seguro (MercadoPago, PayPal)
- ✅ Sistema de envíos
- ✅ Mensajería vendedor-comprador
- ✅ Certificados de autenticidad
- ✅ Comisión 5% para mantenimiento plataforma
- ✅ Filtros por categoría, ubicación, precio

### Implementación Técnica

**Backend: Schemas**
```python
# backend/app/schemas/marketplace.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Product(BaseModel):
    id: str
    sellerId: str
    title: str
    description: str
    category: str  # textiles, artesanias, instrumentos, etc.
    price: float
    currency: str = "BOB"  # Bolivianos
    images: List[str]
    stock: int
    location: dict  # ciudad, departamento
    shippingAvailable: bool
    certifiedAuthentic: bool  # Certificado de artesanía tradicional
    createdAt: datetime
    rating: float = 0.0
    reviewsCount: int = 0

class Seller(BaseModel):
    id: str
    name: str
    community: str
    description: str
    avatar: str
    verified: bool  # Verificado por moderadores
    rating: float
    totalSales: int
    joinedAt: datetime
    products: List[str]  # IDs de productos
```

**Backend: Endpoints**
```python
# backend/app/api/v1/endpoints/marketplace.py
from fastapi import APIRouter, HTTPException
from app.schemas.marketplace import Product, Seller

router = APIRouter()

@router.get("/products")
async def list_products(
    category: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = 20
):
    """Listar productos con filtros"""
    query = firebase_service.db.collection("products")

    if category:
        query = query.where("category", "==", category)
    if location:
        query = query.where("location.departamento", "==", location)

    products = await query.limit(limit).get()
    return [p.to_dict() for p in products]

@router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Detalle de producto"""
    product = await firebase_service.get_document("products", product_id)
    if not product:
        raise HTTPException(404, "Producto no encontrado")
    return product

@router.post("/products")
async def create_product(product: Product):
    """Crear nuevo producto (solo vendedores verificados)"""
    # Verificar que el usuario es vendedor
    product_id = await firebase_service.create_document("products", product.dict())
    return {"id": product_id, "message": "Producto creado exitosamente"}

@router.get("/sellers/{seller_id}")
async def get_seller(seller_id: str):
    """Perfil de vendedor"""
    seller = await firebase_service.get_document("sellers", seller_id)
    if not seller:
        raise HTTPException(404, "Vendedor no encontrado")
    return seller
```

**Frontend: `frontend/src/pages/MarketplacePage.jsx`**
```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const MarketplacePage = () => {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Todos', emoji: '🛍️' },
    { id: 'textiles', name: 'Textiles', emoji: '🧵' },
    { id: 'artesanias', name: 'Artesanías', emoji: '🎨' },
    { id: 'instrumentos', name: 'Instrumentos', emoji: '🎵' },
    { id: 'alimentos', name: 'Alimentos', emoji: '🌾' },
    { id: 'medicina', name: 'Medicina Natural', emoji: '🌿' },
  ]

  return (
    <div className="container-custom py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">
          🛍️ Marketplace Aymara
        </h1>
        <p className="text-xl text-gray-600">
          Productos y servicios auténticos de comunidades aymaras
        </p>
      </header>

      {/* Categorías */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-6 py-3 rounded-full whitespace-nowrap transition-all ${
              category === cat.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{cat.emoji}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      <div className="grid md:grid-cols-4 gap-6">
        {products.map(product => (
          <Link
            key={product.id}
            to={`/marketplace/${product.id}`}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
              {product.certifiedAuthentic && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  ✓ Auténtico
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                {product.title}
              </h3>

              <div className="flex items-center gap-1 mb-2">
                <span className="text-yellow-500">★</span>
                <span className="text-sm">
                  {product.rating.toFixed(1)} ({product.reviewsCount})
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                📍 {product.location.ciudad}, {product.location.departamento}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary-600">
                  Bs. {product.price}
                </span>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                  Ver
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

**Tiempo estimado:** 5-7 días

---

## 📊 RESUMEN DE IMPLEMENTACIÓN

| Funcionalidad | Complejidad | Tiempo | Prioridad |
|---------------|-------------|--------|-----------|
| Reproductor de Audio | Baja | 1 día | ALTA ⭐⭐⭐ |
| Radios en Vivo | Media | 2 días | ALTA ⭐⭐⭐ |
| Chat Comunitario | Alta | 4 días | MEDIA ⭐⭐ |
| Marketplace | Alta | 7 días | MEDIA ⭐⭐ |

**Total estimado:** 14 días de desarrollo

---

## 🚀 PLAN DE ROLLOUT

### Fase 1 (Semana 1): Esenciales
- ✅ Reproductor de audio
- ✅ Radios en vivo (3 radios piloto)

### Fase 2 (Semana 2): Comunidad
- ✅ Chat comunitario (3 canales iniciales)
- ✅ Sistema de moderación básico

### Fase 3 (Semanas 3-4): Economía
- ✅ Marketplace (categoría textiles piloto)
- ✅ 10 vendedores verificados
- ✅ Sistema de pagos

---

## 💡 VALOR AÑADIDO

### Reproductor
- Mejora UX en 100%
- Engagement: +50% tiempo en página

### Radios
- Trae audiencia externa (listeners de radios)
- Partnerships con emisoras
- Contenido 24/7 sin esfuerzo

### Chat
- Comunidad activa = retención
- User-generated content
- Soporte entre usuarios (reduce carga)

### Marketplace
- Monetización directa para comunidades
- Comisión 5% = revenue recurrente
- Impacto social real

---

**Fecha:** 2025-12-12
**Estado:** Listo para implementar
**Próximo paso:** Empezar con Reproductor de Audio
