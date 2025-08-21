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
import { useAIProfile, setExternalIsLoadingAIProfile } from '@/contexts/AIProfileContext'; // Import setter
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

  if (!isAuthenticated || combinedIsLoadingSupabaseData) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground">
        Loading admin settings...
      </div>
    );
  }

  return (
    <div className="admin-panel-wrapper" data-admin-panel="true">
      <style jsx global>{`
        .admin-panel-wrapper [data-ad],
        .admin-panel-wrapper .ad-banner,
        .admin-panel-wrapper .ad-container,
        .admin-panel-wrapper .banner-ad,
        .admin-panel-wrapper .social-bar-ad {
          display: none !important;
        }
      `}</style>
      <TooltipProvider>
        <div className="container mx-auto p-2 sm:p-4 lg:p-6 bg-background min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
              <Sparkles className="mr-3 h-7 w-7" /> Kruthika Chat Admin Panel
            </h1>
            <div className="flex gap-2">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCircle className="mr-2 h-5 w-5" />
                  AI Profile Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure Kruthika's global profile settings
                </p>
                <Button className="w-full" onClick={() => router.push('/maya-chat')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Open Chat Interface
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Supabase:</span>
                    <Badge variant={supabase ? "default" : "destructive"}>
                      {supabase ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Environment:</span>
                    <Badge variant="outline">
                      {process.env.NODE_ENV || 'development'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
                  <Users className="mr-2 h-4 w-4" />
                  Back to Main App
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/status')}>
                  <Globe className="mr-2 h-4 w-4" />
                  View Status Page
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert variant="destructive" className="mt-8">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              This is a simplified admin panel for development. In production, implement proper authentication with Supabase Auth and RLS policies.
            </AlertDescription>
          </Alert>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default AdminProfilePage;