
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProfileEditor from '@/components/chat/ProfileEditor';
import type { AIProfile, AdminStatusDisplay, ManagedContactStatus, AdSettings, AIMediaAssetsConfig, AIMediaAsset } from '@/types';
import { AD_SETTINGS_CONFIG_KEY, AI_PROFILE_CONFIG_KEY, ADMIN_OWN_STATUS_CONFIG_KEY, MANAGED_DEMO_CONTACTS_CONFIG_KEY, AI_MEDIA_ASSETS_CONFIG_KEY } from '@/types';
import { defaultAIProfile, defaultAdminStatusDisplay, availableAvatars, defaultManagedContactStatuses, defaultAdSettings, DEFAULT_ADSTERRA_DIRECT_LINK, DEFAULT_MONETAG_DIRECT_LINK, defaultAIMediaAssetsConfig } from '@/config/ai';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from '@/components/ui/badge';
import { Terminal, Database, Users, MessageSquare, LogOut, LinkIcon, Settings, ExternalLink, Palette, Info, UserCircle, Globe, ImagePlus, Music2, Trash2, PlusCircle, Edit3, Sparkles, BarChartHorizontalBig, Edit, FileText, RefreshCcw, RotateCcw, Newspaper, LayoutPanelLeft, TrendingUp, ShieldAlert, Check } from "lucide-react"
import CacheManagement from '@/components/admin/CacheManagement';
import PerformanceMonitor from '@/components/admin/PerformanceMonitor';
import { supabase } from '@/lib/supabaseClient';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIProfile, setExternalIsLoadingAIProfile } from '@/contexts/AIProfileContext';
import { useGlobalStatus } from '@/contexts/GlobalStatusContext';
import { useAIMediaAssets } from '@/contexts/AIMediaAssetsContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import AdminLayout from '@/components/admin/AdminLayout';

const ADMIN_AUTH_KEY = 'isAdminLoggedIn_KruthikaChat';

const messagesChartConfig = { messages: { label: "Messages Sent", color: "hsl(var(--chart-2))" } } satisfies ChartConfig;
const dauChartConfig = { active_users: { label: "Active Users", color: "hsl(var(--chart-1))" } } satisfies ChartConfig;

interface DailyCount {
  date: string;
  count: number;
}

const AdminProfilePage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const { aiProfile: contextAIProfile, fetchAIProfile, updateAIProfile, isLoadingAIProfile } = useAIProfile();
  const { adminOwnStatus: contextAdminStatus, managedDemoContacts: contextManagedContacts, fetchGlobalStatuses, isLoadingGlobalStatuses } = useGlobalStatus();
  const { mediaAssetsConfig: contextMediaAssets, fetchMediaAssets, isLoadingMediaAssets } = useAIMediaAssets();

  const [currentGlobalAIProfile, setCurrentGlobalAIProfile] = useState<AIProfile>(defaultAIProfile);
  const [adminStatus, setAdminStatus] = useState<AdminStatusDisplay>(defaultAdminStatusDisplay);
  const [managedContactStatuses, setManagedContactStatuses] = useState<ManagedContactStatus[]>(defaultManagedContactStatuses);
  const [adSettings, setAdSettings] = useState<AdSettings>(defaultAdSettings);
  const [aiMediaAssets, setAiMediaAssets] = useState<AIMediaAssetsConfig>(defaultAIMediaAssetsConfig);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newAudioPath, setNewAudioPath] = useState('');
  const [apiSettings, setApiSettings] = useState({
    geminiApiKey: '',
    supabaseUrl: '',
    supabaseKey: ''
  });

  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

  const [realTotalUserMessages, setRealTotalUserMessages] = useState<number | null>(null);
  const [realTotalAiMessages, setRealTotalAiMessages] = useState<number | null>(null);
  const [realMessagesSentLast7Days, setRealMessagesSentLast7Days] = useState<DailyCount[]>([]);

  const [dailyActiveUsersData, setDailyActiveUsersData] = useState<DailyCount[]>([]);
  const [currentDAU, setCurrentDAU] = useState<number | null>(null);

  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  const combinedIsLoadingSupabaseData = isLoadingAIProfile || isLoadingGlobalStatuses || isLoadingMediaAssets;

  useEffect(() => {
    try {
        const authStatus = sessionStorage.getItem(ADMIN_AUTH_KEY);
        if (authStatus !== 'true') {
          router.replace('/admin/login');
        } else {
          setIsAuthenticated(true);
        }
    } catch (error) {
        console.error("Error accessing sessionStorage for auth:", error);
        router.replace('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    if (contextAIProfile) {
      console.log("[AdminProfilePage] Context AIProfile updated, setting currentGlobalAIProfile. AvatarURL from context:", contextAIProfile.avatarUrl);
      setCurrentGlobalAIProfile(contextAIProfile);
    } else if (!isLoadingAIProfile) {
      console.log("[AdminProfilePage] Context AIProfile is null and not loading, using defaultAIProfile for currentGlobalAIProfile.");
      setCurrentGlobalAIProfile(defaultAIProfile);
    }
  }, [contextAIProfile, isLoadingAIProfile]);

  useEffect(() => {
    if (contextAdminStatus) setAdminStatus(contextAdminStatus);
  }, [contextAdminStatus]);

  useEffect(() => {
    if (contextManagedContacts) setManagedContactStatuses(contextManagedContacts);
  }, [contextManagedContacts]);

  useEffect(() => {
    if (contextMediaAssets) setAiMediaAssets(contextMediaAssets);
  }, [contextMediaAssets]);

  const fetchAllNonAnalyticsConfigs = useCallback(async () => {
    if (!supabase) {
      toast({ title: "Supabase Error", description: "Supabase client not available. Cannot load some global configurations.", variant: "destructive" });
      setAdSettings(defaultAdSettings); 
      setCurrentGlobalAIProfile(defaultAIProfile);
      return;
    }
    try {
      if (setExternalIsLoadingAIProfile) setExternalIsLoadingAIProfile(true);

      const { data: adConfigData, error: adConfigError } = await supabase
        .from('app_configurations')
        .select('settings')
        .eq('id', AD_SETTINGS_CONFIG_KEY)
        .single();

      if (adConfigError && adConfigError.code !== 'PGRST116') throw adConfigError;
      const adSettingsData = adConfigData?.settings;

      const mergedAdSettings = { 
        ...defaultAdSettings, 
        ...(adSettingsData as Partial<AdSettings>),
        maxDirectLinkAdsPerDay: (adSettingsData as AdSettings)?.maxDirectLinkAdsPerDay ?? defaultAdSettings.maxDirectLinkAdsPerDay,
        maxDirectLinkAdsPerSession: (adSettingsData as AdSettings)?.maxDirectLinkAdsPerSession ?? defaultAdSettings.maxDirectLinkAdsPerSession,
      };
      setAdSettings(mergedAdSettings);

      await fetchAIProfile();
      await fetchGlobalStatuses();
      await fetchMediaAssets();

    } catch (error: any) {
      console.error("Failed to load some global configurations from Supabase:", error);
      toast({ title: "Error Loading Some Global Configs", description: `Could not load some global settings. Using defaults. ${error.message || ''}`, variant: "destructive" });
      setAdSettings(defaultAdSettings); 
      setCurrentGlobalAIProfile(defaultAIProfile);
      setAdminStatus(defaultAdminStatusDisplay);
      setManagedContactStatuses(defaultManagedContactStatuses);
      setAiMediaAssets(defaultAIMediaAssetsConfig);
    } finally {
        if (setExternalIsLoadingAIProfile) setExternalIsLoadingAIProfile(false);
    }
  }, [toast, fetchAIProfile, fetchGlobalStatuses, fetchMediaAssets]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllNonAnalyticsConfigs();
    }
  }, [isAuthenticated, fetchAllNonAnalyticsConfigs]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchRealAnalytics() {
      if (!supabase || typeof supabase.from !== 'function' || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setSupabaseError("Supabase client is not configured or environment variables are missing. Real analytics will be unavailable. Please check environment variables and SUPABASE_SETUP.md.");
        setAnalyticsLoading(false);
        setRealTotalUserMessages(0);
        setRealTotalAiMessages(0);
        setRealMessagesSentLast7Days([]);
        setDailyActiveUsersData([]);
        setCurrentDAU(0);
        return;
      }
      try {
        setAnalyticsLoading(true);
        setSupabaseError(null);

        const { count: userMsgCount, error: userMsgError } = await supabase
          .from('messages_log')
          .select('*', { count: 'exact', head: true })
          .eq('sender_type', 'user');
        if (userMsgError) throw userMsgError;
        setRealTotalUserMessages(userMsgCount ?? 0);

        const { count: aiMsgCount, error: aiMsgError } = await supabase
          .from('messages_log')
          .select('*', { count: 'exact', head: true })
          .eq('sender_type', 'ai');
        if (aiMsgError) throw aiMsgError;
        setRealTotalAiMessages(aiMsgCount ?? 0);

        const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd');

        const { data: dailyMsgCountsData, error: dailyMsgCountsError } = await supabase
          .rpc('get_daily_message_counts', { start_date: sevenDaysAgo });
        if (dailyMsgCountsError) throw dailyMsgCountsError;

        const { data: dailyDAUData, error: dailyDAUError } = await supabase
          .rpc('get_daily_active_user_counts', { start_date: sevenDaysAgo });
        if (dailyDAUError) throw dailyDAUError;

        const todayDate = new Date();
        const last7DaysInterval = eachDayOfInterval({ start: subDays(todayDate, 6), end: todayDate });

        const formattedDailyMsgCounts: DailyCount[] = last7DaysInterval.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const found = dailyMsgCountsData?.find((d: any) => format(new Date(d.date), 'yyyy-MM-dd') === dayStr);
          return { date: format(day, 'EEE'), count: found ? Number(found.messages) : 0 };
        });
        setRealMessagesSentLast7Days(formattedDailyMsgCounts);

        const formattedDAUCounts: DailyCount[] = last7DaysInterval.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const found = dailyDAUData?.find((d: any) => format(new Date(d.date), 'yyyy-MM-dd') === dayStr);
          return { date: format(day, 'EEE'), count: found ? Number(found.active_users) : 0 };
        });
        setDailyActiveUsersData(formattedDAUCounts);

        const todayFormatted = format(todayDate, 'EEE');
        const todayDAU = formattedDAUCounts.find(d => d.date === todayFormatted);
        setCurrentDAU(todayDAU ? todayDAU.count : 0);

      } catch (err: any) {
        console.error("Error fetching real analytics from Supabase:", err);
        const errorMessage = err.message || "Could not fetch real analytics from Supabase.";
        setSupabaseError(errorMessage);
        toast({ title: "Analytics Error", description: `${errorMessage} Check SUPABASE_SETUP.md and ensure SQL functions exist.`, variant: "destructive" });
        setRealTotalUserMessages(0);
        setRealTotalAiMessages(0);
        setRealMessagesSentLast7Days([]);
        setDailyActiveUsersData([]);
        setCurrentDAU(0);
      } finally {
        setAnalyticsLoading(false);
      }
    }

    if (typeof window !== 'undefined' && isAuthenticated) {
      fetchRealAnalytics();
    }
  }, [toast, isAuthenticated]);

  const handleLogout = () => {
    try {
        sessionStorage.removeItem(ADMIN_AUTH_KEY);
    } catch (error) {
        console.error("Error removing sessionStorage item:", error);
    }
    toast({ title: 'Logged Out', description: 'You have been logged out of the admin panel.' });
    router.replace('/admin/login');
  };

  const handleSaveGlobalProfile = async (updatedProfile: Partial<AIProfile>) => {
    try {
      const fullUpdatedProfile = { ...currentGlobalAIProfile, ...updatedProfile };
      setCurrentGlobalAIProfile(fullUpdatedProfile);
      await updateAIProfile(fullUpdatedProfile);
      toast({ title: 'Global AI Profile Saved', description: 'The AI profile has been updated successfully.' });
    } catch (error: any) {
      console.error("Error saving global AI profile:", error);
      toast({ title: 'Error', description: `Failed to save global AI profile: ${error.message || 'Unknown error'}`, variant: 'destructive' });
    }
  };

  const handleSaveAdminStatus = async () => {
    try {
      if (!supabase) {
        toast({ title: "Supabase Error", description: "Supabase client not available.", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('app_configurations')
        .upsert({ id: ADMIN_OWN_STATUS_CONFIG_KEY, settings: adminStatus }, { onConflict: 'id' });

      if (error) throw error;
      toast({ title: 'Admin Status Saved', description: 'Your admin status has been updated.' });
    } catch (error: any) {
      console.error("Error saving admin status:", error);
      toast({ title: 'Error', description: `Failed to save admin status: ${error.message}`, variant: 'destructive' });
    }
  };

  const handleSaveManagedContacts = async () => {
    try {
      if (!supabase) {
        toast({ title: "Supabase Error", description: "Supabase client not available.", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('app_configurations')
        .upsert({ id: MANAGED_DEMO_CONTACTS_CONFIG_KEY, settings: managedContactStatuses }, { onConflict: 'id' });

      if (error) throw error;
      toast({ title: 'Demo Contacts Saved', description: 'Managed demo contacts have been updated.' });
    } catch (error: any) {
      console.error("Error saving managed demo contacts:", error);
      toast({ title: 'Error', description: `Failed to save managed demo contacts: ${error.message}`, variant: 'destructive' });
    }
  };

  const handleSaveAdSettings = async () => {
    try {
      if (!supabase) {
        toast({ title: "Supabase Error", description: "Supabase client not available.", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('app_configurations')
        .upsert({ id: AD_SETTINGS_CONFIG_KEY, settings: adSettings }, { onConflict: 'id' });

      if (error) throw error;
      toast({ title: 'Ad Settings Saved', description: 'Advertisement settings have been updated.' });
    } catch (error: any) {
      console.error("Error saving ad settings:", error);
      toast({ title: 'Error', description: `Failed to save ad settings: ${error.message}`, variant: 'destructive' });
    }
  };

  const handleAddImageAsset = () => {
    if (newImageUrl.trim()) {
      const newAsset: AIMediaAsset = {
        id: `img_${Date.now()}`,
        type: 'image',
        url: newImageUrl.trim(),
        isActive: true
      };
      setAiMediaAssets(prev => ({
        ...prev,
        images: [...prev.images, newAsset]
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImageAsset = (id: string) => {
    setAiMediaAssets(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };

  const handleAddAudioAsset = () => {
    if (newAudioPath.trim()) {
      const newAsset: AIMediaAsset = {
        id: `audio_${Date.now()}`,
        type: 'audio',
        url: newAudioPath.trim(),
        isActive: true
      };
      setAiMediaAssets(prev => ({
        ...prev,
        audioFiles: [...prev.audioFiles, newAsset]
      }));
      setNewAudioPath('');
    }
  };

  const handleRemoveAudioAsset = (id: string) => {
    setAiMediaAssets(prev => ({
      ...prev,
      audioFiles: prev.audioFiles.filter(audio => audio.id !== id)
    }));
  };

  const handleSaveMediaAssets = async () => {
    try {
      if (!supabase) {
        toast({ title: "Supabase Error", description: "Supabase client not available.", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('app_configurations')
        .upsert({ id: AI_MEDIA_ASSETS_CONFIG_KEY, settings: aiMediaAssets }, { onConflict: 'id' });

      if (error) throw error;
      toast({ title: 'Media Assets Saved', description: 'AI media assets have been updated.' });
    } catch (error: any) {
      console.error("Error saving media assets:", error);
      toast({ title: 'Error', description: `Failed to save media assets: ${error.message}`, variant: 'destructive' });
    }
  };

  if (!isAuthenticated || combinedIsLoadingSupabaseData) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen bg-background text-foreground">
          Loading admin settings...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className="container mx-auto p-2 sm:p-4 lg:p-6 bg-background min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
              <Sparkles className="mr-3 h-7 w-7" /> Kruthika Chat Admin Panel
            </h1>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/maya-chat')} variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" /> Open Chat
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>

          <Alert variant="default" className="mb-8 bg-primary/10 border-primary/30">
            <Globe className="h-5 w-5 !text-primary" />
            <AlertTitle className="text-primary font-semibold">Admin Panel Active</AlertTitle>
            <AlertDescription className="text-primary/80 text-sm">
              You are now in the admin panel. All global settings can be managed from here.
            </AlertDescription>
          </Alert>

          {supabaseError && (
            <Alert variant="destructive" className="mb-6">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Supabase Connection Issue</AlertTitle>
              <AlertDescription className="text-sm">{supabaseError}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 h-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-2">Overview</TabsTrigger>
              <TabsTrigger value="ai-profile" className="text-xs sm:text-sm py-2 px-2">AI Profile</TabsTrigger>
              <TabsTrigger value="admin-status" className="text-xs sm:text-sm py-2 px-2">Status</TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs sm:text-sm py-2 px-2">Contacts</TabsTrigger>
              <TabsTrigger value="ads" className="text-xs sm:text-sm py-2 px-2">Ads</TabsTrigger>
              <TabsTrigger value="media" className="text-xs sm:text-sm py-2 px-2">Media</TabsTrigger>
              <TabsTrigger value="system" className="text-xs sm:text-sm py-2 px-2">System</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total User Messages</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsLoading ? '...' : (realTotalUserMessages ?? 'N/A')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total AI Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsLoading ? '...' : (realTotalAiMessages ?? 'N/A')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analyticsLoading ? '...' : (currentDAU ?? 'N/A')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Status</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <Badge variant={supabase ? "default" : "destructive"}>
                        {supabase ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages Sent (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="h-[200px] flex items-center justify-center">Loading...</div>
                    ) : (
                      <ChartContainer config={messagesChartConfig} className="h-[200px]">
                        <RechartsBarChart data={realMessagesSentLast7Days}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-messages)" />
                        </RechartsBarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Active Users (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="h-[200px] flex items-center justify-center">Loading...</div>
                    ) : (
                      <ChartContainer config={dauChartConfig} className="h-[200px]">
                        <RechartsBarChart data={dailyActiveUsersData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-active_users)" />
                        </RechartsBarChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="ai-profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCircle className="mr-2 h-5 w-5" />
                    Global AI Profile Management
                  </CardTitle>
                  <CardDescription>
                    Configure Kruthika's global profile settings that affect all users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={currentGlobalAIProfile.avatarUrl} alt={currentGlobalAIProfile.name} />
                      <AvatarFallback>{currentGlobalAIProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{currentGlobalAIProfile.name}</h3>
                      <p className="text-sm text-muted-foreground">{currentGlobalAIProfile.status}</p>
                    </div>
                  </div>
                  
                  <Button onClick={() => setIsProfileEditorOpen(true)} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Global Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin-status" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Admin Status Configuration
                  </CardTitle>
                  <CardDescription>
                    Set your admin status that appears in chat interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">Admin Name</Label>
                      <Input
                        id="admin-name"
                        value={adminStatus.name}
                        onChange={(e) => setAdminStatus(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-status">Admin Status</Label>
                      <Input
                        id="admin-status"
                        value={adminStatus.status}
                        onChange={(e) => setAdminStatus(prev => ({ ...prev, status: e.target.value }))}
                        placeholder="Your Status"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-avatar">Avatar URL</Label>
                    <Input
                      id="admin-avatar"
                      value={adminStatus.avatarUrl}
                      onChange={(e) => setAdminStatus(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      placeholder="Avatar Image URL"
                    />
                  </div>
                  <Button onClick={handleSaveAdminStatus} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
                    <Check className="mr-2 h-4 w-4" />
                    Save Admin Status
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Demo Contact Management
                  </CardTitle>
                  <CardDescription>
                    Manage the demo contacts that appear in the chat interface
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(managedContactStatuses || []).map((contact, index) => (
                      <div key={contact.id} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border rounded-lg">
                        <div className="flex items-center space-x-3 sm:space-x-0">
                          <Avatar>
                            <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="sm:hidden font-medium">{contact.name}</div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-1 gap-2">
                            <Input
                              value={contact.name}
                              onChange={(e) => {
                                const updated = [...managedContactStatuses];
                                updated[index].name = e.target.value;
                                setManagedContactStatuses(updated);
                              }}
                              placeholder="Contact Name"
                            />
                            <Input
                              value={contact.status}
                              onChange={(e) => {
                                const updated = [...managedContactStatuses];
                                updated[index].status = e.target.value;
                                setManagedContactStatuses(updated);
                              }}
                              placeholder="Status"
                            />
                          </div>
                          <Input
                            value={contact.avatarUrl}
                            onChange={(e) => {
                              const updated = [...managedContactStatuses];
                              updated[index].avatarUrl = e.target.value;
                              setManagedContactStatuses(updated);
                            }}
                            placeholder="Avatar URL"
                          />
                        </div>
                      </div>
                    ))}
                    <Button onClick={handleSaveManagedContacts} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
                      <Check className="mr-2 h-4 w-4" />
                      Save Demo Contacts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ads" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Newspaper className="mr-2 h-5 w-5" />
                    Advertisement Settings
                  </CardTitle>
                  <CardDescription>
                    Configure advertisement display settings and limits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="global-ads">Enable Ads Globally</Label>
                      <Switch
                        id="global-ads"
                        checked={adSettings.adsEnabledGlobally}
                        onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, adsEnabledGlobally: checked }))}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Adsterra Network</CardTitle>
                        <CardDescription>Configure Adsterra ad settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="adsterra-direct">Direct Link Ads</Label>
                            <Switch
                              id="adsterra-direct"
                              checked={adSettings.adsterraDirectLinkEnabled}
                              onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, adsterraDirectLinkEnabled: checked }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="adsterra-direct-url">Direct Link URL</Label>
                            <Input
                              id="adsterra-direct-url"
                              value={adSettings.adsterraDirectLink}
                              onChange={(e) => setAdSettings(prev => ({ ...prev, adsterraDirectLink: e.target.value }))}
                              placeholder="https://www.adsterra.com/direct/link"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="adsterra-banner">Banner Ads</Label>
                            <Switch
                              id="adsterra-banner"
                              checked={adSettings.adsterraBannerEnabled}
                              onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, adsterraBannerEnabled: checked }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="adsterra-banner-code">Banner Code</Label>
                            <Textarea
                              id="adsterra-banner-code"
                              value={adSettings.adsterraBannerCode}
                              onChange={(e) => setAdSettings(prev => ({ ...prev, adsterraBannerCode: e.target.value }))}
                              placeholder="<!-- Adsterra Banner Code -->"
                              rows={3}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="adsterra-native">Native Banner</Label>
                            <Switch
                              id="adsterra-native"
                              checked={adSettings.adsterraNativeBannerEnabled}
                              onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, adsterraNativeBannerEnabled: checked }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="adsterra-native-code">Native Banner Code</Label>
                            <Textarea
                              id="adsterra-native-code"
                              value={adSettings.adsterraNativeBannerCode}
                              onChange={(e) => setAdSettings(prev => ({ ...prev, adsterraNativeBannerCode: e.target.value }))}
                              placeholder="<!-- Adsterra Native Banner Code -->"
                              rows={3}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="adsterra-social">Social Bar</Label>
                            <Switch
                              id="adsterra-social"
                              checked={adSettings.adsterraSocialBarEnabled}
                              onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, adsterraSocialBarEnabled: checked }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="adsterra-social-code">Social Bar Code</Label>
                            <Textarea
                              id="adsterra-social-code"
                              value={adSettings.adsterraSocialBarCode}
                              onChange={(e) => setAdSettings(prev => ({ ...prev, adsterraSocialBarCode: e.target.value }))}
                              placeholder="<!-- Adsterra Social Bar Code -->"
                              rows={3}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="adsterra-popunder">Pop-under</Label>
                            <Switch
                              id="adsterra-popunder"
                              checked={adSettings.adsterraPopunderEnabled}
                              onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, adsterraPopunderEnabled: checked }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="adsterra-popunder-code">Pop-under Code</Label>
                            <Textarea
                              id="adsterra-popunder-code"
                              value={adSettings.adsterraPopunderCode}
                              onChange={(e) => setAdSettings(prev => ({ ...prev, adsterraPopunderCode: e.target.value }))}
                              placeholder="<!-- Adsterra Pop-under Script -->"
                              rows={3}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">MonetAG Network</CardTitle>
                        <CardDescription>Configure MonetAG ad settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="monetag-direct">Direct Link Ads</Label>
                            <Switch
                              id="monetag-direct"
                              checked={adSettings.monetagDirectLinkEnabled}
                              onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, monetagDirectLinkEnabled: checked }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monetag-direct-url">Direct Link URL</Label>
                            <Input
                              id="monetag-direct-url"
                              value={adSettings.monetagDirectLink}
                              onChange={(e) => setAdSettings(prev => ({ ...prev, monetagDirectLink: e.target.value }))}
                              placeholder="https://www.monetag.com/direct/link"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="monetag-banner">Banner Ads</Label>
                            <Switch
                              id="monetag-banner"
                              checked={adSettings.monetagBannerEnabled}
                              onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, monetagBannerEnabled: checked }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monetag-banner-code">Banner Code</Label>
                            <Textarea
                              id="monetag-banner-code"
                              value={adSettings.monetagBannerCode}
                              onChange={(e) => setAdSettings(prev => ({ ...prev, monetagBannerCode: e.target.value }))}
                              placeholder="<!-- MonetAG Banner Code -->"
                              rows={3}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="monetag-native">Native Banner</Label>
                            <Switch
                              id="monetag-native"
                              checked={adSettings.monetagNativeBannerEnabled}
                              onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, monetagNativeBannerEnabled: checked }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monetag-native-code">Native Banner Code</Label>
                            <Textarea
                              id="monetag-native-code"
                              value={adSettings.monetagNativeBannerCode}
                              onChange={(e) => setAdSettings(prev => ({ ...prev, monetagNativeBannerCode: e.target.value }))}
                              placeholder="<!-- MonetAG Native Banner Code -->"
                              rows={3}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="monetag-social">Social Bar</Label>
                            <Switch
                              id="monetag-social"
                              checked={adSettings.monetagSocialBarEnabled}
                              onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, monetagSocialBarEnabled: checked }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monetag-social-code">Social Bar Code</Label>
                            <Textarea
                              id="monetag-social-code"
                              value={adSettings.monetagSocialBarCode}
                              onChange={(e) => setAdSettings(prev => ({ ...prev, monetagSocialBarCode: e.target.value }))}
                              placeholder="<!-- MonetAG Social Bar Code -->"
                              rows={3}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="monetag-popunder">Pop-under</Label>
                            <Switch
                              id="monetag-popunder"
                              checked={adSettings.monetagPopunderEnabled}
                              onCheckedChange={(checked) => setAdSettings(prev => ({ ...prev, monetagPopunderEnabled: checked }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="monetag-popunder-code">Pop-under Code</Label>
                            <Textarea
                              id="monetag-popunder-code"
                              value={adSettings.monetagPopunderCode}
                              onChange={(e) => setAdSettings(prev => ({ ...prev, monetagPopunderCode: e.target.value }))}
                              placeholder="<!-- MonetAG Pop-under Script -->"
                              rows={3}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Ad Frequency Limits</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="max-daily-ads">Max Direct Link Ads Per Day</Label>
                        <Input
                          id="max-daily-ads"
                          type="number"
                          value={adSettings.maxDirectLinkAdsPerDay}
                          onChange={(e) => setAdSettings(prev => ({ ...prev, maxDirectLinkAdsPerDay: parseInt(e.target.value) || 0 }))}
                          min="0"
                          max="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-session-ads">Max Direct Link Ads Per Session</Label>
                        <Input
                          id="max-session-ads"
                          type="number"
                          value={adSettings.maxDirectLinkAdsPerSession}
                          onChange={(e) => setAdSettings(prev => ({ ...prev, maxDirectLinkAdsPerSession: parseInt(e.target.value) || 0 }))}
                          min="0"
                          max="20"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button onClick={handleSaveAdSettings} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
                      <Check className="mr-2 h-4 w-4" />
                      Save Ad Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ImagePlus className="mr-2 h-5 w-5" />
                      Image Assets
                    </CardTitle>
                    <CardDescription>Manage AI image assets</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Add new image URL"
                      />
                      <Button onClick={handleAddImageAsset} size="sm" className="min-h-[40px] min-w-[40px] touch-manipulation">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(aiMediaAssets?.images || []).map((image) => (
                        <div key={image.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm truncate">{image.url}</span>
                          <Button onClick={() => handleRemoveImageAsset(image.id)} variant="destructive" size="sm" className="min-h-[36px] min-w-[36px] touch-manipulation">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Music2 className="mr-2 h-5 w-5" />
                      Audio Assets
                    </CardTitle>
                    <CardDescription>Manage AI audio files</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newAudioPath}
                        onChange={(e) => setNewAudioPath(e.target.value)}
                        placeholder="Add new audio path"
                      />
                      <Button onClick={handleAddAudioAsset} size="sm" className="min-h-[40px] min-w-[40px] touch-manipulation">
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(aiMediaAssets?.audioFiles || []).map((audio) => (
                        <div key={audio.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm truncate">{audio.url}</span>
                          <Button onClick={() => handleRemoveAudioAsset(audio.id)} variant="destructive" size="sm" className="min-h-[36px] min-w-[36px] touch-manipulation">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-center">
                <Button onClick={handleSaveMediaAssets} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
                  <Check className="mr-2 h-4 w-4" />
                  Save Media Assets
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <RefreshCcw className="mr-2 h-5 w-5" />
                      Cache Management
                    </CardTitle>
                    <CardDescription>Monitor and manage application cache</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CacheManagement />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChartHorizontalBig className="mr-2 h-5 w-5" />
                      Performance Monitor
                    </CardTitle>
                    <CardDescription>Real-time performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PerformanceMonitor />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Supabase Connection</Label>
                      <Badge variant={supabase ? "default" : "destructive"}>
                        {supabase ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Environment</Label>
                      <Badge variant="outline">
                        {process.env.NODE_ENV || 'development'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Database Tables</Label>
                      <Badge variant="outline">
                        Configured
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <ProfileEditor
            currentProfile={currentGlobalAIProfile}
            onSave={handleSaveGlobalProfile}
            onClose={() => setIsProfileEditorOpen(false)}
            isAdminEditor={true}
            isOpen={isProfileEditorOpen}
            onOpenChange={setIsProfileEditorOpen}
          />
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
};

export default AdminProfilePage;
