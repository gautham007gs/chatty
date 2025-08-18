
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Users, Settings, Camera, Search, MoreVertical } from 'lucide-react';
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

  if (isLoadingAIProfile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <GlobalAdScripts />
      <SocialBarAdDisplay />
      
      <div className="flex flex-col h-screen max-w-3xl mx-auto bg-background">
        {/* Header Ad */}
        <BannerAdDisplay 
          adType="standard" 
          placementKey="home-header" 
          className="w-full"
        />

        {/* Header */}
        <div className="bg-[#075E54] text-white p-4 shadow-md">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">WhatsApp</h1>
            <div className="flex items-center space-x-4">
              <Search className="h-5 w-5" />
              <MoreVertical className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#075E54] text-white">
          <div className="flex">
            <Button 
              variant="ghost" 
              className="flex-1 text-white hover:bg-white/10 rounded-none border-b-2 border-white py-3"
            >
              CHATS
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1 text-white/70 hover:bg-white/10 rounded-none py-3"
              onClick={handleStatusClick}
            >
              STATUS
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1 text-white/70 hover:bg-white/10 rounded-none py-3"
            >
              CALLS
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow overflow-y-auto bg-white">
          {/* Chat List */}
          <div 
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
            onClick={handleChatClick}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={effectiveProfile.avatarUrl} 
                alt={effectiveProfile.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-[#075E54] text-white">
                {effectiveProfile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="ml-4 flex-grow">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-gray-900">{effectiveProfile.name}</h2>
                <span className="text-xs text-gray-500">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-500 text-sm truncate">
                {effectiveProfile.status}
              </p>
            </div>
          </div>

          {/* Native Ad */}
          <BannerAdDisplay 
            adType="native" 
            placementKey="home-middle" 
            className="mx-4 my-2"
          />

          {/* Additional chat items for better UX */}
          <div className="space-y-1">
            <div className="flex items-center p-4 opacity-50">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gray-300 text-gray-600">A</AvatarFallback>
              </Avatar>
              <div className="ml-4 flex-grow">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium text-gray-400">Add more contacts</h2>
                  <span className="text-xs text-gray-400">--:--</span>
                </div>
                <p className="text-gray-400 text-sm">Tap to invite friends</p>
              </div>
            </div>
          </div>

          {/* Another Ad Space */}
          <BannerAdDisplay 
            adType="standard" 
            placementKey="home-content" 
            className="mx-4 my-4"
          />
        </div>

        {/* Footer Ad */}
        <BannerAdDisplay 
          adType="standard" 
          placementKey="home-footer" 
          className="w-full"
        />

        {/* Floating Action Button */}
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-[#25D366] hover:bg-[#20B858] z-50"
          onClick={handleChatClick}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    </>
  );
}
