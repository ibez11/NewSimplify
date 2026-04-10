--
-- Create New Table ClientDocument
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."ClientDocument" (
			id integer NOT NULL,
			"notes" TEXT,
			"documentUrl" TEXT,
			"isHide" boolean,
			"clientId" integer NOT NULL,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."ClientDocument" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."ClientDocument" IS ''ClientDocument for equipment.'';
		CREATE SEQUENCE ' || r.NAME || '."ClientDocument_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."ClientDocument_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."ClientDocument_id_seq" OWNED BY ' || r.NAME || '."ClientDocument"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."ClientDocument" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."ClientDocument_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."ClientDocument" ADD CONSTRAINT "ClientDocument_pkey" PRIMARY KEY (id);
		ALTER TABLE ONLY  ' || r.NAME || '."ClientDocument" ADD CONSTRAINT "ClientDocument_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES ' || r.NAME || '."Client"(id) ON DELETE CASCADE ON UPDATE CASCADE;
       	INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (117, ''CLIENT_DOCUMENTS'', ''ACCESS''),
                        (118, ''CLIENT_DOCUMENTS'', ''VIEW''),
                        (119, ''CLIENT_DOCUMENTS'', ''CREATE''),
                        (120, ''CLIENT_DOCUMENTS'', ''EDIT''),
                        (121, ''CLIENT_DOCUMENTS'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 117),
                        (1, 118),
                        (1, 119),
                        (1, 120),
                        (1, 121),
                        (2, 117),
                        (2, 118);';
        END IF;
    END LOOP;
END$$;
