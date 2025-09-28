-- Create leads table if it doesn't exist with all necessary columns
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  email TEXT,
  company TEXT,
  domain TEXT,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  -- Add company column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'company') THEN
    ALTER TABLE leads ADD COLUMN company TEXT;
  END IF;
  
  -- Add domain column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'domain') THEN
    ALTER TABLE leads ADD COLUMN domain TEXT;
  END IF;
  
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'status') THEN
    ALTER TABLE leads ADD COLUMN status TEXT DEFAULT 'new';
  END IF;
  
  -- Add source column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source') THEN
    ALTER TABLE leads ADD COLUMN source TEXT DEFAULT 'manual';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own leads
CREATE POLICY IF NOT EXISTS "Users can view their own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own leads
CREATE POLICY IF NOT EXISTS "Users can insert their own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own leads
CREATE POLICY IF NOT EXISTS "Users can update their own leads" ON leads
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own leads
CREATE POLICY IF NOT EXISTS "Users can delete their own leads" ON leads
  FOR DELETE USING (auth.uid() = user_id);
