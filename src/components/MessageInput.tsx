'use client';
import { useState } from 'react';
import { sendMessage } from '@/services/chatApi';
import { sendMessageSocket, emitTyping } from '@/services/socket';
import { getUserId } from '@/utils/userSession';
import { Message } from '@/utils/types';
import { useChat } from '@/context/ChatContext';

export default function MessageInput() {
  const [message, setMessage] = useState('');
  const { chosenChatId, sendMessage: addLocalMessage} = useChat();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      user_id: getUserId(),
      content: message,
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    addLocalMessage(tempMessage);
    setMessage('');

    try {
      await sendMessage(chosenChatId, message);
      sendMessageSocket(chosenChatId, message);
    } catch (error) {
      console.error('❌ Error to send the message:', error);
    }
  };

  const handleTyping = (e: React.KeyboardEvent<HTMLInputElement>) => {
    emitTyping(chosenChatId);
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <div className="flex gap-2 mt-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleTyping}
        placeholder="Type a message"
        className="border p-2 w-full rounded-md"
      />
      <button
        onClick={handleSendMessage}
        className="bg-blue-500 text-white p-2 rounded-md"
      >
        Send
      </button>
    </div>
  );
}
