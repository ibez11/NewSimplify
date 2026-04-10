--
-- add column country code for user profile table
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'ALTER TABLE '|| r.name ||'."UserProfile" ADD COLUMN "countryCode" varchar(255) DEFAULT ''+65'';';
        END IF;
    END LOOP;
END$$;
