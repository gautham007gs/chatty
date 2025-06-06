
"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface SimulatedAdPlaceholderProps {
  type: 'interstitial'; // Banner type is no longer used by this component directly
  onClose?: () => void;
  message?: string;
  duration?: number; // Optional duration for auto-close
}

const SimulatedAdPlaceholder: React.FC<SimulatedAdPlaceholderProps> = ({ type, onClose, message, duration = 3000 }) => {
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (duration && onClose) {
      timer = setTimeout(() => {
        onClose();
      }, duration);
    }
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // This component is now ONLY for brief interstitial messages on the main page.
  // The actual Adsterra ad is opened via window.open().
  if (type === 'interstitial') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="relative bg-card p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xs text-card-foreground text-center">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-1 right-1 text-muted-foreground hover:text-foreground h-7 w-7"
              aria-label="Close message"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <p className="text-sm text-foreground mt-2">
            {message || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return null; // Should not be called with other types now
};

export default SimulatedAdPlaceholder;
