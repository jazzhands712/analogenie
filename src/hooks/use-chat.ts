"use client";

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { processPrompt, sendToResearchApi } from '@/lib/api-service';

// Define a type for API responses
type ApiResponse = {
  content: string;
  type?: string;
  options?: any[];
  rawResponse?: string;
};

// Message types
export type MessageType = 'user' | 'assistant' | 'loading';

// Message interface
export interface Message {
  id: string;
  type: MessageType;
  content: string;
  options?: Array<{
    id: string;
    name?: string;
    title?: string;
    description?: string;
    text?: string;
  }>;
}

// Custom hook for managing chat state
export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [currentConcept, setCurrentConcept] = useState<string>('');
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [currentFinding, setCurrentFinding] = useState<string>('');

  // Initialize session ID
  useState(() => {
    setSessionId(uuidv4());
  });

  // Add a message to the chat
  const addMessage = (message: Omit<Message, 'id'>) => {
    const newMessage = {
      ...message,
      id: uuidv4(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage.id;
  };

  // Update a message by ID
  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, ...updates } : message
      )
    );
  };

  // Remove a message by ID
  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
  };

  // Submit a concept (Stage 1)
  const submitConcept = async (concept: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentConcept(concept);
      setCurrentStage(1);

      // Add user message
      addMessage({
        type: 'user',
        content: concept,
      });

      // Add loading message
      const loadingId = addMessage({
        type: 'loading',
        content: 'Analyzing concept and identifying domains...',
      });

      // Call API with explicit type assertion
      const response = await processPrompt(1, {
        concept,
        sessionId,
      }) as ApiResponse;

      // Remove loading message
      removeMessage(loadingId);

      // Add assistant message with domain options
      const assistantMessage: Omit<Message, 'id'> = {
        type: 'assistant',
        content: response.content,
      };
      
      // Explicitly check and add options if they exist
      if ('options' in response && Array.isArray(response.options)) {
        assistantMessage.options = response.options;
      } else {
        assistantMessage.options = [];
      }
      
      addMessage(assistantMessage);

      return response;
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your concept');
      console.error('Error submitting concept:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Select a domain (Stage 2)
  const selectDomain = async (domain: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentDomain(domain);
      setCurrentStage(2);

      // Add user message
      addMessage({
        type: 'user',
        content: `I'd like to explore the ${domain} domain.`,
      });

      // Add loading message
      const loadingId = addMessage({
        type: 'loading',
        content: 'Generating metaphorical frameworks...',
      });

      // Call API with explicit type assertion
      const response = await processPrompt(2, {
        concept: currentConcept,
        domain,
        sessionId,
      }) as ApiResponse;

      // Remove loading message
      removeMessage(loadingId);

      // Add assistant message with framework options
      const assistantMessage: Omit<Message, 'id'> = {
        type: 'assistant',
        content: response.content,
      };
      
      // Explicitly check and add options if they exist
      if ('options' in response && Array.isArray(response.options)) {
        assistantMessage.options = response.options;
      } else {
        assistantMessage.options = [];
      }
      
      addMessage(assistantMessage);

      return response;
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your domain selection');
      console.error('Error selecting domain:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Select a finding (Stage 3)
  const selectFinding = async (finding: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentFinding(finding);
      setCurrentStage(3);

      // Add user message
      addMessage({
        type: 'user',
        content: `I'd like to explore this framework: ${finding.substring(0, 50)}...`,
      });

      // Add loading message
      const loadingId = addMessage({
        type: 'loading',
        content: 'Generating hypotheses and research questions...',
      });

      // Call API with explicit type assertion
      const response = await processPrompt(3, {
        concept: currentConcept,
        domain: currentDomain,
        finding,
        sessionId,
      }) as ApiResponse;

      // Remove loading message
      removeMessage(loadingId);

      // Add assistant message with research questions
      const assistantMessage: Omit<Message, 'id'> = {
        type: 'assistant',
        content: response.content,
      };
      
      // Explicitly check and add options if they exist
      if ('options' in response && Array.isArray(response.options)) {
        assistantMessage.options = response.options;
      } else {
        assistantMessage.options = [];
      }
      
      addMessage(assistantMessage);

      return response;
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing your framework selection');
      console.error('Error selecting finding:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Submit research questions to external API
  const submitResearchQuestions = async (
    questions: string[],
    provider: 'perplexity' | 'elicit'
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message
      addMessage({
        type: 'user',
        content: `I'd like to research these questions using ${provider}.`,
      });

      // Add loading message
      const loadingId = addMessage({
        type: 'loading',
        content: `Sending research questions to ${provider}...`,
      });

      // Call API
      const response = await sendToResearchApi(questions, provider, sessionId);

      // Remove loading message
      removeMessage(loadingId);

      // Add assistant message with research results
      addMessage({
        type: 'assistant',
        content: `Here are the research results from ${provider}:\n\n${JSON.stringify(response, null, 2)}`,
      });

      return response;
    } catch (err: any) {
      setError(err.message || `An error occurred while sending questions to ${provider}`);
      console.error('Error submitting research questions:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the chat
  const resetChat = () => {
    setMessages([]);
    setError(null);
    setCurrentStage(0);
    setCurrentConcept('');
    setCurrentDomain('');
    setCurrentFinding('');
    setSessionId(uuidv4());
  };

  return {
    messages,
    isLoading,
    error,
    currentStage,
    submitConcept,
    selectDomain,
    selectFinding,
    submitResearchQuestions,
    resetChat,
  };
}
