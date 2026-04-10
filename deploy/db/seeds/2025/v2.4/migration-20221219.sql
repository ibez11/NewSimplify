--
-- Insert GST Template value setting
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
<<<<<<<< HEAD:deploy/db/execute_sql/migration-20221128.sql
            'INSERT INTO ' || r.NAME || '."RolePermission" VALUES (2, 44), (2,46)';
========
			'ALTER TABLE '|| r.name ||'."Entity" 
                ADD COLUMN "invoiceFooter" text;';
>>>>>>>> dev:deploy/db/seeds/v2.4/migration-20221219.sql
        END IF;
    END LOOP;
END$$;
