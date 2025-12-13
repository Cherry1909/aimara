import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';

/**
 * MessageList - Lista de mensajes con scroll automático
 */
function MessageList({ messages, currentUserId, onAddReaction, onRemoveReaction, loading = false }) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Agrupar mensajes por fecha
  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((message) => {
      const date = new Date(message.timestamp).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500 mb-4"></div>
          <p className="text-gray-600">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg font-semibold mb-2">No hay mensajes aún</p>
          <p className="text-sm">¡Sé el primero en enviar un mensaje!</p>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto py-4">
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          {/* Separador de fecha */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-200 rounded-full px-4 py-1">
              <span className="text-xs text-gray-600 font-medium">{date}</span>
            </div>
          </div>

          {/* Mensajes de ese día */}
          {msgs.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              onAddReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
            />
          ))}
        </div>
      ))}

      {/* Elemento invisible para scroll automático */}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
