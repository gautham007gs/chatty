import React, { useEffect, useRef } from 'react';
import type { Message } from '@/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useMessagePagination } from '@/hooks/useMessagePagination';
import { Button } from '@/components/ui/button';

interface ChatViewProps {
  messages: Message[];
  aiAvatarUrl: string;
  aiName: string;
  isAiTyping: boolean;
  onTriggerAd?: () => void; // New prop for handling ad clicks from bubbles
  userId?: string;
  enablePagination?: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ 
  messages, 
  aiAvatarUrl, 
  aiName, 
  isAiTyping, 
  onTriggerAd,
  userId,
  enablePagination = false 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Use pagination hook if enabled
  const pagination = useMessagePagination({
    chatId: 'kruthika_chat', // This should likely be dynamic based on the conversation
    userId: userId,
    pageSize: 50
  });

  const displayMessages = enablePagination ? pagination.messages : messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scroll to load more messages
  const handleScroll = () => {
    if (!enablePagination || !messagesContainerRef.current) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop === 0 && pagination.hasMore && !pagination.loading) {
      pagination.loadMore();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]); // Re-scroll if messages or typing status changes

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-grow overflow-y-auto p-4 space-y-4 bg-chat-bg-default custom-scrollbar"
      onScroll={handleScroll}
    >
      {enablePagination && pagination.hasMore && (
        <div className="text-center py-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={pagination.loadMore}
            disabled={pagination.loading}
          >
            {pagination.loading ? 'Loading...' : 'Load More Messages'}
          </Button>
        </div>
      )}

      {displayMessages.map((msg) => (
        <MessageBubble 
            key={msg.id} 
            message={msg} 
            aiAvatarUrl={aiAvatarUrl} 
            aiName={aiName} 
            onTriggerAd={onTriggerAd} // Pass down the callback
        />
      ))}
      {isAiTyping && <TypingIndicator avatarUrl={aiAvatarUrl} />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatView;