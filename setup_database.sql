
-- Enable Row Level Security
ALTER TABLE IF EXISTS public.messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_configurations ENABLE ROW LEVEL SECURITY;

-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS public.messages_log;

-- Create messages_log table with correct column names
CREATE TABLE public.messages_log (
    id BIGSERIAL PRIMARY KEY,
    message_id TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai')),
    chat_id TEXT NOT NULL DEFAULT 'kruthika_chat',
    user_id TEXT,
    text_content TEXT NOT NULL,
    has_image BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_activity_log table
CREATE TABLE IF NOT EXISTS public.daily_activity_log (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    user_id TEXT,
    session_id TEXT,
    first_visit_timestamp TIMESTAMPTZ,
    last_visit_timestamp TIMESTAMPTZ,
    activity_count INTEGER DEFAULT 1,
    chat_id TEXT DEFAULT 'kruthika_chat',
    UNIQUE(date, user_id)
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
    ON CONFLICT (date, user_id)
    DO UPDATE SET 
        activity_count = daily_activity_log.activity_count + 1,
        last_visit_timestamp = NOW();
END;
$$;

-- Insert default AI profile if not exists
INSERT INTO public.app_configurations (id, settings) 
VALUES ('ai_profile', '{
  "name": "Kruthika",
  "status": "🌸 Living my best life! Let'\''s chat! 🌸",
  "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
  "statusStoryText": "Ask me anything! 💬",
  "statusStoryImageUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
  "statusStoryHasUpdate": true
}') ON CONFLICT (id) DO NOTHING;

-- Insert default ad settings if not exists
INSERT INTO public.app_configurations (id, settings) 
VALUES ('ad_settings', '{
  "adsEnabledGlobally": true,
  "maxDirectLinkAdsPerDay": 6,
  "maxDirectLinkAdsPerSession": 3,
  "adsterraDirectLinkEnabled": true,
  "monetagDirectLinkEnabled": true,
  "adsterraDirectLink": "https://www.highrevenuenetwork.com/direct/link",
  "monetagDirectLink": "https://www.monetag.com/direct/link"
}') ON CONFLICT (id) DO NOTHING;
