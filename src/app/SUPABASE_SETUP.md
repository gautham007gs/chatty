
# Supabase Database Setup

## Required Tables

### 1. app_configurations
```sql
CREATE TABLE app_configurations (
  id TEXT PRIMARY KEY,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. messages_log
```sql
CREATE TABLE messages_log (
  id BIGSERIAL PRIMARY KEY,
  message_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai')),
  chat_id TEXT NOT NULL DEFAULT 'kruthika_chat',
  user_id TEXT NOT NULL,
  text_content TEXT,
  has_image BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_messages_log_user_id ON messages_log(user_id);
CREATE INDEX idx_messages_log_chat_id ON messages_log(chat_id);
CREATE INDEX idx_messages_log_created_at ON messages_log(created_at);
```

### 3. daily_activity_log
```sql
CREATE TABLE daily_activity_log (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  user_id TEXT NOT NULL,
  first_visit_timestamp TIMESTAMP WITH TIME ZONE,
  last_visit_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, user_id)
);

-- Add indexes
CREATE INDEX idx_daily_activity_date ON daily_activity_log(date);
CREATE INDEX idx_daily_activity_user_id ON daily_activity_log(user_id);
```

### 4. ai_media_assets
```sql
CREATE TABLE ai_media_assets (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'audio')),
  url TEXT NOT NULL,
  caption TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_ai_media_assets_type_active ON ai_media_assets(type, is_active);
```

## Initial Data Setup

### Insert default AI profile:
```sql
INSERT INTO app_configurations (id, settings) VALUES (
  'ai_profile',
  '{
    "name": "Kruthika",
    "status": "🌸 Living my best life! Let''s chat! 🌸",
    "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "statusStoryText": "Ask me anything! 💬",
    "statusStoryImageUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "statusStoryHasUpdate": true
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET settings = EXCLUDED.settings, updated_at = NOW();
```

### Insert default ad settings:
```sql
INSERT INTO app_configurations (id, settings) VALUES (
  'ad_settings',
  '{
    "adsEnabledGlobally": true,
    "maxDirectLinkAdsPerDay": 6,
    "maxDirectLinkAdsPerSession": 3,
    "adsterraDirectLinkEnabled": true,
    "monetagDirectLinkEnabled": true,
    "adsterraDirectLink": "https://example.com/adsterra",
    "monetagDirectLink": "https://example.com/monetag"
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET settings = EXCLUDED.settings, updated_at = NOW();
```

### Insert sample media assets:
```sql
INSERT INTO ai_media_assets (type, url, caption, tags) VALUES 
('image', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', 'Just chilling! 😊', ARRAY['selfie', 'casual']),
('image', 'https://i.postimg.cc/example2.jpg', 'Good morning vibes! ☀️', ARRAY['morning', 'happy']);
```

## Environment Variables Required

Make sure these are set in your `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Enable Row Level Security (Optional)

If you want to enable RLS:
```sql
ALTER TABLE messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_media_assets ENABLE ROW LEVEL SECURITY;

-- Create policies as needed for your security requirements
```
