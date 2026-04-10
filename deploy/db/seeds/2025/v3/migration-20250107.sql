--
-- Query for create pdf layout template table
--

DO $$ DECLARE
r record;
BEGIN
	FOR r IN SELECT LOWER
		( KEY ) AS NAME 
	FROM
		"shared"."Tenant"
	LOOP
		IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."PdfTemplateOptions" (
              "id" integer NOT NULL,
              "fileName" varchar(255),
              "headerOptionId" integer NOT NULL,
              "clientInfoOptionId" integer NOT NULL,
              "tableOptionId" integer NOT NULL,
              "tncOptionId" integer NOT NULL,
              "signatureOptionId" integer NOT NULL
            );

            ALTER TABLE ' || r.NAME || '."PdfTemplateOptions" OWNER TO simplify;
			      COMMENT ON TABLE ' || r.NAME || '."PdfTemplateOptions" IS ''Dynamic pdf template options.'';
            
            CREATE SEQUENCE ' || r.NAME || '."PdfTemplateOptions_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
            ALTER TABLE ' || r.NAME || '."PdfTemplateOptions_id_seq" OWNER TO simplify;
            ALTER SEQUENCE ' || r.NAME || '."PdfTemplateOptions_id_seq" OWNED BY ' || r.NAME || '."PdfTemplateOptions"."id";
            ALTER TABLE ONLY  ' || r.NAME || '."PdfTemplateOptions" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."PdfTemplateOptions_id_seq"''::regclass);
            ALTER TABLE ONLY  ' || r.NAME || '."PdfTemplateOptions" ADD CONSTRAINT "PdfTemplateOptions_pkey" PRIMARY KEY (id);

            INSERT INTO ' || r.NAME || '."PdfTemplateOptions"
            VALUES
            (1, ''invoice'', 1, 1, 1, 1, 0),
            (2, ''quotation'', 1, 1, 1, 1, 1);

            INSERT INTO '|| r.name ||'."Permission" VALUES 
							(169, ''PDF_TEMPLATE_OPTIONS'', ''ACCESS''),
							(170, ''PDF_TEMPLATE_OPTIONS'', ''VIEW''),
							(171, ''PDF_TEMPLATE_OPTIONS'', ''CREATE''),
							(172, ''PDF_TEMPLATE_OPTIONS'', ''EDIT''),
							(173, ''PDF_TEMPLATE_OPTIONS'', ''DELETE'');

            INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
							(1, 169),
							(1, 170),
							(1, 171),
							(1, 172),
              (1, 173),
              (3, 169),
							(3, 170),
							(3, 171),
							(3, 172),
              (3, 173);
            ';
        END IF;
		
	END LOOP;

END $$;
