"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ChatView from '@/components/chat/ChatView';
import ChatInput from '@/components/chat/ChatInput';
import ChatHeader from '@/components/chat/ChatHeader';
import BannerAdDisplay from '@/components/chat/BannerAdDisplay';
import SocialBarAdDisplay from '@/components/SocialBarAdDisplay';
import { useAIProfile } from '@/contexts/AIProfileContext';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import { useAIMediaAssets } from '@/contexts/AIMediaAssetsContext';
import { useToast } from "@/hooks/use-toast";
import GlobalAdScripts from '@/components/GlobalAdScripts';
import ProfileEditor from '@/components/chat/ProfileEditor';
import AvatarView from '@/components/chat/AvatarView';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
  status?: 'sent' | 'delivered' | 'read'; // Added status for better message tracking
}

// Helper functions for local storage
const getMessagesFromStorage = (): Message[] => {
  try {
    const stored = localStorage.getItem('kruthika_chat_messages');
    if (stored) {
      return JSON.parse(stored).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading messages from storage:', error);
    return [];
  }
};

const saveMessagesToStorage = (messages: Message[]): void => {
  try {
    localStorage.setItem('kruthika_chat_messages', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages to storage:', error);
  }
};

const MayaChatPage: React.FC = () => {
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<{ used: number; limit: number; percentage: number } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false); // State for profile editor modal
  const [isAvatarViewOpen, setIsAvatarViewOpen] = useState(false); // State for avatar full view

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const { aiProfile, isLoadingAIProfile, updateAIProfile } = useAIProfile();
  const { adSettings, isLoadingAdSettings } = useAdSettings();
  const { mediaAssetsConfig, isLoadingMediaAssets } = useAIMediaAssets();

  // Load messages on mount and add welcome message
  useEffect(() => {
    const savedMessages = getMessagesFromStorage();
    
    if (savedMessages.length === 0 && aiProfile && !hasShownWelcome) {
      setIsFirstVisit(true);
      // Add welcome message if this is the first visit
      const welcomeMessage: Message = {
        id: `welcome_${Date.now()}`,
        text: `Hi there! 🌸 I'm ${aiProfile.name}! Welcome to our chat! I'm so excited to talk with you! Feel free to ask me anything or just say hello! 💕`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered',
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage]);
      setHasShownWelcome(true);
    } else if (savedMessages.length > 0) {
      setMessages(savedMessages);
      setIsFirstVisit(false);
      setHasShownWelcome(true);
    }
  }, [aiProfile, hasShownWelcome]);

  // Effect to save messages to storage whenever messages state changes
  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages]);

  // Scroll to bottom when messages or typing status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsAiTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          conversationHistory: messages.slice(-10), // Keep history relevant
          aiProfile: aiProfile || undefined,
          mediaAssets: mediaAssetsConfig?.assets || []
        })
      });

      if (!response.ok) {
        // Handle network or server errors
        let errorMessage = "Sorry, I'm having trouble connecting right now. Please try again! 😊";
        if (response.status === 429) { // Example: Rate limiting
          errorMessage = "Too many requests. Please try again in a moment.";
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // Ignore if error response is not JSON
          }
        }
        toast({
          title: "Connection Issue",
          description: errorMessage,
          variant: "destructive",
          duration: 3000, // Shorter duration for error toasts
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        text: data.message || "Sorry, I couldn't process that message.",
        sender: 'ai',
        timestamp: new Date(),
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        status: 'delivered',
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // This catch block is for errors that occur before receiving a response or network issues
      toast({
        title: "Connection Issue",
        description: "Unable to send message. Please check your connection and try again.",
        variant: "destructive",
        duration: 3000, // Shorter duration for error toasts
      });
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleAvatarClick = () => {
    setIsAvatarViewOpen(true);
  };

  const handleProfileSave = (updatedProfile: any) => {
    updateAIProfile(updatedProfile);
    setIsProfileEditorOpen(false);
    toast({
      title: "Profile Updated",
      description: "Your AI profile has been successfully updated.",
      duration: 2000,
    });
  };

  const handleCallClick = () => {
    toast({
      title: "Voice Call",
      description: "Voice calling feature coming soon!",
      duration: 2000, // Shorter duration for feature announcements
    });
  };

  const handleVideoClick = () => {
    toast({
      title: "Video Call", 
      description: "Video calling feature coming soon!",
      duration: 2000, // Shorter duration for feature announcements
    });
  };

  const handleTriggerAd = () => {
    toast({
      title: "Ad Link",
      description: "This would open an ad in a real implementation.",
      duration: 2000, // Shorter duration for ad interaction feedback
    });
  };

  const isLoading = isLoadingAIProfile || isLoadingAdSettings || isLoadingMediaAssets;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // The actual rendering of the chat page
  return (
    <>
      <GlobalAdScripts adSettings={adSettings} />
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <ChatHeader 
          profile={aiProfile}
          onBack={handleBackToHome}
          onAvatarClick={handleAvatarClick}
          onCallClick={handleCallClick}
          onVideoClick={handleVideoClick}
          tokenUsage={tokenUsage}
        />

        <BannerAdDisplay adSettings={adSettings} />

        <div className="flex-1 overflow-y-auto"> {/* Changed overflow-hidden to overflow-y-auto for scrollable chat */}
          <ChatView 
            messages={messages}
            isTyping={isAiTyping}
            messagesEndRef={messagesEndRef}
            aiAvatarUrl={aiProfile?.avatarUrl || ''} // Pass avatarUrl
            aiName={aiProfile?.name || 'AI Assistant'} // Pass name
            onTriggerAd={handleTriggerAd}
          />
        </div>

        <ChatInput onSendMessage={handleSendMessage} disabled={isAiTyping} />

        <SocialBarAdDisplay adSettings={adSettings} />

        {isProfileEditorOpen && aiProfile && (
          <ProfileEditor
            currentProfile={aiProfile}
            onSave={handleProfileSave}
            onClose={() => setIsProfileEditorOpen(false)}
            isOpen={isProfileEditorOpen}
            onOpenChange={setIsProfileEditorOpen}
          />
        )}

        {isAvatarViewOpen && aiProfile && (
          <AvatarView
            isOpen={isAvatarViewOpen}
            onClose={() => setIsAvatarViewOpen(false)}
            avatarUrl={aiProfile.avatarUrl || ''}
            name={aiProfile.name}
            status={aiProfile.status}
          />
        )}
      </div>
    </>
  );
};

export default MayaChatPage;