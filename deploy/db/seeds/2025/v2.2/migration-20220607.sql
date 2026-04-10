--
-- Create New Table Notification
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."Notification" (
			id integer NOT NULL,
			"title" varchar(255),
			"description" TEXT,
            "type" varchar(255),
			"status" varchar(255),
            "jobId" integer,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."Notification" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."Notification" IS ''Notification for web app.'';
		CREATE SEQUENCE ' || r.NAME || '."Notification_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."Notification_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."Notification_id_seq" OWNED BY ' || r.NAME || '."Notification"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."Notification" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."Notification_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."Notification" ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);
		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (107, ''NOTIFICATIONS'', ''ACCESS''),
                        (108, ''NOTIFICATIONS'', ''VIEW''),
                        (109, ''NOTIFICATIONS'', ''CREATE''),
                        (110, ''NOTIFICATIONS'', ''EDIT''),
                        (111, ''NOTIFICATIONS'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 107),
                        (1, 108),
                        (1, 109),
                        (1, 110),
                        (1, 111);';
        END IF;
    END LOOP;
END$$;
