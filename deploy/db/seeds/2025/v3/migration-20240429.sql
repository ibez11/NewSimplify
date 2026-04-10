 --
-- add chequeNumber column in Job and Invoice table
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE
            'ALTER TABLE '|| r.name ||'."Job" ADD COLUMN "chequeNumber" varchar(255);
            ALTER TABLE '|| r.name ||'."Invoice" ADD COLUMN "chequeNumber" varchar(255);';
        END IF;
    END LOOP;
END$$;
