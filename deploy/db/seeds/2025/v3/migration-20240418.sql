--
-- Alter Equipment table add column isMain and mainId
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE
            'ALTER TABLE '|| r.name ||'."Equipment" ADD COLUMN "isMain" boolean;
            ALTER TABLE '|| r.name ||'."Equipment" ADD COLUMN "mainId" integer;
            
            UPDATE '|| r.name ||'."Equipment" SET "isMain" = true;';
        END IF;
    END LOOP;
END$$;
