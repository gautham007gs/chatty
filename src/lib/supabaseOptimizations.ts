
import { supabase } from './supabaseClient';

// Connection pool and query optimization utilities
class SupabaseOptimizer {
  private queryCache = new Map<string, { data: any; timestamp: number }>();
  private readonly QUERY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Optimized batch message insertion
  async batchInsertMessages(messages: Array<{
    session_id: string;
    user_id?: string;
    message_type: 'user' | 'ai';
    message_content: string;
    chat_id: string;
  }>) {
    if (!supabase || messages.length === 0) return;

    try {
      // Use upsert for better performance
      const { error } = await supabase
        .from('messages_log')
        .upsert(messages, { 
          onConflict: 'session_id,timestamp',
          ignoreDuplicates: true 
        });

      if (error) console.error('Batch insert error:', error);
    } catch (error) {
      console.error('Batch message insert failed:', error);
    }
  }

  // Cached query execution
  async cachedQuery<T>(
    cacheKey: string,
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T | null> {
    // Check cache first
    const cached = this.queryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.QUERY_CACHE_TTL) {
      return cached.data;
    }

    // Execute query
    const { data, error } = await queryFn();
    if (error) {
      console.error('Cached query error:', error);
      return null;
    }

    // Cache result
    this.queryCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  // Optimized daily activity logging with conflict resolution
  async logDailyActivity(userId?: string, sessionId = 'anonymous', chatId = 'default_chat') {
    if (!supabase) return;

    try {
      // Use stored procedure for atomic operation
      const { error } = await supabase.rpc('log_daily_activity', {
        p_user_id: userId,
        p_session_id: sessionId,
        p_chat_id: chatId
      });

      if (error) console.error('Daily activity log error:', error);
    } catch (error) {
      console.error('Daily activity logging failed:', error);
    }
  }

  // Get user stats with caching
  async getUserStats(userId: string) {
    return this.cachedQuery(`user_stats_${userId}`, async () => {
      if (!supabase) return { data: null, error: 'No Supabase client' };

      return supabase
        .from('daily_activity_log')
        .select('date, activity_count')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);
    });
  }

  // Clear cache manually
  clearCache() {
    this.queryCache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys())
    };
  }
}

export const supabaseOptimizer = new SupabaseOptimizer();
