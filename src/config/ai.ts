
import type { AIProfile, AvatarOption, AdminStatusDisplay, ManagedContactStatus, AdSettings, AIMediaAssetsConfig } from '@/types';

// For AIProfile.avatarUrl, AvatarOption.url, and statusStoryImageUrl:
// These should be URLs to publicly hosted images.

export const defaultAIProfile: AIProfile = {
  name: 'Kruthika',
  avatarUrl: 'https://placehold.co/100x100.png/E91E63/FFFFFF?text=K',
  status: '🌸 Living my best life! Let\'s chat! 🌸',
  statusStoryText: 'Ask me anything! 💬',
  statusStoryImageUrl: undefined,
  statusStoryHasUpdate: true,
};

export const defaultAdminStatusDisplay: AdminStatusDisplay = {
  id: "admin-own-status",
  name: "My Status",
  avatarUrl: "https://placehold.co/100x100.png/757575/FFFFFF?text=A",
  statusText: "Tap to update from Admin Panel!",
  statusImageUrl: undefined,
  hasUpdate: false,
};

export const defaultManagedContactStatuses: ManagedContactStatus[] = [
  { id: "demo1", name: "Ananya ✨", avatarUrl: "https://placehold.co/100x100.png/FF9800/FFFFFF?text=A", statusText: "10 minutes ago", hasUpdate: true, dataAiHint: "profile woman", statusImageUrl: undefined },
  { id: "demo2", name: "Priya 💖", avatarUrl: "https://placehold.co/100x100.png/4CAF50/FFFFFF?text=P", statusText: "Wow, new pic! 📸", hasUpdate: true, dataAiHint: "girl fashion", statusImageUrl: "https://placehold.co/300x500.png/4CAF50/FFFFFF?text=Priya%27s+Story" },
  { id: "demo3", name: "Sneha 😊", avatarUrl: "https://placehold.co/100x100.png/03A9F4/FFFFFF?text=S", statusText: "Seen 2 hours ago", hasUpdate: false, dataAiHint: "female portrait", statusImageUrl: undefined },
];

export const DEFAULT_ADSTERRA_DIRECT_LINK = "https://judicialphilosophical.com/zd46rhxy0?key=3dad0e700ddba4c8c8ace4396dd31e8a";
export const DEFAULT_MONETAG_DIRECT_LINK = "https://otieu.com/4/9403276";

export const defaultAdSettings: AdSettings = {
  adsEnabledGlobally: true,
  
  adsterraDirectLink: DEFAULT_ADSTERRA_DIRECT_LINK,
  adsterraDirectLinkEnabled: true,
  adsterraBannerCode: "<!-- Adsterra Banner Code Placeholder: Paste full script here -->",
  adsterraBannerEnabled: false,
  adsterraNativeBannerCode: "<!-- Adsterra Native Banner Code Placeholder: Paste full script here -->",
  adsterraNativeBannerEnabled: false,
  adsterraSocialBarCode: "<!-- Adsterra Social Bar Code Placeholder: Paste full script here -->",
  adsterraSocialBarEnabled: false,
  adsterraPopunderCode: "<!-- Adsterra Pop-under Script Placeholder: Paste full script here -->",
  adsterraPopunderEnabled: false,

  monetagDirectLink: DEFAULT_MONETAG_DIRECT_LINK,
  monetagDirectLinkEnabled: true,
  monetagBannerCode: "<!-- Monetag Banner Code Placeholder: Paste full script here -->",
  monetagBannerEnabled: false,
  monetagNativeBannerCode: "<!-- Monetag Native Banner Code Placeholder: Paste full script here -->",
  monetagNativeBannerEnabled: false,
  monetagSocialBarCode: "<!-- Monetag Social Bar Code Placeholder: Paste full script here -->",
  monetagSocialBarEnabled: false,
  monetagPopunderCode: "<!-- Monetag Pop-under Script Placeholder: Paste full script here -->",
  monetagPopunderEnabled: false,

  maxDirectLinkAdsPerDay: 6, // Default based on our previous discussion
  maxDirectLinkAdsPerSession: 3, // Default based on our previous discussion
};

// Default configuration for AI's sharable media assets.
// Images: URLs must be publicly accessible.
// Audio: Place files in `public/media/` and use paths like '/media/filename.mp3'.
export const defaultAIMediaAssetsConfig: AIMediaAssetsConfig = {
  assets: [
    // { id: 'img1', type: 'image', url: 'https://placehold.co/600x400.png/FFEB3B/000000?text=My+Sunny+Selfie!', description: 'AI Selfie Example' },
    // { id: 'img2', type: 'image', url: 'https://placehold.co/600x400.png/8BC34A/FFFFFF?text=Beautiful+View!', description: 'AI Scenery Example' },
    // { id: 'audio1', type: 'audio', url: '/media/example_laugh.mp3', description: 'AI Laugh Example (place in public/media)' },
  ],
};

// This is kept for legacy avatar picker if ever re-enabled, but not used for Kruthika's profile avatar anymore.
export const availableAvatars: AvatarOption[] = [
  { id: 'avatar1', url: 'https://placehold.co/100x100.png/FFC107/000000?text=K1', aiHint: 'woman illustration' },
  { id: 'avatar2', url: 'https://placehold.co/100x100.png/4CAF50/FFFFFF?text=K2', aiHint: 'girl avatar' },
  { id: 'avatar3', url: 'https://placehold.co/100x100.png/2196F3/FFFFFF?text=K3', aiHint: 'female icon' },
  { id: 'avatar4', url: 'https://placehold.co/100x100.png/9C27B0/FFFFFF?text=K4', aiHint: 'woman face' },
  { id: 'avatar5', url: 'https://placehold.co/100x100.png/795548/FFFFFF?text=K5', aiHint: 'person silhouette' },
];
