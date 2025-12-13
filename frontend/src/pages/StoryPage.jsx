import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getStory } from '../services/firebase'
import StoryDetail from '../components/story/StoryDetail'

function StoryPage() {
  const { id } = useParams()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTranscription, setShowTranscription] = useState(false)

  useEffect(() => {
    loadStory()
  }, [id])

  const loadStory = async () => {
    try {
      setLoading(true)
      const data = await getStory(id)

      if (!data) {
        setError('Relato no encontrado')
        return
      }

      setStory(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      ritual: '🌾',
      legend: '📖',
      personal_story: '👤',
      historical: '🏛️',
      myth: '✨',
      other: '💬'
    }
    return icons[category] || '💬'
  }

  const getCategoryName = (category) => {
    const names = {
      ritual: 'Ritual',
      legend: 'Leyenda',
      personal_story: 'Historia Personal',
      historical: 'Histórico',
      myth: 'Mito',
      other: 'Otro'
    }
    return names[category] || 'Historia'
  }

  const shareStory = () => {
    const url = window.location.href
    const text = `${story.title} - Historias Vivientes Aymara`

    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: text,
        url: url
      })
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(url)
      alert('URL copiada al portapapeles')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Cargando relato...</p>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error || 'Relato no encontrado'}
          </h2>
          <Link to="/" className="btn-primary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{story.title} - Historias Vivientes Aymara</title>
        <meta name="description" content={story.description} />
        <meta property="og:title" content={story.title} />
        <meta property="og:description" content={story.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta name="geo.position" content={`${story.location.latitude};${story.location.longitude}`} />
        <meta name="geo.placename" content={story.location.placeName || ''} />
      </Helmet>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container-custom py-4">
          <Link to="/" className="text-primary-600 hover:text-primary-700 flex items-center">
            ← Volver a historias
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <StoryDetail story={story} />
      </main>
    </div>
  )
}

export default StoryPage
