--
-- Update Job Note Table
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 'ALTER TABLE '|| r.name ||'."JobNote" ADD COLUMN "jobNoteType" VARCHAR DEFAULT NULL;
                ALTER TABLE '|| r.name ||'."JobNote" ADD COLUMN "equipmentId" integer;
                ALTER TABLE '|| r.name ||'."JobNote" ADD COLUMN "createdBy" integer;
                ALTER TABLE ONLY '|| r.name ||'."JobNote" ADD CONSTRAINT "JobNote_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES '|| r.name ||'."Equipment"(id) ON DELETE CASCADE ON UPDATE CASCADE;
                ALTER TABLE ONLY '|| r.name ||'."JobNote" ADD CONSTRAINT "JobNote_userProfileId_fkey" FOREIGN KEY ("createdBy") REFERENCES '|| r.name ||'."UserProfile"(id) ON DELETE CASCADE ON UPDATE CASCADE;
                UPDATE '|| r.name ||'."JobNote" SET "jobNoteType" = ''GENERAL'';';
        END IF;
    END LOOP;
END$$;
