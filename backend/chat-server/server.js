import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Config
import { initializeFirebase } from './config/firebase.js';

// Managers
import ConnectionManager from './managers/ConnectionManager.js';
import RoomManager from './managers/RoomManager.js';
import PresenceManager from './managers/PresenceManager.js';

// Services
import MessageService from './services/messageService.js';

// Handlers
import { handleConnection } from './handlers/connectionHandler.js';
import { handleRoomEvents } from './handlers/roomHandler.js';
import { handleMessageEvents } from './handlers/messageHandler.js';
import { handleReactionEvents } from './handlers/reactionHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Initialize Firebase
const db = initializeFirebase();

// Initialize managers
const connectionManager = new ConnectionManager();
const roomManager = new RoomManager();
const presenceManager = new PresenceManager(db);

// Initialize services
const messageService = new MessageService(db);

// Bundle managers for handlers
const managers = {
  connectionManager,
  roomManager,
  presenceManager
};

// Health check endpoint
app.get('/health', (req, res) => {
  const stats = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    connections: connectionManager.getStats(),
    rooms: roomManager.getStats(),
    presence: presenceManager.getStats()
  };

  res.json(stats);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Historias Aymara Chat Server',
    version: '1.0.0',
    status: 'running',
    socket: {
      connected: connectionManager.getStats().totalConnections,
      users: connectionManager.getStats().uniqueUsers
    }
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  // Register all event handlers
  handleConnection(socket, managers);
  handleRoomEvents(socket, managers, io);
  handleMessageEvents(socket, managers, messageService, io);
  handleReactionEvents(socket, managers, messageService, io);

  // Log connection stats
  console.log(`📊 Stats: ${connectionManager.getStats().totalConnections} connections, ${connectionManager.getStats().uniqueUsers} users`);
});

// Error handling
io.on('error', (error) => {
  console.error('❌ Socket.io error:', error);
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log('┌─────────────────────────────────────────────┐');
  console.log('│                                             │');
  console.log('│  🎭 Historias Aymara - Chat Server 🎭     │');
  console.log('│                                             │');
  console.log('└─────────────────────────────────────────────┘');
  console.log('');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGINS}`);
  console.log(`🔥 Firebase connected: ${db ? '✅' : '❌'}`);
  console.log('');
  console.log('📡 Socket.io events registered:');
  console.log('   - authenticate, disconnect, ping');
  console.log('   - join_room, leave_room, get_room_presence, get_rooms');
  console.log('   - send_message, load_messages, typing, delete_message');
  console.log('   - add_reaction, remove_reaction, toggle_reaction');
  console.log('');
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
