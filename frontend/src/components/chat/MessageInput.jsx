import { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

/**
 * MessageInput - Input para escribir mensajes
 */
function MessageInput({ onSendMessage, onTyping, disabled = false }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    setMessage(e.target.value);

    // Enviar indicador de typing
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      onTyping(true);
    }

    // Reset timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing después de 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (message.trim().length === 0 || disabled) {
      return;
    }

    try {
      await onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      onTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e) => {
    // Enter para enviar, Shift+Enter para nueva línea
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <TextareaAutosize
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            minRows={1}
            maxRows={5}
            disabled={disabled}
          />
        </div>

        <button
          type="submit"
          disabled={disabled || message.trim().length === 0}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold"
        >
          Enviar
        </button>
      </div>

      <div className="text-xs text-gray-500 mt-2">
        Presiona Enter para enviar, Shift+Enter para nueva línea
      </div>
    </form>
  );
}

export default MessageInput;
