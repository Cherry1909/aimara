/**
 * Reaction Handler - Maneja reacciones a mensajes (👍 ❤️ 😂)
 */

// Emojis permitidos
const ALLOWED_EMOJIS = ['👍', '❤️', '😂'];

export function handleReactionEvents(socket, managers, messageService, io) {
  const { connectionManager } = managers;

  // Evento: Agregar reacción
  socket.on('add_reaction', async (data, callback) => {
    try {
      const { messageId, emoji } = data;
      const userData = connectionManager.getUserBySocketId(socket.id);

      if (!userData) {
        throw new Error('Not authenticated');
      }

      // Validar emoji
      if (!ALLOWED_EMOJIS.includes(emoji)) {
        throw new Error(`Invalid emoji. Allowed: ${ALLOWED_EMOJIS.join(', ')}`);
      }

      // Agregar reacción en Firestore
      const updatedMessage = await messageService.addReaction(
        messageId,
        userData.userId,
        emoji
      );

      // Broadcast a todos en la sala del mensaje
      if (updatedMessage) {
        io.to(updatedMessage.roomId).emit('reaction_added', {
          messageId,
          userId: userData.userId,
          emoji,
          reactions: updatedMessage.reactions,
          timestamp: Date.now()
        });
      }

      callback({ success: true });
    } catch (error) {
      console.error('Error adding reaction:', error);
      callback({
        success: false,
        error: error.message
      });
    }
  });

  // Evento: Quitar reacción
  socket.on('remove_reaction', async (data, callback) => {
    try {
      const { messageId, emoji } = data;
      const userData = connectionManager.getUserBySocketId(socket.id);

      if (!userData) {
        throw new Error('Not authenticated');
      }

      // Quitar reacción en Firestore
      const updatedMessage = await messageService.removeReaction(
        messageId,
        userData.userId,
        emoji
      );

      // Broadcast a todos en la sala del mensaje
      if (updatedMessage) {
        io.to(updatedMessage.roomId).emit('reaction_removed', {
          messageId,
          userId: userData.userId,
          emoji,
          reactions: updatedMessage.reactions,
          timestamp: Date.now()
        });
      }

      callback({ success: true });
    } catch (error) {
      console.error('Error removing reaction:', error);
      callback({
        success: false,
        error: error.message
      });
    }
  });

  // Evento: Toggle reacción (agregar si no existe, quitar si existe)
  socket.on('toggle_reaction', async (data, callback) => {
    try {
      const { messageId, emoji } = data;
      const userData = connectionManager.getUserBySocketId(socket.id);

      if (!userData) {
        throw new Error('Not authenticated');
      }

      if (!ALLOWED_EMOJIS.includes(emoji)) {
        throw new Error(`Invalid emoji. Allowed: ${ALLOWED_EMOJIS.join(', ')}`);
      }

      // Obtener mensaje actual para verificar si el usuario ya reaccionó
      // Por ahora, simplemente intentamos agregar (el messageService maneja duplicados)
      const updatedMessage = await messageService.addReaction(
        messageId,
        userData.userId,
        emoji
      );

      if (updatedMessage) {
        io.to(updatedMessage.roomId).emit('reaction_updated', {
          messageId,
          reactions: updatedMessage.reactions,
          timestamp: Date.now()
        });
      }

      callback({ success: true });
    } catch (error) {
      console.error('Error toggling reaction:', error);
      callback({
        success: false,
        error: error.message
      });
    }
  });
}

export { ALLOWED_EMOJIS };
