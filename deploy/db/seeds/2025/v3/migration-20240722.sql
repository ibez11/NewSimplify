 --
-- omit NIL for building name in service and billing address
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE
            'UPDATE ' || r.name || '."ServiceAddress" 
             SET "address" = REGEXP_REPLACE("address", ''^\s*NIL\s*,?\s*'', '''', ''i'') 
             WHERE "address" ILIKE ''NIL%''';
            EXECUTE
            'UPDATE ' || r.name || '."Client" 
             SET "billingAddress" = REGEXP_REPLACE("billingAddress", ''^\s*NIL\s*,?\s*'', '''', ''i'') 
             WHERE "billingAddress" ILIKE ''NIL%''';
        END IF;
    END LOOP;
END$$;
