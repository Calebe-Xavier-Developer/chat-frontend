import { useEffect, useState } from 'react';
import { getChats, joinChat, createChat } from '@/services/chatApi';
import { connectToChat } from '@/services/socket';
import { useChat } from '@/context/ChatContext';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import { getRandomColor } from '@/utils/colors';
import { Chat } from '@/utils/types';

export default function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { setChosenChat, chosenChat, userStatus } = useChat();

  useEffect(() => {
    const fetchChats = async () => {
      const chatList: Chat[] = await getChats();
    
      const updatedChats: Chat[] = chatList.map((chat, index) => ({
        ...chat,
        chat_name: chat.chat_name || `Chat Bot ${index + 1}`,
        color: getRandomColor(),
      }));
    
      setChats(updatedChats);
      setFilteredChats(updatedChats);
    };

    fetchChats();    
  }, []);

  const handleCreateChat = async () => {
    const createdChat = await createChat(); 

    const newChat: Chat = {
      chat_id: createdChat.chat_id,
      chat_name: `Chat Bot ${chats.length + 1}`,
      color: getRandomColor(),
      participants: createdChat.participants,
    };

    setChats([...chats, newChat]);
    setFilteredChats([...filteredChats, newChat]);
    setChosenChat(newChat);
    await joinChat(newChat.chat_id);
    connectToChat(newChat.chat_id);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredChats(chats);
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter((chat) =>
        chat?.chat_name?.toLowerCase().includes(term)
      );
      setFilteredChats(filtered);
    }
  };

  const handleSelectChat = async (chat: Chat) => {
    setChosenChat(chat);
    await joinChat(chat.chat_id);
    connectToChat(chat.chat_id);
    clearSearch();
  };

  return (
    <div className='h-full w-full rounded-[24px] p-4 bg-dark-blue border border-white'>
      <div className='flex w-full justify-between items-center mb-4'>
        <div className="relative w-3/5">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-dark-blue border border-white text-white placeholder:text-gray-400 focus:outline-none"
          />
        </div>
        <div className='w-2/5 flex justify-end'>
          <button
            onClick={() => handleCreateChat()}
            className='flex items-center justify-center w-[50px] h-[50px] rounded-full bg-blue-500 text-white text-sm hover:text-primary-blue'
          >
            <AddCircleOutlineIcon />
          </button>
        </div>
      </div>

      <ul className="max-h-[calc(100%-100px)] pr-3 overflow-y-auto custom-scroll">
        {filteredChats.map((chat, index) => (
          <li key={`${chat.chat_id},${index}`}>
            <button
              onClick={() => handleSelectChat(chat)}
              className={`w-full h-[72px] border-t border-bl text-white flex items-center group outline-none ${
                chosenChat.chat_id === chat.chat_id
                  ? 'bg-opacity-10 bg-white text-primary-blue'
                  : 'hover:text-primary-blue'
              }`}
            >
              <div className="h-[10%] text-xl font-bold p-2 flex items-center">
                <span
                  className="flex items-center justify-center w-[52px] h-[52px] rounded-full bg-opacity-10 bg-white"
                  style={{ color: chat.color, border: `1px solid ${chat.color}` }}
                >
                  <SmartToyIcon />
                </span>
              </div>
              <div>
                {chat.chat_name}
                {chosenChat?.chat_id === chat.chat_id && userStatus?.isTyping && (
                  <p className="text-sm text-gray-400 animate-pulse">Typing...</p>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
