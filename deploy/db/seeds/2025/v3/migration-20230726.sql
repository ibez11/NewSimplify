--
-- Create New Table CollectedAmountHistory
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."CollectedAmountHistory" (
			id integer NOT NULL,
			"serviceId" integer NOT NULL,
			"collectedBy" varchar(255),
			"collectedAmount" float8,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."CollectedAmountHistory" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."CollectedAmountHistory" IS ''CollectedAmountHistory for each contract.'';
		CREATE SEQUENCE ' || r.NAME || '."CollectedAmountHistory_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."CollectedAmountHistory_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."CollectedAmountHistory_id_seq" OWNED BY ' || r.NAME || '."CollectedAmountHistory"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."CollectedAmountHistory" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."CollectedAmountHistory_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."CollectedAmountHistory" ADD CONSTRAINT "CollectedAmountHistory_pkey" PRIMARY KEY (id);
        ALTER TABLE ONLY  ' || r.NAME || '."CollectedAmountHistory" ADD CONSTRAINT "CollectedAmountHistory_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES '|| r.NAME ||'."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;';
        END IF;
    END LOOP;
END$$;
