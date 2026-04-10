--
-- Insert RemarksSchedule and NoteSchedule value setting
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
			'INSERT INTO ' || r.NAME || '."GstTemplate" VALUES (3, ''Gst 9%'', ''Gst from 2024'', 9, false, true, ''2023-10-05 10:11:25.187+00'',''2023-10-05 10:11:25.187+00'')';
            END IF;
    END LOOP;
END$$;
