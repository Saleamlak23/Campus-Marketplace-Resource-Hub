import { Server } from 'socket.io';

// TODO: build out real-time chat events (join conversation, send message,
// persist to DB). See docs/plan.md Section 7.1, Trunk Task C.
export function registerChatSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}
