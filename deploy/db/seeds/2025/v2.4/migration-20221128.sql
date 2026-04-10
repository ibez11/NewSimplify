--
<<<<<<<< HEAD:deploy/db/seeds/v2.4/migration-20221128.sql
-- Create New Table ServiceItemEquipment
========
-- Insert GST Template value setting
>>>>>>>> dev:deploy/db/seeds/v2.4/migration-20221203.sql
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
<<<<<<<< HEAD:deploy/db/seeds/v2.4/migration-20221128.sql
            'INSERT INTO ' || r.NAME || '."RolePermission" VALUES (2, 44), (2,46)';
========
			'ALTER TABLE '|| r.name ||'."Service" 
                ADD COLUMN "gstTax" integer;
                
            UPDATE '|| r.name ||'."Service" SET "gstTax" = 7;';
>>>>>>>> dev:deploy/db/seeds/v2.4/migration-20221203.sql
        END IF;
    END LOOP;
END$$;
