--
-- Add issueDate and expiryDate column in Service Table 
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'ALTER TABLE '|| r.name ||'."Service" 
                ADD COLUMN "issueDate" date, 
                ADD COLUMN "expiryDate" date;';
        END IF;
    END LOOP;
END$$;