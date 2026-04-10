--
-- Insert Send Whatsapp notifcation value setting
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
			'ALTER TABLE '|| r.name ||'."Client" 
                ADD COLUMN "emailReminder" bool NOT NULL DEFAULT true;
            INSERT INTO ' || r.NAME || '."Setting" VALUES (20, ''EmailNotification'', ''EMAILNOTIFICATION'', 3, true, ''2022-06-14 15:48:25.187+00'',''20022-06-14 15:48:25.187+00'');';
        END IF;
    END LOOP;
END$$;
