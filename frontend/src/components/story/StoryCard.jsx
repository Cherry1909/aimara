import { Link } from 'react-router-dom'

/**
 * Tarjeta de relato moderna con glassmorphism y animaciones
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

  const getCategoryIcon = (cat) => {
    const icons = {
      ritual: '🔥',
      legend: '📖',
      personal_story: '👤',
      tradition: '🎭',
      history: '📜',
      music: '🎵'
    }
    return icons[cat] || '📝'
  }

  const getCategoryLabel = (cat) => {
    const labels = {
      ritual: 'Ritual',
      legend: 'Leyenda',
      personal_story: 'Historia Personal',
      tradition: 'Tradición',
      history: 'Historia',
      music: 'Música'
    }
    return labels[cat] || cat
  }

  const getCategoryColor = (cat) => {
    const colors = {
      ritual: 'from-orange-500 to-red-500',
      legend: 'from-purple-500 to-pink-500',
      personal_story: 'from-blue-500 to-cyan-500',
      tradition: 'from-green-500 to-emerald-500',
      history: 'from-amber-500 to-yellow-500',
      music: 'from-indigo-500 to-purple-500'
    }
    return colors[cat] || 'from-gray-500 to-gray-600'
  }

  return (
    <Link to={`/story/${id}`} className="block group">
      <article className="card-glass card-hover-lift h-full flex flex-col overflow-hidden group-hover:ring-2 group-hover:ring-primary-500/50 transition-all duration-300">
        {/* Header decorativo con gradiente */}
        <div className={`h-2 bg-gradient-to-r ${getCategoryColor(category)}`}></div>

        <div className="p-6 flex-1 flex flex-col">
          {/* Header con categoría y duración */}
          <div className="flex items-center justify-between mb-4">
            <div className={`badge-primary flex items-center gap-2 bg-gradient-to-r ${getCategoryColor(category)} text-white border-0`}>
              <span className="text-lg">{getCategoryIcon(category)}</span>
              <span className="font-semibold">{getCategoryLabel(category)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{formatDuration(audioDuration || 0)}</span>
            </div>
          </div>

          {/* Título con hover effect */}
          <h3 className="text-2xl font-display font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
            {title || 'Sin título'}
          </h3>

          {/* Descripción */}
          <p className="text-gray-600 text-base mb-4 line-clamp-3 flex-1">
            {description || 'Sin descripción disponible'}
          </p>

          {/* Keywords con estilo moderno */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {keywords.slice(0, 3).map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gradient-to-r from-primary-50 to-purple-50 text-primary-700 rounded-full border border-primary-200/50"
                >
                  #{keyword}
                </span>
              ))}
              {keywords.length > 3 && (
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                  +{keywords.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Divider sutil */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>

          {/* Footer con información del narrador */}
          <div className="space-y-3">
            {/* Narrador */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-lg shadow-lg">
                {narrator?.name ? narrator.name.charAt(0).toUpperCase() : '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {narrator?.name || 'Narrador Anónimo'}
                </p>
                {narrator?.community && (
                  <p className="text-sm text-gray-500 truncate">
                    {narrator.community}
                  </p>
                )}
              </div>
            </div>

            {/* Ubicación y fecha */}
            <div className="flex items-center justify-between text-sm">
              {location?.placeName && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate max-w-[150px]">{location.placeName}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">{formatDate(createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Hover indicator */}
          <div className="mt-4 flex items-center gap-2 text-primary-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Escuchar historia</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default StoryCard
