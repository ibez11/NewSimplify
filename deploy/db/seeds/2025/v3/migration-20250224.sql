--
-- Add priceReportVisibility column in Client table and update its value from the Setting table
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            
            EXECUTE 'ALTER TABLE ' || r.name || '."Client" ADD COLUMN "priceReportVisibility" BOOLEAN;';

            EXECUTE 'UPDATE ' || r.name || '."Client" 
                     SET "priceReportVisibility" = (SELECT "isActive" FROM ' || r.name || '."Setting" WHERE "code" = ''PRICEREPORTVISIBILITY'') 
                   WHERE EXISTS (SELECT 1 FROM ' || r.name || '."Setting" WHERE "code" = ''PRICEREPORTVISIBILITY'');';
        END IF;
    END LOOP;
END$$;
