--
-- Set default country for contact person table
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
			EXECUTE 'UPDATE ' || r.NAME || '."ContactPerson" SET "country" = ''Singapore''';
		
	END IF;
	
END LOOP;

END $$;