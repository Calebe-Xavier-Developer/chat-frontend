'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Chat, Message } from '@/utils/types';
import {
  joinChatSocket,
  connectToChat,
  disconnectWebSocket,
} from '@/services/socket';
import { getMessages, joinChat } from '@/services/chatApi';
import { getUserId } from '@/utils/userSession';
interface ChatContextProps {
  chosenChat: Chat;
  setChosenChat: (chat: Chat) => void;
  messages: Message[];
  userStatus: { isTyping: boolean; isOffline: boolean; isOnline: boolean; } | null;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chosenChat, setChosenChat] = useState<Chat>({ chat_id: '', chat_name: '', participants: [] });
  const [messages, setMessages] = useState<Message[]>([]);
  const [userStatus, setUserStatus] = useState<{ isTyping: boolean; isOffline: boolean; isOnline: boolean; } | null>(null);


  useEffect(() => {
    if (!chosenChat.chat_id || chosenChat.chat_id === '') return;

    const initializeChat = async () => {
      await joinChat(chosenChat.chat_id);
      joinChatSocket(chosenChat.chat_id);
      connectToChat(chosenChat.chat_id);

      const fetchedMessages = await getMessages(chosenChat.chat_id);
      setMessages(
        fetchedMessages.map((msg) => ({ ...msg, status: 'read' }))
      );

      // await markChatAsRead(chosenChatId); API is broken
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

      setMessages((prev) => {
        const lastReadIndex = prev.findIndex((msg) => msg.id === last_read_message_id);
        if (lastReadIndex === -1) return prev;

        return prev.map((msg, index) =>
          index <= lastReadIndex ? { ...msg, status: 'read' } : msg
        );
      });
    };

    const handleWebSocketPresenceUpdated = (event: CustomEvent) => {
      const { user_id, status } = event.detail;

      if (user_id === 'bot_user') {
        setUserStatus({ 
          isTyping: status === 'typing', 
          isOnline: status === 'online', 
          isOffline: status === 'offline' 
        });
      }
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
  }, [chosenChat]);

  return (
    <ChatContext.Provider value={{ chosenChat, setChosenChat, messages, userStatus  }}>
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
