import React from 'react';

interface NiaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NiaLogo: React.FC<NiaLogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${sizeClasses[size]} ${className}`}>
      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold">N</span>
      </div>
      <span className="font-bold text-primary-600">Nia AI</span>
    </div>
  );
};