--
-- Add homeAddress and homePostalCode to UserProfile table for all tenants
--

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT LOWER(key) AS name FROM "shared"."Tenant"
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I."UserProfile"
           ADD COLUMN IF NOT EXISTS "homeDistrict" text DEFAULT ''Central / Town'',
           ADD COLUMN IF NOT EXISTS "homePostalCode" text DEFAULT 018989;',
        r.name
      );
    END IF;
  END LOOP;
END$$;
