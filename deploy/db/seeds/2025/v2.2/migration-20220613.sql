--
-- Add New Column whatsappService to Shared.Teant
--

ALTER TABLE shared."Tenant" ADD COLUMN "whatsappService" boolean DEFAULT false;