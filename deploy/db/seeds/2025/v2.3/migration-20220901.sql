--
-- Create New Table BrandTemplate
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."BrandTemplate" (
			id integer NOT NULL,
			"name" varchar(255),
			"description" TEXT,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."BrandTemplate" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."BrandTemplate" IS ''BrandTemplate for equipment.'';
		CREATE SEQUENCE ' || r.NAME || '."BrandTemplate_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."BrandTemplate_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."BrandTemplate_id_seq" OWNED BY ' || r.NAME || '."BrandTemplate"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."BrandTemplate" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."BrandTemplate_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."BrandTemplate" ADD CONSTRAINT "BrandTemplate_pkey" PRIMARY KEY (id);
		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (112, ''BRAND_TEMPLATES'', ''ACCESS''),
                        (113, ''BRAND_TEMPLATES'', ''VIEW''),
                        (114, ''BRAND_TEMPLATES'', ''CREATE''),
                        (115, ''BRAND_TEMPLATES'', ''EDIT''),
                        (116, ''BRAND_TEMPLATES'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 112),
                        (1, 113),
                        (1, 114),
                        (1, 115),
                        (1, 116),
                        (2, 112),
                        (2, 113),
                        (2, 114),
                        (2, 115),
                        (2, 116);';
        END IF;
    END LOOP;
END$$;
