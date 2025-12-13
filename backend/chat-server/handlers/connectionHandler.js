import { v4 as uuidv4 } from 'uuid';

/**
 * Connection Handler - Maneja autenticación y desconexión
 */
export function handleConnection(socket, managers) {
  const { connectionManager, roomManager, presenceManager } = managers;

  console.log(`🔌 New client connected: ${socket.id}`);

  // Evento: Autenticación anónima
  socket.on('authenticate', async (data, callback) => {
    try {
      const { displayName } = data;

      if (!displayName || displayName.trim().length === 0) {
        throw new Error('Display name is required');
      }

      // Generar userId único
      const userId = `user_${Date.now()}_${uuidv4().substring(0, 8)}`;

      const userData = {
        userId,
        displayName: displayName.trim(),
        socketId: socket.id,
        connectedAt: Date.now()
      };

      // Almacenar conexión
      connectionManager.addConnection(socket.id, userData);

      // Asociar userId al socket para acceso rápido
      socket.userId = userId;
      socket.displayName = displayName.trim();

      // Marcar usuario como online
      await presenceManager.setUserOnline(userId, displayName.trim());

      console.log(`✅ User authenticated: ${displayName} (${userId})`);

      callback({
        success: true,
        userId,
        displayName: displayName.trim()
      });
    } catch (error) {
      console.error('Authentication error:', error);
      callback({
        success: false,
        error: error.message
      });
    }
  });

  // Evento: Desconexión
  socket.on('disconnect', async (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} (Reason: ${reason})`);

    const userData = connectionManager.getUserBySocketId(socket.id);

    if (userData) {
      // Salir de todas las salas
      const rooms = roomManager.getUserRooms(userData.userId);
      rooms.forEach(roomId => {
        // Notificar a otros usuarios en la sala
        socket.to(roomId).emit('user_left', {
          userId: userData.userId,
          displayName: userData.displayName,
          roomId
        });

        roomManager.leaveRoom(userData.userId, roomId);
      });

      // Remover conexión
      connectionManager.removeConnection(socket.id);

      // Si el usuario no tiene más conexiones, marcar como offline
      if (!connectionManager.isUserOnline(userData.userId)) {
        await presenceManager.setUserOffline(userData.userId);

        // Broadcast a todos los clientes
        socket.broadcast.emit('user_offline', {
          userId: userData.userId
        });
      }
    }
  });

  // Evento: Ping para mantener conexión viva
  socket.on('ping', (callback) => {
    if (callback && typeof callback === 'function') {
      callback({ timestamp: Date.now() });
    }
  });
}
