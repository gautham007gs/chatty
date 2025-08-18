
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Heart, Sparkles, ArrowRight, User, Settings } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChat = async () => {
    setIsLoading(true);
    // Small delay for smooth transition
    setTimeout(() => {
      router.push('/maya-chat');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-pink-500" />
            <span className="text-2xl font-bold text-gray-800">Kruthika Chat</span>
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost" onClick={() => router.push('/status')}>
              <User className="h-4 w-4 mr-2" />
              Status
            </Button>
            <Button variant="ghost" onClick={() => router.push('/admin/profile')}>
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-purple-500 p-1">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <Image
                  src="https://i.postimg.cc/52S3BZrM/images-10.jpg"
                  alt="Kruthika"
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                  unoptimized
                />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
          </div>

          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Kruthika</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Your friendly AI companion who loves to chat in Hindi and English! 
            Experience conversations that feel real and engaging. 🌸
          </p>

          <div className="flex justify-center space-x-4 mb-12">
            <Button 
              onClick={handleStartChat} 
              size="lg" 
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Start Chatting
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-pink-500" />
              </div>
              <CardTitle className="text-xl text-gray-800">Natural Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Chat naturally in Hindi and English. Kruthika understands context and responds like a real friend.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-purple-500" />
              </div>
              <CardTitle className="text-xl text-gray-800">Emotional Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Share your thoughts, feelings, and daily experiences. Kruthika genuinely cares about your day.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="text-xl text-gray-800">Always Available</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Whether it's morning chai or late night thoughts, Kruthika is here whenever you need someone to talk to.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">Ready to start your conversation?</p>
          <Button 
            onClick={handleStartChat}
            variant="outline" 
            size="lg"
            className="border-pink-300 text-pink-600 hover:bg-pink-50"
            disabled={isLoading}
          >
            Begin Your Chat Journey
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white/50">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 Kruthika Chat. Made with 💕 for meaningful conversations.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <button onClick={() => router.push('/legal/privacy')} className="hover:text-pink-500 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => router.push('/legal/terms')} className="hover:text-pink-500 transition-colors">
              Terms of Service
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
