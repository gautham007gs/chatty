
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, ArrowLeft, Camera, Search, MoreVertical, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAIProfile } from '@/contexts/AIProfileContext';
import { defaultAIProfile } from '@/config/ai';
import BannerAdDisplay from '@/components/chat/BannerAdDisplay';
import SocialBarAdDisplay from '@/components/SocialBarAdDisplay';
import GlobalAdScripts from '@/components/GlobalAdScripts';

export default function HomePage() {
  const router = useRouter();
  const { aiProfile, isLoadingAIProfile } = useAIProfile();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const effectiveProfile = aiProfile || defaultAIProfile;

  const handleChatClick = () => {
    router.push('/maya-chat');
  };

  const handleStatusClick = () => {
    router.push('/status');
  };

  if (isLoadingAIProfile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <GlobalAdScripts />
      <SocialBarAdDisplay />

      <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg">
        {/* Header with lighter green color */}
        <div className="bg-[#25D366] text-white px-4 py-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold">WhatApp</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Camera className="h-5 w-5 cursor-pointer hover:text-gray-200" />
              <Search className="h-5 w-5 cursor-pointer hover:text-gray-200" />
              <MoreVertical className="h-5 w-5 cursor-pointer hover:text-gray-200" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#25D366] text-white">
          <div className="flex">
            <Button 
              variant="ghost" 
              className="flex-1 text-white hover:bg-white/10 rounded-none border-b-2 border-white py-3 font-medium text-sm"
            >
              CHATS
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1 text-white/70 hover:bg-white/10 rounded-none py-3 font-medium text-sm"
              onClick={handleStatusClick}
            >
              STATUS
            </Button>
          </div>
        </div>

        {/* Chat List Container */}
        <div className="flex-grow overflow-y-auto bg-white">
          {/* Main Chat Entry */}
          <div 
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-all duration-200 active:bg-gray-100"
            onClick={handleChatClick}
          >
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-[#25D366] p-0.5">
                <AvatarImage 
                  src={effectiveProfile.avatarUrl} 
                  alt={effectiveProfile.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#25D366] text-white text-lg">
                  {effectiveProfile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Green status indicator for story/status updates */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#25D366] rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="ml-4 flex-grow">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 text-lg">{effectiveProfile.name}</h2>
                <span className="text-xs text-gray-500">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {effectiveProfile.status}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
                <div className="w-6 h-6 bg-[#25D366] rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="p-6 text-center">
            <div className="mb-4">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Welcome to WhatApp! 👋
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Start chatting with {effectiveProfile.name} - your friend who's always ready to talk!
              </p>
              <p className="text-xs text-gray-400 mt-2 opacity-50">
                Powered by smart conversation technology
              </p>
            </div>

            <Button 
              onClick={handleChatClick}
              className="w-full bg-[#25D366] hover:bg-[#20B858] text-white py-3 text-lg font-medium rounded-lg shadow-md hover:shadow-lg transition-all mt-4 mb-3"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Chatting
            </Button>

            <div className="flex gap-3 mb-6">
              <Button 
                onClick={handleStatusClick}
                className="flex-1 bg-[#128C7E] hover:bg-[#0F7A6B] text-white py-3 text-lg font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <Users className="h-5 w-5 mr-2" />
                View Status
              </Button>
              <Button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Chat with Kruthika on WhatApp',
                      text: 'Join me chatting with friends on WhatApp!',
                      url: window.location.origin
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.origin);
                    // You could add a toast here
                  }
                }}
                className="bg-[#34B7F1] hover:bg-[#2DA9E1] text-white py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                title="Share WhatApp"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Banner Ad at Bottom */}
        <div className="bg-white border-t border-gray-100">
          <BannerAdDisplay 
            adType="standard" 
            placementKey="home-bottom" 
            className="w-full py-2"
          />
        </div>

        {/* Floating Action Button */}
        <Button
          className="fixed bottom-20 right-6 rounded-full w-16 h-16 shadow-2xl bg-[#25D366] hover:bg-[#20B858] z-50 transition-all duration-200 hover:scale-110"
          onClick={handleChatClick}
        >
          <MessageCircle className="h-7 w-7 text-white" />
        </Button>
      </div>
    </>
  );
}
