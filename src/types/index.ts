
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: MessageStatus;
  aiImageUrl?: string;
  userImageUrl?: string;
  audioUrl?: string;
}

export interface AIProfile {
  name: string;
  avatarUrl: string;
  status: string; // Main status line for ChatHeader
  statusStoryText?: string; // Text for the Status Page story
  statusStoryImageUrl?: string; // Image URL for the Status Page story
  statusStoryHasUpdate?: boolean; // Ring indicator for new story on Status Page
}

export interface AvatarOption {
  id: string;
  url: string;
  aiHint: string;
}

export interface AdminStatusDisplay {
  id: string;
  name: string;
  avatarUrl: string;
  statusText: string;
  statusImageUrl?: string;
  hasUpdate: boolean;
}

export interface ManagedContactStatus {
  id: string;
  name: string;
  avatarUrl: string;
  statusText: string;
  hasUpdate: boolean;
  dataAiHint?: string;
  statusImageUrl?: string;
}

export interface AdSettings {
  adsEnabledGlobally: boolean;
  
  adsterraDirectLink: string;
  adsterraDirectLinkEnabled: boolean;
  adsterraBannerCode: string;
  adsterraBannerEnabled: boolean;
  adsterraNativeBannerCode: string; 
  adsterraNativeBannerEnabled: boolean; 
  adsterraSocialBarCode: string; 
  adsterraSocialBarEnabled: boolean; 
  adsterraPopunderCode: string;
  adsterraPopunderEnabled: boolean;

  monetagDirectLink: string;
  monetagDirectLinkEnabled: boolean;
  monetagBannerCode: string;
  monetagBannerEnabled: boolean;
  monetagNativeBannerCode: string; 
  monetagNativeBannerEnabled: boolean; 
  monetagSocialBarCode: string; 
  monetagSocialBarEnabled: boolean; 
  monetagPopunderCode: string;
  monetagPopunderEnabled: boolean;

  // New fields for controlling ad frequency
  maxDirectLinkAdsPerDay: number;
  maxDirectLinkAdsPerSession: number;
}

export interface AIMediaAsset {
  id: string; 
  type: 'image' | 'audio';
  url: string; // Full public URL for images, or path like '/media/sound.mp3' for audio
  description?: string; // Optional description for admin reference
}
export interface AIMediaAssetsConfig {
  assets: AIMediaAsset[];
}

// Key for storing AdSettings in Supabase app_configurations table
export const AD_SETTINGS_CONFIG_KEY = 'ad_settings_kruthika_chat_v1';
// Key for storing AIProfile in Supabase app_configurations table
export const AI_PROFILE_CONFIG_KEY = 'ai_profile_kruthika_chat_v1';
// Key for storing Admin's own status in Supabase app_configurations table
export const ADMIN_OWN_STATUS_CONFIG_KEY = 'admin_own_status_config_v1';
// Key for storing Managed Demo Contacts in Supabase app_configurations table
export const MANAGED_DEMO_CONTACTS_CONFIG_KEY = 'managed_demo_contacts_config_v1';
// Key for storing AI's sharable media assets in Supabase app_configurations table
export const AI_MEDIA_ASSETS_CONFIG_KEY = 'ai_media_assets_config_v1';
