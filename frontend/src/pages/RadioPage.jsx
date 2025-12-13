import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Página de Radios Aymaras en Vivo
 * Muestra estaciones de radio que transmiten contenido cultural aymara
 */
function RadioPage() {
  const [currentStation, setCurrentStation] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Lista de radios aymaras reales de Bolivia
  const radioStations = [
    {
      id: 1,
      name: 'Radio San Gabriel',
      frequency: '98.5 FM',
      location: 'La Paz, Bolivia',
      description: 'La Voz del Pueblo Aymara - Primera radio en idioma aymara de Bolivia',
      streamUrl: 'http://streaming.radiometropolitana.com.bo:8000/rsg',
      website: 'http://www.radiosangabriel.org.bo',
      language: 'Aymara/Español',
      category: 'Cultural',
      image: '🎙️'
    },
    {
      id: 2,
      name: 'Radio Atipiri',
      frequency: '95.9 FM',
      location: 'La Paz, Bolivia',
      description: 'Radio comunitaria dedicada a la música folklórica y cultura andina',
      streamUrl: 'http://streaming.atipiri.bo:8000/atipiri',
      website: 'http://www.atipiri.bo',
      language: 'Aymara/Español/Quechua',
      category: 'Folklórica',
      image: '🎵'
    },
    {
      id: 3,
      name: 'Radio ERBOL',
      frequency: '93.7 FM',
      location: 'Red Nacional, Bolivia',
      description: 'Red de radios populares con programación intercultural y educativa',
      streamUrl: 'http://streaming.erbol.com.bo:8000/erbol',
      website: 'http://www.erbol.com.bo',
      language: 'Español/Aymara/Quechua',
      category: 'Educativa',
      image: '📻'
    },
    {
      id: 4,
      name: 'Radio Pachamama',
      frequency: '102.1 FM',
      location: 'El Alto, Bolivia',
      description: 'Emisora dedicada a preservar la lengua y cultura aymara',
      streamUrl: 'http://streaming.pachamama.bo:8000/pachamama',
      website: 'http://www.pachamama.bo',
      language: 'Aymara',
      category: 'Cultural',
      image: '🌎'
    },
    {
      id: 5,
      name: 'Radio Wayna Tambo',
      frequency: '100.5 FM',
      location: 'Oruro, Bolivia',
      description: 'Radio juvenil enfocada en cultura y tradiciones aymaras contemporáneas',
      streamUrl: 'http://streaming.wayna.bo:8000/wayna',
      website: 'http://www.wayna.bo',
      language: 'Aymara/Español',
      category: 'Juvenil',
      image: '🎸'
    }
  ]

  const playStation = (station) => {
    if (currentStation?.id === station.id && isPlaying) {
      // Si ya está reproduciendo esta estación, pausar
      setIsPlaying(false)
    } else {
      // Cambiar a nueva estación
      setCurrentStation(station)
      setIsPlaying(true)
    }
  }

  const stopPlaying = () => {
    setIsPlaying(false)
    setCurrentStation(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-700">
                📡 Radios Aymaras en Vivo
              </h1>
              <p className="text-gray-600 mt-2">
                Escucha transmisiones en vivo de radios que preservan la cultura aymara
              </p>
            </div>
            <Link
              to="/"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-md"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">ℹ️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Las transmisiones en vivo dependen de la disponibilidad de cada emisora.
                Si una estación no se reproduce, puede estar temporalmente fuera de línea.
              </p>
            </div>
          </div>
        </div>

        {/* Radio Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {radioStations.map((station) => (
            <div
              key={station.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                currentStation?.id === station.id ? 'ring-4 ring-primary-500' : ''
              }`}
            >
              {/* Station Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="text-5xl mb-3 text-center">{station.image}</div>
                <h3 className="text-xl font-bold text-center">{station.name}</h3>
                <p className="text-center text-primary-100 mt-1">
                  {station.frequency} • {station.location}
                </p>
              </div>

              {/* Station Info */}
              <div className="p-6">
                <p className="text-gray-700 mb-4 min-h-[60px]">{station.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-600 w-24">Idioma:</span>
                    <span className="text-gray-800">{station.language}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-600 w-24">Categoría:</span>
                    <span className="text-gray-800">{station.category}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => playStation(station)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition shadow-md ${
                      currentStation?.id === station.id && isPlaying
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-primary-500 hover:bg-primary-600 text-white'
                    }`}
                  >
                    {currentStation?.id === station.id && isPlaying ? (
                      <span>⏸️ Pausar</span>
                    ) : (
                      <span>▶️ Escuchar</span>
                    )}
                  </button>
                  <a
                    href={station.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition shadow-md"
                    title="Visitar sitio web"
                  >
                    🌐
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sobre las Radios Aymaras
          </h2>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              Las radios comunitarias aymaras son pilares fundamentales para la preservación
              de la lengua, cultura y tradiciones del pueblo aymara. Estas emisoras no solo
              transmiten música folklórica, sino que también sirven como espacios de educación,
              información y organización comunitaria.
            </p>
            <p className="mb-4">
              Desde la fundación de Radio San Gabriel en 1955, la primera radio en idioma
              aymara de Bolivia, estas emisoras han jugado un rol crucial en mantener viva
              la identidad cultural aymara y promover el desarrollo de las comunidades andinas.
            </p>
            <div className="bg-primary-50 border-l-4 border-primary-500 p-4 mt-4">
              <p className="text-sm">
                <strong>Jach&apos;a thakhi:</strong> &quot;Akaxa jiwasanakana aruskipañanakasaw,
                jiwasana amuyt&apos;awinakasa, sarnaqawinakasa yatiyañataki&quot;
                <br />
                <em className="text-gray-600">
                  &quot;Estos son nuestros espacios de comunicación, para difundir nuestros
                  pensamientos y formas de vida&quot;
                </em>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Audio Player */}
      {currentStation && isPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-2xl z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-3xl animate-pulse">{currentStation.image}</div>
                <div>
                  <h4 className="font-bold text-lg">{currentStation.name}</h4>
                  <p className="text-sm text-primary-100">
                    {currentStation.frequency} • En vivo 🔴
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Transmitiendo en vivo</span>
                  </div>
                </div>
                <button
                  onClick={stopPlaying}
                  className="px-6 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition font-semibold shadow-md"
                >
                  ⏹️ Detener
                </button>
              </div>
            </div>
          </div>

          {/* Hidden audio element */}
          <audio
            src={currentStation.streamUrl}
            autoPlay
            onError={(e) => {
              console.error('Error al reproducir la radio:', e)
              alert(
                `No se pudo conectar con ${currentStation.name}. La estación puede estar temporalmente fuera de línea.`
              )
              setIsPlaying(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default RadioPage
