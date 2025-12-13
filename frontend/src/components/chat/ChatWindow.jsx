import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

/**
 * ChatWindow - Ventana principal de chat
 */
function ChatWindow({
  room,
  messages,
  currentUserId,
  typingUsers,
  onSendMessage,
  onTyping,
  onAddReaction,
  onRemoveReaction,
  loading = false
}) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{room.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{room.name}</h2>
              <p className="text-sm text-gray-600">{room.description}</p>
            </div>
          </div>

          {/* Info de usuarios online (opcional) */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Conectado</span>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        onAddReaction={onAddReaction}
        onRemoveReaction={onRemoveReaction}
        loading={loading}
      />

      {/* Typing indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        disabled={!currentUserId}
      />
    </div>
  );
}

export default ChatWindow;
