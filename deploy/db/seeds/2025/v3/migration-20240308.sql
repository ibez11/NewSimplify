--
-- Query for move primary client contact person to service contact person
--

DO $$ DECLARE
r record;
BEGIN
	FOR r IN SELECT LOWER
		( KEY ) AS NAME 
	FROM
		"shared"."Tenant"
	LOOP
        IF
            EXISTS ( SELECT 1 FROM information_schema.schemata WHERE SCHEMA_NAME = r.NAME ) THEN
            EXECUTE FORMAT('
                INSERT INTO '|| r.name || '."ServiceContactPerson" ("serviceId", "contactPersonId")
                SELECT s."id", cp."id"
                FROM '|| r.name || '."Service" s
                INNER JOIN '|| r.name || '."Client" c ON s."clientId" = c."id"
                INNER JOIN '|| r.name || '."ContactPerson" cp ON c."id" = cp."clientId"
                WHERE cp."isMain" = TRUE;
            ');
        END IF;
        
    END LOOP;

END $$;