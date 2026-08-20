import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';

export interface SocketClient {
  connect: (token: string) => void;
  disconnect: () => void;
  on: (event: string, listener: (payload: unknown) => void) => SocketClient;
  off: (event: string, listener?: (payload: unknown) => void) => SocketClient;
  emit: (event: string, payload: unknown, ack?: (res: unknown) => void) => SocketClient;
}

let socket: Socket | null = null;

function createSocket(token: string): Socket {
  if (socket) {
    socket.disconnect();
  }
  socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
}

class RealSocketClient implements SocketClient {
  connect(token: string) {
    createSocket(token);
    socket?.connect();
  }

  disconnect() {
    socket?.disconnect();
    socket = null;
  }

  on(event: string, listener: (payload: unknown) => void) {
    socket?.on(event, listener as (...args: unknown[]) => void);
    return this;
  }

  off(event: string, listener?: (payload: unknown) => void) {
    if (listener) {
      socket?.off(event, listener as (...args: unknown[]) => void);
    } else {
      socket?.off(event);
    }
    return this;
  }

  emit(event: string, payload: unknown, ack?: (res: unknown) => void) {
    if (ack) {
      socket?.emit(event, payload, ack);
    } else {
      socket?.emit(event, payload);
    }
    return this;
  }
}

const socketClient = new RealSocketClient();

export function getSocket(): SocketClient {
  return socketClient;
}
