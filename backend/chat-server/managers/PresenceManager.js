/**
 * PresenceManager - Gestiona presencia de usuarios (online/offline)
 * Sincroniza con Firestore para persistencia
 */
class PresenceManager {
  constructor(firestore) {
    this.db = firestore;

    // In-memory cache: userId → presenceData
    this.presence = new Map();
  }

  /**
   * Marcar usuario como online
   */
  async setUserOnline(userId, displayName) {
    const presenceData = {
      userId,
      displayName,
      status: 'online',
      lastSeen: Date.now(),
      connectedAt: Date.now()
    };

    this.presence.set(userId, presenceData);

    // Persistir a Firestore
    try {
      await this.db.collection('chatPresence').doc(userId).set({
        userId,
        displayName,
        status: 'online',
        lastSeen: new Date(),
        connectedAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      console.log(`🟢 User ${displayName} (${userId}) is now online`);
    } catch (error) {
      console.error('Error updating presence in Firestore:', error);
    }

    return presenceData;
  }

  /**
   * Marcar usuario como offline
   */
  async setUserOffline(userId) {
    const presenceData = this.presence.get(userId);

    if (presenceData) {
      presenceData.status = 'offline';
      presenceData.lastSeen = Date.now();

      // Persistir a Firestore
      try {
        await this.db.collection('chatPresence').doc(userId).update({
          status: 'offline',
          lastSeen: new Date(),
          updatedAt: new Date()
        });

        console.log(`⚫ User ${presenceData.displayName} (${userId}) is now offline`);
      } catch (error) {
        console.error('Error updating presence in Firestore:', error);
      }

      this.presence.delete(userId);
    }
  }

  /**
   * Actualizar last seen
   */
  async updateLastSeen(userId) {
    const presenceData = this.presence.get(userId);

    if (presenceData) {
      presenceData.lastSeen = Date.now();

      try {
        await this.db.collection('chatPresence').doc(userId).update({
          lastSeen: new Date(),
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error updating last seen:', error);
      }
    }
  }

  /**
   * Obtener usuarios online
   */
  getOnlineUsers() {
    return Array.from(this.presence.values()).filter(p => p.status === 'online');
  }

  /**
   * Obtener presencia de un usuario
   */
  getUserPresence(userId) {
    return this.presence.get(userId) || null;
  }

  /**
   * Verificar si un usuario está online
   */
  isUserOnline(userId) {
    const presence = this.presence.get(userId);
    return presence && presence.status === 'online';
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    const onlineCount = this.getOnlineUsers().length;
    return {
      onlineUsers: onlineCount,
      totalTracked: this.presence.size
    };
  }
}

export default PresenceManager;
