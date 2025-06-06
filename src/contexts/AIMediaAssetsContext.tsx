
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { AIMediaAssetsConfig } from '@/types';
import { AI_MEDIA_ASSETS_CONFIG_KEY } from '@/types';
import { defaultAIMediaAssetsConfig } from '@/config/ai';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface AIMediaAssetsContextType {
  mediaAssetsConfig: AIMediaAssetsConfig | null;
  isLoadingMediaAssets: boolean;
  fetchMediaAssets: () => Promise<void>;
}

const AIMediaAssetsContext = createContext<AIMediaAssetsContextType | undefined>(undefined);

export const AIMediaAssetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mediaAssetsConfig, setMediaAssetsConfig] = useState<AIMediaAssetsConfig | null>(null);
  const [isLoadingMediaAssets, setIsLoadingMediaAssets] = useState(true);
  const { toast } = useToast();

  const fetchMediaAssets = useCallback(async () => {
    setIsLoadingMediaAssets(true);
    if (!supabase) {
      console.warn("Supabase client not available for fetching AI media assets. Using defaults.");
      setMediaAssetsConfig(defaultAIMediaAssetsConfig);
      setIsLoadingMediaAssets(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('app_configurations')
        .select('settings')
        .eq('id', AI_MEDIA_ASSETS_CONFIG_KEY)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        console.error('Error fetching AI media assets from Supabase:', error);
        toast({ title: "Error Loading AI Media", description: `Could not load AI's sharable media. Using defaults. ${error.message}`, variant: "destructive" });
        setMediaAssetsConfig(defaultAIMediaAssetsConfig);
      } else if (data && data.settings && Array.isArray((data.settings as AIMediaAssetsConfig).assets)) {
        setMediaAssetsConfig(data.settings as AIMediaAssetsConfig);
      } else {
        setMediaAssetsConfig(defaultAIMediaAssetsConfig);
      }
    } catch (e: any) {
      console.error('Unexpected error fetching AI media assets:', e);
      toast({ title: "Error Loading AI Media", description: `Unexpected error. Using defaults. ${e.message}`, variant: "destructive" });
      setMediaAssetsConfig(defaultAIMediaAssetsConfig);
    } finally {
      setIsLoadingMediaAssets(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMediaAssets();
  }, [fetchMediaAssets]);

  return (
    <AIMediaAssetsContext.Provider value={{ mediaAssetsConfig, isLoadingMediaAssets, fetchMediaAssets }}>
      {children}
    </AIMediaAssetsContext.Provider>
  );
};

export const useAIMediaAssets = (): AIMediaAssetsContextType => {
  const context = useContext(AIMediaAssetsContext);
  if (context === undefined) {
    throw new Error('useAIMediaAssets must be used within an AIMediaAssetsProvider');
  }
  return context;
};
