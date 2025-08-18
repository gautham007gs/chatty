"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAIProfile } from '@/contexts/AIProfileContext';

export function AppHeader() {
  const { globalAIProfile, isLoading } = useAIProfile();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
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
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/maya-chat" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Avatar className="w-10 h-10">
              <AvatarImage src={globalAIProfile?.avatarUrl} alt={globalAIProfile?.name} />
              <AvatarFallback>{globalAIProfile?.name?.[0] || 'AI'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-gray-900">{globalAIProfile?.name || 'AI Chat'}</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <Link href="/maya-chat">
              <Badge 
                variant={pathname === '/maya-chat' ? "default" : "secondary"} 
                className="text-xs cursor-pointer hover:opacity-80"
              >
                Chat
              </Badge>
            </Link>
            <Link href="/status">
              <Badge 
                variant={pathname === '/status' ? "default" : "secondary"} 
                className="text-xs cursor-pointer hover:opacity-80"
              >
                Status
              </Badge>
            </Link>
            <Link href="/admin/profile">
              <Badge 
                variant={pathname === '/admin/profile' ? "default" : "outline"} 
                className="text-xs cursor-pointer hover:opacity-80"
              >
                Settings
              </Badge>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}