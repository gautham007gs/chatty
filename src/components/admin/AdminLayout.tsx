
'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  UserCircle, 
  Settings, 
  FileText, 
  BarChartHorizontalBig, 
  Terminal, 
  ShieldAlert,
  Menu,
  X,
  HelpCircle,
  LogOut,
  Home,
  MessageSquare,
  Users,
  ChevronRight,
  AlertTriangle,
  Info
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  instructions: string;
  status?: 'active' | 'warning' | 'error';
}

const navigationItems: NavItem[] = [
  {
    id: 'kruthika',
    label: 'Kruthika Settings',
    icon: UserCircle,
    description: 'Manage AI personality & media',
    instructions: 'Configure Kruthika\'s profile, status story, and sharable media assets. These settings affect all users globally.',
    status: 'active'
  },
  {
    id: 'ads',
    label: 'Ad Management',
    icon: Settings,
    description: 'Control monetization settings',
    instructions: 'Enable/disable ads, configure ad networks (Adsterra, Monetag), set frequency limits, and manage ad placements.',
    status: 'active'
  },
  {
    id: 'status_content',
    label: 'Status Page',
    icon: FileText,
    description: 'Manage status content',
    instructions: 'Set your admin status and manage demo contact statuses that appear on the Status page for all users.',
    status: 'active'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChartHorizontalBig,
    description: 'View usage statistics',
    instructions: 'Monitor user engagement, message counts, daily active users, and performance metrics from Supabase.',
    status: 'active'
  },
  {
    id: 'system',
    label: 'System Tools',
    icon: Terminal,
    description: 'Performance & maintenance',
    instructions: 'Monitor system performance, manage cache, check database connections, and view environment status.',
    status: 'active'
  },
  {
    id: 'security',
    label: 'Security',
    icon: ShieldAlert,
    description: 'Security & compliance',
    instructions: 'Review security recommendations, authentication status, data protection measures, and legal compliance.',
    status: 'warning'
  }
];

const quickActions = [
  { label: 'View Chat', icon: MessageSquare, action: '/maya-chat' },
  { label: 'Home Page', icon: Home, action: '/' },
  { label: 'Status Page', icon: Users, action: '/status' }
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('kruthika');
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Override any global ad contexts for admin pages
  React.useEffect(() => {
    const adElements = document.querySelectorAll('[data-ad], .ad-banner, .ad-container');
    adElements.forEach(element => {
      (element as HTMLElement).style.display = 'none';
    });

    sessionStorage.setItem('isAdminPanel', 'true');

    return () => {
      sessionStorage.removeItem('isAdminPanel');
      adElements.forEach(element => {
        (element as HTMLElement).style.display = '';
      });
    };
  }, []);

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('isAdminLoggedIn_KruthikaChat');
    } catch (error) {
      console.error("Error removing sessionStorage item:", error);
    }
    toast({ title: 'Logged Out', description: 'You have been logged out of the admin panel.' });
    router.replace('/admin/login');
  };

  const handleQuickAction = (action: string) => {
    router.push(action);
  };

  const isProfilePage = pathname === '/admin/profile';

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // If we're in the profile page and have a setActiveTab prop, use it
    if (isProfilePage && window.location.pathname === '/admin/profile') {
      // Trigger a custom event to communicate with the profile page
      window.dispatchEvent(new CustomEvent('adminTabChange', { detail: tabId }));
    }
  };

  if (!isProfilePage) {
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
        {children}
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
      
      <div className="flex h-screen bg-background">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-80 bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-lg p-2">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">Admin Panel</h1>
                    <p className="text-sm text-muted-foreground">Kruthika Chat</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Management Tools
                </h3>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <Card 
                      key={item.id}
                      className={`
                        cursor-pointer transition-all duration-200 hover:shadow-md
                        ${isActive ? 'bg-primary/10 border-primary/30' : 'hover:bg-secondary/50'}
                      `}
                      onClick={() => handleTabChange(item.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <div className={`
                            p-2 rounded-lg 
                            ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
                          `}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">{item.label}</h4>
                              {item.status && (
                                <Badge 
                                  variant={item.status === 'warning' ? 'destructive' : 'default'}
                                  className="ml-2 text-xs"
                                >
                                  {item.status === 'warning' ? '!' : '✓'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.label}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => handleQuickAction(action.action)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border space-y-2">
              <Alert variant="default" className="bg-primary/5 border-primary/20">
                <AlertTriangle className="h-4 w-4 !text-primary" />
                <AlertDescription className="text-xs !text-primary">
                  Global settings affect all users. Changes are saved to Supabase.
                </AlertDescription>
              </Alert>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <div className="bg-background border-b border-border p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold">
                    {navigationItems.find(item => item.id === activeTab)?.label || 'Admin Panel'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {navigationItems.find(item => item.id === activeTab)?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Panel */}
          <div className="bg-secondary/30 border-b border-border p-4 lg:p-6">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <HelpCircle className="h-4 w-4 !text-blue-600" />
              <AlertTitle className="!text-blue-800 text-sm font-semibold">How to use this section</AlertTitle>
              <AlertDescription className="!text-blue-700 text-sm mt-1">
                {navigationItems.find(item => item.id === activeTab)?.instructions}
              </AlertDescription>
            </Alert>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {React.cloneElement(children as React.ReactElement, { activeTab, setActiveTab })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
