-- =============================================
-- COMPLETE SUPABASE DATABASE SCHEMA
-- Copy and run this entire script in Supabase SQL Editor
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. AI SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS ai_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default AI profile
INSERT INTO ai_settings (settings) VALUES ('{
    "name": "Kruthika",
    "status": "🌸 Living my best life! Lets chat! 🌸",
    "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "statusStoryText": "Ask me anything! 💬",
    "statusStoryImageUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "statusStoryHasUpdate": true
}') ON CONFLICT DO NOTHING;

-- =============================================
-- 2. MESSAGES LOG TABLE (FIXED SCHEMA)
-- =============================================
DROP TABLE IF EXISTS messages_log CASCADE;

CREATE TABLE messages_log (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id TEXT NOT NULL DEFAULT 'anonymous',
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai')),
    message_content TEXT NOT NULL,
    message TEXT NOT NULL,
    text_content TEXT,
    has_image BOOLEAN DEFAULT FALSE,
    response_content TEXT,
    response_array JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_type TEXT DEFAULT 'user_message',
    ai_mood TEXT,
    time_of_day TEXT,
    tokens_used INTEGER DEFAULT 0,
    cached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_log_user_id ON messages_log(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_log_timestamp ON messages_log(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_log_type ON messages_log(sender_type);

-- =============================================
-- 3. USER PERSONALIZATION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_personalization (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    preferences JSONB DEFAULT '{}',
    interaction_history JSONB DEFAULT '[]',
    total_tokens_used INTEGER DEFAULT 0,
    daily_tokens_used INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    conversation_count INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_user_personalization_user_id ON user_personalization(user_id);

-- =============================================
-- 4. AD SETTINGS TABLE  
-- =============================================
CREATE TABLE IF NOT EXISTS ad_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default ad settings
INSERT INTO ad_settings (settings) VALUES ('{
    "adsEnabledGlobally": true,
    "adsterraDirectLink": "https://judicialphilosophical.com/zd46rhxy0?key=3dad0e700ddba4c8c8ace4396dd31e8a",
    "adsterraDirectLinkEnabled": true,
    "monetagDirectLink": "https://otieu.com/4/9403276",
    "monetagDirectLinkEnabled": true,
    "maxDirectLinkAdsPerDay": 6,
    "maxDirectLinkAdsPerSession": 3
}') ON CONFLICT DO NOTHING;

-- =============================================
-- 5. AI MEDIA ASSETS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS ai_media_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id TEXT UNIQUE NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'audio')),
    url TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for media queries
CREATE INDEX IF NOT EXISTS idx_ai_media_assets_type ON ai_media_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_ai_media_assets_active ON ai_media_assets(is_active);

-- =============================================
-- 6. CONVERSATION STATE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS conversation_state (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    current_mood TEXT DEFAULT 'neutral',
    message_count INTEGER DEFAULT 0,
    current_situation TEXT,
    situation_start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_offline BOOLEAN DEFAULT FALSE,
    last_goodbye_time TIMESTAMP WITH TIME ZONE,
    offline_duration_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for state management
CREATE INDEX IF NOT EXISTS idx_conversation_state_user_id ON conversation_state(user_id);

-- =============================================
-- 7. AD ANALYTICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS ad_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    ad_type TEXT NOT NULL,
    ad_network TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_ad_analytics_user_id ON ad_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_analytics_timestamp ON ad_analytics(timestamp);

-- =============================================
-- 8. CACHE STATS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS cache_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key TEXT NOT NULL,
    hit_count INTEGER DEFAULT 0,
    miss_count INTEGER DEFAULT 0,
    last_hit TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for cache analysis
CREATE INDEX IF NOT EXISTS idx_cache_stats_key ON cache_stats(cache_key);

-- =============================================
-- 9. USER SESSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0,
    tokens_consumed INTEGER DEFAULT 0,
    ads_shown INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    device_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for session analysis
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start ON user_sessions(session_start);

-- =============================================
-- 10. ENABLE ROW LEVEL SECURITY (Optional)
-- =============================================
-- Uncomment these if you need RLS
-- ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages_log ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_personalization ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ad_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_media_assets ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 11. CREATE FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at fields
CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON ai_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_personalization_updated_at BEFORE UPDATE ON user_personalization FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ad_settings_updated_at BEFORE UPDATE ON ad_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_media_assets_updated_at BEFORE UPDATE ON ai_media_assets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_conversation_state_updated_at BEFORE UPDATE ON conversation_state FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================
-- 12. SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample media assets
INSERT INTO ai_media_assets (asset_id, asset_type, url, description) VALUES
('img1', 'image', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', 'Kruthika Profile Image'),
('img2', 'image', 'https://i.postimg.cc/T1234567/sample.jpg', 'Sample Selfie'),
('audio1', 'audio', '/media/laugh.mp3', 'Laugh Sound')
ON CONFLICT (asset_id) DO NOTHING;

-- =============================================
-- SETUP COMPLETE!
-- =============================================
-- Your database is now ready for production use.
-- All tables, indexes, and sample data have been created.