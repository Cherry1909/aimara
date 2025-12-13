/**
 * PresenceIndicator - Indicador de estado online/offline
 */
function PresenceIndicator({ online, lastSeen, size = 'sm' }) {
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Hace tiempo';

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Justo ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  };

  return (
    <div className="relative inline-flex items-center group">
      <div
        className={`${sizeClasses[size]} rounded-full ${
          online ? 'bg-green-500' : 'bg-gray-400'
        } border-2 border-white`}
        title={online ? 'Online' : `Offline - ${formatLastSeen(lastSeen)}`}
      />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {online ? 'Online' : `Visto ${formatLastSeen(lastSeen)}`}
      </div>
    </div>
  );
}

export default PresenceIndicator;
