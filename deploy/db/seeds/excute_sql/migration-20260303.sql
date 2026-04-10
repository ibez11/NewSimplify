--
-- Insert Call Client value setting
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
			'INSERT INTO ' || r.NAME || '."Setting" VALUES (34, ''CallClientPermission'', ''CALLCLIENTPERMISSION'', NULL, true, ''2026-03-03 16:32:25.187+00'',''2026-03-03 16:32:25.187+00'')';
        END IF;
    END LOOP;
END$$;
