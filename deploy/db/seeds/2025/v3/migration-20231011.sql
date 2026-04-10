--
-- Add newInvoice and updateInvoice column in Invoice Table 
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'ALTER TABLE '|| r.name ||'."Invoice" 
                ADD COLUMN "newInvoice" timestamp DEFAULT NULL,
                ADD COLUMN "updateInvoice" timestamp DEFAULT NULL;';
        END IF;
    END LOOP;
END$$;
