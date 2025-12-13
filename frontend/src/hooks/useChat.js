import { useEffect, useCallback, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import socketService from '../services/socketService';

/**
 * Custom Hook para gestionar Chat
 * Combina Zustand store + Socket.io service
 */
export const useChat = () => {
  const store = useChatStore();
  const typingTimeoutRef = useRef(null);

  // Setup socket event listeners
  useEffect(() => {
    // Nuevo mensaje
    const handleNewMessage = (message) => {
      store.addMessage(message.roomId, message);
    };

    // Reacción agregada
    const handleReactionAdded = ({ messageId, reactions }) => {
      store.updateMessageReactions(store.currentRoom, messageId, reactions);
    };

    // Reacción removida
    const handleReactionRemoved = ({ messageId, reactions }) => {
      store.updateMessageReactions(store.currentRoom, messageId, reactions);
    };

    // Usuario unido a sala
    const handleUserJoined = ({ userId, displayName }) => {
      store.setUserOnline(userId, { displayName });
    };

    // Usuario salió de sala
    const handleUserLeft = ({ userId }) => {
      // Mantener en el store pero no hacer nada especial
    };

    // Usuario escribiendo
    const handleUserTyping = ({ userId, displayName, roomId, isTyping }) => {
      store.setUserTyping(roomId, userId, displayName, isTyping);
    };

    // Usuario offline
    const handleUserOffline = ({ userId }) => {
      store.setUserOffline(userId);
    };

    // Registrar listeners
    socketService.on('new_message', handleNewMessage);
    socketService.on('reaction_added', handleReactionAdded);
    socketService.on('reaction_removed', handleReactionRemoved);
    socketService.on('user_joined', handleUserJoined);
    socketService.on('user_left', handleUserLeft);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('user_offline', handleUserOffline);

    // Cleanup on unmount
    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('reaction_added', handleReactionAdded);
      socketService.off('reaction_removed', handleReactionRemoved);
      socketService.off('user_joined', handleUserJoined);
      socketService.off('user_left', handleUserLeft);
      socketService.off('user_typing', handleUserTyping);
      socketService.off('user_offline', handleUserOffline);
    };
  }, [store]);

  /**
   * Conectar al chat
   */
  const connect = useCallback(
    async (displayName) => {
      try {
        store.setConnecting(true);

        const serverUrl = import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:3001';
        socketService.connect(serverUrl);

        const { userId, displayName: confirmedName } = await socketService.authenticate(
          displayName
        );

        store.setUser(userId, confirmedName);
        store.setConnected(true);

        return { userId, displayName: confirmedName };
      } catch (error) {
        console.error('Failed to connect:', error);
        throw error;
      } finally {
        store.setConnecting(false);
      }
    },
    [store]
  );

  /**
   * Unirse a una sala
   */
  const joinRoom = useCallback(
    async (roomId) => {
      try {
        // Salir de sala actual si es diferente
        if (store.currentRoom !== roomId) {
          await socketService.leaveRoom(store.currentRoom);
        }

        await socketService.joinRoom(roomId);
        store.setCurrentRoom(roomId);

        // Cargar historial de mensajes
        const messages = await socketService.loadMessages(roomId);
        store.setMessages(roomId, messages);
      } catch (error) {
        console.error('Failed to join room:', error);
        throw error;
      }
    },
    [store]
  );

  /**
   * Enviar mensaje
   */
  const sendMessage = useCallback(
    async (content) => {
      try {
        await socketService.sendMessage(store.currentRoom, content);
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [store.currentRoom]
  );

  /**
   * Agregar reacción
   */
  const addReaction = useCallback(async (messageId, emoji) => {
    try {
      await socketService.addReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      throw error;
    }
  }, []);

  /**
   * Quitar reacción
   */
  const removeReaction = useCallback(async (messageId, emoji) => {
    try {
      await socketService.removeReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      throw error;
    }
  }, []);

  /**
   * Enviar indicador de escritura
   */
  const sendTypingIndicator = useCallback(
    (isTyping) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socketService.sendTyping(store.currentRoom, isTyping);

      if (isTyping) {
        // Auto-stop typing después de 3 segundos
        typingTimeoutRef.current = setTimeout(() => {
          socketService.sendTyping(store.currentRoom, false);
        }, 3000);
      }
    },
    [store.currentRoom]
  );

  /**
   * Desconectar
   */
  const disconnect = useCallback(() => {
    socketService.disconnect();
    store.reset();
  }, [store]);

  /**
   * Cargar más mensajes (paginación)
   */
  const loadMoreMessages = useCallback(
    async (roomId, limit = 50) => {
      try {
        const currentMessages = store.messagesByRoom[roomId];
        if (currentMessages.length === 0) return;

        const oldestMessage = currentMessages[0];
        const messages = await socketService.loadMessages(
          roomId,
          limit,
          oldestMessage.timestamp
        );

        if (messages.length > 0) {
          store.prependMessages(roomId, messages);
        }

        return messages.length;
      } catch (error) {
        console.error('Failed to load more messages:', error);
        return 0;
      }
    },
    [store]
  );

  return {
    // Estado
    connected: store.connected,
    connecting: store.connecting,
    userId: store.userId,
    displayName: store.displayName,
    currentRoom: store.currentRoom,
    messages: store.messagesByRoom[store.currentRoom] || [],
    rooms: store.rooms,
    onlineUsers: store.onlineUsers,
    typingUsers: store.typingUsers[store.currentRoom] || {},

    // Acciones
    connect,
    disconnect,
    joinRoom,
    sendMessage,
    addReaction,
    removeReaction,
    sendTypingIndicator,
    loadMoreMessages
  };
};
