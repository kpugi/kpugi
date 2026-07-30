-- Create support_chat_messages table for storing KpugiBot chat history
CREATE TABLE IF NOT EXISTS support_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  user_role TEXT CHECK (user_role IN ('creator', 'advertiser', 'both')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by user and order by time
CREATE INDEX IF NOT EXISTS idx_support_chat_messages_clerk_id_created_at 
ON support_chat_messages (clerk_id, created_at ASC);

-- Enable RLS
ALTER TABLE support_chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on support_chat_messages"
ON support_chat_messages FOR ALL
USING (true)
WITH CHECK (true);
