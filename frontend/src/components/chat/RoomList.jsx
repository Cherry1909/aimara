/**
 * RoomList - Lista de salas de chat
 */
function RoomList({ rooms, currentRoom, onSelectRoom, onlineUsersByRoom = {} }) {
  const roomList = Object.values(rooms);

  return (
    <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Salas</h2>
        <p className="text-sm text-gray-600">Chat Comunitario Aymara</p>
      </div>

      {/* Lista de salas */}
      <div className="flex-1 overflow-y-auto">
        {roomList.map((room) => {
          const isActive = currentRoom === room.id;
          const onlineCount = onlineUsersByRoom[room.id] || 0;

          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                isActive ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{room.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold truncate ${isActive ? 'text-primary-700' : 'text-gray-800'}`}>
                      {room.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{room.description}</div>
                  </div>
                </div>

                {/* Usuarios online */}
                {onlineCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{onlineCount}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 text-center">
          <p>💬 Chat en Tiempo Real</p>
          <p className="mt-1">Historias Vivientes Aymara</p>
        </div>
      </div>
    </div>
  );
}

export default RoomList;
