--
-- Query for role manager permission
--

DO $$ 
DECLARE
    r RECORD;
    values_str TEXT := '';
BEGIN
    FOR r IN 
        SELECT LOWER(KEY) AS name 
        FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            values_str := '';
            FOR i IN 1..168 LOOP
                values_str := values_str || '(3, ' || i || ')';
                
                IF i < 168 THEN
                    values_str := values_str || ', ';
                END IF;
            END LOOP;
            EXECUTE 
                'INSERT INTO ' || r.name || '."RolePermission" ("roleId", "permissionId") VALUES ' || values_str || ';';
        END IF;
    END LOOP;
END $$;
