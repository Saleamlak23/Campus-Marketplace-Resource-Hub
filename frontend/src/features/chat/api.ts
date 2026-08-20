import { apiClient } from '../../lib/api-client';
import { getAccessToken } from '../../store/authStore';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sentAt: string;
  createdAt?: string;
  readAt?: string | null;
  sender?: { id: string; name: string; avatarUrl: string | null };
}

export interface Conversation {
  id: string;
  universityId: string;
  participantIds: string[];
  counterpart: {
    id: string;
    name: string;
    avatar: string;
    avatarUrl: string | null;
  };
  lastMessage: string;
  lastMessageAt: string;
  updatedAt: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export async function fetchConversations(): Promise<Conversation[]> {
  return apiClient<Conversation[]>('/api/conversations', { token: getAccessToken() });
}

export async function createConversation(participantId: string): Promise<Conversation> {
  return apiClient<Conversation>('/api/conversations', {
    method: 'POST',
    body: { participantId },
    token: getAccessToken(),
  });
}

export async function fetchConversation(id: string): Promise<Conversation> {
  return apiClient<Conversation>(`/api/conversations/${id}`, { token: getAccessToken() });
}

export async function sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
  return apiClient<ChatMessage>(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { content },
    token: getAccessToken(),
  });
}
