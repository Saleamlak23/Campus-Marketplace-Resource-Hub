import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

const userSelect = { id: true, name: true, avatarUrl: true } satisfies Prisma.UserSelect;
const conversationInclude = {
  messages: { include: { sender: { select: userSelect } }, orderBy: { sentAt: 'desc' as const }, take: 1 },
} satisfies Prisma.ConversationInclude;

export async function ensureConversation(userId: string, universityId: string, participantId: string) {
  if (userId === participantId) throw new AppError('A conversation needs another participant', 400);
  const participant = await prisma.user.findFirst({ where: { id: participantId, universityId }, select: { id: true, name: true, avatarUrl: true } });
  if (!participant) throw new AppError('Participant not found at your university', 404);
  const participantIds = [userId, participantId].sort();
  let existing = await prisma.conversation.findFirst({ where: { universityId, participantIds: { equals: participantIds } }, include: conversationInclude });
  if (!existing) {
    existing = await prisma.conversation.create({ data: { universityId, participantIds }, include: conversationInclude });
  }
  return {
    ...existing,
    counterpart: {
      id: participant.id,
      name: participant.name,
      avatar: participant.avatarUrl || participant.name.slice(0, 2).toUpperCase(),
      avatarUrl: participant.avatarUrl,
    },
  };
}

export async function listConversations(userId: string, universityId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { universityId, participantIds: { has: userId } },
    include: {
      messages: {
        include: { sender: { select: userSelect } },
        orderBy: { sentAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const counterpartIds = Array.from(
    new Set(
      conversations
        .map((c) => c.participantIds.find((id) => id !== userId))
        .filter((id): id is string => Boolean(id))
    )
  );

  const counterparts = await prisma.user.findMany({
    where: { id: { in: counterpartIds } },
    select: { id: true, name: true, avatarUrl: true },
  });

  const counterpartMap = new Map(counterparts.map((u) => [u.id, u]));

  return conversations.map((conv) => {
    const counterpartId = conv.participantIds.find((id) => id !== userId);
    const cp = counterpartId ? counterpartMap.get(counterpartId) : null;
    const lastMsg = conv.messages[0];
    return {
      ...conv,
      counterpart: {
        id: cp?.id || counterpartId || '',
        name: cp?.name || 'Fellow Student',
        avatar: cp?.avatarUrl || (cp?.name ? cp.name.slice(0, 2).toUpperCase() : 'ST'),
        avatarUrl: cp?.avatarUrl || null,
      },
      lastMessage: lastMsg?.content || '',
      lastMessageAt: lastMsg?.sentAt || conv.updatedAt,
      unreadCount: 0,
    };
  });
}

export async function getConversation(userId: string, universityId: string, conversationId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, universityId, participantIds: { has: userId } },
    include: { messages: { include: { sender: { select: userSelect } }, orderBy: { sentAt: 'asc' } } },
  });
  if (!conversation) throw new AppError('Conversation not found', 404);

  const counterpartId = conversation.participantIds.find((id) => id !== userId);
  const cp = counterpartId
    ? await prisma.user.findUnique({ where: { id: counterpartId }, select: { id: true, name: true, avatarUrl: true } })
    : null;

  return {
    ...conversation,
    counterpart: {
      id: cp?.id || counterpartId || '',
      name: cp?.name || 'Fellow Student',
      avatar: cp?.avatarUrl || (cp?.name ? cp.name.slice(0, 2).toUpperCase() : 'ST'),
      avatarUrl: cp?.avatarUrl || null,
    },
  };
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
