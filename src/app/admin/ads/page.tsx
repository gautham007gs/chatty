
"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { useAdSettings } from '@/contexts/AdSettingsContext';
import { supabase } from '@/lib/supabaseClient';
import { AD_SETTINGS_CONFIG_KEY } from '@/types';
import { 
  Megaphone, 
  Save, 
  TrendingUp, 
  ExternalLink, 
  LinkIcon, 
  RotateCcw,
  Info,
  Loader2
} from 'lucide-react';

const DEFAULT_ADSTERRA_DIRECT_LINK = "https://www.adsterra.network/referral/default";
const DEFAULT_MONETAG_DIRECT_LINK = "https://www.monetag.com/referral/default";

const AdManagementPage: React.FC = () => {
  const { adSettings, isLoadingAdSettings, fetchAdSettings } = useAdSettings();
  const [localAdSettings, setLocalAdSettings] = useState(adSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (adSettings) {
      setLocalAdSettings(adSettings);
    }
  }, [adSettings]);

  const handleAdSettingChange = (key: string, value: any) => {
    if (!localAdSettings) return;
    setLocalAdSettings({
      ...localAdSettings,
      [key]: value
    });
  };

  const handleResetDirectLink = (network: 'adsterra' | 'monetag') => {
    if (!localAdSettings) return;
    
    const defaultLink = network === 'adsterra' ? DEFAULT_ADSTERRA_DIRECT_LINK : DEFAULT_MONETAG_DIRECT_LINK;
    const linkKey = network === 'adsterra' ? 'adsterraDirectLink' : 'monetagDirectLink';
    
    handleAdSettingChange(linkKey, defaultLink);
    toast({
      title: "Link Reset",
      description: `${network.charAt(0).toUpperCase() + network.slice(1)} direct link reset to default.`,
    });
  };

  const handleSaveAdSettings = async () => {
    if (!localAdSettings || !supabase) {
      toast({
        title: "Error",
        description: "Unable to save settings. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('app_configurations')
        .upsert({
          id: AD_SETTINGS_CONFIG_KEY,
          settings: localAdSettings,
        });

      if (error) {
        console.error('Error saving ad settings:', error);
        toast({
          title: "Error",
          description: "Failed to save ad settings. Please try again.",
          variant: "destructive",
        });
      } else {
        await fetchAdSettings(); // Refresh the context
        toast({
          title: "Success",
          description: "Ad settings saved successfully!",
        });
      }
    } catch (e) {
      console.error('Unexpected error saving ad settings:', e);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingAdSettings || !localAdSettings) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const scriptPasteInstruction = "Paste the complete script code from your ad network dashboard";

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Global Ads</p>
                  <p className="text-2xl font-bold">{localAdSettings.adsEnabledGlobally ? 'ON' : 'OFF'}</p>
                </div>
                <Megaphone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Adsterra</p>
                  <p className="text-2xl font-bold">{localAdSettings.adsterraDirectLinkEnabled ? 'ON' : 'OFF'}</p>
                </div>
                <ExternalLink className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monetag</p>
                  <p className="text-2xl font-bold">{localAdSettings.monetagDirectLinkEnabled ? 'ON' : 'OFF'}</p>
                </div>
                <LinkIcon className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Max Daily</p>
                  <p className="text-2xl font-bold">{localAdSettings.maxDirectLinkAdsPerDay}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <Megaphone className="mr-2 h-6 w-6" />
              Global Ad Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-3">
              <Switch
                id="adsEnabledGlobally"
                checked={localAdSettings.adsEnabledGlobally}
                onCheckedChange={(checked) => handleAdSettingChange('adsEnabledGlobally', checked)}
              />
              <Label htmlFor="adsEnabledGlobally" className="text-lg font-medium">
                Enable Advertisements Globally
              </Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxDirectLinkAdsPerDay" className="font-medium">Max Ads Per Day</Label>
                <Input
                  id="maxDirectLinkAdsPerDay"
                  type="number"
                  value={localAdSettings.maxDirectLinkAdsPerDay}
                  onChange={(e) => handleAdSettingChange('maxDirectLinkAdsPerDay', parseInt(e.target.value))}
                  disabled={!localAdSettings.adsEnabledGlobally}
                  min="1"
                  max="20"
                />
              </div>
              <div>
                <Label htmlFor="maxDirectLinkAdsPerSession" className="font-medium">Max Ads Per Session</Label>
                <Input
                  id="maxDirectLinkAdsPerSession"
                  type="number"
                  value={localAdSettings.maxDirectLinkAdsPerSession}
                  onChange={(e) => handleAdSettingChange('maxDirectLinkAdsPerSession', parseInt(e.target.value))}
                  disabled={!localAdSettings.adsEnabledGlobally}
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adsterra Settings */}
        <Card className="bg-secondary/10 border-border shadow-sm mb-6">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-lg font-semibold text-primary flex items-center">
              <ExternalLink className="mr-2 h-5 w-5"/>
              Adsterra Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-4 pb-4">
            {/* Direct Link */}
            <div className="border-b border-border/50 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="adsterraDirectLink" className="font-medium text-sm">Direct Link URL</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleResetDirectLink('adsterra')} 
                      disabled={!localAdSettings.adsEnabledGlobally} 
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                    >
                      <RotateCcw size={16}/>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Reset to Default Link</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input 
                id="adsterraDirectLink" 
                type="url" 
                value={localAdSettings.adsterraDirectLink} 
                onChange={(e) => handleAdSettingChange('adsterraDirectLink', e.target.value)} 
                placeholder={DEFAULT_ADSTERRA_DIRECT_LINK} 
                className="text-sm" 
                disabled={!localAdSettings.adsEnabledGlobally}
              />
              <div className="flex items-center space-x-2 pt-1">
                <Switch 
                  id="adsterraDirectLinkEnabled" 
                  checked={localAdSettings.adsterraDirectLinkEnabled} 
                  onCheckedChange={(checked) => handleAdSettingChange('adsterraDirectLinkEnabled', checked)} 
                  disabled={!localAdSettings.adsEnabledGlobally}
                />
                <Label htmlFor="adsterraDirectLinkEnabled" className="text-sm font-medium">Enable Adsterra Direct Link</Label>
              </div>
            </div>

            {/* Banner Ad */}
            <div className="border-b border-border/50 pb-4 space-y-2">
              <Label htmlFor="adsterraBannerCode" className="font-medium text-sm">Banner Ad Code</Label>
              <Textarea 
                id="adsterraBannerCode" 
                value={localAdSettings.adsterraBannerCode} 
                onChange={(e) => handleAdSettingChange('adsterraBannerCode', e.target.value)} 
                placeholder="<!-- Adsterra Banner Code -->" 
                className="min-h-[100px] font-mono text-xs" 
                disabled={!localAdSettings.adsEnabledGlobally}
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Info size={13} className="mr-1 shrink-0"/>
                {scriptPasteInstruction}
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <Switch 
                  id="adsterraBannerEnabled" 
                  checked={localAdSettings.adsterraBannerEnabled} 
                  onCheckedChange={(checked) => handleAdSettingChange('adsterraBannerEnabled', checked)} 
                  disabled={!localAdSettings.adsEnabledGlobally}
                />
                <Label htmlFor="adsterraBannerEnabled" className="text-sm font-medium">Enable Adsterra Banner Ad</Label>
              </div>
            </div>

            {/* Native Banner */}
            <div className="border-b border-border/50 pb-4 space-y-2">
              <Label htmlFor="adsterraNativeBannerCode" className="font-medium text-sm">Native Banner Code</Label>
              <Textarea 
                id="adsterraNativeBannerCode" 
                value={localAdSettings.adsterraNativeBannerCode} 
                onChange={(e) => handleAdSettingChange('adsterraNativeBannerCode', e.target.value)} 
                placeholder="<!-- Adsterra Native Banner Code -->" 
                className="min-h-[100px] font-mono text-xs" 
                disabled={!localAdSettings.adsEnabledGlobally}
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Info size={13} className="mr-1 shrink-0"/>
                {scriptPasteInstruction}
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <Switch 
                  id="adsterraNativeBannerEnabled" 
                  checked={localAdSettings.adsterraNativeBannerEnabled} 
                  onCheckedChange={(checked) => handleAdSettingChange('adsterraNativeBannerEnabled', checked)} 
                  disabled={!localAdSettings.adsEnabledGlobally}
                />
                <Label htmlFor="adsterraNativeBannerEnabled" className="text-sm font-medium">Enable Adsterra Native Banner</Label>
              </div>
            </div>

            {/* Social Bar */}
            <div className="border-b border-border/50 pb-4 space-y-2">
              <Label htmlFor="adsterraSocialBarCode" className="font-medium text-sm">Social Bar Code</Label>
              <Textarea 
                id="adsterraSocialBarCode" 
                value={localAdSettings.adsterraSocialBarCode} 
                onChange={(e) => handleAdSettingChange('adsterraSocialBarCode', e.target.value)} 
                placeholder="<!-- Adsterra Social Bar Code -->" 
                className="min-h-[100px] font-mono text-xs" 
                disabled={!localAdSettings.adsEnabledGlobally}
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Info size={13} className="mr-1 shrink-0"/>
                {scriptPasteInstruction}
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <Switch 
                  id="adsterraSocialBarEnabled" 
                  checked={localAdSettings.adsterraSocialBarEnabled} 
                  onCheckedChange={(checked) => handleAdSettingChange('adsterraSocialBarEnabled', checked)} 
                  disabled={!localAdSettings.adsEnabledGlobally}
                />
                <Label htmlFor="adsterraSocialBarEnabled" className="text-sm font-medium">Enable Adsterra Social Bar</Label>
              </div>
            </div>

            {/* Pop-under */}
            <div className="space-y-2">
              <Label htmlFor="adsterraPopunderCode" className="font-medium text-sm">Pop-under Script Code</Label>
              <Textarea 
                id="adsterraPopunderCode" 
                value={localAdSettings.adsterraPopunderCode} 
                onChange={(e) => handleAdSettingChange('adsterraPopunderCode', e.target.value)} 
                placeholder="<!-- Adsterra Pop-under Script -->" 
                className="min-h-[100px] font-mono text-xs" 
                disabled={!localAdSettings.adsEnabledGlobally}
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Info size={13} className="mr-1 shrink-0"/>
                {scriptPasteInstruction}
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <Switch 
                  id="adsterraPopunderEnabled" 
                  checked={localAdSettings.adsterraPopunderEnabled} 
                  onCheckedChange={(checked) => handleAdSettingChange('adsterraPopunderEnabled', checked)} 
                  disabled={!localAdSettings.adsEnabledGlobally}
                />
                <Label htmlFor="adsterraPopunderEnabled" className="text-sm font-medium">Enable Adsterra Pop-under</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monetag Settings */}
        <Card className="bg-secondary/10 border-border shadow-sm mb-6">
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-lg font-semibold text-primary flex items-center">
              <LinkIcon className="mr-2 h-5 w-5"/>
              Monetag Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-4 pb-4">
            {/* Direct Link */}
            <div className="border-b border-border/50 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="monetagDirectLink" className="font-medium text-sm">Direct Link URL</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleResetDirectLink('monetag')} 
                      disabled={!localAdSettings.adsEnabledGlobally} 
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                    >
                      <RotateCcw size={16}/>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Reset to Default Link</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input 
                id="monetagDirectLink" 
                type="url" 
                value={localAdSettings.monetagDirectLink} 
                onChange={(e) => handleAdSettingChange('monetagDirectLink', e.target.value)} 
                placeholder={DEFAULT_MONETAG_DIRECT_LINK} 
                className="text-sm" 
                disabled={!localAdSettings.adsEnabledGlobally}
              />
              <div className="flex items-center space-x-2 pt-1">
                <Switch 
                  id="monetagDirectLinkEnabled" 
                  checked={localAdSettings.monetagDirectLinkEnabled} 
                  onCheckedChange={(checked) => handleAdSettingChange('monetagDirectLinkEnabled', checked)} 
                  disabled={!localAdSettings.adsEnabledGlobally}
                />
                <Label htmlFor="monetagDirectLinkEnabled" className="text-sm font-medium">Enable Monetag Direct Link</Label>
              </div>
            </div>

            {/* Banner Ad */}
            <div className="border-b border-border/50 pb-4 space-y-2">
              <Label htmlFor="monetagBannerCode" className="font-medium text-sm">Banner Ad Code</Label>
              <Textarea 
                id="monetagBannerCode" 
                value={localAdSettings.monetagBannerCode} 
                onChange={(e) => handleAdSettingChange('monetagBannerCode', e.target.value)} 
                placeholder="<!-- Monetag Banner Code -->" 
                className="min-h-[100px] font-mono text-xs" 
                disabled={!localAdSettings.adsEnabledGlobally}
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Info size={13} className="mr-1 shrink-0"/>
                {scriptPasteInstruction}
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <Switch 
                  id="monetagBannerEnabled" 
                  checked={localAdSettings.monetagBannerEnabled} 
                  onCheckedChange={(checked) => handleAdSettingChange('monetagBannerEnabled', checked)} 
                  disabled={!localAdSettings.adsEnabledGlobally}
                />
                <Label htmlFor="monetagBannerEnabled" className="text-sm font-medium">Enable Monetag Banner Ad</Label>
              </div>
            </div>

            {/* Native Banner */}
            <div className="border-b border-border/50 pb-4 space-y-2">
              <Label htmlFor="monetagNativeBannerCode" className="font-medium text-sm">Native Banner Code</Label>
              <Textarea 
                id="monetagNativeBannerCode" 
                value={localAdSettings.monetagNativeBannerCode} 
                onChange={(e) => handleAdSettingChange('monetagNativeBannerCode', e.target.value)} 
                placeholder="<!-- Monetag Native Banner Code -->" 
                className="min-h-[100px] font-mono text-xs" 
                disabled={!localAdSettings.adsEnabledGlobally}
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Info size={13} className="mr-1 shrink-0"/>
                {scriptPasteInstruction}
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <Switch 
                  id="monetagNativeBannerEnabled" 
                  checked={localAdSettings.monetagNativeBannerEnabled} 
                  onCheckedChange={(checked) => handleAdSettingChange('monetagNativeBannerEnabled', checked)} 
                  disabled={!localAdSettings.adsEnabledGlobally}
                />
                <Label htmlFor="monetagNativeBannerEnabled" className="text-sm font-medium">Enable Monetag Native Banner</Label>
              </div>
            </div>

            {/* Social Bar */}
            <div className="border-b border-border/50 pb-4 space-y-2">
              <Label htmlFor="monetagSocialBarCode" className="font-medium text-sm">Social Bar Code</Label>
              <Textarea 
                id="monetagSocialBarCode" 
                value={localAdSettings.monetagSocialBarCode} 
                onChange={(e) => handleAdSettingChange('monetagSocialBarCode', e.target.value)} 
                placeholder="<!-- Monetag Social Bar Code -->" 
                className="min-h-[100px] font-mono text-xs" 
                disabled={!localAdSettings.adsEnabledGlobally}
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Info size={13} className="mr-1 shrink-0"/>
                {scriptPasteInstruction}
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <Switch 
                  id="monetagSocialBarEnabled" 
                  checked={localAdSettings.monetagSocialBarEnabled} 
                  onCheckedChange={(checked) => handleAdSettingChange('monetagSocialBarEnabled', checked)} 
                  disabled={!localAdSettings.adsEnabledGlobally}
                />
                <Label htmlFor="monetagSocialBarEnabled" className="text-sm font-medium">Enable Monetag Social Bar</Label>
              </div>
            </div>

            {/* Pop-under */}
            <div className="space-y-2">
              <Label htmlFor="monetagPopunderCode" className="font-medium text-sm">Pop-under Script Code</Label>
              <Textarea 
                id="monetagPopunderCode" 
                value={localAdSettings.monetagPopunderCode} 
                onChange={(e) => handleAdSettingChange('monetagPopunderCode', e.target.value)} 
                placeholder="<!-- Monetag Pop-under Script -->" 
                className="min-h-[100px] font-mono text-xs" 
                disabled={!localAdSettings.adsEnabledGlobally}
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Info size={13} className="mr-1 shrink-0"/>
                {scriptPasteInstruction}
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <Switch 
                  id="monetagPopunderEnabled" 
                  checked={localAdSettings.monetagPopunderEnabled} 
                  onCheckedChange={(checked) => handleAdSettingChange('monetagPopunderEnabled', checked)} 
                  disabled={!localAdSettings.adsEnabledGlobally}
                />
                <Label htmlFor="monetagPopunderEnabled" className="text-sm font-medium">Enable Monetag Pop-under</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Save Settings</h3>
                <p className="text-sm text-gray-600">Apply all changes to your ad configuration</p>
              </div>
              <Button 
                onClick={handleSaveAdSettings}
                disabled={isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdManagementPage;
