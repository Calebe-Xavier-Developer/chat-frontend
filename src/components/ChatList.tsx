import { useEffect, useState } from 'react';
import { getChats, joinChat } from '@/services/chatApi';

export default function ChatList({ setChosenChatId }: { setChosenChatId: any }) {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      const chatList = await getChats();
      setChats(chatList);
      if (chatList.length > 0) {
        setChosenChatId(chatList[0].chat_id);
        await joinChat(chatList[0].chat_id);
      }
    };

    fetchChats();
  }, []);

  return (
    <div>
      <h1>Chats</h1>
      <ul>
        {chats.map((chat, index) => (
          <li key={chat.chat_id}>
            <button onClick={() => setChosenChatId(chat.chat_id)}>
              Chat {index+1}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
