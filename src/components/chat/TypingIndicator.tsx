import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  avatarUrl: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ avatarUrl }) => {
  return (
    <div className="flex items-center space-x-2 p-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} alt="AI Avatar" data-ai-hint="profile woman" />
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div className="flex items-center space-x-1 bg-chat-bg-ai text-chat-text-ai rounded-full px-3 py-2 shadow-md">
        <span className="typing-dot animate-bounce [animation-delay:-0.3s]"></span>
        <span className="typing-dot animate-bounce [animation-delay:-0.15s]"></span>
        <span className="typing-dot animate-bounce"></span>
      </div>
      <style jsx>{`
        .typing-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          background-color: currentColor;
          border-radius: 50%;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
