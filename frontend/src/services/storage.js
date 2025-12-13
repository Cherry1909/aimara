import apiClient from './api'

/**
 * Servicio de almacenamiento - Upload de audio al backend
 * (Alternativa gratuita a Firebase Storage)
 */

/**
 * Subir archivo de audio al servidor backend
 * @param {Blob} audioBlob - Blob del audio grabado
 * @param {string} storyId - ID del relato (opcional)
 * @param {function} onProgress - Callback de progreso (0-100)
 * @returns {Promise<{url: string, path: string, size: number}>}
 */
export const uploadAudio = async (audioBlob, storyId = null, onProgress = null) => {
  try {
    // Crear FormData
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')

    if (storyId) {
      formData.append('story_id', storyId)
    }

    // Configurar request con tracking de progreso
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }
    }

    // Enviar al backend
    const response = await apiClient.post('/upload/audio', formData, config)

    if (response.data.success) {
      return response.data.data
    } else {
      throw new Error('Upload failed')
    }

  } catch (error) {
    console.error('Error uploading audio:', error)
    throw error
  }
}

/**
 * Obtener información de un audio
 * @param {string} filename - Nombre del archivo
 * @returns {Promise<{filename: string, url: string, size: number}>}
 */
export const getAudioInfo = async (filename) => {
  try {
    const response = await apiClient.get(`/upload/audio/${filename}`)
    return response.data
  } catch (error) {
    console.error('Error getting audio info:', error)
    throw error
  }
}

/**
 * Eliminar archivo de audio
 * @param {string} filename - Nombre del archivo
 * @returns {Promise<boolean>}
 */
export const deleteAudio = async (filename) => {
  try {
    const response = await apiClient.delete(`/upload/audio/${filename}`)
    return response.data.success
  } catch (error) {
    console.error('Error deleting audio:', error)
    throw error
  }
}

/**
 * Obtener URL completa del audio
 * @param {string} url - URL relativa del audio
 * @returns {string} URL completa
 */
export const getFullAudioUrl = (url) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
  const BASE_URL = API_URL.replace('/api/v1', '')

  if (url.startsWith('http')) {
    return url
  }

  return `${BASE_URL}${url}`
}
