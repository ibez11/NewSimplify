--
-- Insert GST Template value setting
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
			'INSERT INTO ' || r.NAME || '."GstTemplate" VALUES (1, ''Gst 7%'', ''Gst for 2021-2022'', ''7'', false, true, ''2021-01-01 15:48:25.187+00'',''2021-01-01 15:48:25.187+00'');
             INSERT INTO ' || r.NAME || '."GstTemplate" VALUES (2, ''Gst 8%'', ''Gst from 2023'', ''8'', true, true, ''2022-12-01 15:48:25.187+00'',''2022-12-01 15:48:25.187+00'');';
        END IF;
    END LOOP;
END$$;
