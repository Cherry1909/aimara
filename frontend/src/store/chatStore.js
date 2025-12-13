import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Zustand Store para el Chat en Tiempo Real
 * Gestiona estado de conexión, usuarios, mensajes, presencia
 */
export const useChatStore = create(
  devtools(
    (set, get) => ({
      // Estado de conexión
      connected: false,
      connecting: false,
      userId: null,
      displayName: null,

      // Sala actual
      currentRoom: 'general',

      // Mensajes por sala
      messagesByRoom: {
        general: [],
        rituales: [],
        festividades: [],
        idioma: [],
        tradiciones: [],
        soporte: []
      },

      // Presencia de usuarios
      onlineUsers: {}, // { userId: { displayName, online, lastSeen } }

      // Usuarios escribiendo por sala
      typingUsers: {}, // { roomId: { userId: displayName } }

      // Información de salas
      rooms: {
        general: {
          id: 'general',
          name: 'General',
          icon: '💬',
          description: 'Conversaciones generales sobre cultura Aymara'
        },
        rituales: {
          id: 'rituales',
          name: 'Rituales y Ceremonias',
          icon: '🎭',
          description: 'Discusión sobre prácticas espirituales'
        },
        festividades: {
          id: 'festividades',
          name: 'Festividades',
          icon: '🎉',
          description: 'Preguntas sobre fiestas y celebraciones'
        },
        idioma: {
          id: 'idioma',
          name: 'Idioma Aymara',
          icon: '📚',
          description: 'Ayuda con traducción y aprendizaje'
        },
        tradiciones: {
          id: 'tradiciones',
          name: 'Tradiciones',
          icon: '🏛️',
          description: 'Costumbres, vestimenta, gastronomía'
        },
        soporte: {
          id: 'soporte',
          name: 'Ayuda/Soporte',
          icon: '❓',
          description: 'Soporte técnico de la plataforma'
        }
      },

      // ============ ACTIONS ============

      // Conexión
      setConnected: (connected) => set({ connected }),
      setConnecting: (connecting) => set({ connecting }),

      // Usuario
      setUser: (userId, displayName) => set({ userId, displayName }),

      // Sala actual
      setCurrentRoom: (roomId) => set({ currentRoom: roomId }),

      // Mensajes
      addMessage: (roomId, message) =>
        set((state) => ({
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: [...state.messagesByRoom[roomId], message]
          }
        })),

      setMessages: (roomId, messages) =>
        set((state) => ({
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: messages
          }
        })),

      prependMessages: (roomId, messages) =>
        set((state) => ({
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: [...messages, ...state.messagesByRoom[roomId]]
          }
        })),

      updateMessageReactions: (roomId, messageId, reactions) =>
        set((state) => ({
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: state.messagesByRoom[roomId].map((msg) =>
              msg.id === messageId ? { ...msg, reactions } : msg
            )
          }
        })),

      // Presencia
      setOnlineUsers: (users) => set({ onlineUsers: users }),

      setUserOnline: (userId, data) =>
        set((state) => ({
          onlineUsers: {
            ...state.onlineUsers,
            [userId]: { ...data, online: true }
          }
        })),

      setUserOffline: (userId) =>
        set((state) => ({
          onlineUsers: {
            ...state.onlineUsers,
            [userId]: {
              ...state.onlineUsers[userId],
              online: false
            }
          }
        })),

      // Typing indicators
      setUserTyping: (roomId, userId, displayName, isTyping) =>
        set((state) => {
          const roomTyping = state.typingUsers[roomId] || {};

          if (isTyping) {
            return {
              typingUsers: {
                ...state.typingUsers,
                [roomId]: { ...roomTyping, [userId]: displayName }
              }
            };
          } else {
            const { [userId]: _, ...rest } = roomTyping;
            return {
              typingUsers: {
                ...state.typingUsers,
                [roomId]: rest
              }
            };
          }
        }),

      clearTypingForRoom: (roomId) =>
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [roomId]: {}
          }
        })),

      // Reset (logout/disconnect)
      reset: () =>
        set({
          connected: false,
          connecting: false,
          userId: null,
          displayName: null,
          currentRoom: 'general',
          messagesByRoom: {
            general: [],
            rituales: [],
            festividades: [],
            idioma: [],
            tradiciones: [],
            soporte: []
          },
          onlineUsers: {},
          typingUsers: {}
        })
    }),
    { name: 'chat-store' }
  )
);
