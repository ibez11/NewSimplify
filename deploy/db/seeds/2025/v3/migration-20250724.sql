--
-- Query for update role grants for equipments
--

DO $$ DECLARE
r record;
BEGIN
	FOR r IN SELECT LOWER
		( KEY ) AS NAME 
	FROM
		"shared"."Tenant"
	LOOP
		IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
      EXECUTE 
      '
      INSERT INTO ' || r.NAME || '."RoleGrant" ("id", "module", "function", "label", "description", "isMain") VALUES 
      (13, ''EQUIPMENTS'', ''ACCESS'', ''Equipment Page'', ''Granting Access to the Equipment Page.'', true),
	  (14, ''EQUIPMENTS'', ''EXPORT'', ''Export Equipment Data'', ''Granting access to export data from the equipment page.'', false),
	  (15, ''EQUIPMENTS'', ''DELETE'', ''Delete Equipment'', ''Granting access to deleting equipment data from the equipment page.'', false);
      
	   INSERT INTO ' || r.NAME || '."RoleGrantPermission" ("roleGrantId", "roleId", "isActive") VALUES 
      (13, 1, true),
	  (14, 1, true),
	  (15, 1, true),
	  (13, 3, true),
	  (14, 3, true),
	  (15, 3, true);
      ';
    END IF;
		
	END LOOP;

END $$;
