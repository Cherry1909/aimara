/**
 * TypingIndicator - Muestra quién está escribiendo
 */
function TypingIndicator({ typingUsers }) {
  const userNames = Object.values(typingUsers);

  if (userNames.length === 0) {
    return null;
  }

  const getText = () => {
    if (userNames.length === 1) {
      return `${userNames[0]} está escribiendo`;
    } else if (userNames.length === 2) {
      return `${userNames[0]} y ${userNames[1]} están escribiendo`;
    } else {
      return `${userNames.length} personas están escribiendo`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-gray-600 italic flex items-center gap-2">
      <span>{getText()}</span>
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default TypingIndicator;
