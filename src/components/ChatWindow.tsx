'use client';
import { useEffect, useState } from 'react';
import { getMessages, joinChat } from '@/services/chatApi';
import socket, { joinChatSocket, onMessageReceived } from '@/services/socket';

export default function ChatWindow({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const initializeChat = async () => {
      await joinChat(chatId);
      joinChatSocket(chatId);

      const fetchedMessages = await getMessages(chatId);
      setMessages(fetchedMessages);
    };

    initializeChat();

    onMessageReceived((message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('message_received');
    };
  }, [chatId]);

  return (
    <div>
      <h1>Messages</h1>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            <strong>{msg.user_id}: </strong>
            {msg.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
