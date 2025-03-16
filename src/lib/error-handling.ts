"use client";

import { useState, useEffect } from 'react';

// Error types for the application
export enum ErrorType {
  INPUT_VALIDATION = 'input_validation',
  API_CONNECTION = 'api_connection',
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  SERVER_ERROR = 'server_error',
  UNKNOWN = 'unknown'
}

// Error interface
export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: Date;
}

// Custom hook for error handling
export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null);
  const [hasDisplayed, setHasDisplayed] = useState(false);

  // Clear error after it has been displayed
  useEffect(() => {
    if (error && !hasDisplayed) {
      setHasDisplayed(true);
    }
  }, [error, hasDisplayed]);

  // Handle different types of errors
  const handleError = (err: any): AppError => {
    // Default to unknown error
    let errorType = ErrorType.UNKNOWN;
    let errorMessage = 'An unexpected error occurred';
    let errorDetails = err.message || '';

    // Check if it's a response error
    if (err.response) {
      const status = err.response.status;
      
      // Handle different status codes
      if (status === 400) {
        errorType = ErrorType.INPUT_VALIDATION;
        errorMessage = 'Invalid input';
        errorDetails = err.response.data?.message || 'Please check your input and try again';
      } else if (status === 401 || status === 403) {
        errorType = ErrorType.AUTHENTICATION;
        errorMessage = 'Authentication error';
        errorDetails = 'Please check your API keys';
      } else if (status === 429) {
        errorType = ErrorType.RATE_LIMIT;
        errorMessage = 'Rate limit exceeded';
        errorDetails = 'Please try again later';
      } else if (status >= 500) {
        errorType = ErrorType.SERVER_ERROR;
        errorMessage = 'Server error';
        errorDetails = 'The server encountered an error. Please try again later';
      }
    } else if (err.request) {
      // Network error
      errorType = ErrorType.API_CONNECTION;
      errorMessage = 'Connection error';
      errorDetails = 'Could not connect to the server. Please check your internet connection';
    } else if (err.message && err.message.includes('word')) {
      // Input validation error (word count)
      errorType = ErrorType.INPUT_VALIDATION;
      errorMessage = 'Input validation error';
      errorDetails = err.message;
    }

    const appError: AppError = {
      type: errorType,
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date()
    };

    setError(appError);
    return appError;
  };

  // Clear the current error
  const clearError = () => {
    setError(null);
    setHasDisplayed(false);
  };

  return {
    error,
    handleError,
    clearError
  };
}

// Input validation functions
export const validateConcept = (concept: string): { valid: boolean; message?: string } => {
  if (!concept.trim()) {
    return { valid: false, message: 'Concept cannot be empty' };
  }

  const wordCount = concept.trim().split(/\s+/).length;
  if (wordCount > 12) {
    return { 
      valid: false, 
      message: `Concept must be 12 words or less (current: ${wordCount} words)` 
    };
  }

  return { valid: true };
};

// Retry mechanism for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const { 
    maxRetries = 3, 
    retryDelay = 1000, 
    onRetry = () => {} 
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (
        error.response?.status === 400 || // Bad request
        error.response?.status === 401 || // Unauthorized
        error.response?.status === 403    // Forbidden
      ) {
        throw error;
      }

      // Last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Call onRetry callback
      onRetry(attempt + 1, error);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  throw lastError;
}
