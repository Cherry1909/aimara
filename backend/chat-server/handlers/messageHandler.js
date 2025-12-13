import { v4 as uuidv4 } from 'uuid';

/**
 * Message Handler - Maneja envío/recepción de mensajes y typing indicators
 */
export function handleMessageEvents(socket, managers, messageService, io) {
  const { connectionManager, roomManager } = managers;

  // Evento: Enviar mensaje
  socket.on('send_message', async (data, callback) => {
    try {
      const { roomId, content } = data;
      const userData = connectionManager.getUserBySocketId(socket.id);

      if (!userData) {
        throw new Error('Not authenticated');
      }

      // Validar contenido
      if (!content || content.trim().length === 0) {
        throw new Error('Empty message');
      }

      if (content.length > 2000) {
        throw new Error('Message too long (max 2000 characters)');
      }

      // Verificar que el usuario esté en la sala
      if (!roomManager.isUserInRoom(userData.userId, roomId)) {
        throw new Error('You are not in this room');
      }

      // Crear objeto mensaje
      const message = {
        id: uuidv4(),
        roomId,
        userId: userData.userId,
        displayName: userData.displayName,
        content: content.trim(),
        timestamp: Date.now(),
        reactions: {},
        createdAt: new Date()
      };

      // Guardar en Firestore
      await messageService.saveMessage(message);

      // Broadcast a todos los usuarios en la sala (incluyendo el emisor)
      io.to(roomId).emit('new_message', message);

      console.log(`💬 Message sent in ${roomId} by ${userData.displayName}: ${content.substring(0, 50)}...`);

      callback({
        success: true,
        message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      callback({
        success: false,
        error: error.message
      });
    }
  });

  // Evento: Cargar historial de mensajes
  socket.on('load_messages', async (data, callback) => {
    try {
      const { roomId, limit = 50, before = null } = data;

      const messages = await messageService.getMessages(roomId, limit, before);

      callback({
        success: true,
        messages,
        count: messages.length
      });
    } catch (error) {
      console.error('Error loading messages:', error);
      callback({
        success: false,
        error: error.message
      });
    }
  });

  // Evento: Typing indicator
  socket.on('typing', (data) => {
    try {
      const { roomId, isTyping } = data;
      const userData = connectionManager.getUserBySocketId(socket.id);

      if (userData && roomManager.isUserInRoom(userData.userId, roomId)) {
        // Enviar a todos en la sala excepto al emisor
        socket.to(roomId).emit('user_typing', {
          userId: userData.userId,
          displayName: userData.displayName,
          roomId,
          isTyping,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error handling typing:', error);
    }
  });

  // Evento: Eliminar mensaje (moderación)
  socket.on('delete_message', async (data, callback) => {
    try {
      const { messageId } = data;
      const userData = connectionManager.getUserBySocketId(socket.id);

      if (!userData) {
        throw new Error('Not authenticated');
      }

      // TODO: Agregar verificación de permisos (solo moderadores/admin)

      await messageService.deleteMessage(messageId);

      // Notificar a todos en las salas
      io.emit('message_deleted', {
        messageId,
        deletedBy: userData.userId,
        timestamp: Date.now()
      });

      callback({ success: true });
    } catch (error) {
      console.error('Error deleting message:', error);
      callback({
        success: false,
        error: error.message
      });
    }
  });
}
