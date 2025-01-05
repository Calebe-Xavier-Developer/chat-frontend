import { io } from 'socket.io-client';
import { getUserId } from '@/utils/userSession';

const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
  query: {
    userId: getUserId(),
  },
});

socket.on('connect', () => console.log('✅ Socket.IO connected'));
socket.on('disconnect', () => console.log('❌ Socket.IO disconnected'));

let activeChatId: string | null = null;

export const setActiveChat = (chatId: string) => {
  activeChatId = chatId;
};

export const joinChatSocket = (chatId: string) => {
  socket.emit('join_chat', chatId);
  setActiveChat(chatId);
};

export const leaveChatSocket = (chatId: string) => {
  socket.emit('leave_chat', chatId);
  if (activeChatId === chatId) activeChatId = null;
};

export const sendMessageSocket = (chatId: string, message: string, type: 'text' | 'image' | 'audio' = 'text') => {
  socket.emit('send_message', {
    chatId,
    userId: getUserId(),
    type,
    content: message,
  });
};

export const emitTyping = (chatId: string) => {
  socket.emit('typing', {
    chatId,
    userId: getUserId(),
  });
};

const createListener = (() => {
  const listeners: { [event: string]: boolean } = {};

  return (event: string, callback: (data: any) => void) => {
    if (!listeners[event]) {
      socket.on(event, (data) => {
        if (event === 'message_received' || event === 'chat_read') {
          if (data.chat_id !== activeChatId) {
            console.warn(`⚠️ Event skipped (Chat ID does not match): ${data.chat_id}`);
            return;
          }
        }
        callback(data);
      });
      listeners[event] = true;
    }
  };
})();

export const onMessageReceived = (callback: (message: any) => void) => {
  createListener('message_received', callback);
};

export const onPresenceUpdated = (callback: (presence: any) => void) => {
  createListener('presence_updated', callback);
};

export const onChatRead = (callback: (data: { chat_id: string; user_id: string; last_read_message_id: string }) => void) => {
  createListener('chat_read', callback);
};

let ws: WebSocket | null = null;

export const connectToChat = (chatId: string) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.warn('⚠️ WebSocket still connected.');
    return;
  }

  ws = new WebSocket(`ws://localhost:8000/ws/${chatId}`);
  setActiveChat(chatId);

  console.log('🔗 Connecting to WebSocket...');

  ws.onopen = () => {
    console.log('✅ WebSocket connected');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.event) {
      case 'message_received':
        handleMessageReceived(data.data);
        break;
      case 'presence_updated':
        handlePresenceUpdated(data.data);
        break;
      case 'chat_read':
        handleChatRead(data.data);
        break;
      default:
        console.warn('⚠️ WebSocket event unknown:', data.event);
    }
  };

  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('❌ WebSocket disconnected');
  };
};

export const sendWebSocketMessage = (chatId: string, message: string) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        event: 'send_message',
        data: {
          chatId,
          userId: getUserId(),
          type: 'text',
          content: message,
        },
      })
    );
  }
};

export const emitWebSocketTyping = (chatId: string) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        event: 'typing',
        data: {
          chatId,
          userId: getUserId(),
        },
      })
    );
  }
};

const handleMessageReceived = (message: any) => {
  console.log('📝 WebSocket New message:', message);
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('websocket_message_received', { detail: message });
    window.dispatchEvent(event);
  }
};

const handlePresenceUpdated = (presence: any) => {
  console.log(`👤 WebSocket ${presence.user_id} is now ${presence.status}`);
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('websocket_presence_updated', { detail: presence });
    window.dispatchEvent(event);
  }
};

const handleChatRead = (data: { chat_id: string; user_id: string; last_read_message_id: string }) => {
  console.log('✅ WebSocket Chat Read:', data);
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('websocket_chat_read', { detail: data });
    window.dispatchEvent(event);
  }
};

export const disconnectWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
    activeChatId = null;
  }
};

export default socket;
