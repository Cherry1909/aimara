import { useState, useEffect } from 'react'

/**
 * Hook para obtener geolocalización del usuario
 */
export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    autoFetch = true
  } = options

  const getLocation = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por el navegador')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
        setLoading(false)
      },
      (err) => {
        let errorMessage = 'Error al obtener ubicación'

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible'
            break
          case err.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado'
            break
          default:
            errorMessage = err.message
        }

        setError(errorMessage)
        setLoading(false)
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    )
  }

  useEffect(() => {
    if (autoFetch) {
      getLocation()
    } else {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    location,
    error,
    loading,
    refetch: getLocation
  }
}

export default useGeolocation
