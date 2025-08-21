
-- Fix missing columns in messages_log table
ALTER TABLE messages_log 
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS text_content TEXT,
ADD COLUMN IF NOT EXISTS has_image BOOLEAN DEFAULT false;

-- Update existing column name if needed
DO $$ 
BEGIN 
    IF EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'messages_log' AND column_name = 'message_content') THEN
        ALTER TABLE messages_log RENAME COLUMN message_content TO text_content;
    END IF;
END $$;

-- Ensure all required columns exist
CREATE TABLE IF NOT EXISTS messages_log (
    id SERIAL PRIMARY KEY,
    message_id TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    user_id TEXT,
    text_content TEXT,
    has_image BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_log_user_id ON messages_log(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_log_chat_id ON messages_log(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_log_created_at ON messages_log(created_at);
