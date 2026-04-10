--
-- Create New Table Job Label Template
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."JobLabelTemplate" (
			id integer NOT NULL,
			"name" varchar(255),
			"description" TEXT,
			"color" varchar(10),
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."JobLabelTemplate" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."JobLabelTemplate" IS ''JobLabelTemplate for job label template.'';
		CREATE SEQUENCE ' || r.NAME || '."JobLabelTemplate_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."JobLabelTemplate_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."JobLabelTemplate_id_seq" OWNED BY ' || r.NAME || '."JobLabelTemplate"."id";
		ALTER TABLE ' || r.NAME || '."JobLabelTemplate" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."JobLabelTemplate_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."JobLabelTemplate" ADD CONSTRAINT "JobLabelTemplate_pkey" PRIMARY KEY (id);
		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (97, ''JOB_LABEL_TEMPLATES'', ''ACCESS''),
                        (98, ''JOB_LABEL_TEMPLATES'', ''VIEW''),
                        (99, ''JOB_LABEL_TEMPLATES'', ''CREATE''),
                        (100, ''JOB_LABEL_TEMPLATES'', ''EDIT''),
                        (101, ''JOB_LABEL_TEMPLATES'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 97),
                        (1, 98),
                        (1, 99),
                        (1, 100),
                        (1, 101);';
        END IF;
    END LOOP;
END$$;
