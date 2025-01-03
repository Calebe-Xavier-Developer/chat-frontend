'use client';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';

export default function Home() {
  return (
    <main className="p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow-md">
          <ChatList />
        </div>
        <div className="col-span-2 bg-white p-4 shadow-md">
          <ChatWindow />
        </div>
      </div>
    </main>
  );
}
