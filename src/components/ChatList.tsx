import { useEffect, useState } from 'react';
import { getChats, joinChat, createChat } from '@/services/chatApi';
import { connectToChat } from '@/services/socket';
import { useChat } from '@/context/ChatContext';

export default function ChatList() {
  const [chats, setChats] = useState<any[]>([]);
  const { setChosenChatId } = useChat();

  useEffect(() => {
    const fetchChats = async () => {
      const chatList = await getChats();
      setChats(chatList);
      if (chatList.length > 0) {
        setChosenChatId(chatList[0].chat_id);
        await joinChat(chatList[0].chat_id);
        await connectToChat(chatList[0].chat_id);
      }
    };

    fetchChats();
  }, []);

  const handleCreateChat = async () => {
    const createdChat = await createChat();
    setChats([...chats, createdChat]);
  }

  return (
    <div>
      <div className='flex justify-between items-center'>
        <h1>Chats</h1>
        <button onClick={() => handleCreateChat()} className='w-[50px] h-[50px] rounded-full bg-blue-500 text-white text-sm'>New chat</button>
      </div>
      <ul>
        {chats.map((chat, index) => (
          <li key={`${chat.chat_id, index}`}>
            <button onClick={() => setChosenChatId(chat.chat_id)}>
              Chat {index+1}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
