import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { registerChatSocket } from './sockets/chat.socket.js';

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL },
});

registerChatSocket(io);

server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
