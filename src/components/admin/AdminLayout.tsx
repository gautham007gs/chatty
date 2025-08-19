
"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Settings,
  BarChart3,
  Database,
  Megaphone,
  Shield,
  Home,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Profile Management',
      path: '/admin/profile',
      icon: User,
      description: 'Manage AI profile settings'
    },
    {
      name: 'Ad Management',
      path: '/admin/ads',
      icon: Megaphone,
      description: 'Configure advertisements'
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: BarChart3,
      description: 'View performance metrics'
    },
    {
      name: 'Database',
      path: '/admin/database',
      icon: Database,
      description: 'Database management'
    },
    {
      name: 'Security',
      path: '/admin/security',
      icon: Shield,
      description: 'Security settings'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings,
      description: 'General settings'
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsSidebarOpen(false);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleLogout = () => {
    // Add logout logic here if needed
    router.push('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-white shadow-md"
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">WhatApp Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors duration-200 flex items-center space-x-3
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                  {isActive && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Active
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleBackToHome}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8 pt-16 lg:pt-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find(item => item.path === pathname)?.name || 'Admin Dashboard'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {navigationItems.find(item => item.path === pathname)?.description || 'Welcome to the admin panel'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  System Online
                </Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg border border-gray-200 min-h-[600px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
