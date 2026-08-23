import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import prisma from '../lib/prisma';
import * as chatService from '../modules/chat/chat.service';
import { createMessageSchema } from '../modules/chat/chat.validation';

interface SocketUser {
  userId: string;
  universityId: string;
  role: string;
}

interface SocketWithUser extends Socket {
  user?: SocketUser;
}

type Acknowledgement = (response: { success: boolean; error?: string; data?: unknown }) => void;

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Unexpected socket error';
}

export function registerChatSocket(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (typeof token !== 'string') return next(new Error('Authentication token is required'));
      const decoded = jwt.verify(token, config.jwt.accessSecret) as SocketUser;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { isBanned: true },
      });
      if (!user || user.isBanned) return next(new Error('Your account has been banned'));
      (socket as SocketWithUser).user = decoded;
      next();
    } catch {
      next(new Error('Invalid or expired authentication token'));
    }
  });

  io.on('connection', (socket: SocketWithUser) => {
    const user = socket.user;
    if (!user) return socket.disconnect();
    socket.join(`user:${user.userId}`);

    socket.on('join_conversation', async (conversationId: unknown, acknowledge?: Acknowledgement) => {
      try {
        if (typeof conversationId !== 'string') throw new Error('conversationId is required');
        await chatService.getConversation(user.userId, user.universityId, conversationId);
        socket.join(`conversation:${conversationId}`);
        acknowledge?.({ success: true });
      } catch (error) { acknowledge?.({ success: false, error: message(error) }); }
    });

    socket.on('send_message', async (payload: unknown, acknowledge?: Acknowledgement) => {
      try {
        if (!payload || typeof payload !== 'object') throw new Error('Message payload is required');
        const { conversationId, content } = payload as { conversationId?: unknown; content?: unknown };
        if (typeof conversationId !== 'string') throw new Error('conversationId is required');
        const parsed = createMessageSchema.parse({ content });
        const saved = await chatService.createMessage(user.userId, user.universityId, conversationId, parsed.content);
        io.to(`conversation:${conversationId}`).emit('message_created', saved);
        acknowledge?.({ success: true, data: saved });
      } catch (error) { acknowledge?.({ success: false, error: message(error) }); }
    });

    socket.on('mark_read', async (conversationId: unknown, acknowledge?: Acknowledgement) => {
      try {
        if (typeof conversationId !== 'string') throw new Error('conversationId is required');
        await chatService.markMessagesRead(user.userId, user.universityId, conversationId);
        socket.to(`conversation:${conversationId}`).emit('messages_read', { conversationId, userId: user.userId });
        acknowledge?.({ success: true });
      } catch (error) { acknowledge?.({ success: false, error: message(error) }); }
    });
  });
}
