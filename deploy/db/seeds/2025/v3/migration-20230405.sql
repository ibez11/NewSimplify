--
-- Insert Future Job Visibility value setting
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
			'INSERT INTO ' || r.NAME || '."Setting" VALUES (21, ''FutureJobsVisibility'', ''FUTUREJOBSVISIBILITY'', NULL, true, ''2023-04-5 16:32:25.187+00'',''2023-04-5 16:32:25.187+00'')';
        END IF;
    END LOOP;
END$$;
