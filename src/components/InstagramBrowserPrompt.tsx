
"use client";

import React, { useState, useEffect } from 'react';
import { isRunningInInstagramApp } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Smartphone, Copy, ExternalLink, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const INSTA_PROMPT_DISMISSED_KEY = 'instagramPromptDismissed_v2'; // Use a new key to reset for users

const InstagramBrowserPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This prompt is a fallback. The middleware attempts a more direct redirect first.
    // If, after the middleware's attempt (or if middleware didn't run for this path),
    // the user is still in the Instagram browser and hasn't dismissed this specific prompt, show it.
    if (isRunningInInstagramApp()) {
      if (!sessionStorage.getItem(INSTA_PROMPT_DISMISSED_KEY)) {
        setShowPrompt(true);
      }
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "You can now paste it into your main browser.",
      });
    } catch (err) {
      toast({
        title: "Failed to Copy",
        description: "Please copy the link from the address bar manually.",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem(INSTA_PROMPT_DISMISSED_KEY, 'true');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[101] p-2 sm:p-4 w-full flex justify-center">
      <Alert variant="default" className="bg-background border-primary/30 shadow-lg max-w-2xl w-full">
        <div className="flex items-start">
          <Smartphone className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-1" />
          <div className="flex-grow">
            <AlertTitle className="font-semibold text-primary">View in Your Main Browser?</AlertTitle>
            <AlertDescription className="text-sm text-foreground/90 mt-1">
              For the best experience with all features, we recommend opening this in your phone's main web browser (like Chrome or Safari).
              <br />
              <strong>How?</strong> Tap the menu (often <strong>●●●</strong>) in this browser & choose 'Open in Browser'.
            </AlertDescription>
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <Button onClick={handleCopyLink} size="sm" variant="outline">
                <Copy className="mr-2 h-4 w-4" /> Copy Link
              </Button>
               <Button 
                onClick={() => window.open(window.location.href, '_blank')} 
                size="sm" 
                variant="outline"
                title="This might open a new tab within Instagram's browser or your main browser, depending on settings."
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Try Open Externally
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDismiss} className="ml-2 h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default InstagramBrowserPrompt;
