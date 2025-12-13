import { useState } from 'react';
import ReactionPicker from './ReactionPicker';

/**
 * MessageItem - Componente individual de mensaje
 */
function MessageItem({ message, currentUserId, onAddReaction, onRemoveReaction }) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const isOwnMessage = message.userId === currentUserId;

  const handleReactionClick = (emoji) => {
    const userReacted = message.reactions?.[emoji]?.includes(currentUserId);

    if (userReacted) {
      onRemoveReaction(message.id, emoji);
    } else {
      onAddReaction(message.id, emoji);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* Nombre del usuario (solo para mensajes de otros) */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-600 mb-1 px-2 font-medium">
            {message.displayName}
          </div>
        )}

        {/* Burbuja del mensaje */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage
              ? 'bg-primary-600 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-900 rounded-bl-none'
          }`}
        >
          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
          <div className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-100' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>

        {/* Reacciones */}
        <div className="flex flex-wrap gap-1 mt-1 px-2 relative">
          {Object.entries(message.reactions || {}).map(([emoji, users]) =>
            users.length > 0 ? (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition ${
                  users.includes(currentUserId)
                    ? 'bg-primary-100 border-2 border-primary-500'
                    : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                }`}
                type="button"
              >
                <span>{emoji}</span>
                <span className="text-gray-700 font-medium">{users.length}</span>
              </button>
            ) : null
          )}

          {/* Botón para agregar reacción */}
          <div className="relative">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="px-2 py-1 rounded-full text-xs bg-gray-100 hover:bg-gray-200 transition border-2 border-transparent hover:border-gray-300"
              type="button"
            >
              +
            </button>

            {showReactionPicker && (
              <ReactionPicker
                onSelect={(emoji) => {
                  onAddReaction(message.id, emoji);
                  setShowReactionPicker(false);
                }}
                onClose={() => setShowReactionPicker(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageItem;
