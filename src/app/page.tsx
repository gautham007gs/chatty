
<old_str>'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, Video, MoreVertical, Search, Settings, User } from 'lucide-react';
import { useAIProfile } from '@/contexts/AIProfileContext';
import { defaultAIProfile } from '@/config/ai';

interface ChatContact {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatarUrl: string;
  isOnline: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { aiProfile } = useAIProfile();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const effectiveAIProfile = aiProfile || defaultAIProfile;

  const chatContacts: ChatContact[] = [
    {
      id: 'kruthika',
      name: effectiveAIProfile.name,
      lastMessage: 'Hey! How are you doing? 😊',
      timestamp: '2 min',
      unreadCount: 2,
      avatarUrl: effectiveAIProfile.avatarUrl,
      isOnline: true
    },
    {
      id: 'maya',
      name: 'Maya',
      lastMessage: 'Good morning! ☀️',
      timestamp: '1 hour',
      unreadCount: 0,
      avatarUrl: 'https://i.postimg.cc/FRQcpkYX/images-9.jpg',
      isOnline: false
    },
    {
      id: 'friend1',
      name: 'Rahul',
      lastMessage: 'Lunch plans today?',
      timestamp: '3 hours',
      unreadCount: 1,
      avatarUrl: 'https://i.postimg.cc/QCzf8Kmt/images-11.jpg',
      isOnline: true
    },
    {
      id: 'family',
      name: 'Mom',
      lastMessage: 'Don\'t forget to call!',
      timestamp: 'Yesterday',
      unreadCount: 0,
      avatarUrl: 'https://i.postimg.cc/L5YDqwLQ/images-12.jpg',
      isOnline: false
    }
  ];

  const handleChatClick = (chatId: string) => {
    if (chatId === 'kruthika') {
      router.push('/maya-chat');
    } else {
      // For other chats, show a simple message
      alert(`Chat with ${chatContacts.find(c => c.id === chatId)?.name} - Feature coming soon!`);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
        <h1 className="text-xl font-semibold">Chats</h1>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/status')}>
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/profile')}>
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="flex items-center bg-secondary rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent flex-1 outline-none text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chatContacts.map((contact) => (
          <div
            key={contact.id}
            className={`flex items-center p-4 border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors ${
              selectedChat === contact.id ? 'bg-secondary' : ''
            }`}
            onClick={() => handleChatClick(contact.id)}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm truncate">{contact.name}</h3>
                <span className="text-xs text-muted-foreground">{contact.timestamp}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {contact.lastMessage}
                </p>
                {contact.unreadCount > 0 && (
                  <Badge variant="default" className="bg-primary text-primary-foreground rounded-full text-xs min-w-[20px] h-5 flex items-center justify-center">
                    {contact.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-6 right-6">
        <Button 
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => alert('New chat - Feature coming soon!')}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-t bg-background">
        <Button variant="ghost" className="flex-1 py-3 flex flex-col items-center space-y-1">
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs">Chats</span>
        </Button>
        <Button variant="ghost" className="flex-1 py-3 flex flex-col items-center space-y-1" onClick={() => router.push('/status')}>
          <div className="relative">
            <div className="w-5 h-5 rounded-full border-2 border-current"></div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full"></div>
          </div>
          <span className="text-xs">Status</span>
        </Button>
        <Button variant="ghost" className="flex-1 py-3 flex flex-col items-center space-y-1">
          <Phone className="h-5 w-5" />
          <span className="text-xs">Calls</span>
        </Button>
      </div>
    </div>
  );
}</old_str>
<new_str>'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, Video, MoreVertical, Search, Settings, User } from 'lucide-react';
import { useAIProfile } from '@/contexts/AIProfileContext';
import { defaultAIProfile } from '@/config/ai';
import BannerAdDisplay from '@/components/chat/BannerAdDisplay';

interface ChatContact {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatarUrl: string;
  isOnline: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { aiProfile } = useAIProfile();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const effectiveAIProfile = aiProfile || defaultAIProfile;

  // Only Kruthika chat now
  const chatContacts: ChatContact[] = [
    {
      id: 'kruthika',
      name: effectiveAIProfile.name,
      lastMessage: 'Hey! How are you doing? 😊 Let\'s chat!',
      timestamp: 'online',
      unreadCount: 2,
      avatarUrl: effectiveAIProfile.avatarUrl,
      isOnline: true
    }
  ];

  const handleChatClick = (chatId: string) => {
    if (chatId === 'kruthika') {
      router.push('/maya-chat');
    }
  };

  const handleNewChatClick = () => {
    // Same function as clicking Kruthika chat
    router.push('/maya-chat');
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background border-x">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
        <h1 className="text-xl font-semibold">Chats</h1>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/status')}>
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/profile')}>
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Banner Ad */}
      <BannerAdDisplay 
        adType="standard" 
        placementKey="homePageTopBanner" 
        className="mx-2 mt-2" 
      />

      {/* Search Bar */}
      <div className="p-3 border-b">
        <div className="flex items-center bg-secondary rounded-lg px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent flex-1 outline-none text-sm"
          />
        </div>
      </div>

      {/* Welcome Message */}
      <div className="p-4 bg-secondary/30">
        <h2 className="text-sm font-medium text-muted-foreground mb-2">RECENT CHATS</h2>
        <p className="text-xs text-muted-foreground">
          Start chatting with {effectiveAIProfile.name}, your AI companion!
        </p>
      </div>

      {/* Chat List - Only Kruthika */}
      <div className="flex-1 overflow-y-auto">
        {chatContacts.map((contact) => (
          <div
            key={contact.id}
            className={`flex items-center p-4 border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors ${
              selectedChat === contact.id ? 'bg-secondary' : ''
            }`}
            onClick={() => handleChatClick(contact.id)}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm truncate">{contact.name}</h3>
                <span className="text-xs text-muted-foreground">{contact.timestamp}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {contact.lastMessage}
                </p>
                {contact.unreadCount > 0 && (
                  <Badge variant="default" className="bg-primary text-primary-foreground rounded-full text-xs min-w-[20px] h-5 flex items-center justify-center">
                    {contact.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Native Ad */}
        <div className="mt-4">
          <BannerAdDisplay 
            adType="native" 
            placementKey="homePageNativeAd" 
            className="mx-4" 
            contextual={true}
            delayMs={3000}
          />
        </div>

        {/* Additional space for scrolling */}
        <div className="h-20"></div>
      </div>

      {/* Banner Ad before floating button */}
      <BannerAdDisplay 
        adType="standard" 
        placementKey="homePageBottomBanner" 
        className="mx-2 mb-2" 
      />

      {/* Floating Action Button - Now opens Kruthika chat */}
      <div className="absolute bottom-24 right-6">
        <Button 
          className="rounded-full w-14 h-14 shadow-lg bg-green-600 hover:bg-green-700"
          onClick={handleNewChatClick}
          title="Start chatting with Kruthika"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-t bg-background">
        <Button variant="ghost" className="flex-1 py-3 flex flex-col items-center space-y-1">
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs">Chats</span>
        </Button>
        <Button variant="ghost" className="flex-1 py-3 flex flex-col items-center space-y-1" onClick={() => router.push('/status')}>
          <div className="relative">
            <div className="w-5 h-5 rounded-full border-2 border-current"></div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full"></div>
          </div>
          <span className="text-xs">Status</span>
        </Button>
        <Button variant="ghost" className="flex-1 py-3 flex flex-col items-center space-y-1">
          <Phone className="h-5 w-5" />
          <span className="text-xs">Calls</span>
        </Button>
      </div>
    </div>
  );
}</new_str>
