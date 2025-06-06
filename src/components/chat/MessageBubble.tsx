
import React from 'react';
import Image from 'next/image';
import { Check, CheckCheck } from 'lucide-react';
import type { Message, MessageStatus } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { defaultAIProfile } from '@/config/ai'; 

interface MessageBubbleProps {
  message: Message;
  aiAvatarUrl: string;
  aiName: string;
  onTriggerAd?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, aiAvatarUrl, aiName, onTriggerAd }) => {
  const isUser = message.sender === 'user';
  const timestamp = new Date(message.timestamp);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const renderTicks = (status: MessageStatus) => {
    if (!isUser) return null;
    if (status === 'read') return <CheckCheck className="h-4 w-4 text-blue-500 ml-1" />;
    if (status === 'delivered') return <CheckCheck className="h-4 w-4 text-muted-foreground ml-1" />;
    return <Check className="h-4 w-4 text-muted-foreground ml-1" />;
  };

  const imageToShowUrl = isUser ? message.userImageUrl : message.aiImageUrl;
  const imageHint = isUser ? "user upload" : "chat image";

  let isValidImageSrc = false;
  if (imageToShowUrl && typeof imageToShowUrl === 'string' && imageToShowUrl.trim() !== '') {
    try {
      if (imageToShowUrl.startsWith('data:image')) {
        isValidImageSrc = true;
      } else {
        new URL(imageToShowUrl); 
        isValidImageSrc = true;
      }
    } catch (e) {
      isValidImageSrc = false;
    }
  }

  let aiAvatarUrlToUse = aiAvatarUrl;
  if (!aiAvatarUrlToUse || typeof aiAvatarUrlToUse !== 'string' || aiAvatarUrlToUse.trim() === '' || (!aiAvatarUrlToUse.startsWith('http') && !aiAvatarUrlToUse.startsWith('data:'))) {
    aiAvatarUrlToUse = defaultAIProfile.avatarUrl;
  }

  const handleAIAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`MessageBubble - AI AvatarImage load error for ${aiName}. URL: ${aiAvatarUrlToUse}`, e);
  };
  
  const handleContentImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`MessageBubble - Content Image load error for message ${message.id}. URL: ${imageToShowUrl}`, e);
  };


  const renderMessageContent = () => {
    if (message.sender === 'ai' && message.text.includes("[CLICKABLE_AD_LINK text='")) {
      const parts = [];
      let lastIndex = 0;
      const adLinkRegex = /\[CLICKABLE_AD_LINK text='(.*?)'\]/g;
      let match;

      while ((match = adLinkRegex.exec(message.text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<span key={`text-${lastIndex}`}>{message.text.substring(lastIndex, match.index)}</span>);
        }
        const linkText = match[1];
        parts.push(
          <Button
            key={`adlink-${match.index}`}
            variant="link"
            className="text-sm p-0 h-auto inline whitespace-normal text-left hover:underline text-accent-foreground/90 dark:text-accent-foreground"
            onClick={onTriggerAd}
          >
            {linkText}
          </Button>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < message.text.length) {
        parts.push(<span key={`text-${lastIndex}-end`}>{message.text.substring(lastIndex)}</span>);
      }
      return <p className="text-sm whitespace-pre-wrap">{parts}</p>;
    }
    return message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>;
  };


  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div className="flex items-end max-w-[75%] sm:max-w-[65%]">
        {!isUser && (
          <Avatar 
            className="h-8 w-8 mr-2 self-end shrink-0"
            key={`ai-msg-avatar-comp-${message.id}-${aiAvatarUrlToUse || 'default_avatar_comp_key_mb'}`}
          >
            <AvatarImage
              src={aiAvatarUrlToUse || undefined}
              alt={aiName}
              data-ai-hint="profile woman"
              key={`ai-msg-avatar-img-${message.id}-${aiAvatarUrlToUse || 'no_avatar_fallback_img_mb'}`}
              onError={handleAIAvatarError}
            />
            <AvatarFallback>{(aiName || "K").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        <div
          className={cn(
            'px-3 py-2 shadow-md break-words',
            isUser
              ? 'bg-chat-bg-user text-chat-text-user rounded-lg rounded-br-sm'
              : 'bg-chat-bg-ai text-chat-text-ai rounded-lg rounded-bl-sm'
          )}
        >
          {isValidImageSrc && imageToShowUrl && (
            <Image
              src={imageToShowUrl}
              alt="Sent image"
              width={200}
              height={200}
              className="rounded-md mb-1 max-w-full h-auto"
              data-ai-hint={imageHint}
              key={`${message.id}-content-img-${imageToShowUrl}`} 
              onError={handleContentImageError}
              unoptimized={true} 
            />
          )}
          {message.audioUrl && (
            <audio controls src={message.audioUrl} className="w-full my-1">
              Your browser does not support the audio element.
            </audio>
          )}
          {renderMessageContent()}
          <div className="flex items-center justify-end mt-1">
            <span className={cn('text-xs',
              isUser ? 'text-chat-text-user/70' : 'text-muted-foreground/90'
            )}>
              {formatTime(timestamp)}
            </span>
            {renderTicks(message.status)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
