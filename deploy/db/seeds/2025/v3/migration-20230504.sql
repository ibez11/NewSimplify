--
-- Insert role permission delete additional service item to tech user
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'INSERT INTO ' || r.NAME || '."RolePermission" VALUES (2, 26)';
        END IF;
    END LOOP;
END$$;
