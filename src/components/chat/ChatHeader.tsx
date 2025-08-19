"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useAIProfile } from '@/contexts/AIProfileContext';
import AvatarView from './AvatarView';

const ChatHeader: React.FC = () => {
  const router = useRouter();
  const { aiProfile } = useAIProfile();
  const [isAvatarViewOpen, setIsAvatarViewOpen] = useState(false);

  const handleBackClick = () => {
    router.push('/');
  };

  const handleAvatarClick = () => {
    setIsAvatarViewOpen(true);
  };

  return (
    <>
      <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackClick}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <AvatarView
            avatarUrl={aiProfile?.avatarUrl || '/default-avatar.png'}
            name={aiProfile?.name || 'Kruthika'}
            isOpen={isAvatarViewOpen}
            onClose={() => setIsAvatarViewOpen(false)}
            trigger={
              <button
                onClick={handleAvatarClick}
                className="flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors"
              >
                <div className="relative">
                  <img
                    src={aiProfile?.avatarUrl || '/default-avatar.png'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">{aiProfile?.name || 'Kruthika'}</h3>
                  <p className="text-xs text-green-200">online</p>
                </div>
              </button>
            }
          />
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;