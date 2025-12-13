import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import RoomList from '../components/chat/RoomList';
import ChatWindow from '../components/chat/ChatWindow';

/**
 * ChatPage - Página principal del chat
 */
function ChatPage() {
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const {
    connected,
    connecting,
    userId,
    currentRoom,
    messages,
    rooms,
    typingUsers,
    connect,
    joinRoom,
    sendMessage,
    sendTypingIndicator,
    addReaction,
    removeReaction
  } = useChat();

  // Auto-unirse a la sala general al conectar
  useEffect(() => {
    if (connected && currentRoom === 'general') {
      joinRoom('general').catch(console.error);
    }
  }, [connected, currentRoom, joinRoom]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (displayName.trim().length === 0) {
      setLoginError('Por favor ingresa un nombre');
      return;
    }

    if (displayName.trim().length < 2) {
      setLoginError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    try {
      await connect(displayName.trim());
      setShowLoginModal(false);
    } catch (error) {
      setLoginError(error.message || 'Error al conectar');
    }
  };

  const handleSelectRoom = async (roomId) => {
    try {
      await joinRoom(roomId);
      setShowMobileMenu(false);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  // Modal de login
  if (showLoginModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💬</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Chat Comunitario</h1>
            <p className="text-gray-600">Historias Vivientes Aymara</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-2">
                Ingresa tu nombre
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej: Juan Mamani"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={connecting}
                maxLength={50}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Tu nombre será visible para otros usuarios
              </p>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={connecting || displayName.trim().length === 0}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-semibold text-lg"
            >
              {connecting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Conectando...
                </span>
              ) : (
                'Entrar al Chat'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-xl">ℹ️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>6 salas disponibles:</strong> General, Rituales, Festividades, Idioma, Tradiciones y Soporte
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/"
              className="block text-center mt-4 text-primary-600 hover:text-primary-700 font-semibold"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar (mobile) */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-bold text-lg">Chat Aymara</h1>
        <Link to="/" className="text-primary-600">
          ←
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop siempre visible, Mobile con toggle */}
        <div className={`${showMobileMenu ? 'block' : 'hidden'} md:block`}>
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onSelectRoom={handleSelectRoom}
          />
        </div>

        {/* Chat window */}
        <div className={`flex-1 ${showMobileMenu ? 'hidden md:flex' : 'flex'} flex-col`}>
          <ChatWindow
            room={rooms[currentRoom]}
            messages={messages}
            currentUserId={userId}
            typingUsers={typingUsers}
            onSendMessage={sendMessage}
            onTyping={sendTypingIndicator}
            onAddReaction={addReaction}
            onRemoveReaction={removeReaction}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Conectado como <strong>{displayName}</strong></span>
        </div>
        <Link to="/" className="hover:text-primary-600">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default ChatPage;
