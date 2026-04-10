--
-- Add role permission for technician that can edit seperate quotation
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES (2, 25);';
        END IF;
    END LOOP;
END$$;
