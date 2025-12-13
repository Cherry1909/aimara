import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useGeolocation } from '../../hooks/useGeolocation'
import 'leaflet/dist/leaflet.css'

// Fix para iconos de Leaflet en producción
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

/**
 * Componente interno para manejar eventos del mapa
 */
function MapEventHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

/**
 * Componente selector de ubicación con mapa Leaflet
 */
function MapSelector({ initialLocation, onLocationSelected }) {
  const [position, setPosition] = useState(initialLocation || {
    latitude: -16.5,
    longitude: -68.15
  })

  const {
    location: geoLocation,
    error: geoError,
    loading: geoLoading,
    refetch: getLocation
  } = useGeolocation({ autoFetch: false })

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation)
    }
  }, [initialLocation])

  useEffect(() => {
    if (geoLocation) {
      const newPos = {
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude
      }
      setPosition(newPos)
      onLocationSelected(newPos.latitude, newPos.longitude)
    }
  }, [geoLocation, onLocationSelected])

  const handleMapClick = (lat, lng) => {
    const newPos = { latitude: lat, longitude: lng }
    setPosition(newPos)
    onLocationSelected(lat, lng)
  }

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    const newPos = {
      ...position,
      [field]: numValue
    }
    setPosition(newPos)
    onLocationSelected(newPos.latitude, newPos.longitude)
  }

  return (
    <div className="space-y-4">
      {/* Botón de geolocalización */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900">
            📍 Ubicación automática
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Usa tu ubicación actual o haz clic en el mapa
          </p>
        </div>
        <button
          onClick={getLocation}
          disabled={geoLoading}
          className="btn-primary ml-4 whitespace-nowrap"
        >
          {geoLoading ? 'Obteniendo...' : 'Usar mi ubicación'}
        </button>
      </div>

      {geoError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
          ⚠️ {geoError}. Puedes seleccionar manualmente en el mapa.
        </div>
      )}

      {/* Mapa */}
      <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
        <MapContainer
          center={[position.latitude, position.longitude]}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[position.latitude, position.longitude]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target
                const pos = marker.getLatLng()
                handleMapClick(pos.lat, pos.lng)
              }
            }}
          />
          <MapEventHandler onLocationChange={handleMapClick} />
        </MapContainer>
      </div>

      {/* Coordenadas manuales */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Coordenadas exactas:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label text-xs">Latitud</label>
            <input
              type="number"
              step="0.0001"
              className="input text-sm"
              value={position.latitude}
              onChange={(e) => handleInputChange('latitude', e.target.value)}
              placeholder="-16.5000"
            />
          </div>
          <div>
            <label className="label text-xs">Longitud</label>
            <input
              type="number"
              step="0.0001"
              className="input text-sm"
              value={position.longitude}
              onChange={(e) => handleInputChange('longitude', e.target.value)}
              placeholder="-68.1500"
            />
          </div>
        </div>
      </div>

      {/* Información */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
        <p className="font-semibold">✓ Ubicación seleccionada</p>
        <p className="text-xs mt-1">
          Lat: {position.latitude.toFixed(4)}, Lng: {position.longitude.toFixed(4)}
        </p>
      </div>
    </div>
  )
}

export default MapSelector
