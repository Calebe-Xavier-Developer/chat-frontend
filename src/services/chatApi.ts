import { Message } from '@/utils/types';
import api from './api';
import { getUserId } from '@/utils/userSession';
interface Chat {
  chat_id: string;
  participants: string[];
}

export const createChat = async (): Promise<Chat> => {
  const response = await api.post('/chats', {
    participants: [getUserId()],
  });
  return response.data;
};

export const joinChat = async (chatId: string): Promise<void> => {
  await api.post(`/chats/${chatId}/presence`, {
    user_id: getUserId(),
    status: 'online',
  });
};

export const getChats = async (): Promise<Chat[]> => {
  const response = await api.get('/chats');
  return response.data;
};

export const getMessages = async (chatId: string): Promise<Message[]> => {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response.data;
};

export const sendMessage = async (
  chatId: string,
  message: string,
  type: 'text' | 'image' | 'audio' = 'text'
): Promise<void> => {
  await api.post(`/chats/${chatId}/messages`, {
    user_id: getUserId(),
    type,
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

export const markChatAsRead = async (chatId: string): Promise<void> => {
  await api.post(`/chats/${chatId}/read`, {
    user_id: getUserId(),
  });
};

export const leaveChat = async (chatId: string): Promise<void> => {
  await api.post(`/chats/${chatId}/presence`, {
    user_id: getUserId(),
    status: 'offline',
  });
};

export const getPresence = async (chatId: string): Promise<any[]> => {
  const response = await api.get(`/chats/${chatId}/presence`);
  return response.data;
};

export const getChatDetails = async (chatId: string): Promise<Chat> => {
  const response = await api.get(`/chats/${chatId}`);
  return response.data;
};
