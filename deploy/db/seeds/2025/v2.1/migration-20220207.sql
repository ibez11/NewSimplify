--
-- Create New Table Job Note Template
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."JobNoteTemplate" (
			id integer NOT NULL,
			"notes" TEXT,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."JobNoteTemplate" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."JobNoteTemplate" IS ''JobNoteTemplate for job note template.'';
		CREATE SEQUENCE ' || r.NAME || '."JobNoteTemplate_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."JobNoteTemplate_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."JobNoteTemplate_id_seq" OWNED BY ' || r.NAME || '."JobNoteTemplate"."id";
		ALTER TABLE ' || r.NAME || '."JobNoteTemplate" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."JobNoteTemplate_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."JobNoteTemplate" ADD CONSTRAINT "JobNoteTemplate_pkey" PRIMARY KEY (id);
		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (92, ''JOB_NOTE_TEMPLATES'', ''ACCESS''),
                        (93, ''JOB_NOTE_TEMPLATES'', ''VIEW''),
                        (94, ''JOB_NOTE_TEMPLATES'', ''CREATE''),
                        (95, ''JOB_NOTE_TEMPLATES'', ''EDIT''),
                        (96, ''JOB_NOTE_TEMPLATES'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 92),
                        (1, 93),
                        (1, 94),
                        (1, 95),
                        (1, 96),
                        (2, 92),
                        (2, 93),
                        (2, 94),
                        (2, 95),
                        (2, 96);';
        END IF;
    END LOOP;
END$$;
