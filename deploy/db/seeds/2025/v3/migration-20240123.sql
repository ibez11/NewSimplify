--
-- Create New Table CustomField
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."CustomField" (
			id integer NOT NULL,
			"serviceId" integer NOT NULL,
			"label" varchar(255),
			"value" varchar(255),
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."CustomField" OWNER TO simplify;
        CREATE SEQUENCE ' || r.NAME || '."CustomField_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."CustomField_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."CustomField_id_seq" OWNED BY ' || r.NAME || '."CustomField"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."CustomField" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."CustomField_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."CustomField" ADD CONSTRAINT "CustomField_pkey" PRIMARY KEY (id);
		COMMENT ON TABLE ' || r.NAME || '."CustomField" IS ''CustomField for each contract.'';
        ALTER TABLE ONLY  ' || r.NAME || '."CustomField" ADD CONSTRAINT "CustomField_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES '|| r.NAME ||'."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;
        

		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (142, ''CUSTOM_FIELD'', ''ACCESS''),
                        (143, ''CUSTOM_FIELD'', ''VIEW''),
                        (144, ''CUSTOM_FIELD'', ''CREATE''),
                        (145, ''CUSTOM_FIELD'', ''EDIT''),
                        (146, ''CUSTOM_FIELD'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 142),
                        (1, 143),
                        (1, 144),
                        (1, 145),
                        (1, 146);';
        END IF;
    END LOOP;
END$$;
