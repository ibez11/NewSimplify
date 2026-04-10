--
-- Query for drop needGST and paymentStatus from Client table
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
                EXECUTE FORMAT('ALTER TABLE ' || r.NAME || '."Client" 
                DROP COLUMN "needGST",
                DROP COLUMN "description",
                DROP COLUMN "paymentStatus";');
        END IF;
        
    END LOOP;

END $$;