"use client";

import React from 'react';

// Logo component
export const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
        ANALOGENIE
      </span>
      <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-800 rounded-full">
        v1.1
      </span>
    </div>
  );
};

// Stage indicator component to show progress through the three-stage workflow
export const StageIndicator: React.FC<{ currentStage: number }> = ({ currentStage }) => {
  return (
    <div className="stage-indicator">
      <div className={`stage-step ${currentStage >= 1 ? 'active' : ''} ${currentStage > 1 ? 'completed' : ''}`}>
        1
      </div>
      <div className={`stage-line ${currentStage >= 2 ? 'active' : ''} ${currentStage > 2 ? 'completed' : ''}`}></div>
      <div className={`stage-step ${currentStage >= 2 ? 'active' : ''} ${currentStage > 2 ? 'completed' : ''}`}>
        2
      </div>
      <div className={`stage-line ${currentStage >= 3 ? 'active' : ''}`}></div>
      <div className={`stage-step ${currentStage >= 3 ? 'active' : ''}`}>
        3
      </div>
    </div>
  );
};

// Loading indicator component
export const LoadingIndicator: React.FC<{ text?: string }> = ({ text = 'Processing...' }) => {
  return (
    <div className="flex items-center space-x-2 text-indigo-400">
      <div className="animate-pulse">●</div>
      <div className="animate-pulse animation-delay-200">●</div>
      <div className="animate-pulse animation-delay-400">●</div>
      <div className="ml-2">{text}</div>
    </div>
  );
};

// Button component with different variants
export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900';
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-800',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800',
    outline: 'bg-transparent border border-indigo-500 text-indigo-400 hover:bg-indigo-900 disabled:border-indigo-800 disabled:text-indigo-800'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
