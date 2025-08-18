
-- Fix the messages_log table structure
-- Run this in your Supabase SQL editor

-- First, let's see what we have
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'messages_log';

-- Drop and recreate the table with correct structure
DROP TABLE IF EXISTS messages_log;

CREATE TABLE messages_log (
    id BIGSERIAL PRIMARY KEY,
    message_id TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai')),
    chat_id TEXT NOT NULL,
    user_id TEXT NOT NULL,  -- This was missing!
    text_content TEXT,
    has_image BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_messages_log_user_id ON messages_log(user_id);
CREATE INDEX idx_messages_log_chat_id ON messages_log(chat_id);
CREATE INDEX idx_messages_log_created_at ON messages_log(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE messages_log ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can make this more restrictive later)
CREATE POLICY "Allow all operations on messages_log" ON messages_log
    FOR ALL USING (true);
