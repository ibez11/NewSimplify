--
-- Insert collate item value setting
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
			'INSERT INTO ' || r.NAME || '."Setting" VALUES (32, ''SmartRanking'', ''SMARTRANKING'', ''BOTH'', true, ''2026-01-05 11:41:25.187+00'',''2026-01-05 11:41:25.187+00'')';
        END IF;
    END LOOP;
END$$;