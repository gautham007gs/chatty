"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { defaultAIProfile } from '@/config/ai'; 

interface ChatHeaderProps {
  aiName: string;
  aiAvatarUrl: string; 
  onlineStatus: string;
  onAvatarClick: () => void;
  onCallClick: () => void; 
  onVideoClick: () => void; 
  tokenUsage?: {used: number; limit: number; percentage: number} | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  aiName,
  aiAvatarUrl, 
  onlineStatus,
  onAvatarClick,
  onCallClick,
  onVideoClick,
  tokenUsage,
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/');
  };

  let avatarUrlToUse = aiAvatarUrl; 
  if (!avatarUrlToUse || typeof avatarUrlToUse !== 'string' || avatarUrlToUse.trim() === '' || (!avatarUrlToUse.startsWith('http') && !avatarUrlToUse.startsWith('data:'))) {
    avatarUrlToUse = defaultAIProfile.avatarUrl;
  }

  // if (aiName === "Kruthika") {
    // console.log(`ChatHeader - Kruthika's final aiAvatarUrlToUse: ${avatarUrlToUse}`);
  // }

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`ChatHeader - AvatarImage load error for ${aiName}. URL: ${avatarUrlToUse}`, e);
  };

  const getTokenMessage = () => {
    if (!tokenUsage) return null;

    const { percentage } = tokenUsage;
    if (percentage >= 95) {
      return "💕 Almost time to say bye... but I'll miss you!";
    } else if (percentage >= 80) {
      return "🌸 We've been chatting so much! Love it!";
    } else if (percentage >= 60) {
      return "✨ Having so much fun talking to you!";
    } else if (percentage >= 40) {
      return "😊 This conversation is getting interesting!";
    }
    return null;
  };

  return (
    <header className="flex items-center p-3 bg-chat-header-bg border-b border-border shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-inherit hover:bg-accent/10 mr-2"
        onClick={handleBackClick}
        aria-label="Go back"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <button 
        onClick={onAvatarClick} 
        className={cn(
            "flex items-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-chat-header-bg rounded-full p-1 mr-3",
            aiName === "Kruthika" && "border-2 border-primary p-0.5" 
        )}
        key={`avatar-header-wrapper-${aiName}-${avatarUrlToUse || 'default_wrapper_key_ch'}`}
      >
        <Avatar 
            className="h-10 w-10 cursor-pointer" 
            key={`avatar-comp-header-${aiName}-${avatarUrlToUse || 'default_avatar_comp_key_ch'}`}
        >
          <AvatarImage 
            src={avatarUrlToUse || undefined} 
            alt={aiName} 
            data-ai-hint="profile woman" 
            key={`chat-header-avatar-img-${aiName}-${avatarUrlToUse || 'no_avatar_fallback_img_ch'}`}
            onError={handleAvatarError} 
          />
          <AvatarFallback>{(aiName || "K").charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </button>
      <div className="flex-grow cursor-pointer" onClick={onAvatarClick}>
        <h1 className="font-semibold text-lg text-chat-header-text">{aiName}</h1>
        <p className="text-xs text-chat-header-text/70">{onlineStatus}</p>
        {tokenUsage && tokenUsage.percentage > 0 && (
          <div className="text-xs text-pink-300 mt-1">
            {getTokenMessage()}
          </div>
        )}
      </div >

      <Button variant="ghost" size="icon" className="text-inherit hover:bg-accent/10" aria-label="Video call (simulated ad)" onClick={onVideoClick}>
        <Video className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="text-inherit hover:bg-accent/10 mr-1" aria-label="Call (simulated ad)" onClick={onCallClick}>
        <Phone className="h-5 w-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-inherit hover:bg-accent/10" aria-label="More options">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onAvatarClick}>
            <span>View Contact</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alert("Media, links, and docs: Non-functional placeholder")}>
            <span>Media, links, and docs</span>
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => alert("Search: Non-functional placeholder")}>
            <span>Search</span>
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => alert("Mute notifications: Non-functional placeholder")}>
            <span>Mute notifications</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/legal/terms')}>
            <span>Terms of Service</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/legal/privacy')}>
            <span>Privacy Policy</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuItem onClick={() => router.push('/')}>
            <span>Exit Chat</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default ChatHeader;