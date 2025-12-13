import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

/**
 * Componente reproductor de audio personalizado con controles avanzados
 */
function AudioPlayer({ src, title = 'Audio', narrator, onEnded }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (onEnded) onEnded()
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onEnded])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio) return

    const seekTime = parseFloat(e.target.value)
    audio.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const handleVolumeChange = (e) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    audio.volume = newVolume
    setVolume(newVolume)
  }

  const skip = (seconds) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds))
  }

  const handleSpeedChange = (speed) => {
    const audio = audioRef.current
    if (!audio) return

    audio.playbackRate = speed
    setPlaybackRate(speed)
    setShowSpeedMenu(false)
  }

  const downloadAudio = () => {
    const a = document.createElement('a')
    a.href = src
    a.download = `${title || 'audio'}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 shadow-lg">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Título */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        {narrator && (
          <p className="text-sm text-gray-600 mt-1">Narrado por: {narrator}</p>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="mb-6">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controles principales */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={() => skip(-10)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 shadow-md transition"
          title="Retroceder 10s"
        >
          <span className="text-xl">⏪</span>
        </button>

        <button
          onClick={togglePlayPause}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg transition transform hover:scale-105"
        >
          <span className="text-3xl">{isPlaying ? '⏸️' : '▶️'}</span>
        </button>

        <button
          onClick={() => skip(10)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 shadow-md transition"
          title="Adelantar 10s"
        >
          <span className="text-xl">⏩</span>
        </button>
      </div>

      {/* Control de volumen */}
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-gray-600">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <span className="text-sm text-gray-600 w-12">{Math.round(volume * 100)}%</span>
      </div>

      {/* Controles adicionales */}
      <div className="flex items-center justify-between pt-4 border-t border-primary-200">
        {/* Velocidad de reproducción */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow text-sm font-semibold transition"
          >
            ⚡ {playbackRate}x
          </button>

          {showSpeedMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl overflow-hidden z-10">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`block w-full px-4 py-2 text-left hover:bg-primary-50 transition ${
                    playbackRate === speed ? 'bg-primary-100 font-bold' : ''
                  }`}
                >
                  {speed}x {speed === 1 && '(Normal)'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botón de descarga */}
        <button
          onClick={downloadAudio}
          className="px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow text-sm font-semibold transition flex items-center gap-2"
          title="Descargar audio"
        >
          <span>💾</span>
          <span>Descargar</span>
        </button>
      </div>
    </div>
  )
}

AudioPlayer.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  narrator: PropTypes.string,
  onEnded: PropTypes.func
}

export default AudioPlayer
