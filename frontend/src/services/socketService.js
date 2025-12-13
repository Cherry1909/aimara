import { io } from 'socket.io-client';

/**
 * Socket.io Service - Wrapper para comunicación WebSocket
 * Singleton para gestionar la conexión al chat server
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.eventHandlers = new Map();
  }

  /**
   * Conectar al servidor Socket.io
   */
  connect(serverUrl = null) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    const url = serverUrl || import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:3001';

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000
    });

    this.setupDefaultListeners();

    console.log(`🔌 Connecting to chat server: ${url}`);

    return this.socket;
  }

  /**
   * Configurar listeners por defecto
   */
  setupDefaultListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
    });
  }

  /**
   * Autenticar usuario (anónimo con displayName)
   */
  authenticate(displayName) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('authenticate', { displayName }, (response) => {
        if (response.success) {
          console.log('✅ Authenticated as:', response.displayName);
          resolve(response);
        } else {
          console.error('❌ Authentication failed:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Unirse a una sala
   */
  joinRoom(roomId) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('join_room', { roomId }, (response) => {
        if (response.success) {
          console.log('✅ Joined room:', roomId);
          resolve(response);
        } else {
          console.error('❌ Failed to join room:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Salir de una sala
   */
  leaveRoom(roomId) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('leave_room', { roomId }, (response) => {
        if (response.success) {
          console.log('✅ Left room:', roomId);
          resolve(response);
        } else {
          console.error('❌ Failed to leave room:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Enviar mensaje
   */
  sendMessage(roomId, content) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('send_message', { roomId, content }, (response) => {
        if (response.success) {
          resolve(response.message);
        } else {
          console.error('❌ Failed to send message:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Cargar mensajes de una sala
   */
  loadMessages(roomId, limit = 50, before = null) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('load_messages', { roomId, limit, before }, (response) => {
        if (response.success) {
          resolve(response.messages);
        } else {
          console.error('❌ Failed to load messages:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Agregar reacción a un mensaje
   */
  addReaction(messageId, emoji) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('add_reaction', { messageId, emoji }, (response) => {
        if (response.success) {
          resolve();
        } else {
          console.error('❌ Failed to add reaction:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Quitar reacción de un mensaje
   */
  removeReaction(messageId, emoji) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('remove_reaction', { messageId, emoji }, (response) => {
        if (response.success) {
          resolve();
        } else {
          console.error('❌ Failed to remove reaction:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Enviar indicador de escritura
   */
  sendTyping(roomId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { roomId, isTyping });
    }
  }

  /**
   * Registrar event listener
   */
  on(event, handler) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on(event, handler);

    // Guardar para cleanup
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Quitar event listener
   */
  off(event, handler) {
    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  /**
   * Desconectar
   */
  disconnect() {
    if (this.socket) {
      // Limpiar todos los listeners personalizados
      this.eventHandlers.forEach((handlers, event) => {
        handlers.forEach((handler) => {
          this.socket.off(event, handler);
        });
      });
      this.eventHandlers.clear();

      this.socket.disconnect();
      this.socket = null;

      console.log('🔌 Socket disconnected');
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Obtener socket ID
   */
  getSocketId() {
    return this.socket?.id || null;
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
