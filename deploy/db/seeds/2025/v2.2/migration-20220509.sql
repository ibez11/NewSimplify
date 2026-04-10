--
-- Create New Table Job Label
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."JobLabel" (
			id integer NOT NULL,
			"name" varchar(255),
			"description" TEXT,
			"color" varchar(10),
            "jobId" integer NOT NULL,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."JobLabel" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."JobLabel" IS ''JobLabel for job labeling.'';
		CREATE SEQUENCE ' || r.NAME || '."JobLabel_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."JobLabel_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."JobLabel_id_seq" OWNED BY ' || r.NAME || '."JobLabel"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."JobLabel" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."JobLabel_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."JobLabel" ADD CONSTRAINT "JobLabel_pkey" PRIMARY KEY (id);
		ALTER TABLE ONLY  ' || r.NAME || '."JobLabel" ADD CONSTRAINT "JobLabel_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES ' || r.NAME || '."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;
		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (102, ''JOB_LABEL'', ''ACCESS''),
                        (103, ''JOB_LABEL'', ''VIEW''),
                        (104, ''JOB_LABEL'', ''CREATE''),
                        (105, ''JOB_LABEL'', ''EDIT''),
                        (106, ''JOB_LABEL'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 102),
                        (1, 103),
                        (1, 104),
                        (1, 105),
                        (1, 106);';
        END IF;
    END LOOP;
END$$;
