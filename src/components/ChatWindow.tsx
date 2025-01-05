'use client';
import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { getUserId } from '@/utils/userSession';
import MessageInput from './MessageInput';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { MessageStatus } from '@/utils/types';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export default function ChatWindow() {
  const { messages, chosenChat, userStatus } = useChat();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const previousMessagesRef = useRef(messages);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [lastUnreadMessageIsNotCurrentUser, setLastUnreadMessageIsNotCurrentUser] = useState(false);

  const handleMarkAsRead = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.user_id !== getUserId()) {
      window.dispatchEvent(
        new CustomEvent('websocket_chat_read', {
          detail: {
            chat_id: chosenChat.chat_id,
            user_id: getUserId(),
            last_read_message_id: lastMessage.id,
            status: 'read',
          },
        })
      );
    }
  };

  useEffect(() => {
    if (!chatContainerRef.current || messages.length === 0) return;

    const previousMessages = previousMessagesRef.current;

    if (previousMessages.length === messages.length && previousMessages[previousMessages.length - 1]?.id === messages[messages.length - 1]?.id) return;

    previousMessagesRef.current = messages;

    const { scrollHeight, clientHeight } = chatContainerRef.current;
    const hasScroll = scrollHeight > clientHeight;

    const lastMessage = messages[messages.length - 1];
    const lastUserMessageIndex = messages.findLastIndex(
      (msg) => msg.user_id === getUserId()
    );

    const lastMessageIsCurrentUser = lastMessage?.user_id === getUserId();
    const lastUserMessage = chatContainerRef.current.querySelectorAll('li')[lastUserMessageIndex];

    const lastReadMessageIsNotCurrentUser = messages[messages.findLastIndex((msg) => msg.status === 'read')]?.user_id !== getUserId();

    setLastUnreadMessageIsNotCurrentUser(!lastMessageIsCurrentUser);

    const existSomeUnreadMessages = messages.some((msg) => msg.status !== 'read');

    if (existSomeUnreadMessages && hasScroll && !lastReadMessageIsNotCurrentUser) {
      if (lastUserMessageIndex !== -1 && lastUserMessage) {
        const lastUserMessagePosition = (lastUserMessage as HTMLElement).offsetTop;
        chatContainerRef.current.scrollTop = lastUserMessagePosition - clientHeight + 75;
        setHasUnreadMessages(existSomeUnreadMessages);
        setIsAtBottom(false);
      }
    } else if (existSomeUnreadMessages && !hasScroll && !lastMessageIsCurrentUser) {
      setHasUnreadMessages(existSomeUnreadMessages);
      handleMarkAsRead();
    } else if ((!existSomeUnreadMessages || lastReadMessageIsNotCurrentUser) && hasScroll) {
      if (lastReadMessageIsNotCurrentUser) handleMarkAsRead();
      setIsAtBottom(true);
      requestAnimationFrame(() => {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [messages]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    if (Math.floor(chatContainerRef.current.scrollTop) >= 0) {
      setIsAtBottom(true);
      handleMarkAsRead();
    }
  };

  const renderStatusIcon = (status?: MessageStatus) => {
    switch (status) {
      case 'sent':
        return <CheckIcon className="text-gray-500 !w-[16px] !h-[16px]" />;
      case 'received':
        return <DoneAllRoundedIcon className="text-gray-500 !w-[16px] !h-[16px]" />;
      case 'read':
        return <DoneAllRoundedIcon className="text-green-500 !w-[16px] !h-[16px]" />;
      default:
        return null;
    }
  };

    const renderMessage = (msg: any) => {
      const isCurrentUser = msg.user_id === getUserId();
  
      return (
        <div className={`relative min-w-24 ${isCurrentUser ? 'ml-auto' : 'mr-auto'} max-w-xs`}>
          <div
            className={`absolute w-0 h-0 border-t-[24px] top-1 ${
              isCurrentUser
                ? 'border-green-200 right-[-8px] border-r-[16px] border-r-transparent'
                : 'border-white left-[-8px] border-l-[16px] border-l-transparent'
            }`}
          ></div>
          <div
            className={`py-2 px-3 my-1 min-w-24 rounded-md shadow ${
              isCurrentUser ? 'bg-green-200' : 'bg-white'
            } max-w-xs`}
          >
            <strong>{isCurrentUser ? 'You' : msg.user_id}:</strong>
            <div>
              {(() => {
                switch (msg.type) {
                  case 'text':
                    return <span>{msg.content}</span>;
                  case 'image':
                    return <img src={msg.content} alt="Image" className="rounded-md shadow-sm my-1" />;
                  case 'audio':
                    return <audio src={msg.content} className='mb-1 custom-audio' controls controlsList="nodownload noremoteplayback nofullscreen"></audio>;
                  default:
                    return null;
                }
              })()}
            </div>
            <div className="flex items-center justify-end text-xs text-right">
              <p className="mr-1 text-[10px]">
                {new Date(msg.timestamp || '').toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {renderStatusIcon(msg.status)}
            </div>
          </div>
        </div>
      );
    };

    const renderUserPresence = () => {
      if (userStatus === null || userStatus.isOffline) return 'User Bot is Offline';

      if (userStatus.isTyping) return 'User Bot is Typing...';

      if (userStatus.isOnline) return 'User Bot is Online';
  
      return;
    };

  return (
    <div className='relative h-full w-full rounded-[24px] bg-dark-blue'>
      {messages.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <div className="flex flex-col items-center justify-center">
            <span className="text-5xl animate-bounce">💬</span>
            <div className="w-24 h-24 rounded-full border-4 border-t-4 border-t-blue-400 border-gray-300 animate-spin"></div>
            <p className="mt-4 text-lg font-semibold animate-pulse">
              No messages yet, create a new chat or select an existing one
            </p>
          </div>
        </div>
      )}
      {messages.length > 0 && (
        <>
          <div className="h-[10%] text-xl font-bold p-2 flex items-start">
            <span className='flex self-center items-center justify-center w-[52px] h-[52px] rounded-full bg-opacity-10 bg-white' style={{ color: chosenChat.color, border: `1px solid ${chosenChat.color}` }}>
              <SmartToyIcon />
            </span>
            <div className='ml-2 flex flex-col items-start justify-between'>
              <h2 className='text-lg text-white mt-1 font-normal'>{chosenChat.chat_name}</h2>
              <p className="text-sm text-gray-400 animate-pulse">{renderUserPresence()}</p>
            </div>
          </div>
          <div className='h-[80%]'>
            <div className='h-full bg-light-blue p-2'>
              <div
                ref={chatContainerRef}
                className="h-full p-4 overflow-y-auto bg-light-blue flex flex-col-reverse custom-scroll"
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
            </div>
          </div>
          <MessageInput />
          {!isAtBottom && hasUnreadMessages && lastUnreadMessageIsNotCurrentUser && (
            <div
              onClick={() =>
                chatContainerRef.current?.scrollTo({
                  top: chatContainerRef.current.scrollHeight,
                  behavior: 'smooth',
                })
              }
              className="absolute bottom-28 right-[40%] bg-primary-blue text-white px-4 py-2 rounded-md shadow-lg cursor-pointer animate-bounce"
            >
              New Messages
            </div>
          )}
        </>
      )} 
    </div>
  );
}
