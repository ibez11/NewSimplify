--
-- Insert Send Whatsapp notifcation value setting
--

DO $$DECLARE r record;
BEGIN
    EXECUTE 
    'ALTER TABLE "shared"."Tenant" 
       ADD COLUMN "emailService" bool NOT NULL DEFAULT true;';
END$$;
