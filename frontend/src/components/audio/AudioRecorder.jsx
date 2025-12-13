import { useEffect } from 'react'
import { useAudioRecorder } from '../../hooks/useAudioRecorder'

/**
 * Componente de grabación de audio con MediaRecorder API
 */
function AudioRecorder({ onRecorded, maxDuration = 600 }) {
  const {
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
  } = useAudioRecorder()

  // Detener automáticamente si se alcanza el tiempo máximo
  useEffect(() => {
    if (isRecording && recordingTime >= maxDuration) {
      stopRecording()
    }
  }, [isRecording, recordingTime, maxDuration, stopRecording])

  // Notificar cuando se complete la grabación
  useEffect(() => {
    if (audioBlob && !isRecording) {
      onRecorded(audioBlob, recordingTime)
    }
  }, [audioBlob, isRecording]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleNewRecording = () => {
    clearAudio()
  }

  return (
    <div className="space-y-6">
      {/* Visualización de estado */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8 text-center">
        {/* Indicador de grabación */}
        <div className="mb-6">
          {isRecording && (
            <div className="flex items-center justify-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-lg font-semibold text-gray-700">
                {isPaused ? 'En pausa' : 'Grabando...'}
              </span>
            </div>
          )}
          {!isRecording && !audioUrl && (
            <div className="text-6xl mb-2">🎤</div>
          )}
          {audioUrl && !isRecording && (
            <div className="text-6xl mb-2">✅</div>
          )}
        </div>

        {/* Timer */}
        <div className="text-5xl font-bold text-primary-600 mb-2 font-mono">
          {formatTime(recordingTime)}
        </div>
        <div className="text-sm text-gray-500">
          {maxDuration && `Máximo: ${formatTime(maxDuration)}`}
        </div>

        {/* Barra de progreso */}
        {maxDuration && isRecording && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Reproductor de audio grabado */}
      {audioUrl && !isRecording && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-3">Vista previa:</h3>
          <audio
            src={audioUrl}
            controls
            className="w-full"
            controlsList="nodownload"
          />
        </div>
      )}

      {/* Controles */}
      <div className="flex justify-center space-x-3">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="btn-primary flex items-center space-x-2 px-8 py-3"
          >
            <span className="text-xl">⏺️</span>
            <span>Iniciar Grabación</span>
          </button>
        )}

        {isRecording && (
          <>
            <button
              onClick={togglePause}
              className="btn-secondary flex items-center space-x-2 px-6 py-3"
            >
              <span className="text-xl">{isPaused ? '▶️' : '⏸️'}</span>
              <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
            </button>

            <button
              onClick={stopRecording}
              className="btn-primary flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700"
            >
              <span className="text-xl">⏹️</span>
              <span>Finalizar</span>
            </button>

            <button
              onClick={cancelRecording}
              className="btn-secondary flex items-center space-x-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600"
            >
              <span className="text-xl">❌</span>
              <span>Cancelar</span>
            </button>
          </>
        )}

        {audioUrl && !isRecording && (
          <button
            onClick={handleNewRecording}
            className="btn-secondary flex items-center space-x-2 px-6 py-3"
          >
            <span className="text-xl">🔄</span>
            <span>Grabar de nuevo</span>
          </button>
        )}
      </div>

      {/* Ayuda */}
      {!isRecording && !audioUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-semibold mb-2">💡 Consejos para una buena grabación:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            <li>Busca un lugar tranquilo sin ruido de fondo</li>
            <li>Habla con claridad y a un ritmo natural</li>
            <li>Mantén el micrófono a una distancia adecuada</li>
            <li>Puedes pausar la grabación en cualquier momento</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default AudioRecorder
