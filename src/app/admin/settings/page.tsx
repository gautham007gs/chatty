
"use client";

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, Bell, Globe } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input id="appName" defaultValue="WhatApp Chat" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appDescription">Description</Label>
                <Input id="appDescription" defaultValue="AI-powered chat application" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenanceMode" />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="debugMode" />
                <Label htmlFor="debugMode">Debug Mode</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="emailNotifications" defaultChecked />
                <Label htmlFor="emailNotifications">Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="pushNotifications" defaultChecked />
                <Label htmlFor="pushNotifications">Push Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="smsNotifications" />
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input id="notificationEmail" type="email" placeholder="admin@example.com" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Localization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Input id="defaultLanguage" defaultValue="English" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="UTC" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Input id="dateFormat" defaultValue="MM/DD/YYYY" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="rtlSupport" />
                <Label htmlFor="rtlSupport">RTL Support</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Save className="mr-2 h-5 w-5" />
                System Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save All Settings
              </Button>
              <Button variant="outline" className="w-full">
                Reset to Defaults
              </Button>
              <Button variant="outline" className="w-full">
                Export Configuration
              </Button>
              <Button variant="outline" className="w-full">
                Import Configuration
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
