import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { getSocket } from '../../lib/socket';
import { useAuthStore } from '../../store/authStore';
import {
  fetchConversation,
  fetchConversations,
  type ChatMessage,
} from './api';

export default function ChatWorkspace() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, accessToken } = useAuthStore();
  const currentUserId = user?.id ?? '';

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  });

  const activeId = conversationId ?? conversations[0]?.id;
  const { data: activeConversation } = useQuery({
    queryKey: ['conversation', activeId],
    queryFn: () => fetchConversation(activeId!),
    enabled: Boolean(activeId),
  });

  const active = activeConversation ?? conversations.find((item) => item.id === activeId);
  const messages = active?.messages ?? [];

  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!conversationId && conversations[0]) {
      navigate(`/chat/${conversations[0].id}`, { replace: true });
    }
  }, [conversationId, conversations, navigate]);

  useEffect(() => {
    if (!accessToken || !activeId) return;

    const socket = getSocket();
    socket.connect(accessToken);

    socket.emit('join_conversation', activeId);

    const receive = (payload: unknown) => {
      const message = payload as ChatMessage;
      if (message.senderId === currentUserId) return;
      qc.invalidateQueries({ queryKey: ['conversation', activeId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('message_created', receive);

    return () => {
      socket.off('message_created', receive);
      socket.disconnect();
    };
  }, [accessToken, activeId, currentUserId, qc]);

  const send = async () => {
    if (!draft.trim() || !active || !accessToken) return;

    const content = draft.trim();
    setDraft('');

    try {
      await new Promise<void>((resolve, reject) => {
        getSocket().emit(
          'send_message',
          { conversationId: active.id, content },
          (response: unknown) => {
            const result = response as { success?: boolean; error?: string };
            if (result.success) {
              resolve();
            } else {
              reject(new Error(result.error ?? 'Message could not be sent'));
            }
          },
        );
      });
      qc.invalidateQueries({ queryKey: ['conversation', active.id] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    } catch {
      setDraft(content);
    }
  };

  if (isLoading) return <Card>Loading conversations…</Card>;

  return (
    <div className="h-[calc(100vh-10rem)] min-h-[580px] overflow-hidden rounded-xl border border-border bg-surface shadow-sm md:grid md:grid-cols-[20rem_1fr]">
      <aside className="border-b border-border md:border-b-0 md:border-r">
        <div className="border-b border-border p-4">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <div className="max-h-52 overflow-y-auto md:max-h-none">
          {conversations.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => navigate(`/chat/${item.id}`)}
              className={`flex w-full gap-3 border-b border-border p-4 text-left ${
                active?.id === item.id ? 'bg-primary-50' : 'hover:bg-surface-muted'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
                {item.counterpart.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <strong className="truncate text-sm">{item.counterpart.name}</strong>
                  <time className="text-xs text-text-muted">
                    {new Date(item.lastMessageAt || item.updatedAt).toLocaleDateString()}
                  </time>
                </div>
                <p className="truncate text-sm text-text-muted">{item.lastMessage}</p>
              </div>
              {item.unreadCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-primary-600" />
              )}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        {active ? (
          <>
            <header className="border-b border-border p-4">
              <h2 className="font-semibold">{active.counterpart.name}</h2>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto bg-surface-muted p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      message.senderId === currentUserId
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface text-text shadow-sm'
                    }`}
                  >
                    <p>{message.content}</p>
                    <time
                      className={`mt-1 block text-[10px] ${
                        message.senderId === currentUserId
                          ? 'text-primary-100'
                          : 'text-text-muted'
                      }`}
                    >
                      {new Date(message.sentAt || message.createdAt || '').toLocaleTimeString(
                        [],
                        { hour: '2-digit', minute: '2-digit' },
                      )}
                    </time>
                  </div>
                </div>
              ))}
            </div>
            <form
              className="flex gap-2 border-t border-border p-3"
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a message…"
                className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 text-sm"
              />
              <Button type="submit">Send</Button>
            </form>
          </>
        ) : (
          <div className="m-auto text-text-muted">Select a conversation to start chatting.</div>
        )}
      </section>
    </div>
  );
}
