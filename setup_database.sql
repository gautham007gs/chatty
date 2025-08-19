
-- Enable Row Level Security
ALTER TABLE IF EXISTS public.messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_configurations ENABLE ROW LEVEL SECURITY;

-- Create messages_log table
CREATE TABLE IF NOT EXISTS public.messages_log (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'ai')),
    message_content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    chat_id TEXT DEFAULT 'default_chat'
);

-- Create daily_activity_log table
CREATE TABLE IF NOT EXISTS public.daily_activity_log (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    user_id TEXT,
    session_id TEXT NOT NULL,
    activity_count INTEGER DEFAULT 1,
    chat_id TEXT DEFAULT 'default_chat',
    UNIQUE(date, user_id, session_id, chat_id)
);

-- Create app_configurations table
CREATE TABLE IF NOT EXISTS public.app_configurations (
    id TEXT PRIMARY KEY,
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for public access (adjust for production)
CREATE POLICY "Allow all operations on messages_log" ON public.messages_log FOR ALL USING (true);
CREATE POLICY "Allow all operations on daily_activity_log" ON public.daily_activity_log FOR ALL USING (true);
CREATE POLICY "Allow all operations on app_configurations" ON public.app_configurations FOR ALL USING (true);

-- Create function for daily activity logging
CREATE OR REPLACE FUNCTION log_daily_activity(
    p_user_id TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT 'anonymous',
    p_chat_id TEXT DEFAULT 'default_chat'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.daily_activity_log (date, user_id, session_id, chat_id, activity_count)
    VALUES (CURRENT_DATE, p_user_id, p_session_id, p_chat_id, 1)
    ON CONFLICT (date, user_id, session_id, chat_id)
    DO UPDATE SET activity_count = daily_activity_log.activity_count + 1;
END;
$$;
