import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listStories } from '../services/firebase'
import StoryCard from '../components/story/StoryCard'

function Home() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Galería de imágenes culturales
  const culturalImages = [
    {
      src: '/imagenes/aymaras_musica.jpg',
      title: 'Música Tradicional',
      description: 'Los sikuris preservan nuestras melodías ancestrales'
    },
    {
      src: '/imagenes/ritual_al_apu.png',
      title: 'Rituales al Apu',
      description: 'Ceremonias sagradas a las montañas protectoras'
    },
    {
      src: '/imagenes/ofrendas_aymaras.jpg',
      title: 'Ceremonias Comunitarias',
      description: 'Ofrendas y celebraciones que unen a la comunidad'
    },
    {
      src: '/imagenes/Sikuris_aymaras.jpg',
      title: 'Bandas de Sikuris',
      description: 'La tradición musical que pasa de generación en generación'
    }
  ]

  useEffect(() => {
    loadStories()
    // Rotación automática de galería cada 5 segundos
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % culturalImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadStories = async () => {
    try {
      setLoading(true)
      const data = await listStories({ pageSize: 20, status: 'published' })
      setStories(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner con Imagen Principal */}
      <header className="relative h-[500px] overflow-hidden">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/imagenes/imagen_principal_en_el_inicio.jpg)',
            backgroundPosition: 'center 30%'
          }}
        >
          {/* Overlay oscuro para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        {/* Contenido del Hero */}
        <div className="relative container-custom h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Historias Vivientes Aymara
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-100 drop-shadow">
              Preservando nuestra cultura a través de relatos orales
            </p>
            <p className="text-lg mb-8 text-gray-200">
              Un archivo vivo de la memoria colectiva aymara.
              Cada voz cuenta, cada historia nos fortalece como pueblo.
            </p>
            <Link
              to="/upload"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-xl transition-all transform hover:scale-105"
            >
              📝 Compartir mi Historia
            </Link>
          </div>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-12">
        {/* Galería Cultural Rotativa */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Nuestra Cultura Viva
          </h2>

          <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Imagen actual */}
            <div className="relative h-96 md:h-[500px]">
              <img
                src={culturalImages[currentImageIndex].src}
                alt={culturalImages[currentImageIndex].title}
                className="w-full h-full object-cover transition-opacity duration-1000"
              />

              {/* Overlay con información */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-3xl font-bold mb-2">
                    {culturalImages[currentImageIndex].title}
                  </h3>
                  <p className="text-lg text-gray-200">
                    {culturalImages[currentImageIndex].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Indicadores de navegación */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {culturalImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-8'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>

            {/* Botones de navegación */}
            <button
              onClick={() => setCurrentImageIndex((prev) =>
                prev === 0 ? culturalImages.length - 1 : prev - 1
              )}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-all"
              aria-label="Anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) =>
                (prev + 1) % culturalImages.length
              )}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-all"
              aria-label="Siguiente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </section>

        {/* Sección de Categorías con Imágenes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Explora por Categoría
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Categoría: Rituales */}
            <Link
              to="/stories?category=ritual"
              className="group relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <img
                src="/imagenes/ritual_al_apu.png"
                alt="Rituales"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">🔥 Rituales</h3>
                  <p className="text-gray-200">Ceremonias sagradas ancestrales</p>
                </div>
              </div>
            </Link>

            {/* Categoría: Música */}
            <Link
              to="/stories?category=music"
              className="group relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <img
                src="/imagenes/sikuris_claveles_rojos.jpg"
                alt="Música"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">🎵 Música</h3>
                  <p className="text-gray-200">Melodías que cuentan historias</p>
                </div>
              </div>
            </Link>

            {/* Categoría: Leyendas */}
            <Link
              to="/stories?category=legend"
              className="group relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <img
                src="/imagenes/ofrendas_aymaras.jpg"
                alt="Leyendas"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">📖 Leyendas</h3>
                  <p className="text-gray-200">Historias transmitidas por generaciones</p>
                </div>
              </div>
            </Link>

            {/* Radios en Vivo */}
            <Link
              to="/radios"
              className="group relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 bg-gradient-to-br from-primary-600 to-primary-700"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl animate-pulse">📡</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">📻 Radios en Vivo</h3>
                  <p className="text-gray-200">Emisoras culturales aymaras</p>
                </div>
              </div>
            </Link>

            {/* Chat Comunitario */}
            <Link
              to="/chat"
              className="group relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 bg-gradient-to-br from-green-600 to-teal-600"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-8xl animate-pulse">💬</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">💬 Chat Comunitario</h3>
                  <p className="text-gray-200">Conversa en tiempo real</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Stories Grid */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800">
              Relatos Recientes
            </h3>
            <Link
              to="/stories"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
            >
              Ver todos
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading && (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500"></div>
              <p className="mt-6 text-gray-600 text-lg">Cargando historias...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-700">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Error:</span> {error}
              </div>
            </div>
          )}

          {!loading && !error && stories.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-gray-700 text-xl font-semibold mb-2">
                Aún no hay relatos publicados
              </p>
              <p className="text-gray-500 mb-6">
                ¡Sé el primero en compartir una historia de tu comunidad!
              </p>
              <Link
                to="/upload"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-lg transition-all"
              >
                Compartir la Primera Historia
              </Link>
            </div>
          )}

          {!loading && !error && stories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </section>

        {/* Sección de llamado a la acción final */}
        <section className="mt-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Texto */}
            <div className="p-12 text-white">
              <h2 className="text-4xl font-bold mb-4">
                Tu voz importa
              </h2>
              <p className="text-xl mb-6 text-primary-100">
                Cada relato fortalece nuestra identidad. Cada voz preserva nuestra memoria colectiva.
              </p>
              <p className="mb-8 text-primary-50">
                Comparte las historias de tus abuelos, tus experiencias, las leyendas de tu comunidad.
                Juntos estamos construyendo un archivo vivo de la cultura aymara.
              </p>
              <Link
                to="/upload"
                className="inline-block bg-white text-primary-700 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
              >
                Grabar mi Historia
              </Link>
            </div>

            {/* Imagen */}
            <div className="h-full hidden md:block">
              <img
                src="/imagenes/aymaras_musica.jpg"
                alt="Cultura Aymara"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer Mejorado */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Columna 1: Acerca de */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary-400">
                Historias Vivientes Aymara
              </h3>
              <p className="text-gray-400 mb-4">
                Un proyecto comunitario dedicado a preservar y celebrar la rica tradición oral aymara
                para las futuras generaciones.
              </p>
              <div className="flex gap-4">
                <div className="text-3xl">🌾</div>
                <div className="text-3xl">🎵</div>
                <div className="text-3xl">📖</div>
              </div>
            </div>

            {/* Columna 2: Enlaces rápidos */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-400">Enlaces</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
                </li>
                <li>
                  <Link to="/upload" className="hover:text-white transition-colors">Compartir Historia</Link>
                </li>
                <li>
                  <Link to="/stories" className="hover:text-white transition-colors">Explorar Relatos</Link>
                </li>
                <li>
                  <Link to="/radios" className="hover:text-white transition-colors">📻 Radios en Vivo</Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Información */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-primary-400">Nuestro Compromiso</h4>
              <p className="text-gray-400 text-sm">
                Preservar la memoria colectiva aymara mediante la tecnología, respetando la tradición oral
                y haciendo accesible nuestro patrimonio cultural a comunidades con conectividad limitada.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Historias Vivientes Aymara - Todos los derechos reservados
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Proyecto comunitario de preservación cultural
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
