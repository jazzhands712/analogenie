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
