
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CacheStats {
  chatCache: {
    size: number;
    totalHits: number;
  };
  timestamp: string;
}

const CacheManagement: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cache-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    }
  };

  const clearCache = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cache-stats', { method: 'DELETE' });
      if (response.ok) {
        toast({ title: 'Success', description: 'Chat cache cleared successfully' });
        await fetchStats(); // Refresh stats
      } else {
        throw new Error('Failed to clear cache');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to clear cache', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cache Management</CardTitle>
        <CardDescription>Monitor and manage application caching performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Chat Cache Size</div>
              <Badge variant="secondary">{stats.chatCache.size} entries</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Total Cache Hits</div>
              <Badge variant="outline">{stats.chatCache.totalHits} hits</Badge>
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button onClick={fetchStats} variant="outline" size="sm">
            Refresh Stats
          </Button>
          <Button 
            onClick={clearCache} 
            variant="destructive" 
            size="sm"
            disabled={loading}
          >
            {loading ? 'Clearing...' : 'Clear Chat Cache'}
          </Button>
        </div>
        
        {stats && (
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date(stats.timestamp).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CacheManagement;
