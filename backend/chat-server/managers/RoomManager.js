/**
 * RoomManager - Gestiona las 6 salas temáticas y sus usuarios
 */

// 6 salas predefinidas
export const ROOMS = {
  GENERAL: 'general',
  RITUALES: 'rituales',
  FESTIVIDADES: 'festividades',
  IDIOMA: 'idioma',
  TRADICIONES: 'tradiciones',
  SOPORTE: 'soporte'
};

export const ROOM_INFO = {
  general: {
    id: 'general',
    name: 'General',
    description: 'Conversaciones generales sobre cultura Aymara',
    icon: '💬'
  },
  rituales: {
    id: 'rituales',
    name: 'Rituales y Ceremonias',
    description: 'Discusión sobre prácticas espirituales',
    icon: '🎭'
  },
  festividades: {
    id: 'festividades',
    name: 'Festividades',
    description: 'Preguntas sobre fiestas y celebraciones',
    icon: '🎉'
  },
  idioma: {
    id: 'idioma',
    name: 'Idioma Aymara',
    description: 'Ayuda con traducción y aprendizaje',
    icon: '📚'
  },
  tradiciones: {
    id: 'tradiciones',
    name: 'Tradiciones',
    description: 'Costumbres, vestimenta, gastronomía',
    icon: '🏛️'
  },
  soporte: {
    id: 'soporte',
    name: 'Ayuda/Soporte',
    description: 'Soporte técnico de la plataforma',
    icon: '❓'
  }
};

class RoomManager {
  constructor() {
    // Map: roomId → Set<userId>
    this.rooms = new Map();

    // Map: userId → Set<roomId>
    this.userRooms = new Map();

    // Inicializar salas
    Object.values(ROOMS).forEach(roomId => {
      this.rooms.set(roomId, new Set());
    });
  }

  /**
   * Unirse a una sala
   */
  joinRoom(userId, roomId) {
    if (!Object.values(ROOMS).includes(roomId)) {
      throw new Error(`Invalid room: ${roomId}`);
    }

    // Agregar usuario a la sala
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(userId);

    // Agregar sala a las salas del usuario
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId).add(roomId);

    console.log(`📥 User ${userId} joined room: ${roomId}`);
  }

  /**
   * Salir de una sala
   */
  leaveRoom(userId, roomId) {
    this.rooms.get(roomId)?.delete(userId);
    this.userRooms.get(userId)?.delete(roomId);

    console.log(`📤 User ${userId} left room: ${roomId}`);
  }

  /**
   * Salir de todas las salas
   */
  leaveAllRooms(userId) {
    const rooms = this.getUserRooms(userId);
    rooms.forEach(roomId => {
      this.leaveRoom(userId, roomId);
    });
  }

  /**
   * Obtener lista de usuarios en una sala
   */
  getUsersInRoom(roomId) {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room) : [];
  }

  /**
   * Obtener lista de salas en las que está un usuario
   */
  getUserRooms(userId) {
    const rooms = this.userRooms.get(userId);
    return rooms ? Array.from(rooms) : [];
  }

  /**
   * Obtener información de una sala
   */
  getRoomInfo(roomId) {
    return ROOM_INFO[roomId] || null;
  }

  /**
   * Obtener todas las salas con información y conteo de usuarios
   */
  getAllRoomsInfo() {
    return Object.values(ROOMS).map(roomId => ({
      ...ROOM_INFO[roomId],
      userCount: this.getUsersInRoom(roomId).length
    }));
  }

  /**
   * Verificar si un usuario está en una sala
   */
  isUserInRoom(userId, roomId) {
    return this.rooms.get(roomId)?.has(userId) || false;
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    const stats = {};
    Object.values(ROOMS).forEach(roomId => {
      stats[roomId] = this.getUsersInRoom(roomId).length;
    });
    return stats;
  }
}

export default RoomManager;
