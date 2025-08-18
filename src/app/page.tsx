
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Users, Settings, Camera } from 'lucide-react';
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
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 shadow-md">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">KruthikaChat</h1>
            <div className="text-sm">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Ad Space - Top Banner */}
        <BannerAdDisplay 
          adType="standard" 
          placementKey="home-top" 
          className="my-2"
        />

        {/* Main Content */}
        <div className="flex-grow overflow-y-auto bg-secondary/10">
          {/* Chat List */}
          <div className="bg-background">
            <div 
              className="flex items-center p-4 hover:bg-secondary/50 cursor-pointer border-b border-border transition-colors"
              onClick={handleChatClick}
            >
              <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                <AvatarImage 
                  src={effectiveProfile.avatarUrl} 
                  alt={effectiveProfile.name}
                  className="object-cover"
                />
                <AvatarFallback>
                  {effectiveProfile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="ml-4 flex-grow">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">{effectiveProfile.name}</h2>
                  <span className="text-xs text-muted-foreground">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm truncate">
                  {effectiveProfile.status}
                </p>
              </div>
            </div>
          </div>

          {/* Ad Space - Native Banner */}
          <BannerAdDisplay 
            adType="native" 
            placementKey="home-middle" 
            className="my-4"
          />

          {/* Quick Actions */}
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">QUICK ACTIONS</h3>
            
            <div 
              className="flex items-center p-3 bg-card rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors border"
              onClick={handleStatusClick}
            >
              <div className="bg-primary/10 p-2 rounded-full">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <h4 className="font-medium">Status Updates</h4>
                <p className="text-sm text-muted-foreground">View and share status</p>
              </div>
            </div>

            <div 
              className="flex items-center p-3 bg-card rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors border"
              onClick={handleChatClick}
            >
              <div className="bg-green-500/10 p-2 rounded-full">
                <MessageCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <h4 className="font-medium">Start Chat</h4>
                <p className="text-sm text-muted-foreground">Chat with Kruthika</p>
              </div>
            </div>
          </div>

          {/* Ad Space - Bottom Banner */}
          <BannerAdDisplay 
            adType="standard" 
            placementKey="home-bottom" 
            className="my-2"
          />
        </div>

        {/* Bottom Navigation */}
        <div className="bg-background border-t border-border p-2">
          <div className="flex justify-around items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 flex flex-col items-center py-3"
            >
              <MessageCircle className="h-5 w-5 mb-1" />
              <span className="text-xs">Chats</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 flex flex-col items-center py-3"
              onClick={handleStatusClick}
            >
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs">Status</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 flex flex-col items-center py-3"
              onClick={() => router.push('/admin/profile')}
            >
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </div>

        {/* Floating Action Button */}
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
          onClick={handleChatClick}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}
