/**
 * ConnectionManager - Gestiona conexiones activas de Socket.io
 * Mapea socketId → userData y userId → Set<socketId>
 */
class ConnectionManager {
  constructor() {
    // Map: socketId → userData
    this.connections = new Map();

    // Map: userId → Set<socketId> (un usuario puede tener múltiples conexiones)
    this.userSockets = new Map();
  }

  /**
   * Agregar nueva conexión
   */
  addConnection(socketId, userData) {
    this.connections.set(socketId, userData);

    if (!this.userSockets.has(userData.userId)) {
      this.userSockets.set(userData.userId, new Set());
    }
    this.userSockets.get(userData.userId).add(socketId);

    console.log(`✅ Connection added: ${socketId} (User: ${userData.displayName})`);
  }

  /**
   * Remover conexión
   */
  removeConnection(socketId) {
    const userData = this.connections.get(socketId);

    if (userData) {
      const sockets = this.userSockets.get(userData.userId);
      sockets?.delete(socketId);

      // Si no quedan más sockets para este usuario, limpiar
      if (sockets?.size === 0) {
        this.userSockets.delete(userData.userId);
      }

      this.connections.delete(socketId);
      console.log(`❌ Connection removed: ${socketId} (User: ${userData.displayName})`);

      return userData;
    }

    return null;
  }

  /**
   * Obtener datos de usuario por socketId
   */
  getUserBySocketId(socketId) {
    return this.connections.get(socketId);
  }

  /**
   * Obtener todos los socketIds de un usuario
   */
  getSocketsByUserId(userId) {
    const sockets = this.userSockets.get(userId);
    return sockets ? Array.from(sockets) : [];
  }

  /**
   * Verificar si un usuario está online (tiene al menos una conexión)
   */
  isUserOnline(userId) {
    const sockets = this.userSockets.get(userId);
    return sockets && sockets.size > 0;
  }

  /**
   * Obtener lista de todos los usuarios conectados
   */
  getOnlineUsers() {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Obtener estadísticas de conexiones
   */
  getStats() {
    return {
      totalConnections: this.connections.size,
      uniqueUsers: this.userSockets.size,
      averageConnectionsPerUser: this.connections.size / Math.max(this.userSockets.size, 1)
    };
  }
}

export default ConnectionManager;
