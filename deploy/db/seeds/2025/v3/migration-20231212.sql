--
-- Update Default Value Email templates
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'UPDATE '|| r.name ||'."Schedule" SET "repeatType" = ''ADHOC'' WHERE "repeatType" = ''Ad-hoc'';';
        END IF;
    END LOOP;
END$$;
