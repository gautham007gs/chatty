
"use client";

import React, { useState, useEffect, useRef } from 'react'; 
import Image from 'next/image';
import AppHeader from '@/components/AppHeader';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, X as XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { AdminStatusDisplay, ManagedContactStatus, AdSettings, AIProfile } from '@/types';
import { defaultAIProfile, defaultAdminStatusDisplay, defaultManagedContactStatuses } from '@/config/ai';
import { tryShowRotatedAd } from '@/app/maya-chat/page'; 
import { useAIProfile } from '@/contexts/AIProfileContext';
import { useGlobalStatus } from '@/contexts/GlobalStatusContext'; 
import { useAdSettings } from '@/contexts/AdSettingsContext'; 
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"; 

const STATUS_VIEW_AD_DELAY_MS = 3000; 

const StatusPage: React.FC = () => {
  const { aiProfile: globalAIProfile, isLoadingAIProfile } = useAIProfile();
  const { adminOwnStatus: globalAdminOwnStatus, managedDemoContacts: globalManagedDemoContacts, isLoadingGlobalStatuses } = useGlobalStatus();
  const { adSettings, isLoadingAdSettings } = useAdSettings(); 
  const { toast } = useToast();

  const StatusItemDisplay: React.FC<{ 
    statusKey: string;
    displayName: string; 
    rawAvatarUrl: string; 
    statusText: string; 
    hasUpdateRing: boolean; 
    storyImageUrl?: string; 
    dataAiHint?: string;
    isMyStatusStyle?: boolean;
    isKruthikaProfile?: boolean;
  }> = ({ statusKey, displayName, rawAvatarUrl, statusText, hasUpdateRing, storyImageUrl, dataAiHint, isMyStatusStyle, isKruthikaProfile }) => {
    const [showStoryImageViewer, setShowStoryImageViewer] = useState(false);
    const storyViewTimerRef = useRef<NodeJS.Timeout | null>(null);
    const storyViewedLongEnoughRef = useRef(false);

    let avatarUrlToUse = rawAvatarUrl;
    if (!avatarUrlToUse || typeof avatarUrlToUse !== 'string' || avatarUrlToUse.trim() === '' || (!avatarUrlToUse.startsWith('http') && !avatarUrlToUse.startsWith('data:'))) {
      avatarUrlToUse = defaultAIProfile.avatarUrl;
    }
    
    // if (isKruthikaProfile) {
      // console.log(`[StatusItemDisplay-Kruthika] Final avatarUrlToUse for list/dialog avatar: ${avatarUrlToUse}`);
    // }

    let isValidStoryImageSrc = false;
    if (storyImageUrl && typeof storyImageUrl === 'string' && storyImageUrl.trim() !== '') {
      try {
        if (storyImageUrl.startsWith('data:image')) {
          isValidStoryImageSrc = true;
        } else {
          new URL(storyImageUrl); 
          isValidStoryImageSrc = true;
        }
      } catch (e) {
        isValidStoryImageSrc = false;
      }
    }

    const handleItemClick = () => {
      if (isValidStoryImageSrc && storyImageUrl) {
        setShowStoryImageViewer(true);
        storyViewedLongEnoughRef.current = false; 
        if (storyViewTimerRef.current) clearTimeout(storyViewTimerRef.current);
        storyViewTimerRef.current = setTimeout(() => {
          storyViewedLongEnoughRef.current = true; 
        }, STATUS_VIEW_AD_DELAY_MS);
      } else if (storyImageUrl) { 
        console.warn(`[StatusItemDisplay-${displayName}] Not opening story image viewer due to invalid/empty URL: ${storyImageUrl}`);
      }
    };

    const handleCloseStoryViewer = () => {
      setShowStoryImageViewer(false);
      if (storyViewTimerRef.current) clearTimeout(storyViewTimerRef.current);
      
      if (storyImageUrl && storyViewedLongEnoughRef.current && adSettings && adSettings.adsEnabledGlobally) { 
        tryShowRotatedAd(adSettings); 
      }
      storyViewedLongEnoughRef.current = false; 
    };

    const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>, context: string) => {
      console.error(`StatusItemDisplay - ${context} AvatarImage load error for ${displayName}. URL: ${avatarUrlToUse}`, e);
    };
    
    const handleStoryImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      console.error(`StatusItemDisplay - Story Image load error for ${displayName}. URL: ${storyImageUrl}`, e);
      toast({
        title: "Image Load Failed",
        description: `Could not load story image for ${displayName}. The image might be unavailable or the URL incorrect.`,
        variant: "destructive",
        duration: 4000,
      });
      // Keep dialog open to show the error, user can close manually if needed.
    };

    return (
    <React.Fragment key={`${statusKey}-${avatarUrlToUse || 'no_avatar_frag'}`}>
      <div 
        className="flex items-center p-3 hover:bg-secondary/50 cursor-pointer border-b border-border transition-colors group" 
        onClick={handleItemClick}
      >
        <div className="relative">
          <Avatar 
            className={cn(
                'h-12 w-12', 
                hasUpdateRing ? 'ring-2 ring-primary p-0.5' : (isMyStatusStyle && !hasUpdateRing ? 'ring-2 ring-muted/50 p-0.5' : '')
            )}
            key={`status-avatar-comp-${statusKey}-${avatarUrlToUse || 'default_avatar_comp_key_sp'}`}
          >
            <AvatarImage 
                src={avatarUrlToUse || undefined} 
                alt={displayName} 
                data-ai-hint={dataAiHint || "profile person"} 
                className="object-cover" 
                key={`${statusKey}-avatar-img-${avatarUrlToUse || 'no_avatar_fallback_img_sp'}`}
                onError={(e) => handleAvatarError(e, "List")}
            />
            <AvatarFallback>{(displayName || "S").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {isMyStatusStyle && !hasUpdateRing && !storyImageUrl && (
             <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-background">
              <PlusCircle size={16} />
            </div>
          )}
        </div>
        <div className="ml-4 flex-grow overflow-hidden">
          <h2 className="font-semibold text-md truncate">{displayName}</h2>
          <p className="text-sm text-muted-foreground truncate">{statusText}</p>
        </div>
      </div>

      {isValidStoryImageSrc && storyImageUrl && (
         <Dialog open={showStoryImageViewer} onOpenChange={(open) => {
            if (!open) {
                handleCloseStoryViewer(); 
            } else {
                setShowStoryImageViewer(true);
                 if (storyViewTimerRef.current) clearTimeout(storyViewTimerRef.current);
                storyViewedLongEnoughRef.current = false; 
                storyViewTimerRef.current = setTimeout(() => {
                    storyViewedLongEnoughRef.current = true;
                }, STATUS_VIEW_AD_DELAY_MS);
            }
        }}>
          <DialogContent 
            className="!fixed !inset-0 !z-[60] flex !w-screen !h-screen flex-col !bg-black !p-0 !border-0 !shadow-2xl !outline-none !rounded-none !max-w-none !translate-x-0 !translate-y-0"
          >
            <div className="absolute top-0 left-0 right-0 z-20 p-3 flex items-center justify-between bg-gradient-to-b from-black/70 via-black/30 to-transparent">
                <div className="flex items-center gap-3">
                    <Avatar 
                        className="h-9 w-9 border-2 border-white/50" 
                        key={`status-dialog-avatar-comp-${statusKey}-${avatarUrlToUse || 'default_avatar_dialog_comp_key_sp'}`}
                    >
                        <AvatarImage 
                            src={avatarUrlToUse || undefined} 
                            alt={displayName} 
                            key={`${statusKey}-dialog-avatar-img-${avatarUrlToUse || 'no_avatar_fallback_dialog_img_sp'}`} 
                            onError={(e) => handleAvatarError(e, "Dialog")}
                        />
                        <AvatarFallback>{(displayName || "S").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <DialogTitle className="text-white text-sm font-semibold">{displayName}</DialogTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCloseStoryViewer} className="text-white hover:bg-white/10">
                    <XIcon size={24} />
                </Button>
            </div>

            <div className="relative flex-grow w-full flex items-center justify-center overflow-hidden">
                <Image 
                    src={storyImageUrl} 
                    alt={`${displayName}'s story`} 
                    fill={true}
                    style={{ objectFit: 'contain' }}
                    data-ai-hint="story image content large"
                    quality={100}
                    unoptimized={true} 
                    sizes="100vw"
                    key={`${statusKey}-story-image-${storyImageUrl}`}
                    onError={handleStoryImageError}
                />
            </div>

             {statusText && !statusText.toLowerCase().includes("tap to add") && !statusText.toLowerCase().includes("no story update") && (
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                    <p className="text-white text-center text-sm drop-shadow-md">{statusText}</p>
                </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </React.Fragment>
    );
  };

  const effectiveAIProfile = globalAIProfile || defaultAIProfile;
  const displayAdminOwnStatus = globalAdminOwnStatus || defaultAdminStatusDisplay;
  const displayManagedDemoContacts = globalManagedDemoContacts || defaultManagedContactStatuses;

  // if (globalAIProfile) {
    // console.log("[StatusPage] Using AIProfile from context:", JSON.stringify(globalAIProfile, null, 2));
  // } else if (!isLoadingAIProfile) {
    // console.log("[StatusPage] AIProfile from context is null (and not loading), using defaultAIProfile:", JSON.stringify(defaultAIProfile, null, 2));
  // }
  // console.log("[StatusPage] Effective AI Profile for render:", JSON.stringify(effectiveAIProfile, null, 2));


  if (isLoadingAIProfile || isLoadingGlobalStatuses || isLoadingAdSettings) { 
     return (
      <div className="flex flex-col h-screen max-w-3xl mx-auto bg-background shadow-2xl">
        <AppHeader title="Status" />
        <div className="flex-grow flex items-center justify-center text-muted-foreground">Loading statuses...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-background shadow-2xl">
      <AppHeader title="Status" />
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <StatusItemDisplay
            statusKey="admin-own-status-item"
            displayName={displayAdminOwnStatus.name}
            rawAvatarUrl={displayAdminOwnStatus.avatarUrl}
            statusText={displayAdminOwnStatus.statusText}
            hasUpdateRing={displayAdminOwnStatus.hasUpdate}
            storyImageUrl={displayAdminOwnStatus.statusImageUrl}
            dataAiHint="profile self admin"
            isMyStatusStyle={true}
            isKruthikaProfile={false}
        />
        
        <div className="p-2 px-4 text-sm font-medium text-muted-foreground bg-secondary/30">RECENT UPDATES</div>
        
        {(effectiveAIProfile.statusStoryHasUpdate || (effectiveAIProfile.statusStoryText && effectiveAIProfile.statusStoryText !== defaultAIProfile.statusStoryText) || effectiveAIProfile.statusStoryImageUrl) && (
            <StatusItemDisplay
                statusKey="kruthika-status-story-item"
                displayName={effectiveAIProfile.name}
                rawAvatarUrl={effectiveAIProfile.avatarUrl} 
                statusText={effectiveAIProfile.statusStoryText || "No story update."}
                hasUpdateRing={effectiveAIProfile.statusStoryHasUpdate || false}
                storyImageUrl={effectiveAIProfile.statusStoryImageUrl}
                dataAiHint="profile woman ai"
                isKruthikaProfile={true}
            />
        )}

        {displayManagedDemoContacts.map(contact => (
          (contact.hasUpdate || contact.statusImageUrl || (contact.statusText && contact.statusText !== "Tap to add status")) && 
          <StatusItemDisplay 
            key={contact.id}
            statusKey={contact.id} 
            displayName={contact.name}
            rawAvatarUrl={contact.avatarUrl}
            statusText={contact.statusText}
            hasUpdateRing={contact.hasUpdate}
            storyImageUrl={contact.statusImageUrl}
            dataAiHint={contact.dataAiHint}
            isKruthikaProfile={false}
          />
        ))}

      </div>
      <div className="p-4 border-t border-border flex justify-end">
        <Button variant="default" size="lg" className="rounded-full p-4 shadow-lg" onClick={() => alert("Camera access for status - not implemented")}>
          <Camera size={24} />
        </Button>
      </div>
    </div>
  );
};

export default StatusPage;
