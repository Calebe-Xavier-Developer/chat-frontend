'use client';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';

export default function Home() {
  return (
    <main className="w-full h-full flex py-4 bg-dark-highBlue">
      <div className="w-full h-full flex justify-around items-center">
        <div className="w-[30%] h-[90%] flex flex-col shadow-md">
          <ChatList />
        </div>
        <div className="w-[65%] h-[90%]  flex flex-col shadow-md">
          <ChatWindow />
        </div>
      </div>
    </main>
  );
}
