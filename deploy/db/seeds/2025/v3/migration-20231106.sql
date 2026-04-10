--
-- Add dueDate column in Invoice Table 
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'ALTER TABLE '|| r.name ||'."Invoice" 
                ADD COLUMN "dueDate" varchar(255) DEFAULT ''Due on Receipt''';
        END IF;
    END LOOP;
END$$;