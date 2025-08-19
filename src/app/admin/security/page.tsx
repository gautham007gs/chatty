
"use client";

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Key, AlertTriangle } from 'lucide-react';

const SecurityPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Score</p>
                  <p className="text-2xl font-bold">95%</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SSL Status</p>
                  <p className="text-2xl font-bold">Active</p>
                </div>
                <Lock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">API Keys</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Key className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Threats</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Two-Factor Authentication</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SSL Certificate</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Valid</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Firewall</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rate Limiting</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                API Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">OpenAI API</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Supabase API</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Analytics API</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Connected</Badge>
              </div>
              <Button variant="outline" className="w-full">
                Regenerate API Keys
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SecurityPage;
