--
-- contact email set to null if the value is empty string
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
			EXECUTE
			'UPDATE ' || r.NAME || '."Client" SET "contactEmail" = NULL WHERE "contactEmail" = ''''';
		
	END IF;
	
END LOOP;

END $$;