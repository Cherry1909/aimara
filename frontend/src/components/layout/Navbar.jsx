import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * Navbar flotante moderno con glassmorphism y scroll behavior
 */
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  const navLinks = [
    { to: '/', label: 'Inicio', icon: '🏠' },
    { to: '/upload', label: 'Compartir', icon: '📝' },
    { to: '/radios', label: 'Radios', icon: '📻' },
    { to: '/chat', label: 'Chat', icon: '💬' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50'
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white text-xl font-bold">H</span>
            </div>
            <div className={`transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              <div className="font-display font-bold text-lg leading-none">
                Historias Aymara
              </div>
              <div className="text-xs opacity-75">Cultura Viva</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  isActive(link.to)
                    ? isScrolled
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-white/20 text-white backdrop-blur-md'
                    : isScrolled
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/10 backdrop-blur-md'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </span>
                {isActive(link.to) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-primary-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* CTA Button Desktop */}
          <Link
            to="/upload"
            className="hidden md:flex items-center gap-2 btn-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nueva Historia</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors ${
              isScrolled
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10 backdrop-blur-md'
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 animate-fade-in-down">
            <div className="glass-strong rounded-2xl p-4 shadow-xl border border-white/50">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      isActive(link.to)
                        ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200'
                        : 'text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    <span className="text-2xl">{link.icon}</span>
                    <span>{link.label}</span>
                    {isActive(link.to) && (
                      <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </Link>
                ))}

                {/* Mobile CTA */}
                <Link
                  to="/upload"
                  className="btn-primary mt-4 justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Compartir Nueva Historia</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
