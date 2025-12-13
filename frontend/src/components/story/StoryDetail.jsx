import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import AudioPlayer from '../audio/AudioPlayer'
import { getFullAudioUrl } from '../../services/storage'
import 'leaflet/dist/leaflet.css'

/**
 * Vista detallada de un relato
 */
function StoryDetail({ story }) {
  const {
    title,
    description,
    audioUrl,
    category,
    narrator,
    location,
    transcription,
    keywords = [],
    createdAt,
    culturalSignificance
  } = story

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryLabel = (cat) => {
    const labels = {
      ritual: '🪔 Ritual',
      legend: '📖 Leyenda',
      personal_story: '👤 Historia Personal',
      tradition: '🎭 Tradición',
      history: '📜 Historia'
    }
    return labels[cat] || cat
  }

  const getSignificanceLabel = (sig) => {
    const labels = {
      high: '⭐⭐⭐ Alta',
      medium: '⭐⭐ Media',
      low: '⭐ Baja'
    }
    return labels[sig] || sig
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
            {getCategoryLabel(category)}
          </span>
          {culturalSignificance && (
            <span className="text-sm">
              {getSignificanceLabel(culturalSignificance)}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-3">{title || 'Relato Aymara'}</h1>
        {description && (
          <p className="text-primary-100 text-lg">{description}</p>
        )}
        <p className="text-primary-200 text-sm mt-4">
          Publicado el {formatDate(createdAt)}
        </p>
      </div>

      {/* Audio Player */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🎧 Escuchar Relato</h2>
        <AudioPlayer
          src={getFullAudioUrl(audioUrl)}
          title={title || 'Audio del relato'}
          narrator={narrator?.name}
        />
      </div>

      {/* Transcription */}
      {transcription && (transcription.aymara || transcription.spanish) && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📝 Transcripción</h2>

          {transcription.aymara && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Aymara</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 leading-relaxed">
                {transcription.aymara}
              </div>
            </div>
          )}

          {transcription.spanish && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Español</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 leading-relaxed">
                {transcription.spanish}
              </div>
            </div>
          )}

          {transcription.confidence && (
            <p className="text-sm text-gray-500 mt-4">
              Confianza de transcripción: {Math.round(transcription.confidence * 100)}%
            </p>
          )}
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🔑 Palabras Clave</h2>
          <div className="flex flex-wrap gap-3">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Narrator Info */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">👤 Narrador</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="text-lg font-semibold text-gray-800">
                {narrator.name || 'Anónimo'}
              </p>
            </div>
            {narrator.age && (
              <div>
                <p className="text-sm text-gray-500">Edad</p>
                <p className="text-lg text-gray-700">{narrator.age} años</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Comunidad</p>
              <p className="text-lg text-gray-700">
                {narrator.community || 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Idioma</p>
              <p className="text-lg text-gray-700 capitalize">
                {narrator.language || 'Aymara'}
              </p>
            </div>
          </div>
        </div>

        {/* Location Map */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📍 Ubicación</h2>
          {location?.placeName && (
            <p className="text-gray-700 mb-3">{location.placeName}</p>
          )}
          <div className="rounded-lg overflow-hidden border-2 border-gray-200">
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={13}
              style={{ height: '300px', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[location.latitude, location.longitude]} />
            </MapContainer>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Coordenadas: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">📤 Compartir</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              const url = window.location.href
              navigator.clipboard.writeText(url)
              alert('URL copiada al portapapeles')
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>📋</span>
            <span>Copiar enlace</span>
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Escucha este relato aymara: ${title || 'Relato'} - ${window.location.href}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center space-x-2"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center space-x-2"
          >
            <span>📘</span>
            <span>Facebook</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default StoryDetail
