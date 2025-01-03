'use client';
import { useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { getUserId } from '@/utils/userSession';
import MessageInput from './MessageInput';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { MessageStatus } from '@/utils/types';
// import { onChatRead } from '@/services/socket'; It doesn't works

export default function ChatWindow() {
  const { messages, chosenChatId } = useChat();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      requestAnimationFrame(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, []);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.user_id === getUserId() && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMarkAsRead = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.user_id !== getUserId()) {

      window.dispatchEvent(
        new CustomEvent('websocket_chat_read', {
          detail: {
            chat_id: chosenChatId,
            user_id: getUserId(),
            last_read_message_id: lastMessage.id,
          },
        })
      );

      messages.forEach((msg) => {
        msg.status = 'read';
      });
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
  
    if (Math.floor(chatContainerRef.current.scrollTop) === 0) handleMarkAsRead();
  };

  const renderStatusIcon = (status?: MessageStatus) => {
    switch (status) {
      case 'sent':
        return <CheckIcon className="text-gray-500" />;
      case 'received':
        return <DoneAllRoundedIcon className="text-gray-500" />;
      case 'read':
        return <DoneAllRoundedIcon className="text-green-500" />;
      default:
        return null;
    }
  };

  const renderMessage = (msg: any) => {
    const isCurrentUser = msg.user_id === getUserId();

    return (
      <div
        className={`p-2 my-1 rounded-md shadow ${
          isCurrentUser ? 'bg-blue-200 ml-auto' : 'bg-gray-200 mr-auto'
        } max-w-xs`}
      >
        <strong>{isCurrentUser ? 'You' : msg.user_id}:</strong>
        <div>
          {(() => {
            switch (msg.type) {
              case 'text':
                return <span>{msg.content}</span>;
              case 'image':
                return <img src={msg.content} alt="Image" className="rounded-md shadow-sm" />;
              case 'audio':
                return <audio controls src={msg.content}></audio>;
              default:
                return null;
            }
          })()}
        </div>
        <div className="flex items-center justify-between text-xs text-right">
          <p>
            {new Date(msg.timestamp || '').toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {renderStatusIcon(msg.status)}
        </div>
      </div>
    );
  };

  return (
    <>
      <h1 className="text-xl font-bold mb-4">Messages</h1>
      <div
        ref={chatContainerRef}
        className="p-4 h-[80vh] overflow-y-auto bg-white border rounded-md flex flex-col-reverse"
        onScroll={handleScroll}
      >
        <ul className="space-y-2">
          {messages.map((msg) => (
            <li key={msg.id} className="flex">
              {renderMessage(msg)}
            </li>
          ))}
        </ul>
      </div>
      <MessageInput />
    </>
  );
}
