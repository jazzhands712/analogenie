"use client";

import React, { createContext, useContext, useState } from 'react';

// Toast context interface
interface ToastContextType {
  addToast: (type: 'error' | 'success' | 'info', message: string, details?: string) => string;
  removeToast: (id: string) => void;
}

// Create context with default values
const ToastContext = createContext<ToastContextType>({
  addToast: () => '',
  removeToast: () => {},
});

// Toast component
export const Toast: React.FC<{
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
  details?: string;
  onClose: () => void;
}> = ({ type, message, details, onClose }) => {
  // Background color based on type
  const bgColor = {
    error: 'bg-red-900 border-red-700',
    success: 'bg-green-900 border-green-700',
    info: 'bg-indigo-900 border-indigo-700'
  }[type];
  
  // Icon based on type
  const Icon = () => {
    switch (type) {
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  return (
    <div className={`fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg border ${bgColor} text-white z-50 animate-in slide-in-from-right`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon />
        </div>
        <div className="ml-3 flex-1">
          <p className="font-medium">{message}</p>
          {details && <p className="mt-1 text-sm opacity-80">{details}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 text-white hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: 'error' | 'success' | 'info';
    message: string;
    details?: string;
  }>>([]);
  
  // Add a new toast
  const addToast = (type: 'error' | 'success' | 'info', message: string, details?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, details }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
    
    return id;
  };
  
  // Remove a toast by ID
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            details={toast.details}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook for using toast functions
export const useToast = () => useContext(ToastContext);

// Loading overlay component
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  message?: string;
}> = ({ isLoading, message = 'Processing your request...' }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="flex space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse delay-150"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse delay-300"></div>
          </div>
          <p className="text-center text-white">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Error message component
export const ErrorMessage: React.FC<{
  error: { message: string; details?: string } | null;
  onDismiss?: () => void;
}> = ({ error, onDismiss }) => {
  if (!error) return null;
  
  return (
    <div className="p-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg text-white animate-in fade-in">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="font-medium">{error.message}</p>
          {error.details && <p className="mt-1 text-sm opacity-80">{error.details}</p>}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 flex-shrink-0 text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
