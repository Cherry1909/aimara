import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Crear instancia de axios con configuración por defecto
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 segundos
})

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)

    if (error.response) {
      // Error con respuesta del servidor
      const message = error.response.data?.detail || error.response.statusText
      throw new Error(message)
    } else if (error.request) {
      // Error de red
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
    } else {
      // Otro tipo de error
      throw new Error(error.message)
    }
  }
)

// === STORIES ENDPOINTS ===

export const createStory = async (storyData) => {
  const response = await apiClient.post('/stories/', storyData)
  return response.data
}

export const getStory = async (storyId) => {
  const response = await apiClient.get(`/stories/${storyId}`)
  return response.data
}

export const listStories = async (params = {}) => {
  const response = await apiClient.get('/stories/', { params })
  return response.data
}

export const updateStory = async (storyId, updateData) => {
  const response = await apiClient.put(`/stories/${storyId}`, updateData)
  return response.data
}

export const deleteStory = async (storyId) => {
  const response = await apiClient.delete(`/stories/${storyId}`)
  return response.data
}

export const findNearbyStories = async (latitude, longitude, radius_km = 10, limit = 20) => {
  const response = await apiClient.get('/stories/nearby/search', {
    params: { latitude, longitude, radius_km, limit }
  })
  return response.data
}

// === AUDIO ENDPOINTS ===

export const processAudio = async (storyId, audioUrl, language = 'ay') => {
  const response = await apiClient.post('/audio/process', {
    story_id: storyId,
    audio_url: audioUrl,
    language: language  // ay=aymara, es=español
  })
  return response.data
}

export const getProcessingStatus = async (jobId) => {
  const response = await apiClient.get(`/audio/status/${jobId}`)
  return response.data
}

export const clearJobStatus = async (jobId) => {
  const response = await apiClient.delete(`/audio/status/${jobId}`)
  return response.data
}

// === QR ENDPOINTS ===

export const getQRCode = async (storyId, size = 512) => {
  const response = await apiClient.get(`/qr/${storyId}`, { params: { size } })
  return response.data
}

export const getPrintableQR = async (storyId) => {
  const response = await apiClient.get(`/qr/${storyId}/print`)
  return response.data
}

export const regenerateQR = async (storyId) => {
  const response = await apiClient.post(`/qr/${storyId}/regenerate`)
  return response.data
}

// Exportar cliente para uso avanzado
export default apiClient
