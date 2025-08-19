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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
}

const MayaChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { aiProfile, isLoadingAIProfile } = useAIProfile();
  const { adSettings, isLoadingAdSettings } = useAdSettings();
  const { mediaAssetsConfig, isLoadingMediaAssets } = useAIMediaAssets();

  // Smart AI disclosure for new users
  useEffect(() => {
    const showAIDisclosure = () => {
      try {
        const hasSeenDisclosure = localStorage.getItem('kruthika_ai_disclosure_shown');
        const lastVisit = localStorage.getItem('kruthika_last_visit');
        const currentTime = Date.now();

        // Show disclosure if:
        // 1. Never seen before, OR
        // 2. Last visit was more than 7 days ago, OR
        // 3. User has less than 3 messages in history (new user)
        const storedMessages = localStorage.getItem('kruthika_chat_messages');
        const messageCount = storedMessages ? JSON.parse(storedMessages).length : 0;
        const daysSinceLastVisit = lastVisit ? (currentTime - parseInt(lastVisit)) / (1000 * 60 * 60 * 24) : Infinity;

        const shouldShow = !hasSeenDisclosure || daysSinceLastVisit > 7 || messageCount < 3;

        if (shouldShow) {
          // Random delay between 2-5 seconds after page load
          const delay = Math.random() * 3000 + 2000;

          setTimeout(() => {
            toast({
              title: "💬 Smart Chat Assistant",
              description: "You're chatting with our advanced AI companion for the best experience!",
              duration: 4000,
              className: "bg-green-50 border-green-200 text-green-800"
            });

            // Mark as shown and update last visit
            localStorage.setItem('kruthika_ai_disclosure_shown', 'true');
            localStorage.setItem('kruthika_last_visit', currentTime.toString());
          }, delay);
        } else {
          // Just update last visit time
          localStorage.setItem('kruthika_last_visit', currentTime.toString());
        }
      } catch (error) {
        console.error('Error handling AI disclosure:', error);
      }
    };

    // Show disclosure after a short delay to ensure smooth page load
    const timer = setTimeout(showAIDisclosure, 1000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const loadMessages = () => {
      try {
        const stored = localStorage.getItem('kruthika_chat_messages');
        if (stored) {
          const parsedMessages = JSON.parse(stored).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('kruthika_chat_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          conversationHistory: messages.slice(-10),
          aiProfile: aiProfile || undefined,
          mediaAssets: mediaAssetsConfig?.assets || []
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || "Sorry, I couldn't process that message.",
        sender: 'ai',
        timestamp: new Date(),
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again! 😊",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
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

  return (
    <>
      <GlobalAdScripts adSettings={adSettings} />
      <div className="flex flex-col h-screen bg-gray-50 relative">
        {/* Header */}
        <ChatHeader 
          profile={aiProfile}
          onBack={handleBackToHome}
        />

        {/* Banner Ad */}
        <BannerAdDisplay adSettings={adSettings} />

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatView 
            messages={messages}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
          />
        </div>

        {/* Input */}
        <ChatInput onSendMessage={handleSendMessage} />

        {/* Social Bar Ad */}
        <SocialBarAdDisplay adSettings={adSettings} />
      </div>
    </>
  );
};

export default MayaChatPage;