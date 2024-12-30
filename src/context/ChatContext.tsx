'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextProps {
  chosenChatId: string;
  setChosenChatId: (id: string) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chosenChatId, setChosenChatId] = useState<string>('');

  return (
    <ChatContext.Provider value={{ chosenChatId, setChosenChatId }}>
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
