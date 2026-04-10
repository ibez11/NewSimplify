--
-- Copy contact number from tenant to shared.User
--

DO 
$$DECLARE
r record;
c record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
		IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
       FOR c IN EXECUTE
			    format('SELECT up."id", up."contactNumber" as phone FROM ' || r.name || '."UserProfile" up ORDER BY id')
			 LOOP
					IF (SELECT EXISTS(SELECT 1 FROM "shared"."User" WHERE id = c.id)) THEN
						UPDATE "shared"."User" SET "contactNumber" = c.phone WHERE id = c.id AND "TenantKey" = UPPER(r.name);
					END IF; 
					
				END LOOP;
		END IF;

    END LOOP;
END$$;
