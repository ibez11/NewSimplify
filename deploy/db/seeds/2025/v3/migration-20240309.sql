--
-- Query for change additional contact person table name to contact person and
-- Drop main contact person from Client table
-- Drop contact person from ServiceAddress table
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
                -- Drop primary contact columns from Client
                EXECUTE FORMAT('
                    ALTER TABLE ' || r.NAME || '."Client"
                    DROP COLUMN "contactPerson",
                    DROP COLUMN "contactNumber",
                    DROP COLUMN "contactEmail",
                    DROP COLUMN "country",
                    DROP COLUMN "countryCode";
                ');
            
                -- Drop contact person from ServiceAddress table
                EXECUTE FORMAT('
                    ALTER TABLE ' || r.NAME || '."ServiceAddress"
                    DROP COLUMN "contactPerson",
                    DROP COLUMN "contactNumber",
                    DROP COLUMN "countryCode",
                    DROP COLUMN "secondaryContactPerson",
                    DROP COLUMN "secondaryContactNumber";
                ');
        END IF;
        
    END LOOP;

END $$;