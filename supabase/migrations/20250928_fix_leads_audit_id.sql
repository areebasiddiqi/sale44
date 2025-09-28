-- Make audit_id nullable in leads table to allow leads from email verification
ALTER TABLE leads ALTER COLUMN audit_id DROP NOT NULL;

-- Add a check constraint to ensure either audit_id is provided OR source is 'email_verification'
ALTER TABLE leads ADD CONSTRAINT leads_audit_id_or_email_verification 
CHECK (audit_id IS NOT NULL OR source = 'email_verification');
