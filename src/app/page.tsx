
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Users, Settings, Camera, Search, MoreVertical, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAIProfile } from '@/contexts/AIProfileContext';
import { defaultAIProfile } from '@/config/ai';
import BannerAdDisplay from '@/components/chat/BannerAdDisplay';
import SocialBarAdDisplay from '@/components/SocialBarAdDisplay';
import GlobalAdScripts from '@/components/GlobalAdScripts';
import { cn } from '@/lib/utils';

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

  const handleBackClick = () => {
    // For homepage, we can go back in browser history
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  if (isLoadingAIProfile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#075E54]"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <GlobalAdScripts />
      <SocialBarAdDisplay />
      
      <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg">
        {/* Header */}
        <div className="bg-[#075E54] text-white px-4 py-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackClick}
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Whatapp</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Camera className="h-5 w-5 cursor-pointer" />
              <Search className="h-5 w-5 cursor-pointer" />
              <MoreVertical className="h-5 w-5 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#075E54] text-white">
          <div className="flex">
            <Button 
              variant="ghost" 
              className="flex-1 text-white hover:bg-white/10 rounded-none border-b-2 border-white py-3 font-medium"
            >
              CHATS
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1 text-white/70 hover:bg-white/10 rounded-none py-3 font-medium"
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
            <Avatar className="h-14 w-14 ring-2 ring-[#075E54]/20">
              <AvatarImage 
                src={effectiveProfile.avatarUrl} 
                alt={effectiveProfile.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-[#075E54] text-white text-lg">
                {effectiveProfile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="ml-4 flex-grow">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 text-lg">{effectiveProfile.name}</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {effectiveProfile.status}
              </p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
            
            <div className="ml-2">
              <MessageCircle className="h-6 w-6 text-[#075E54]" />
            </div>
          </div>

          {/* Placeholder entries for better UX */}
          <div className="space-y-1">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center p-4 opacity-30">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gray-300 text-gray-600">
                    {String.fromCharCode(65 + index)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-grow">
                  <div className="flex items-center justify-between">
                    <h2 className="font-medium text-gray-400">Add more contacts</h2>
                    <span className="text-xs text-gray-400">--:--</span>
                  </div>
                  <p className="text-gray-400 text-sm">Tap to invite friends</p>
                </div>
              </div>
            ))}
          </div>

          {/* Welcome Message */}
          <div className="p-6 text-center border-t border-gray-100 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Welcome to Whatapp! 👋
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Start chatting with Kruthika - your AI companion who's always ready to talk!
            </p>
          </div>
        </div>

        {/* Footer Banner Ad */}
        <div className="bg-white border-t border-gray-200">
          <BannerAdDisplay 
            adType="standard" 
            placementKey="home-footer" 
            className="w-full py-2"
          />
        </div>

        {/* Floating Action Button */}
        <Button
          className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-xl bg-[#25D366] hover:bg-[#20B858] z-50 transition-all duration-200 hover:scale-110"
          onClick={handleChatClick}
        >
          <MessageCircle className="h-7 w-7 text-white" />
        </Button>
      </div>
    </>
  );
}
