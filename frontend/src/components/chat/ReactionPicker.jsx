import { useRef, useEffect } from 'react';

/**
 * ReactionPicker - Selector de emojis para reacciones
 */
const ALLOWED_EMOJIS = ['👍', '❤️', '😂'];

function ReactionPicker({ onSelect, onClose }) {
  const pickerRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 flex gap-1 z-10 animate-fadeIn"
    >
      {ALLOWED_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="text-2xl hover:bg-gray-100 rounded px-2 py-1 transition"
          type="button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export default ReactionPicker;
