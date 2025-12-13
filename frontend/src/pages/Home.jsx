import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listStories } from '../services/firebase'
import StoryCard from '../components/story/StoryCard'

function Home() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
    <div className="min-h-screen">
      {/* Hero Section Moderno */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Fondo con imagen */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: 'url(/imagenes/imagen_principal_en_el_inicio.jpg)',
            backgroundPosition: 'center 30%'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-purple-900/80 to-pink-900/70"></div>

          {/* Patrón de puntos animado */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>
        </div>

        {/* Contenido del Hero */}
        <div className="relative z-10 container-custom text-center px-4">
          <div className="animate-fade-in-up">
            <div className="inline-block mb-6">
              <span className="badge bg-white/20 text-white backdrop-blur-md border-white/30 px-6 py-2 text-lg">
                🌾 Preservando nuestra cultura
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 drop-shadow-2xl">
              Historias <span className="text-gradient-aymara bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300">Vivientes</span>
              <br />
              <span className="text-5xl md:text-6xl lg:text-7xl">Aymara</span>
            </h1>

            <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 max-w-3xl mx-auto font-light">
              Un archivo vivo de la memoria colectiva aymara.
              <br />
              <span className="text-lg md:text-xl text-white/75">Cada voz cuenta, cada historia nos fortalece como pueblo.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/upload"
                className="btn-primary text-lg px-8 py-4 shadow-glow"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Compartir mi Historia
                </span>
              </Link>

              <a
                href="#stories"
                className="btn-secondary text-lg px-8 py-4 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Explorar Relatos
                </span>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="glass-strong rounded-2xl p-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <div className="text-4xl font-bold text-white mb-2">{stories.length}</div>
                <div className="text-white/75 text-sm">Historias</div>
              </div>
              <div className="glass-strong rounded-2xl p-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="text-4xl font-bold text-white mb-2">12</div>
                <div className="text-white/75 text-sm">Comunidades</div>
              </div>
              <div className="glass-strong rounded-2xl p-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <div className="text-4xl font-bold text-white mb-2">∞</div>
                <div className="text-white/75 text-sm">Voces</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full animate-float"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Galería Cultural Moderna */}
        <section className="section bg-gradient-to-b from-white to-gray-50">
          <div className="container-custom">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="section-title">
                Nuestra Cultura Viva
              </h2>
              <p className="section-subtitle">
                Descubre la riqueza de nuestras tradiciones ancestrales
              </p>
            </div>

            <div className="relative card-glass p-0 overflow-hidden group animate-fade-in-up">
              {/* Imagen con efecto parallax */}
              <div className="relative h-[500px] lg:h-[600px]">
                <img
                  src={culturalImages[currentImageIndex].src}
                  alt={culturalImages[currentImageIndex].title}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-12">
                    <div className="max-w-2xl">
                      <h3 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
                        {culturalImages[currentImageIndex].title}
                      </h3>
                      <p className="text-xl text-white/90">
                        {culturalImages[currentImageIndex].description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation dots */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
                {culturalImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentImageIndex
                        ? 'bg-white w-12 h-3'
                        : 'bg-white/50 hover:bg-white/75 w-3 h-3'
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <button
                onClick={() => setCurrentImageIndex((prev) =>
                  prev === 0 ? culturalImages.length - 1 : prev - 1
                )}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 glass-strong p-4 rounded-full text-white hover:bg-white/30 transition-all z-10"
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
                className="absolute right-6 top-1/2 transform -translate-y-1/2 glass-strong p-4 rounded-full text-white hover:bg-white/30 transition-all z-10"
                aria-label="Siguiente"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="section">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="section-title">
                Explora por Categoría
              </h2>
              <p className="section-subtitle">
                Sumérgete en diferentes aspectos de nuestra cultura
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Rituales */}
              <Link
                to="/stories?category=ritual"
                className="group relative h-80 rounded-2xl overflow-hidden card-hover-lift animate-fade-in-up"
              >
                <img
                  src="/imagenes/ritual_al_apu.png"
                  alt="Rituales"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-8">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">🔥</div>
                  <h3 className="text-3xl font-display font-bold text-white mb-2">Rituales</h3>
                  <p className="text-white/80 text-lg">Ceremonias sagradas ancestrales</p>
                </div>
                <div className="absolute inset-0 ring-2 ring-white/0 group-hover:ring-white/50 rounded-2xl transition-all"></div>
              </Link>

              {/* Música */}
              <Link
                to="/stories?category=music"
                className="group relative h-80 rounded-2xl overflow-hidden card-hover-lift animate-fade-in-up"
                style={{animationDelay: '0.1s'}}
              >
                <img
                  src="/imagenes/sikuris_claveles_rojos.jpg"
                  alt="Música"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-8">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">🎵</div>
                  <h3 className="text-3xl font-display font-bold text-white mb-2">Música</h3>
                  <p className="text-white/80 text-lg">Melodías que cuentan historias</p>
                </div>
                <div className="absolute inset-0 ring-2 ring-white/0 group-hover:ring-white/50 rounded-2xl transition-all"></div>
              </Link>

              {/* Leyendas */}
              <Link
                to="/stories?category=legend"
                className="group relative h-80 rounded-2xl overflow-hidden card-hover-lift animate-fade-in-up"
                style={{animationDelay: '0.2s'}}
              >
                <img
                  src="/imagenes/ofrendas_aymaras.jpg"
                  alt="Leyendas"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-8">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">📖</div>
                  <h3 className="text-3xl font-display font-bold text-white mb-2">Leyendas</h3>
                  <p className="text-white/80 text-lg">Historias de generación en generación</p>
                </div>
                <div className="absolute inset-0 ring-2 ring-white/0 group-hover:ring-white/50 rounded-2xl transition-all"></div>
              </Link>

              {/* Radios */}
              <Link
                to="/radios"
                className="group relative h-80 rounded-2xl overflow-hidden card-hover-lift bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 animate-fade-in-up"
                style={{animationDelay: '0.3s'}}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-9xl animate-pulse-slow">📡</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-3xl font-display font-bold text-white mb-2">📻 Radios en Vivo</h3>
                  <p className="text-white/80 text-lg">Emisoras culturales aymaras</p>
                </div>
                <div className="absolute inset-0 ring-2 ring-white/0 group-hover:ring-white/50 rounded-2xl transition-all"></div>
              </Link>

              {/* Chat */}
              <Link
                to="/chat"
                className="group relative h-80 rounded-2xl overflow-hidden card-hover-lift bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 animate-fade-in-up"
                style={{animationDelay: '0.4s'}}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-9xl animate-pulse-slow">💬</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-3xl font-display font-bold text-white mb-2">💬 Chat Comunitario</h3>
                  <p className="text-white/80 text-lg">Conversa en tiempo real</p>
                </div>
                <div className="absolute inset-0 ring-2 ring-white/0 group-hover:ring-white/50 rounded-2xl transition-all"></div>
              </Link>
            </div>
          </div>
        </section>

        {/* Stories Section */}
        <section id="stories" className="section bg-gradient-to-b from-gray-50 to-white">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
              <div>
                <h2 className="text-4xl lg:text-5xl font-display font-bold text-gradient mb-2">
                  Relatos Recientes
                </h2>
                <p className="text-gray-600 text-lg">Descubre las últimas historias compartidas</p>
              </div>
              <Link
                to="/stories"
                className="btn-secondary flex items-center gap-2"
              >
                Ver todos los relatos
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading && (
              <div className="card text-center py-20 animate-fade-in">
                <div className="spinner w-16 h-16 mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg font-semibold">Cargando historias...</p>
              </div>
            )}

            {error && (
              <div className="card-glass border-error/20 p-6 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Error al cargar</h3>
                    <p className="text-gray-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && stories.length === 0 && (
              <div className="card text-center py-20 animate-fade-in">
                <div className="text-8xl mb-6">📖</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Aún no hay relatos publicados
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  ¡Sé el primero en compartir una historia de tu comunidad!
                </p>
                <Link to="/upload" className="btn-primary">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Compartir la Primera Historia
                  </span>
                </Link>
              </div>
            )}

            {!loading && !error && stories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.map((story, index) => (
                  <div
                    key={story.id}
                    className="animate-fade-in-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <StoryCard story={story} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="section relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          <div className="container-custom relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white animate-fade-in-up">
                <div className="inline-block mb-6">
                  <span className="badge bg-white/20 text-white backdrop-blur-md border-white/30 px-4 py-2">
                    ✨ Únete a nosotros
                  </span>
                </div>
                <h2 className="text-5xl lg:text-6xl font-display font-bold mb-6">
                  Tu voz <span className="text-yellow-300">importa</span>
                </h2>
                <p className="text-2xl mb-6 text-white/90 font-light">
                  Cada relato fortalece nuestra identidad. Cada voz preserva nuestra memoria colectiva.
                </p>
                <p className="text-lg mb-10 text-white/75">
                  Comparte las historias de tus abuelos, tus experiencias, las leyendas de tu comunidad.
                  Juntos estamos construyendo un archivo vivo de la cultura aymara.
                </p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-3 bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-2xl text-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Grabar mi Historia
                </Link>
              </div>

              <div className="hidden lg:block animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="relative">
                  <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-2xl"></div>
                  <img
                    src="/imagenes/aymaras_musica.jpg"
                    alt="Cultura Aymara"
                    className="relative rounded-2xl shadow-2xl w-full h-[500px] object-cover ring-4 ring-white/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Moderno */}
      <footer className="relative bg-gray-900 text-white pt-20 pb-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>

        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h3 className="text-3xl font-display font-bold mb-4 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                Historias Vivientes Aymara
              </h3>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                Un proyecto comunitario dedicado a preservar y celebrar la rica tradición oral aymara
                para las futuras generaciones.
              </p>
              <div className="flex gap-4 text-4xl">
                <span className="animate-float">🌾</span>
                <span className="animate-float" style={{animationDelay: '1s'}}>🎵</span>
                <span className="animate-float" style={{animationDelay: '2s'}}>📖</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Enlaces Rápidos</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary-400 rounded-full"></span>
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/upload" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary-400 rounded-full"></span>
                    Compartir Historia
                  </Link>
                </li>
                <li>
                  <Link to="/stories" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary-400 rounded-full"></span>
                    Explorar Relatos
                  </Link>
                </li>
                <li>
                  <Link to="/radios" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary-400 rounded-full"></span>
                    Radios en Vivo
                  </Link>
                </li>
                <li>
                  <Link to="/chat" className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary-400 rounded-full"></span>
                    Chat Comunitario
                  </Link>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Nuestro Compromiso</h4>
              <p className="text-gray-400 leading-relaxed">
                Preservar la memoria colectiva aymara mediante la tecnología, respetando la tradición oral
                y haciendo accesible nuestro patrimonio cultural.
              </p>
            </div>
          </div>

          <div className="divider"></div>

          {/* Copyright */}
          <div className="text-center pt-8">
            <p className="text-gray-400 mb-2">
              © 2024 Historias Vivientes Aymara - Todos los derechos reservados
            </p>
            <p className="text-gray-500 text-sm">
              Proyecto comunitario de preservación cultural
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
