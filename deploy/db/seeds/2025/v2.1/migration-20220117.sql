--
-- Add New Column needGST to Entity Table
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 'ALTER TABLE '|| r.name ||'."Entity" 
                ADD COLUMN "needGST" bool NOT NULL DEFAULT false;';
        END IF;
    END LOOP;
END$$;
