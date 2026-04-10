 --
-- add jobId column in CollectedAmountHostory table
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE
            'ALTER TABLE '|| r.name ||'."CollectedAmountHistory" ADD COLUMN "jobId" integer;';
            EXECUTE
            'ALTER TABLE ONLY  ' || r.NAME || '."CollectedAmountHistory" ADD CONSTRAINT "CollectedAmountHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES '|| r.NAME ||'."Job"(id) ON DELETE CASCADE;';

        END IF;
    END LOOP;
END$$;
