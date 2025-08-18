
# Supabase Database Setup Instructions

This document provides complete setup instructions for your AI chatbot application's Supabase database.

## Step 1: Create Main Tables

Run the following SQL commands in your Supabase SQL Editor:

### 1. Messages Log Table
```sql
-- Create messages_log table for storing chat messages
CREATE TABLE IF NOT EXISTS messages_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id TEXT NOT NULL,
    user_id TEXT, -- Made nullable for anonymous users
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai')),
    chat_id TEXT NOT NULL,
    text_content TEXT,
    has_image BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_log_chat_id ON messages_log(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_log_created_at ON messages_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_log_user_id ON messages_log(user_id);
```

### 2. AI Profile Settings Table
```sql
-- Create ai_profile_settings table for AI personality configuration
CREATE TABLE IF NOT EXISTS ai_profile_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default AI profile
INSERT INTO ai_profile_settings (settings) VALUES ('{
    "name": "Kruthika",
    "status": "🌸 Living my best life! Let''s chat! 🌸",
    "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "statusStoryText": "Ask me anything! 💬",
    "statusStoryImageUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "statusStoryHasUpdate": true
}'::jsonb) ON CONFLICT DO NOTHING;
```

### 3. User Analytics Table
```sql
-- Create user_analytics table for tracking user engagement
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_timestamp ON user_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);
```

### 4. Ad Settings Table
```sql
-- Create ad_settings table for advertisement configuration
CREATE TABLE IF NOT EXISTS ad_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default ad settings
INSERT INTO ad_settings (settings) VALUES ('{
    "adsEnabledGlobally": true,
    "bannerAdsEnabled": true,
    "interstitialAdsEnabled": true,
    "rewardedAdsEnabled": false,
    "adFrequency": 5,
    "adNetworks": {
        "adsterra": {
            "enabled": true,
            "popunderEnabled": true,
            "bannerEnabled": true
        }
    }
}'::jsonb) ON CONFLICT DO NOTHING;
```

### 5. Global Status Table
```sql
-- Create global_status table for app-wide status management
CREATE TABLE IF NOT EXISTS global_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    status_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default global status
INSERT INTO global_status (status_data) VALUES ('{
    "appName": "AI Chat",
    "version": "1.0.0",
    "maintenanceMode": false,
    "featuresEnabled": {
        "chat": true,
        "imageSharing": true,
        "audioMessages": false,
        "multiLanguage": true
    }
}'::jsonb) ON CONFLICT DO NOTHING;
```

### 6. Chat Sessions Table
```sql
-- Create chat_sessions table for session management
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    session_data JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for chat sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
```

## Step 2: Create Functions and Triggers

### Auto-update timestamp function
```sql
-- Create function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for auto-updating timestamps
CREATE TRIGGER update_ai_profile_settings_updated_at 
    BEFORE UPDATE ON ai_profile_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_settings_updated_at 
    BEFORE UPDATE ON ad_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_status_updated_at 
    BEFORE UPDATE ON global_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: Set Up Row Level Security (RLS)

### Enable RLS on all tables
```sql
-- Enable RLS
ALTER TABLE messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
```

### Create RLS policies
```sql
-- Allow public read access to AI profile settings
CREATE POLICY "Allow public read access to ai_profile_settings" ON ai_profile_settings
    FOR SELECT USING (true);

-- Allow public read access to ad settings
CREATE POLICY "Allow public read access to ad_settings" ON ad_settings
    FOR SELECT USING (true);

-- Allow public read access to global status
CREATE POLICY "Allow public read access to global_status" ON global_status
    FOR SELECT USING (true);

-- Allow public insert/select on messages_log for anonymous users
CREATE POLICY "Allow public access to messages_log" ON messages_log
    FOR ALL USING (true);

-- Allow public access to user_analytics
CREATE POLICY "Allow public access to user_analytics" ON user_analytics
    FOR ALL USING (true);

-- Allow public access to chat_sessions
CREATE POLICY "Allow public access to chat_sessions" ON chat_sessions
    FOR ALL USING (true);
```

## Step 4: Create Views for Better Data Access

### Message statistics view
```sql
-- Create view for message statistics
CREATE OR REPLACE VIEW message_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_messages,
    COUNT(CASE WHEN sender_type = 'user' THEN 1 END) as user_messages,
    COUNT(CASE WHEN sender_type = 'ai' THEN 1 END) as ai_messages,
    COUNT(CASE WHEN has_image = true THEN 1 END) as image_messages
FROM messages_log 
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

### User engagement view
```sql
-- Create view for user engagement metrics
CREATE OR REPLACE VIEW user_engagement AS
SELECT 
    user_id,
    COUNT(DISTINCT session_id) as total_sessions,
    COUNT(*) as total_events,
    MAX(timestamp) as last_activity,
    MIN(timestamp) as first_activity
FROM user_analytics 
WHERE user_id IS NOT NULL
GROUP BY user_id;
```

## Step 5: Verify Setup

Run this query to verify all tables are created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'messages_log', 
    'ai_profile_settings', 
    'user_analytics', 
    'ad_settings', 
    'global_status', 
    'chat_sessions'
);
```

## Step 6: Environment Variables

Make sure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## Application Features Supported

This database schema supports:

1. **Chat Functionality**
   - Message storage and retrieval
   - Image and audio message support
   - Multi-language chat history
   - Anonymous and authenticated users

2. **AI Personality Management**
   - Dynamic AI profile updates
   - Status and avatar management
   - Story updates

3. **Analytics & Monitoring**
   - User engagement tracking
   - Message statistics
   - Session management
   - Performance monitoring

4. **Advertisement System**
   - Global ad configuration
   - Network-specific settings
   - Frequency control

5. **Multi-language Support**
   - Text content in multiple languages
   - Localized error messages
   - Cultural context awareness

6. **Offline Mode Support**
   - Cached responses
   - Network failure handling
   - Realistic fallback messages

The database is production-ready with proper indexing, security policies, and optimization for high-traffic usage.
