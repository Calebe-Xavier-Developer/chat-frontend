import api from './api';
import { getUserId } from '@/utils/userSession';

export const createChat = async (): Promise<string> => {
  const response = await api.post('/chats', {
    participants: [getUserId()],
  });
  return response.data.chat_id;
};

export const joinChat = async (chatId: string): Promise<void> => {
  await api.post(`/chats/${chatId}/presence`, {
    user_id: getUserId(),
    status: 'online',
  });
};

export const getChats = async (): Promise<any[]> => {
  const response = await api.get('/chats');
  return response.data;
};


export const getMessages = async (chatId: string): Promise<any[]> => {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response.data;
};


export const sendMessage = async (
  chatId: string,
  message: string
): Promise<void> => {
  await api.post(`/chats/${chatId}/messages`, {
    user_id: getUserId(),
    type: 'text',
    content: message,
  });
};

export const updatePresence = async (
    chatId: string,
    status: 'online' | 'offline' | 'typing'
  ): Promise<void> => {
    await api.post(`/chats/${chatId}/presence`, {
      user_id: getUserId(),
      status,
    });
  };