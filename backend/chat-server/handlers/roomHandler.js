/**
 * Room Handler - Maneja eventos de salas (join/leave)
 */
export function handleRoomEvents(socket, managers, io) {
  const { connectionManager, roomManager, presenceManager } = managers;

  // Evento: Unirse a una sala
  socket.on('join_room', async (data, callback) => {
    try {
      const { roomId } = data;
      const userData = connectionManager.getUserBySocketId(socket.id);

      if (!userData) {
        throw new Error('Not authenticated. Call authenticate first.');
      }

      // Unirse a la sala de Socket.io
      await socket.join(roomId);

      // Actualizar room manager
      roomManager.joinRoom(userData.userId, roomId);

      // Obtener usuarios en la sala
      const usersInRoom = roomManager.getUsersInRoom(roomId);
      const onlineUsers = usersInRoom.filter(userId =>
        connectionManager.isUserOnline(userId)
      );

      // Notificar a otros usuarios en la sala
      socket.to(roomId).emit('user_joined', {
        userId: userData.userId,
        displayName: userData.displayName,
        roomId,
        timestamp: Date.now()
      });

      console.log(`👤 User ${userData.displayName} joined room: ${roomId}`);

      callback({
        success: true,
        roomId,
        onlineUsers: onlineUsers.length,
        roomInfo: roomManager.getRoomInfo(roomId)
      });
    } catch (error) {
      console.error('Error joining room:', error);
      callback({
        success: false,
        error: error.message
      });
    }
  });

  // Evento: Salir de una sala
  socket.on('leave_room', async (data, callback) => {
    try {
      const { roomId } = data;
      const userData = connectionManager.getUserBySocketId(socket.id);

      if (!userData) {
        throw new Error('Not authenticated');
      }

      // Salir de la sala de Socket.io
      await socket.leave(roomId);

      // Actualizar room manager
      roomManager.leaveRoom(userData.userId, roomId);

      // Notificar a otros usuarios
      socket.to(roomId).emit('user_left', {
        userId: userData.userId,
        displayName: userData.displayName,
        roomId,
        timestamp: Date.now()
      });

      console.log(`👤 User ${userData.displayName} left room: ${roomId}`);

      callback({ success: true });
    } catch (error) {
      console.error('Error leaving room:', error);
      callback({
        success: false,
        error: error.message
      });
    }
  });

  // Evento: Obtener presencia en una sala
  socket.on('get_room_presence', async (data, callback) => {
    try {
      const { roomId } = data;
      const usersInRoom = roomManager.getUsersInRoom(roomId);

      const presence = usersInRoom.map(userId => {
        const isOnline = connectionManager.isUserOnline(userId);
        const presenceData = presenceManager.getUserPresence(userId);

        return {
          userId,
          online: isOnline,
          displayName: presenceData?.displayName || 'Unknown',
          lastSeen: presenceData?.lastSeen || null
        };
      });

      callback({
        success: true,
        presence
      });
    } catch (error) {
      console.error('Error getting room presence:', error);
      callback({
        success: false,
        error: error.message
      });
    }
  });

  // Evento: Obtener lista de todas las salas
  socket.on('get_rooms', (callback) => {
    try {
      const rooms = roomManager.getAllRoomsInfo();
      callback({
        success: true,
        rooms
      });
    } catch (error) {
      console.error('Error getting rooms:', error);
      callback({
        success: false,
        error: error.message
      });
    }
  });
}
