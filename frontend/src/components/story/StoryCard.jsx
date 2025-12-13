import { Link } from 'react-router-dom'

/**
 * Tarjeta de relato para grilla/lista
 */
function StoryCard({ story }) {
  const {
    id,
    title,
    description,
    category,
    narrator,
    location,
    audioDuration,
    createdAt,
    keywords = []
  } = story

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
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

  return (
    <Link to={`/story/${id}`} className="block group">
      <div className="card hover:shadow-xl transition-shadow duration-300">
        {/* Header con categoría */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
            {getCategoryLabel(category)}
          </span>
          <span className="text-sm text-gray-500">
            {formatDuration(audioDuration || 0)}
          </span>
        </div>

        {/* Título y descripción */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition">
          {title || 'Sin título'}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {description || 'Sin descripción'}
        </p>

        {/* Palabras clave */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {keywords.slice(0, 3).map((keyword, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
              >
                {keyword}
              </span>
            ))}
            {keywords.length > 3 && (
              <span className="text-xs px-2 py-1 text-gray-500">
                +{keywords.length - 3} más
              </span>
            )}
          </div>
        )}

        {/* Footer con narrador y ubicación */}
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span>👤</span>
              <span className="font-medium">{narrator?.name || 'Anónimo'}</span>
            </div>
            {location?.placeName && (
              <div className="flex items-center space-x-1">
                <span>📍</span>
                <span className="text-xs">{location.placeName}</span>
              </div>
            )}
          </div>
          {narrator?.community && (
            <div className="text-xs text-gray-500 mt-1">
              {narrator.community}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-2">
            {formatDate(createdAt)}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default StoryCard
