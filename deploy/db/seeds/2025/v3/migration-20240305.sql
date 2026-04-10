--
-- Query for move Contact Person from Client to Additional Contact Person 
-- 
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
                -- Add isMain and country column to AdditionalContactPerson table
                EXECUTE FORMAT('
                    ALTER TABLE ' || r.NAME || '."AdditionalContactPerson"
                    ADD COLUMN "isMain" BOOLEAN,
                    ADD COLUMN "country" varchar(255);
                ');

                -- Update existing entries in AdditionalContactPerson to mark them as not main
                EXECUTE FORMAT('
                    UPDATE ' || r.NAME || '."AdditionalContactPerson"
                    SET "isMain" = FALSE
                    WHERE "clientId" IN (SELECT "id" FROM ' || r.NAME || '."Client");
                ');                   

                -- Move primary contact from Client to AdditionalContactPerson
                EXECUTE FORMAT('
                    INSERT INTO ' || r.NAME || '."AdditionalContactPerson" ("clientId", "contactPerson", "contactNumber", "contactEmail", "country", "countryCode", "isMain")
                    SELECT "id", "contactPerson", "contactNumber", "contactEmail", "country", "countryCode", TRUE
                    FROM ' || r.NAME || '."Client";
                ');

                -- Change Additional Contact Person to Contact Person
                EXECUTE FORMAT ('
                    ALTER TABLE ' || r.NAME ||'."AdditionalContactPerson"
                    RENAME TO "ContactPerson"
                ');
            
        END IF;
        
    END LOOP;

END $$;