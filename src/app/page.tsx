'use client';
import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import MessageInput from '@/components/MessageInput';

export default function Home() {
  const { chosenChatId, setChosenChatId } = useChat();

  return (
    <main className="p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow-md">
          <ChatList setChosenChatId={setChosenChatId} />
        </div>
        <div className="col-span-2 bg-white p-4 shadow-md">
          {chosenChatId && (
            <>
              <ChatWindow chatId={chosenChatId} />
              <MessageInput chatId={chosenChatId} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
