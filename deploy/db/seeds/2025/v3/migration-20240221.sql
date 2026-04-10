--
-- Create New TimeOff Table
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."TimeOff" (
			id integer NOT NULL,
			"status" varchar(255),
			"remarks" varchar(255),
			"startDateTime" timestamp,
			"endDateTime" timestamp,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."TimeOff" OWNER TO simplify;
        CREATE SEQUENCE ' || r.NAME || '."TimeOff_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."TimeOff_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."TimeOff_id_seq" OWNED BY ' || r.NAME || '."TimeOff"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."TimeOff" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."TimeOff_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."TimeOff" ADD CONSTRAINT "TimeOff_pkey" PRIMARY KEY (id);
		COMMENT ON TABLE ' || r.NAME || '."TimeOff" IS ''TimeOff for each contract.'';        

		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (147, ''TIME_OFF'', ''ACCESS''),
                        (148, ''TIME_OFF'', ''VIEW''),
                        (149, ''TIME_OFF'', ''CREATE''),
                        (150, ''TIME_OFF'', ''EDIT''),
                        (151, ''TIME_OFF'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 147),
                        (1, 148),
                        (1, 149),
                        (1, 150),
                        (1, 151);';
        END IF;
    END LOOP;
END$$;
