
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AppHeader from '@/components/AppHeader';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AIProfile } from '@/types';
import { defaultAIProfile } from '@/config/ai';
import { MessageSquarePlus } from 'lucide-react';
import BannerAdDisplay from '@/components/chat/BannerAdDisplay';
import { useAIProfile } from '@/contexts/AIProfileContext'; 
import { cn } from '@/lib/utils';

const ChatListItem: React.FC<{ profile: AIProfile; lastMessage?: string; timestamp?: string; unreadCount?: number; }> = ({
  profile,
  lastMessage,
  timestamp = "",
  unreadCount,
}) => {
  const displayLastMessage = lastMessage || `Click to chat with ${profile.name}!`;
  
  let avatarUrlToUse = profile.avatarUrl;
  if (!avatarUrlToUse || typeof avatarUrlToUse !== 'string' || avatarUrlToUse.trim() === '' || (!avatarUrlToUse.startsWith('http') && !avatarUrlToUse.startsWith('data:'))) {
    avatarUrlToUse = defaultAIProfile.avatarUrl;
  }

  // if (profile.name === "Kruthika") {
    // console.log(`ChatListItem - Kruthika's final avatarUrlToUse: ${avatarUrlToUse}`);
  // }

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`ChatListItem - AvatarImage load error for ${profile.name}. URL: ${avatarUrlToUse}`, e);
  };

  return (
    <Link href="/maya-chat" legacyBehavior>
      <a className="flex items-center p-3 bg-transparent hover:bg-secondary/50 cursor-pointer border-b border-border transition-colors">
        <div
          className={cn(
            "relative rounded-full mr-4 shrink-0",
            profile.name === "Kruthika" && "border-2 border-primary p-0.5" 
          )}
           key={`avatar-wrapper-${profile.name}-${avatarUrlToUse || 'default_wrapper_key_cli'}`}
        >
          <Avatar 
            className="h-12 w-12" 
            key={`avatar-comp-${profile.name}-${avatarUrlToUse || 'default_avatar_comp_key_cli'}`}
          >
            <AvatarImage 
              src={avatarUrlToUse || undefined} 
              alt={profile.name} 
              data-ai-hint="profile woman" 
              key={`chat-list-item-avatar-img-${profile.name}-${avatarUrlToUse || 'no_avatar_fallback_img_cli'}`}
              onError={handleAvatarError}
            />
            <AvatarFallback>{(profile.name || "K").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-grow overflow-hidden min-w-0">
          <h2 className="font-semibold text-md truncate text-foreground">{profile.name}</h2>
          <p className="text-sm text-muted-foreground truncate">{displayLastMessage}</p>
        </div>
        <div className="flex flex-col items-end text-xs ml-2 shrink-0">
          <span className="text-muted-foreground mb-1">{timestamp}</span>
          {unreadCount && unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
      </a>
    </Link>
  );
};


const ChatListPage: React.FC = () => {
  const { aiProfile: globalAIProfile, isLoadingAIProfile } = useAIProfile(); 
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null);
  
  useEffect(() => {
    const lastInteraction = localStorage.getItem('messages_kruthika');
    if (lastInteraction) {
      try {
        const messagesArray = JSON.parse(lastInteraction);
        const lastMsg = messagesArray[messagesArray.length - 1];
        if (lastMsg && lastMsg.timestamp) {
          const date = new Date(lastMsg.timestamp);
          const today = new Date();
          if (date.toDateString() === today.toDateString()) {
            setLastMessageTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
          } else {
             setLastMessageTime(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
          }
        }
      } catch (e) { console.warn("Could not parse last message time from localStorage", e); }
    }
    if (!lastMessageTime && Math.random() > 0.5) { 
        setLastMessageTime("9:15 AM");
    }
  }, [lastMessageTime]); 

  const effectiveAIProfile = globalAIProfile || defaultAIProfile;
  
  // if (globalAIProfile) {
    // console.log("[ChatListPage] Using AIProfile from context:", JSON.stringify(globalAIProfile, null, 2));
  // } else if (!isLoadingAIProfile) { 
    // console.log("[ChatListPage] AIProfile from context is null (and not loading), using defaultAIProfile:", JSON.stringify(defaultAIProfile, null, 2));
  // }


  if (isLoadingAIProfile) { 
    return (
      <div className="flex flex-col h-screen max-w-3xl mx-auto bg-background shadow-2xl">
        <AppHeader title="Chats" />
        <div className="flex-grow flex items-center justify-center text-muted-foreground">
          Loading Kruthika's profile...
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-background shadow-2xl">
      <AppHeader title="Chats" />
      <div className="flex-grow overflow-y-auto custom-scrollbar relative">
        <ChatListItem
          profile={effectiveAIProfile} 
          lastMessage={effectiveAIProfile.status || `Let's chat! 😊`}
          timestamp={lastMessageTime || ""}
        />
        
        <BannerAdDisplay adType="standard" placementKey="chatListBottom" className="mx-auto max-w-md mt-2 mb-1" />
        
        <div className="p-2">
             <BannerAdDisplay adType="native" placementKey="chatListNative" className="my-2" />
        </div>
      </div>
      <Link
        href="/maya-chat"
        aria-label={`New chat with ${effectiveAIProfile.name}`}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 lg:bottom-10 lg:right-10 z-10 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        <span>
          <MessageSquarePlus size={24} />
        </span>
      </Link>
      <footer className="p-2 text-center border-t border-border">
        
        <p className="text-xs text-muted-foreground/70 mt-1">AI Chat Experience.</p>
      </footer>
    </div>
  );
};

export default ChatListPage;
