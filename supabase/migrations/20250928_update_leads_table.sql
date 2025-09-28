-- Update leads table to include columns needed for email verification leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS domain TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Update existing leads to have default values
UPDATE leads 
SET 
  company = COALESCE(company, 'Unknown Company'),
  domain = COALESCE(domain, ''),
  status = COALESCE(status, 'new'),
  source = COALESCE(source, 'manual')
WHERE company IS NULL OR domain IS NULL OR status IS NULL OR source IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads(domain);

-- Add comments for documentation
COMMENT ON COLUMN leads.company IS 'Company name derived from email domain or manually entered';
COMMENT ON COLUMN leads.domain IS 'Email domain for the lead';
COMMENT ON COLUMN leads.status IS 'Lead status: new, contacted, qualified, converted, etc.';
COMMENT ON COLUMN leads.source IS 'How the lead was generated: email_verification, manual, import, etc.';
