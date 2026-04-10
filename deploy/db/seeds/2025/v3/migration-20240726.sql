 --
-- change data type for id qbo tu number
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE
            'ALTER TABLE ' || r.name || '."ServiceItem"
            ALTER COLUMN "idQboWithGST" TYPE INTEGER USING "idQboWithGST"::INTEGER';
            EXECUTE
            'ALTER TABLE ' || r.name || '."ServiceItem"
            ALTER COLUMN "IdQboWithoutGST" TYPE INTEGER USING "IdQboWithoutGST"::INTEGER';
        END IF;
    END LOOP;
END$$;
