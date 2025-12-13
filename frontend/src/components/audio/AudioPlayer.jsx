import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

/**
 * Reproductor de audio moderno con diseño glassmorphism y animaciones
 */
function AudioPlayer({ src, title = 'Audio', narrator, onEnded }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="card-glass overflow-hidden">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Header con fondo degradado */}
      <div className="relative bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 p-6">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Contenido del header */}
        <div className="relative z-10">
          {/* Icono de audio animado */}
          <div className="flex items-center justify-center mb-4">
            <div className={`w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
          </div>

          {/* Título y narrador */}
          <div className="text-center text-white">
            <h3 className="text-xl font-display font-bold mb-1 line-clamp-1">{title}</h3>
            {narrator && (
              <p className="text-sm text-white/80 flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{narrator}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="p-6 space-y-6">
        {/* Progress bar moderna */}
        <div className="space-y-2">
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Barra de progreso con gradiente */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"></div>
            </div>
          </div>

          {/* Slider invisible sobre la barra */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-x-0 top-0 w-full h-2 opacity-0 cursor-pointer"
          />

          {/* Timestamps */}
          <div className="flex justify-between text-sm text-gray-600 font-medium">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controles principales */}
        <div className="flex items-center justify-center gap-4">
          {/* Retroceder */}
          <button
            onClick={() => skip(-10)}
            className="btn-icon group"
            title="Retroceder 10s"
          >
            <svg className="w-6 h-6 text-gray-700 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Play/Pause principal */}
          <button
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all active:scale-95"
          >
            {isPlaying ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Adelantar */}
          <button
            onClick={() => skip(10)}
            className="btn-icon group"
            title="Adelantar 10s"
          >
            <svg className="w-6 h-6 text-gray-700 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>

        {/* Controles secundarios */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200">
          {/* Velocidad */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="btn-secondary text-sm flex items-center gap-2 px-4 py-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-mono font-semibold">{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full left-0 mb-2 card p-2 min-w-[120px] animate-scale-in">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      playbackRate === speed
                        ? 'bg-primary-100 text-primary-700'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {speed}x {speed === 1 && <span className="text-xs text-gray-500">Normal</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volumen */}
          <div className="relative">
            <button
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="btn-icon"
              title="Volumen"
            >
              {volume === 0 ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : volume < 0.5 ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            {showVolumeSlider && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 card p-4 animate-scale-in">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="h-24 w-2 appearance-none bg-gray-200 rounded-full cursor-pointer accent-primary-500"
                  style={{ writingMode: 'bt-lr' }}
                />
                <div className="text-center text-xs font-medium text-gray-600 mt-2">
                  {Math.round(volume * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* Descargar */}
          <button
            onClick={downloadAudio}
            className="btn-icon"
            title="Descargar audio"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
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
