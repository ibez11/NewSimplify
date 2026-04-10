--
-- alter on delete client cascade
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE
            'ALTER TABLE ' || r.name || '."Service" DROP CONSTRAINT IF EXISTS "Service_clientId_fkey";';

            EXECUTE
            'ALTER TABLE ' || r.name || '."Service" ADD CONSTRAINT "Service_clientId_fkey" 
            FOREIGN KEY ("clientId") REFERENCES '|| r.NAME ||'."Client"("id") ON DELETE CASCADE;';

            EXECUTE
            'ALTER TABLE ' || r.name || '."ServiceAddress" DROP CONSTRAINT IF EXISTS "ServiceAddress_clientId_fkey";';
            
            EXECUTE
            'ALTER TABLE ' || r.name || '."ServiceAddress" ADD CONSTRAINT "ServiceAddress_clientId_fkey" 
            FOREIGN KEY ("clientId") REFERENCES '|| r.NAME ||'."Client"("id") ON DELETE CASCADE;';
        END IF;
    END LOOP;
END$$;
