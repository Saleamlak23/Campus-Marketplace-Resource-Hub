import { io, Socket } from 'socket.io-client';
import { isMockModeEnabled } from './api-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export interface SocketClient {
  connect: () => void;
  disconnect: () => void;
  on: (event: string, listener: (payload: unknown) => void) => SocketClient;
  off: (event: string, listener?: (payload: unknown) => void) => SocketClient;
  emit: (event: string, payload: unknown) => SocketClient;
}

class MockSocketClient implements SocketClient {
  private listeners = new Map<string, Set<(payload: unknown) => void>>();

  connect() {}
  disconnect() {}

  on(event: string, listener: (payload: unknown) => void) {
    const eventListeners = this.listeners.get(event) ?? new Set();
    eventListeners.add(listener);
    this.listeners.set(event, eventListeners);
    return this;
  }

  off(event: string, listener?: (payload: unknown) => void) {
    if (listener) this.listeners.get(event)?.delete(listener);
    else this.listeners.delete(event);
    return this;
  }

  emit(event: string, payload: unknown) {
    this.publish(event, payload);
    if (event === 'message:send') {
      window.setTimeout(() => this.publish('message:received', payload), 350);
    }
    return this;
  }

  private publish(event: string, payload: unknown) {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  }
}

let socket: Socket | null = null;
let mockSocket: MockSocketClient | null = null;

export function getSocket(): SocketClient {
  if (isMockModeEnabled()) {
    mockSocket ??= new MockSocketClient();
    return mockSocket;
  }
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket as unknown as SocketClient;
}
