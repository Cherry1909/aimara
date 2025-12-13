import { useState, useRef, useCallback } from 'react'

/**
 * Hook para manejar grabación de audio con MediaRecorder API
 */
export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const streamRef = useRef(null)

  /**
   * Iniciar grabación
   */
  const startRecording = useCallback(async () => {
    try {
      // Solicitar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      streamRef.current = stream

      // Determinar formato soportado
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      // Evento cuando hay datos disponibles
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      // Evento cuando termina la grabación
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)

        setAudioBlob(blob)
        setAudioUrl(url)

        // Detener el stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }

        // Limpiar timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }

      // Iniciar grabación
      mediaRecorder.start(100) // Capturar datos cada 100ms
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)

      // Timer para mostrar tiempo de grabación
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error al iniciar grabación:', error)
      throw new Error('No se pudo acceder al micrófono. Verifica los permisos.')
    }
  }, [])

  /**
   * Pausar/Reanudar grabación
   */
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return

    if (isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      mediaRecorderRef.current.pause()
      setIsPaused(true)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPaused])

  /**
   * Detener grabación
   */
  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return

    mediaRecorderRef.current.stop()
    setIsRecording(false)
    setIsPaused(false)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }, [])

  /**
   * Cancelar grabación
   */
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    setAudioBlob(null)
    setAudioUrl(null)
    chunksRef.current = []
  }, [isRecording])

  /**
   * Limpiar audio grabado
   */
  const clearAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
  }, [audioUrl])

  return {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    startRecording,
    togglePause,
    stopRecording,
    cancelRecording,
    clearAudio
  }
}

export default useAudioRecorder
