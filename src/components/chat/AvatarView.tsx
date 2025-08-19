
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface AvatarViewProps {
  avatarUrl: string;
  name: string;
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
}

const AvatarView: React.FC<AvatarViewProps> = ({ 
  avatarUrl, 
  name, 
  isOpen, 
  onClose, 
  trigger 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 bg-black border-none">
        <div className="relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4">
            <div className="flex items-center justify-between text-white">
              <h3 className="text-lg font-medium">{name}</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Avatar Image */}
          <div className="aspect-square max-h-[80vh]">
            <img
              src={avatarUrl}
              alt={`${name}'s avatar`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarView;
