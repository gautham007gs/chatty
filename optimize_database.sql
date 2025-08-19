
-- Database Performance Optimization Indexes

-- Index for message pagination queries
CREATE INDEX IF NOT EXISTS idx_messages_log_chat_timestamp 
ON public.messages_log (chat_id, timestamp DESC);

-- Index for user-specific message queries
CREATE INDEX IF NOT EXISTS idx_messages_log_user_chat_timestamp 
ON public.messages_log (user_id, chat_id, timestamp DESC);

-- Index for daily activity queries
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date 
ON public.daily_activity_log (user_id, date DESC);

-- Index for session-based queries
CREATE INDEX IF NOT EXISTS idx_messages_log_session_timestamp 
ON public.messages_log (session_id, timestamp DESC);

-- Composite index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_messages_log_composite 
ON public.messages_log (chat_id, user_id, message_type, timestamp DESC);

-- Optimize daily activity function for better performance
CREATE OR REPLACE FUNCTION log_daily_activity_optimized(
    p_user_id TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT 'anonymous',
    p_chat_id TEXT DEFAULT 'default_chat'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Use INSERT ... ON CONFLICT for better performance
    INSERT INTO public.daily_activity_log (date, user_id, session_id, chat_id, activity_count)
    VALUES (CURRENT_DATE, p_user_id, p_session_id, p_chat_id, 1)
    ON CONFLICT (date, COALESCE(user_id, ''), session_id, chat_id)
    DO UPDATE SET 
        activity_count = daily_activity_log.activity_count + 1,
        updated_at = NOW();
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the operation
    RAISE NOTICE 'Daily activity logging failed: %', SQLERRM;
END;
$$;
