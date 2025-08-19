import React, { memo } from 'react';
import Image from 'next/image';
import type { Message } from '@/types';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  aiAvatarUrl?: string;
  aiName?: string;
  onImageClick?: (url: string) => void;
  onTriggerAd?: () => void;
}

const MessageBubble = memo(({ message, aiAvatarUrl, aiName = "AI", onImageClick, onTriggerAd }: MessageBubbleProps) => {
  const isAi = message.sender === 'ai';
  const isUser = message.sender === 'user'; // Added isUser flag

  const handleBubbleClick = () => {
    if (onTriggerAd && Math.random() < 0.1) { // 10% chance on message click
      onTriggerAd();
    }
  };

  return (
    <div className={cn("flex gap-2 max-w-[85%]", isAi ? "justify-start" : "justify-end ml-auto")}>
      {isAi && aiAvatarUrl && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
          <Image
            src={aiAvatarUrl}
            alt={`${aiName}'s avatar`}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            data-ai-hint="profile woman small"
            unoptimized
          />
        </div>
      )}

      <div
        className={cn(
          "rounded-2xl px-4 py-2 max-w-full break-words cursor-pointer transition-colors",
          isAi
            ? "bg-white text-gray-900 rounded-bl-md"
            : "bg-[#DCF8C6] text-gray-900 rounded-br-md"
        )}
        onClick={handleBubbleClick}
      >
        {message.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        )}

        {message.userImageUrl && (
          <div className="mt-2">
            <Image
              src={message.userImageUrl}
              alt="User shared image"
              width={200}
              height={200}
              className="rounded-lg max-w-full h-auto cursor-pointer"
              onClick={() => onImageClick?.(message.userImageUrl!)}
              unoptimized
            />
          </div>
        )}

        {message.aiImageUrl && (
          <div className="mt-2">
            <Image
              src={message.aiImageUrl}
              alt={`${aiName} shared image`}
              width={200}
              height={200}
              className="rounded-lg max-w-full h-auto cursor-pointer"
              onClick={() => onImageClick?.(message.aiImageUrl!)}
              data-ai-hint="ai generated"
              unoptimized
            />
          </div>
        )}

        {message.audioUrl && (
          <div className="mt-2">
            <audio
              controls
              className="max-w-full"
              preload="none"
            >
              <source src={message.audioUrl} type="audio/mpeg" />
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        <div className="flex justify-end mt-1">
          <span className="text-xs opacity-70">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </span>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;