"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, X as XIcon, Search, MoreVertical, ArrowLeft } from 'lucide-react';
import BannerAdDisplay from '@/components/chat/BannerAdDisplay';
import SocialBarAdDisplay from '@/components/SocialBarAdDisplay';
import GlobalAdScripts from '@/components/GlobalAdScripts';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { AdminStatusDisplay, ManagedContactStatus, AdSettings, AIProfile } from '@/types';
import { defaultAIProfile, defaultAdminStatusDisplay, defaultManagedContactStatuses } from '@/config/ai';
import { useAIProfile } from '@/contexts/AIProfileContext';
import { useGlobalStatus } from '@/contexts/GlobalStatusContext';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

const STATUS_VIEW_AD_DELAY_MS = 3000;

const StatusPage: React.FC = () => {
  const router = useRouter();
  const { aiProfile: globalAIProfile, isLoadingAIProfile } = useAIProfile();
  const { adminOwnStatus: globalAdminOwnStatus, managedDemoContacts: globalManagedDemoContacts, isLoadingGlobalStatuses } = useGlobalStatus();
  const { adSettings, isLoadingAdSettings } = useAdSettings();
  const { toast } = useToast();

  const handleBackClick = () => {
    router.push('/');
  };

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
      }
    };

    const handleCloseStoryViewer = () => {
      setShowStoryImageViewer(false);
      if (storyViewTimerRef.current) clearTimeout(storyViewTimerRef.current);
      storyViewedLongEnoughRef.current = false;
    };

    const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>, context: string) => {
      console.error(`StatusItemDisplay - ${context} AvatarImage load error for ${displayName}. URL: ${avatarUrlToUse}`, e);
    };

    const handleStoryImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      console.error(`StatusItemDisplay - Story Image load error for ${displayName}. URL: ${storyImageUrl}`, e);
      toast({
        title: "Image Load Failed",
        description: `Could not load story image for ${displayName}. The image might be unavailable.`,
        variant: "destructive",
        duration: 4000,
      });
    };

    return (
      <React.Fragment key={`${statusKey}-${avatarUrlToUse || 'no_avatar_frag'}`}>
        <div
          className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-all duration-200 group"
          onClick={handleItemClick}
        >
          <div className="relative">
            <Avatar
              className={cn(
                'h-14 w-14',
                hasUpdateRing ? 'ring-2 ring-[#25D366] p-0.5' : (isMyStatusStyle && !hasUpdateRing ? 'ring-2 ring-gray-300 p-0.5' : '')
              )}
            >
              <AvatarImage
                src={avatarUrlToUse || undefined}
                alt={displayName}
                data-ai-hint={dataAiHint || "profile person"}
                className="object-cover"
                onError={(e) => handleAvatarError(e, "List")}
              />
              <AvatarFallback className="bg-[#075E54] text-white">
                {(displayName || "S").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isMyStatusStyle && !hasUpdateRing && !storyImageUrl && (
              <div className="absolute bottom-0 right-0 bg-[#25D366] text-white rounded-full p-1 border-2 border-white">
                <PlusCircle size={14} />
              </div>
            )}
          </div>
          <div className="ml-4 flex-grow overflow-hidden">
            <h2 className="font-semibold text-gray-900 text-lg truncate">{displayName}</h2>
            <p className="text-sm text-gray-600 truncate mt-1">{statusText}</p>
            {hasUpdateRing && (
              <p className="text-xs text-gray-500 mt-1">Tap to view status</p>
            )}
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
            <DialogContent className="!fixed !inset-0 !z-[60] flex !w-screen !h-screen flex-col !bg-black !p-0 !border-0 !shadow-2xl !outline-none !rounded-none !max-w-none !translate-x-0 !translate-y-0">
              <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/70 via-black/30 to-transparent">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white/50">
                    <AvatarImage
                      src={avatarUrlToUse || undefined}
                      alt={displayName}
                      onError={(e) => handleAvatarError(e, "Dialog")}
                    />
                    <AvatarFallback className="bg-[#075E54] text-white">
                      {(displayName || "S").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <DialogTitle className="text-white text-lg font-semibold">{displayName}</DialogTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCloseStoryViewer} className="text-white hover:bg-white/10">
                  <XIcon size={24} />
                </Button>
              </div>

              <div className="relative flex-grow w-full flex items-center justify-center overflow-hidden">
                <Image
                  src={storyImageUrl}
                  alt={`${displayName}'s status`}
                  fill={true}
                  style={{ objectFit: 'contain' }}
                  data-ai-hint="status image content large"
                  quality={100}
                  unoptimized={true}
                  sizes="100vw"
                  onError={handleStoryImageError}
                />
              </div>

              {statusText && !statusText.toLowerCase().includes("tap to add") && !statusText.toLowerCase().includes("no story update") && (
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  <p className="text-white text-center text-lg drop-shadow-md">{statusText}</p>
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

  if (isLoadingAIProfile || isLoadingGlobalStatuses || isLoadingAdSettings) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg">
        <div className="bg-[#25D366] text-white p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ArrowLeft className="h-5 w-5" />
              <h1 className="text-xl font-bold">Status</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Search className="h-5 w-5" />
              <MoreVertical className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25D366] mx-auto mb-4"></div>
            <p>Loading statuses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <GlobalAdScripts />
      <SocialBarAdDisplay />

      <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-lg">
        {/* Header */}
        <div className="bg-[#25D366] text-white p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackClick}
                className="h-8 w-8 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Status</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Search className="h-5 w-5 cursor-pointer hover:text-gray-300" />
              <MoreVertical className="h-5 w-5 cursor-pointer hover:text-gray-300" />
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {/* My Status */}
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

          {/* Section Header */}
          <div className="p-3 px-4 text-sm font-medium text-gray-600 bg-gray-50 border-b border-gray-200">
            RECENT UPDATES
          </div>

          {/* Kruthika Status */}
          {(effectiveAIProfile.statusStoryHasUpdate || effectiveAIProfile.statusStoryImageUrl) && (
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

          {/* Spacer for better content flow */}
          <div className="my-3"></div>

          {/* Other Contacts */}
          {displayManagedDemoContacts.map(contact => (
            (contact.hasUpdate || contact.statusImageUrl) && (
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
            )
          ))}
        </div>

        {/* Bottom Banner Ad */}
        <div className="bg-white border-t border-gray-100">
          <BannerAdDisplay
            adType="standard"
            placementKey="status-bottom"
            className="w-full py-2"
          />
          <BannerAdDisplay
            adType="native"
            placementKey="status-middle"
            className="w-full rounded-lg p-2"
            contextual={true}
          />
        </div>

        {/* Camera Button */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <Button
            variant="default"
            size="lg"
            className="rounded-full p-4 shadow-lg bg-[#25D366] hover:bg-[#20B858]"
            onClick={() => toast({ title: "Camera", description: "Status camera feature coming soon!" })}
          >
            <Camera size={24} />
          </Button>
        </div>
      </div>
    </>
  );
};

export default StatusPage;