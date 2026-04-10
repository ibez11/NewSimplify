--
-- Create New Table ServiceItemEquipment
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'ALTER TABLE '|| r.name ||'."Job" 
                ADD COLUMN "additionalCollectedAmount" float8,
                ADD COLUMN "additionalOutstandingAmount" float8;
                
            UPDATE '|| r.name ||'."Job" SET "additionalCollectedAmount" = 0, "additionalOutstandingAmount" = 0;';
        END IF;
    END LOOP;
END$$;
