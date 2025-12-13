import { useState } from 'react'
import QRCode from 'qrcode.react'

/**
 * Componente para mostrar y descargar código QR
 */
function QRDisplay({ url, storyTitle, narratorName, size = 256 }) {
  const [showPrintVersion, setShowPrintVersion] = useState(false)

  const handleDownload = () => {
    const canvas = document.getElementById('qr-code-canvas')
    if (!canvas) return

    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')

    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `qr-${storyTitle?.replace(/\s+/g, '-') || 'relato'}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  const handlePrint = () => {
    setShowPrintVersion(true)
    setTimeout(() => {
      window.print()
      setShowPrintVersion(false)
    }, 100)
  }

  return (
    <div className="space-y-6">
      {/* Vista normal */}
      <div className={showPrintVersion ? 'hidden' : 'block'}>
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Código QR de tu Relato
          </h3>
          <p className="text-gray-600 mb-6">
            Comparte este código para que otros puedan escuchar tu historia
          </p>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <QRCode
                id="qr-code-canvas"
                value={url}
                size={size}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          {/* Info del relato */}
          <div className="bg-primary-50 rounded-lg p-4 mb-6">
            <p className="font-semibold text-gray-800 mb-1">
              {storyTitle || 'Relato Aymara'}
            </p>
            {narratorName && (
              <p className="text-sm text-gray-600">
                Narrado por: {narratorName}
              </p>
            )}
          </div>

          {/* URL */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-xs text-gray-500 mb-1">URL del relato:</p>
            <p className="text-sm text-gray-700 font-mono break-all">
              {url}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <span>📥</span>
              <span>Descargar QR</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <span>🖨️</span>
              <span>Imprimir</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(url)
                alert('URL copiada al portapapeles')
              }}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>Copiar URL</span>
            </button>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-blue-900 mb-2">
            💡 ¿Cómo usar el código QR?
          </p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Descarga la imagen del QR</li>
            <li>Imprímela y colócala en un lugar visible de tu comunidad</li>
            <li>Las personas pueden escanearlo con la cámara de su celular</li>
            <li>Se abrirá automáticamente la página con tu relato</li>
          </ul>
        </div>
      </div>

      {/* Vista para imprimir */}
      {showPrintVersion && (
        <div className="print-only fixed inset-0 bg-white flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold mb-4">Historias Vivientes Aymara</h1>
            <h2 className="text-2xl mb-6">{storyTitle || 'Relato'}</h2>

            <div className="mb-6">
              <QRCode
                value={url}
                size={400}
                level="H"
                includeMargin={true}
              />
            </div>

            {narratorName && (
              <p className="text-xl mb-4">Narrado por: {narratorName}</p>
            )}

            <p className="text-lg mb-2">Escanea este código con tu celular</p>
            <p className="text-sm text-gray-600 font-mono">{url}</p>
          </div>
        </div>
      )}

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
          }
          .print-only {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default QRDisplay
