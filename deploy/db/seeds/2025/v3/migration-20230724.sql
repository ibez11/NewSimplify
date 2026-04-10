--
-- Create New Table InvoiceHistory
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."InvoiceHistory" (
			id integer NOT NULL,
			"invoiceId" integer NOT NULL,
			"label" varchar(255),
			"description" TEXT,
			"updatedBy" varchar(255),
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."InvoiceHistory" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."InvoiceHistory" IS ''InvoiceHistory for each invoice.'';
		CREATE SEQUENCE ' || r.NAME || '."InvoiceHistory_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."InvoiceHistory_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."InvoiceHistory_id_seq" OWNED BY ' || r.NAME || '."InvoiceHistory"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."InvoiceHistory" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."InvoiceHistory_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."InvoiceHistory" ADD CONSTRAINT "InvoiceHistory_pkey" PRIMARY KEY (id);
        ALTER TABLE ONLY  ' || r.NAME || '."InvoiceHistory" ADD CONSTRAINT "InvoiceHistory_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES '|| r.NAME ||'."Invoice"(id) ON DELETE CASCADE ON UPDATE CASCADE;';
        END IF;
    END LOOP;
END$$;
