import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

const userSelect = { id: true, name: true, avatarUrl: true } satisfies Prisma.UserSelect;
const conversationInclude = {
  messages: { include: { sender: { select: userSelect } }, orderBy: { sentAt: 'desc' as const }, take: 1 },
} satisfies Prisma.ConversationInclude;

export async function ensureConversation(userId: string, universityId: string, participantId: string) {
  if (userId === participantId) throw new AppError('A conversation needs another participant', 400);
  const participant = await prisma.user.findFirst({ where: { id: participantId, universityId }, select: { id: true } });
  if (!participant) throw new AppError('Participant not found at your university', 404);
  const participantIds = [userId, participantId].sort();
  const existing = await prisma.conversation.findFirst({ where: { universityId, participantIds: { equals: participantIds } }, include: conversationInclude });
  if (existing) return existing;
  return prisma.conversation.create({ data: { universityId, participantIds }, include: conversationInclude });
}

export async function listConversations(userId: string, universityId: string) {
  return prisma.conversation.findMany({
    where: { universityId, participantIds: { has: userId } },
    include: conversationInclude,
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getConversation(userId: string, universityId: string, conversationId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, universityId, participantIds: { has: userId } },
    include: { messages: { include: { sender: { select: userSelect } }, orderBy: { sentAt: 'asc' } } },
  });
  if (!conversation) throw new AppError('Conversation not found', 404);
  return conversation;
}

export async function createMessage(userId: string, universityId: string, conversationId: string, content: string) {
  await getConversation(userId, universityId, conversationId);
  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: { conversationId, senderId: userId, content },
      include: { sender: { select: userSelect } },
    });
    await tx.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    return created;
  });
  return message;
}

export async function markMessagesRead(userId: string, universityId: string, conversationId: string) {
  await getConversation(userId, universityId, conversationId);
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });
}
