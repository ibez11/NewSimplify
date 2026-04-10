--
-- Create New TimeOffEmployee Table
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."TimeOffEmployee" (
			"timeOffId" integer NOT NULL,
			"userId" integer NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."TimeOffEmployee" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."TimeOffEmployee" IS ''TimeOffEmployee for each contract.'';
        ALTER TABLE ONLY  ' || r.NAME || '."TimeOffEmployee" ADD CONSTRAINT "TimeOffEmployee_timeOffId_fkey" FOREIGN KEY ("timeOffId") REFERENCES '|| r.NAME ||'."TimeOff"(id) ON DELETE CASCADE ON UPDATE CASCADE;
        ALTER TABLE ONLY  ' || r.NAME || '."TimeOffEmployee" ADD CONSTRAINT "TimeOffEmployee_userId_fkey" FOREIGN KEY ("userId") REFERENCES '|| r.NAME ||'."UserProfile"(id) ON DELETE CASCADE ON UPDATE CASCADE;

		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (152, ''TIME_OFF_EMPLOYEE'', ''ACCESS''),
                        (153, ''TIME_OFF_EMPLOYEE'', ''VIEW''),
                        (154, ''TIME_OFF_EMPLOYEE'', ''CREATE''),
                        (155, ''TIME_OFF_EMPLOYEE'', ''EDIT''),
                        (156, ''TIME_OFF_EMPLOYEE'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 152),
                        (1, 153),
                        (1, 154),
                        (1, 155),
                        (1, 156);';
        END IF;
    END LOOP;
END$$;
