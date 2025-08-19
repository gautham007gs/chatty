
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Message } from '@/types';

interface UseMessagePaginationProps {
  chatId: string;
  userId?: string;
  pageSize?: number;
}

interface PaginationState {
  messages: Message[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useMessagePagination = ({
  chatId,
  userId,
  pageSize = 20
}: UseMessagePaginationProps): PaginationState => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const loadMessages = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    const currentOffset = reset ? 0 : offset;

    try {
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Optimized query with proper indexing
      let query = supabase
        .from('messages_log')
        .select('id, message_content, message_type, timestamp, chat_id')
        .eq('chat_id', chatId)
        .order('timestamp', { ascending: false })
        .range(currentOffset, currentOffset + pageSize - 1);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
        return;
      }

      // Transform to Message format
      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id.toString(),
        text: msg.message_content,
        sender: msg.message_type === 'user' ? 'user' : 'ai',
        timestamp: new Date(msg.timestamp),
        status: 'read' as const
      })).reverse(); // Reverse to show oldest first

      if (reset) {
        setMessages(formattedMessages);
        setOffset(pageSize);
      } else {
        setMessages(prev => [...formattedMessages, ...prev]);
        setOffset(prev => prev + pageSize);
      }

      setHasMore(formattedMessages.length === pageSize);
    } catch (error) {
      console.error('Message pagination error:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId, userId, pageSize, offset, loading]);

  const loadMore = useCallback(() => loadMessages(false), [loadMessages]);
  const refresh = useCallback(() => loadMessages(true), [loadMessages]);

  useEffect(() => {
    refresh();
  }, [chatId, userId]);

  return {
    messages,
    loading,
    hasMore,
    loadMore,
    refresh
  };
};
