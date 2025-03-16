import React from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ThemeProvider } from 'next-themes';

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="flex flex-col min-h-screen bg-gray-950 text-white">
        <main className="flex-1 container mx-auto p-4">
          <div className="bg-gray-900 border border-indigo-900 rounded-lg shadow-xl h-[calc(100vh-8rem)] overflow-hidden">
            <ChatWindow />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
