import app from './app';
import { config } from './config/env';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerChatSocket } from './sockets/chat.socket';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: config.frontendUrl, credentials: true },
});
registerChatSocket(io);

const server = httpServer.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
