"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAIProfile } from '@/contexts/AIProfileContext';
import { MessageCircle, User, Settings, ArrowLeft, Users } from 'lucide-react';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export default function AppHeader({ title, showBackButton = true }: AppHeaderProps) {
  const { aiProfile: globalAIProfile, isLoadingAIProfile } = useAIProfile();
  const pathname = usePathname();
  const router = useRouter();

  const handleBackClick = () => {
    if (pathname === '/status') {
      router.push('/maya-chat');
    } else if (pathname === '/admin/profile') {
      router.push('/maya-chat');
    } else {
      router.push('/maya-chat');
    }
  };

  if (isLoadingAIProfile) {
    return (
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              <div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mt-1" />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && pathname !== '/maya-chat' && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackClick}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            {globalAIProfile && (
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={globalAIProfile.avatarUrl} 
                  alt={globalAIProfile.name}
                  data-ai-hint="profile woman"
                />
                <AvatarFallback>
                  {globalAIProfile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}

            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {title || globalAIProfile?.name || 'Kruthika Chat'}
              </h1>
              <p className="text-sm text-gray-500">
                {pathname === '/status' ? 'Status Updates' : 
                 pathname === '/admin/profile' ? 'Admin Profile' : 
                 'AI Companion'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/maya-chat">
              <Button 
                variant={pathname === '/maya-chat' ? 'default' : 'ghost'} 
                size="icon"
                className="h-9 w-9"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/status">
              <Button 
                variant={pathname === '/status' ? 'default' : 'ghost'} 
                size="icon"
                className="h-9 w-9"
              >
                <Users className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/admin/profile">
              <Button 
                variant={pathname === '/admin/profile' ? 'default' : 'ghost'} 
                size="icon"
                className="h-9 w-9"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export { AppHeader };