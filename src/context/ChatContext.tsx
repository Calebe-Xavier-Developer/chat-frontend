'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message } from '@/utils/types';
import {
  joinChatSocket,
  connectToChat,
  disconnectWebSocket,
} from '@/services/socket';
import { getMessages, joinChat, markChatAsRead } from '@/services/chatApi';
import { getUserId } from '@/utils/userSession';

interface ChatContextProps {
  chosenChatId: string;
  setChosenChatId: (id: string) => void;
  messages: Message[];
  sendMessage: (message: Message) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chosenChatId, setChosenChatId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!chosenChatId) return;

    const initializeChat = async () => {
      await joinChat(chosenChatId);
      joinChatSocket(chosenChatId);
      connectToChat(chosenChatId);

      const fetchedMessages = await getMessages(chosenChatId);
      setMessages(
        fetchedMessages.map((msg) => ({ ...msg, status: 'read' }))
      );

      await markChatAsRead(chosenChatId);
    };

    initializeChat();

    const handleWebSocketMessageReceived = (event: CustomEvent) => {
      const message: Message = event.detail;

      setMessages((prev: any) => {
        if (!prev.some((msg: any) => msg.id === message.id)) {
          return [
            ...prev,
            { ...message, status: message.user_id === getUserId() ? 'sent' : 'received' },
          ].sort((a, b) => new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime());
        }
        return prev;
      });
    };

    const handleWebSocketChatRead = (event: CustomEvent) => {
      const { last_read_message_id }: { last_read_message_id: string } = event.detail;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === last_read_message_id ? { ...msg, status: 'read' } : msg
        )
      );
    };

    const handleWebSocketPresenceUpdated = (event: CustomEvent) => {
      console.log('👤 Presence Event:', event.detail);
    };

    window.addEventListener('websocket_message_received', handleWebSocketMessageReceived as EventListener);
    window.addEventListener('websocket_chat_read', handleWebSocketChatRead as EventListener);
    window.addEventListener('websocket_presence_updated', handleWebSocketPresenceUpdated as EventListener);

    return () => {
      setMessages([]);
      disconnectWebSocket();
      window.removeEventListener('websocket_message_received', handleWebSocketMessageReceived as EventListener);
      window.removeEventListener('websocket_chat_read', handleWebSocketChatRead as EventListener);
      window.removeEventListener('websocket_presence_updated', handleWebSocketPresenceUpdated as EventListener);
    };
  }, [chosenChatId]);

  const sendMessage = (message: Message) => {
    setMessages((prev) => [...prev, { ...message, status: 'sent' }]);
  };

  return (
    <ChatContext.Provider value={{ chosenChatId, setChosenChatId, messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
