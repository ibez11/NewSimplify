--
-- Insert Sync to accounting app
--

DO $$DECLARE r record;
BEGIN
    EXECUTE 
    'ALTER TABLE "shared"."Tenant" 
       ADD COLUMN "syncApp" bool NOT NULL DEFAULT true;';
END$$;
