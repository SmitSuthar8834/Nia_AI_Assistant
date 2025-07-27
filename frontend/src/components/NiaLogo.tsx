import React from 'react';
import { Mic, Brain, Zap } from 'lucide-react';

interface NiaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const NiaLogo: React.FC<NiaLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        {/* Main logo container with gradient background */}
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg`}>
          {/* AI Brain icon with pulse animation */}
          <div className="relative">
            <Brain className="w-1/2 h-1/2 text-white" />
            <div className="absolute -top-1 -right-1">
              <Zap className="w-3 h-3 text-yellow-300 animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Voice indicator */}
        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
          <Mic className="w-3 h-3 text-white" />
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 ${textSizeClasses[size]} leading-none`}>
            Nia
          </span>
          <span className="text-xs text-gray-500 font-medium">
            AI Assistant
          </span>
        </div>
      )}
    </div>
  );
};