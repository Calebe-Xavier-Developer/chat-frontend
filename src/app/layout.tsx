import '../styles/globals.css';
import { ChatProvider } from '@/context/ChatContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
