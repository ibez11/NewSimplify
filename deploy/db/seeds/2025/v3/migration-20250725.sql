--
-- Add warrantyStartDate column in Equipment table

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            
            EXECUTE 'ALTER TABLE ' || r.name || '."Equipment" ADD COLUMN "description" text;';
            EXECUTE 'ALTER TABLE ' || r.name || '."Equipment" ADD COLUMN "warrantyStartDate" timestamp default null;';
            EXECUTE 'ALTER TABLE ' || r.name || '."Equipment" ADD COLUMN "warrantyEndDate" timestamp default null;';

        END IF;
    END LOOP;
END$$;
