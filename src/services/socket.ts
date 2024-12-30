import { io } from 'socket.io-client';
import { getUserId } from '@/utils/userSession';

const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
  query: {
    userId: getUserId(),
  },
});

socket.on('connect', () => console.log('WebSocket connected'));
socket.on('disconnect', () => console.log('WebSocket disconnected'));

export const joinChatSocket = (chatId: string) => {
  socket.emit('join_chat', chatId);
};

export const leaveChatSocket = (chatId: string) => {
  socket.emit('leave_chat', chatId);
};

export const sendMessageSocket = (chatId: string, message: string) => {
  socket.emit('send_message', {
    chatId,
    userId: getUserId(),
    type: 'text',
    content: message,
  });
};

export const emitTyping = (chatId: string) => {
    socket.emit('typing', {
      chatId,
      userId: getUserId(),
    });
};
  
socket.on('presence_updated', (data) => {
    console.log(`${data.user_id} is ${data.status}`);
});

export const onMessageReceived = (callback: (message: any) => void) => {
  socket.on('message_received', callback);
};

export const onPresenceUpdated = (callback: (presence: any) => void) => {
  socket.on('presence_updated', callback);
};

export default socket;
