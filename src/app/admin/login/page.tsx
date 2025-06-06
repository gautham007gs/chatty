
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert'; // Added import
import { useToast } from '@/hooks/use-toast';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

const ADMIN_AUTH_KEY = 'isAdminLoggedIn_KruthikaChat';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!supabase) {
      setError('Supabase client is not available. Please check configuration.');
      setIsLoading(false);
      toast({ title: 'Login Error', description: 'Authentication service not available.', variant: 'destructive' });
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message || 'Invalid login credentials.');
      toast({ title: 'Login Failed', description: signInError.message || 'Incorrect email or password.', variant: 'destructive' });
    } else if (data.user) {
      // Successfully authenticated with Supabase
      try {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        // Optionally, you could store the user object or a token if needed for further checks,
        // but for basic route protection, the flag is often sufficient for client-side.
        toast({ title: 'Login Successful', description: "Welcome to the Admin Panel!" });
        router.push('/admin/profile');
      } catch (sessionError: any) {
          console.error("Error setting sessionStorage:", sessionError);
          setError(`Failed to initiate session. Please ensure cookies/session storage are enabled. ${sessionError.message || ''}`);
          toast({ title: 'Session Error', description: `Could not save login state. ${sessionError.message || ''}`, variant: 'destructive' });
      }
    } else {
      setError('An unknown error occurred during login.');
      toast({ title: 'Login Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <KeyRound size={32} />
          </div>
          <CardTitle className="text-2xl">Kruthika Chat Admin Panel</CardTitle>
          <CardDescription>Enter your admin credentials to access settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="mb-6 bg-primary/10 border-primary/30">
            <ShieldAlert size={20} className="mr-2 shrink-0 mt-0.5 !text-primary" />
            <div>
              <span className="font-semibold !text-primary">Admin Access:</span> Uses Supabase Authentication. Ensure your RLS policies for `app_configurations` are updated to restrict write access to authenticated admin users.
            </div>
          </Alert>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email" // Changed type to email
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com" // Changed placeholder
                required
                className="text-base"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="text-base"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
