
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabaseOptimizer } from '@/lib/supabaseOptimizations';
import { chatCache } from '@/lib/chatCache';

const PerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState({
    chatCache: { size: 0, totalHits: 0 },
    supabaseCache: { size: 0, keys: [] },
    responseTime: 0,
    memoryUsage: 0
  });

  const fetchStats = async () => {
    const chatStats = chatCache.getStats();
    const supabaseStats = supabaseOptimizer.getCacheStats();
    
    // Measure response time
    const startTime = performance.now();
    await fetch('/api/cache-stats');
    const responseTime = performance.now() - startTime;

    setStats({
      chatCache: chatStats,
      supabaseCache: supabaseStats,
      responseTime: Math.round(responseTime),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
    });
  };

  const clearAllCaches = () => {
    chatCache.clear();
    supabaseOptimizer.clearCache();
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Monitor</CardTitle>
        <CardDescription>Real-time performance metrics and cache statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Chat Cache</div>
            <Badge variant="secondary">{stats.chatCache.size} entries</Badge>
            <div className="text-xs text-muted-foreground">{stats.chatCache.totalHits} hits</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">DB Cache</div>
            <Badge variant="outline">{stats.supabaseCache.size} queries</Badge>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Response Time</div>
            <Badge variant={stats.responseTime < 100 ? "default" : stats.responseTime < 500 ? "secondary" : "destructive"}>
              {stats.responseTime}ms
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Memory Usage</div>
            <Badge variant="outline">
              {(stats.memoryUsage / 1024 / 1024).toFixed(1)}MB
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={fetchStats} variant="outline" size="sm">
            Refresh
          </Button>
          <Button onClick={clearAllCaches} variant="destructive" size="sm">
            Clear All Caches
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
