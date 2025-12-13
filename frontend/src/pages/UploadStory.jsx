import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadAudio } from '../services/storage'
import { createStory, processAudio, getProcessingStatus } from '../services/api'
import AudioRecorder from '../components/audio/AudioRecorder'
import MapSelector from '../components/map/MapSelector'
import QRDisplay from '../components/qr/QRDisplay'

function UploadStory() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estado del formulario
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [location, setLocation] = useState({ latitude: -16.5, longitude: -68.15 })
  const [narrator, setNarrator] = useState({
    name: '',
    age: '',
    community: '',
    language: 'aymara',
    consentGiven: false
  })

  // Estado de progreso
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingJobId, setProcessingJobId] = useState(null)
  const [storyId, setStoryId] = useState(null)

  const handleAudioRecorded = (blob, duration) => {
    setAudioBlob(blob)
    setAudioDuration(duration)
  }

  const handleLocationSelected = (lat, lng) => {
    setLocation({ latitude: lat, longitude: lng })
  }

  const handleNarratorChange = (field, value) => {
    setNarrator(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return audioBlob !== null
      case 2:
        return location.latitude && location.longitude
      case 3:
        return narrator.name && narrator.community && narrator.consentGiven
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      setError(null)
    } else {
      setError('Por favor completa todos los campos requeridos')
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    setError(null)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      // Paso 1: Subir audio a Firebase Storage
      setUploadProgress(10)
      const uploadResult = await uploadAudio(
        audioBlob,
        `temp_${Date.now()}`,
        (progress) => setUploadProgress(10 + (progress * 0.3))
      )

      // Paso 2: Crear story en backend
      setUploadProgress(50)
      const storyData = {
        audioUrl: uploadResult.url,
        audioDuration: Math.floor(audioDuration),
        audioSize: uploadResult.size,
        audioFormat: 'webm',
        narrator: {
          ...narrator,
          age: narrator.age ? parseInt(narrator.age) : null
        },
        location: {
          ...location,
          placeName: null
        }
      }

      const createResult = await createStory(storyData)
      setStoryId(createResult.id)

      // Paso 3: Iniciar procesamiento de audio con Groq
      setUploadProgress(70)
      const processResult = await processAudio(createResult.id, uploadResult.url)
      setProcessingJobId(processResult.job_id)

      // Paso 4: Polling para verificar el progreso
      setUploadProgress(80)
      await pollProcessingStatus(processResult.job_id)

      setUploadProgress(100)
      setStep(5) // Ir a página de éxito

    } catch (err) {
      console.error('Error subiendo relato:', err)
      setError(err.message || 'Error al subir el relato')
    } finally {
      setLoading(false)
    }
  }

  const pollProcessingStatus = async (jobId) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const status = await getProcessingStatus(jobId)

          if (status.status === 'completed') {
            clearInterval(interval)
            resolve(status.result)
          } else if (status.status === 'failed') {
            clearInterval(interval)
            reject(new Error(status.error || 'Procesamiento falló'))
          }
          // Si está "processing", continuar polling
        } catch (err) {
          clearInterval(interval)
          reject(err)
        }
      }, 3000) // Cada 3 segundos

      // Timeout después de 5 minutos
      setTimeout(() => {
        clearInterval(interval)
        reject(new Error('Timeout: El procesamiento está tomando demasiado tiempo'))
      }, 300000)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-500 text-white shadow-lg">
        <div className="container-custom py-6">
          <h1 className="text-3xl font-bold">Compartir un Relato</h1>
          <p className="text-primary-100 mt-2">
            Preserva la historia de tu comunidad
          </p>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-12 h-1 ${
                      step > s ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-2 text-sm">
            <span className={step >= 1 ? 'text-primary-600' : 'text-gray-500'}>Audio</span>
            <span className={step >= 2 ? 'text-primary-600' : 'text-gray-500'}>Ubicación</span>
            <span className={step >= 3 ? 'text-primary-600' : 'text-gray-500'}>Narrador</span>
            <span className={step >= 4 ? 'text-primary-600' : 'text-gray-500'}>Confirmar</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Step 1: Audio */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Paso 1: Graba tu relato</h2>
                <AudioRecorder onRecorded={handleAudioRecorded} maxDuration={600} />
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Paso 2: Ubicación</h2>
                <MapSelector
                  initialLocation={location}
                  onLocationSelected={handleLocationSelected}
                />
              </div>
            )}

            {/* Step 3: Narrator */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Paso 3: Datos del Narrador</h2>
                <form className="space-y-4">
                  <div>
                    <label className="label">Nombre *</label>
                    <input
                      type="text"
                      className="input"
                      value={narrator.name}
                      onChange={(e) => handleNarratorChange('name', e.target.value)}
                      placeholder="Juan Mamani"
                    />
                  </div>

                  <div>
                    <label className="label">Edad</label>
                    <input
                      type="number"
                      className="input"
                      value={narrator.age}
                      onChange={(e) => handleNarratorChange('age', e.target.value)}
                      placeholder="67"
                    />
                  </div>

                  <div>
                    <label className="label">Comunidad *</label>
                    <input
                      type="text"
                      className="input"
                      value={narrator.community}
                      onChange={(e) => handleNarratorChange('community', e.target.value)}
                      placeholder="Comunidad Qullana"
                    />
                  </div>

                  <div>
                    <label className="label">Idioma Principal</label>
                    <select
                      className="input"
                      value={narrator.language}
                      onChange={(e) => handleNarratorChange('language', e.target.value)}
                    >
                      <option value="aymara">Aymara</option>
                      <option value="spanish">Español</option>
                      <option value="mixed">Mixto</option>
                    </select>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={narrator.consentGiven}
                      onChange={(e) => handleNarratorChange('consentGiven', e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <label htmlFor="consent" className="text-sm text-gray-700">
                      Doy mi consentimiento para que esta grabación sea compartida públicamente
                      y preservada como parte del patrimonio cultural aymara. *
                    </label>
                  </div>
                </form>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Paso 4: Confirmar</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-700">Audio</h3>
                    <p>Duración: {Math.floor(audioDuration)}s</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700">Ubicación</h3>
                    <p>Lat: {location.latitude}, Lng: {location.longitude}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700">Narrador</h3>
                    <p>Nombre: {narrator.name}</p>
                    <p>Comunidad: {narrator.community}</p>
                    <p>Idioma: {narrator.language}</p>
                  </div>
                </div>

                {loading && (
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-primary-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-center mt-2 text-gray-600">
                      {uploadProgress < 50 ? 'Subiendo audio...' :
                       uploadProgress < 80 ? 'Procesando con IA...' :
                       'Finalizando...'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && storyId && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-3xl font-bold mb-4 text-green-600">
                    ¡Relato publicado!
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Tu historia ha sido procesada y está disponible públicamente.
                  </p>
                </div>

                <QRDisplay
                  url={`${window.location.origin}/story/${storyId}`}
                  storyTitle={narrator.name ? `Relato de ${narrator.name}` : 'Relato Aymara'}
                  narratorName={narrator.name}
                />

                <div className="flex justify-center space-x-4 mt-8">
                  <button
                    onClick={() => navigate(`/story/${storyId}`)}
                    className="btn-primary"
                  >
                    Ver Relato
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="btn-secondary"
                  >
                    Volver al Inicio
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 5 && (
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    onClick={prevStep}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    ← Anterior
                  </button>
                )}

                {step < 4 && (
                  <button
                    onClick={nextStep}
                    className="btn-primary ml-auto"
                  >
                    Siguiente →
                  </button>
                )}

                {step === 4 && (
                  <button
                    onClick={handleSubmit}
                    className="btn-primary ml-auto"
                    disabled={loading}
                  >
                    {loading ? 'Subiendo...' : 'Publicar Relato'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default UploadStory
