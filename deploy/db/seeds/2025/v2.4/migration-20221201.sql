--
-- Create New Table GstTemplate
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."GstTemplate" (
			id integer NOT NULL,
			"name" varchar(255),
			"description" TEXT,
			"tax" integer NOT NULL,
			"isDefault" bool,
			"isActive" bool,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."GstTemplate" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."GstTemplate" IS ''GstTemplate for calculation.'';
		CREATE SEQUENCE ' || r.NAME || '."GstTemplate_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."GstTemplate_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."GstTemplate_id_seq" OWNED BY ' || r.NAME || '."GstTemplate"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."GstTemplate" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."GstTemplate_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."GstTemplate" ADD CONSTRAINT "GstTemplate_pkey" PRIMARY KEY (id);
		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (122, ''GST_TEMPLATES'', ''ACCESS''),
                        (123, ''GST_TEMPLATES'', ''VIEW''),
                        (124, ''GST_TEMPLATES'', ''CREATE''),
                        (125, ''GST_TEMPLATES'', ''EDIT''),
                        (126, ''GST_TEMPLATES'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 122),
                        (1, 123),
                        (1, 124),
                        (1, 125),
                        (1, 126);';
        END IF;
    END LOOP;
END$$;
