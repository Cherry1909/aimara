import { v4 as uuidv4 } from 'uuid';

/**
 * MessageService - Gestiona mensajes en Firestore
 * CRUD operations + reactions
 */
class MessageService {
  constructor(firestore) {
    this.db = firestore;
    this.messagesCollection = 'chatMessages';
    this.roomsCollection = 'chatRooms';
  }

  /**
   * Guardar mensaje en Firestore
   */
  async saveMessage(message) {
    try {
      const messageData = {
        id: message.id || uuidv4(),
        roomId: message.roomId,
        userId: message.userId,
        displayName: message.displayName,
        content: message.content,
        timestamp: message.timestamp || Date.now(),
        reactions: message.reactions || {},
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.db.collection(this.messagesCollection).doc(messageData.id).set(messageData);

      // Actualizar último mensaje en la sala
      await this.updateRoomLastMessage(message.roomId, messageData);

      console.log(`💬 Message saved: ${messageData.id} in room ${message.roomId}`);
      return messageData;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  /**
   * Obtener mensajes de una sala con paginación
   */
  async getMessages(roomId, limit = 50, before = null) {
    try {
      let query = this.db
        .collection(this.messagesCollection)
        .where('roomId', '==', roomId)
        .orderBy('timestamp', 'desc')
        .limit(limit);

      if (before) {
        query = query.where('timestamp', '<', before);
      }

      const snapshot = await query.get();

      const messages = [];
      snapshot.forEach(doc => {
        messages.push(doc.data());
      });

      // Devolver en orden cronológico (más antiguos primero)
      return messages.reverse();
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  /**
   * Agregar reacción a un mensaje
   */
  async addReaction(messageId, userId, emoji) {
    try {
      const messageRef = this.db.collection(this.messagesCollection).doc(messageId);
      const messageDoc = await messageRef.get();

      if (!messageDoc.exists) {
        throw new Error('Message not found');
      }

      const messageData = messageDoc.data();
      const reactions = messageData.reactions || {};

      // Inicializar array si no existe
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }

      // Agregar userId si no está ya
      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
      }

      await messageRef.update({
        reactions,
        updatedAt: new Date()
      });

      console.log(`👍 Reaction ${emoji} added to message ${messageId} by user ${userId}`);

      return {
        ...messageData,
        id: messageId,
        reactions
      };
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  /**
   * Quitar reacción de un mensaje
   */
  async removeReaction(messageId, userId, emoji) {
    try {
      const messageRef = this.db.collection(this.messagesCollection).doc(messageId);
      const messageDoc = await messageRef.get();

      if (!messageDoc.exists) {
        throw new Error('Message not found');
      }

      const messageData = messageDoc.data();
      const reactions = messageData.reactions || {};

      if (reactions[emoji]) {
        reactions[emoji] = reactions[emoji].filter(id => id !== userId);

        // Eliminar el emoji si no tiene reacciones
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      }

      await messageRef.update({
        reactions,
        updatedAt: new Date()
      });

      console.log(`👎 Reaction ${emoji} removed from message ${messageId} by user ${userId}`);

      return {
        ...messageData,
        id: messageId,
        reactions
      };
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  /**
   * Actualizar último mensaje en la sala
   */
  async updateRoomLastMessage(roomId, message) {
    try {
      await this.db.collection(this.roomsCollection).doc(roomId).update({
        lastMessage: {
          text: message.content.substring(0, 100), // Primeros 100 caracteres
          userName: message.displayName,
          timestamp: new Date(message.timestamp)
        },
        updatedAt: new Date()
      });
    } catch (error) {
      // Si la sala no existe, no hacer nada
      console.log(`Room ${roomId} might not exist yet`);
    }
  }

  /**
   * Eliminar mensaje (moderación)
   */
  async deleteMessage(messageId) {
    try {
      await this.db.collection(this.messagesCollection).doc(messageId).delete();
      console.log(`🗑️ Message deleted: ${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de mensajes por sala
   */
  async getRoomStats(roomId) {
    try {
      const snapshot = await this.db
        .collection(this.messagesCollection)
        .where('roomId', '==', roomId)
        .count()
        .get();

      return {
        roomId,
        messageCount: snapshot.data().count
      };
    } catch (error) {
      console.error('Error getting room stats:', error);
      return { roomId, messageCount: 0 };
    }
  }
}

export default MessageService;
