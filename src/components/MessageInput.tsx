'use client';
import { useState } from 'react';
import { sendMessage } from '@/services/chatApi';
import { sendMessageSocket, emitTyping } from '@/services/socket';
import { getUserId } from '@/utils/userSession';

export default function MessageInput({ chatId }: { chatId: string }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      user_id: getUserId(),
      type: 'text',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    await sendMessage(chatId, message);
    sendMessageSocket(chatId, message);
  };

  const handleTyping = () => {
    emitTyping(chatId);
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        placeholder="Type a message"
        className="border p-2 w-full"
      />
      <button onClick={handleSendMessage} className="bg-blue-500 text-white p-2 mt-2">
        Send
      </button>
    </div>
  );
}
