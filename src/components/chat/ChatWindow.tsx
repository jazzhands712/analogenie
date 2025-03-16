"use client";

import React, { useRef, useEffect } from 'react';
import { useChat, Message as MessageType } from '@/hooks/use-chat';
import { LoadingIndicator } from '@/components/ui/ui-components';
import { ErrorMessage } from '@/components/ui/toast';
import { Button } from '@/components/ui/ui-components';

// Chat Window Component
export const ChatWindow: React.FC = () => {
  const {
    messages,
    isLoading,
    error,
    submitConcept,
    selectDomain,
    selectFinding,
    submitResearchQuestions,
    resetChat,
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-indigo-800 bg-indigo-950">
        <h1 className="text-xl font-bold text-white">ANALOGENIE</h1>
        <button
          onClick={resetChat}
          className="px-3 py-1 text-sm text-white bg-indigo-700 rounded hover:bg-indigo-600"
        >
          New Conversation
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <h2 className="text-2xl font-bold mb-2">Welcome to ANALOGENIE</h2>
            <p className="max-w-md">
              Enter a concept (12 words or less) to begin exploring novel insights, 
              metaphors, and research questions through the lens of various domains.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem 
              key={message.id} 
              message={message} 
              onSelectDomain={selectDomain}
              onSelectFinding={selectFinding}
              onSubmitResearch={submitResearchQuestions}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-indigo-400">
            <LoadingIndicator />
          </div>
        )}
        
        {error && (
          <div className="p-3 text-red-400 bg-red-900 bg-opacity-20 rounded-md">
            {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <UserInput onSubmit={submitConcept} isLoading={isLoading} />
    </div>
  );
};

// Message Item Component
interface MessageItemProps {
  message: MessageType;
  onSelectDomain: (domain: string) => void;
  onSelectFinding: (finding: string) => void;
  onSubmitResearch: (questions: string[], provider: 'perplexity' | 'elicit') => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  onSelectDomain, 
  onSelectFinding,
  onSubmitResearch
}) => {
  if (message.type === 'loading') {
    return (
      <div className="flex items-center space-x-2 text-indigo-400">
        <LoadingIndicator text={message.content} />
      </div>
    );
  }
  
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl p-4 rounded-lg ${
          isUser 
            ? 'bg-indigo-700 text-white' 
            : 'bg-gray-800 text-gray-100'
        }`}
      >
        {/* Message content */}
        <div className="prose prose-invert max-w-none">
          {message.content}
        </div>
        
        {/* Options for domain selection (Stage 1) */}
        {!isUser && message.options && message.options.length > 0 && message.options[0].name && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-indigo-300">Select a domain to explore:</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {message.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectDomain(option.name!)}
                  className="p-2 text-left text-sm bg-indigo-900 hover:bg-indigo-800 rounded transition"
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Options for framework selection (Stage 2) */}
        {!isUser && message.options && message.options.length > 0 && message.options[0].title && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-indigo-300">Select a framework to explore:</h4>
            <div className="space-y-2">
              {message.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectFinding(`**${option.title}**: ${option.description}`)}
                  className="w-full p-3 text-left bg-indigo-900 hover:bg-indigo-800 rounded transition"
                >
                  <div className="font-medium">{option.title}</div>
                  <div className="text-sm text-indigo-200">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Research questions (Stage 3) */}
        {!isUser && message.options && message.options.length > 0 && message.options[0].text && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-indigo-300">Research Questions:</h4>
            <div className="space-y-2">
              {message.options.map((option) => (
                <div key={option.id} className="p-3 bg-gray-800 rounded">
                  {option.text}
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => onSubmitResearch(
                  message.options!.map(o => o.text!),
                  'perplexity'
                )}
                variant="primary"
                size="sm"
              >
                Search with Perplexity
              </Button>
              <Button
                onClick={() => onSubmitResearch(
                  message.options!.map(o => o.text!),
                  'elicit'
                )}
                variant="secondary"
                size="sm"
              >
                Search with Elicit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// User Input Component
interface UserInputProps {
  onSubmit: (concept: string) => void;
  isLoading: boolean;
}

const UserInput: React.FC<UserInputProps> = ({ onSubmit, isLoading }) => {
  const [input, setInput] = React.useState('');
  const [wordCount, setWordCount] = React.useState(0);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setWordCount(value.trim() ? value.trim().split(/\s+/).length : 0);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && wordCount <= 12) {
      onSubmit(input.trim());
      setInput('');
      setWordCount(0);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-indigo-800 bg-gray-900">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Enter a concept (12 words or less)..."
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white resize-none"
            rows={2}
            disabled={isLoading}
          />
          <div className={`text-xs mt-1 ${wordCount > 12 ? 'text-red-400' : 'text-gray-400'}`}>
            {wordCount}/12 words
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading || !input.trim() || wordCount > 12}
          variant="primary"
        >
          Send
        </Button>
      </div>
    </form>
  );
};
