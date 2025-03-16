import React from 'react';
import { Logo } from '@/components/ui/Logo';

// Root layout component that wraps the entire application
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>ANALOGENIE - Cognitive Analysis Service</title>
        <meta name="description" content="A sophisticated cognitive analysis service that generates novel insights, metaphors, and research questions by connecting user concepts with various domains." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gray-950 text-white">
        <div className="flex flex-col min-h-screen">
          <header className="p-4 bg-indigo-950 border-b border-indigo-900">
            <div className="container mx-auto flex items-center justify-between">
              <Logo />
              <div className="text-sm text-indigo-300">
                Powered by Claude 3.7 Sonnet
              </div>
            </div>
          </header>
          
          <main className="flex-1 container mx-auto p-4">
            {children}
          </main>
          
          <footer className="p-4 bg-gray-950 border-t border-indigo-900">
            <div className="container mx-auto text-center text-sm text-gray-500">
              <p>
                ANALOGENIE - A sophisticated cognitive analysis service for generating novel insights, 
                metaphors, and research questions
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
