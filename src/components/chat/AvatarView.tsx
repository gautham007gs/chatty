
"use client";

import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';

interface AvatarViewProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string;
  name: string;
  status?: string;
}

const AvatarView: React.FC<AvatarViewProps> = ({
  isOpen,
  onClose,
  avatarUrl,
  name,
  status
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-black border-none">
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="p-6 text-center">
            <div className="mb-4">
              <Image
                src={avatarUrl}
                alt={name}
                width={300}
                height={300}
                className="rounded-full mx-auto border-4 border-white/20"
                data-ai-hint="profile woman"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/300x300.png/CCCCCC/FFFFFF?text=Avatar';
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{name}</h2>
            {status && (
              <p className="text-white/80 text-sm">{status}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarView;
