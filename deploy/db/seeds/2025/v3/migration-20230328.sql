--
-- Create New Table ServiceItemEquipment
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'UPDATE '|| r.name ||'."Client" SET "contactNumber" = REPLACE("contactNumber", ''+65'', '''');
             UPDATE '|| r.name ||'."AdditionalContactPerson" SET "contactNumber" = REPLACE("contactNumber", ''+65'', '''');';
        END IF;
    END LOOP;
END$$;
