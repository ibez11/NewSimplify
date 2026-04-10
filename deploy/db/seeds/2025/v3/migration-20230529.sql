--
-- Insert RemarksSchedule and NoteSchedule value setting
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
			'INSERT INTO ' || r.NAME || '."Setting" VALUES (22, ''RemarksSchedule'', ''REMARKSSCHEDULE'', NULL, false, ''2023-05-29 10:11:25.187+00'',''2023-05-29 10:11:25.187+00'')';
            EXECUTE 
            'INSERT INTO ' || r.NAME || '."Setting" VALUES (23, ''NoteSchedule'', ''NOTESCHEDULE'', NULL, false, ''2023-05-29 10:11:25.187+00'',''2023-05-29 10:11:25.187+00'')';
        END IF;
    END LOOP;
END$$;
