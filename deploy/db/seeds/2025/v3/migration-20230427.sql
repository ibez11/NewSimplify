--
-- Create New Table JobExpenses and JobExpensesItem
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."JobExpenses" (
			id integer NOT NULL,
			"jobId" integer NOT NULL,
			"serviceId" integer NOT NULL,
			"header" varchar(255),
			"remarks" TEXT,
			"totalExpenses" float8,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."JobExpenses" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."JobExpenses" IS ''JobExpenses for each job.'';
		CREATE SEQUENCE ' || r.NAME || '."JobExpenses_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."JobExpenses_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."JobExpenses_id_seq" OWNED BY ' || r.NAME || '."JobExpenses"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."JobExpenses" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."JobExpenses_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."JobExpenses" ADD CONSTRAINT "JobExpenses_pkey" PRIMARY KEY (id);
        ALTER TABLE ONLY  ' || r.NAME || '."JobExpenses" ADD CONSTRAINT "JobExpenses_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES '|| r.NAME ||'."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;
        ALTER TABLE ONLY  ' || r.NAME || '."JobExpenses" ADD CONSTRAINT "JobExpenses_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES '|| r.NAME ||'."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;
        
            CREATE TABLE ' || r.NAME || '."JobExpensesItem" (
			id integer NOT NULL,
			"jobExpensesId" integer NOT NULL,
			"itemName" varchar(255),
			"remarks" TEXT,
			"price" float8,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."JobExpensesItem" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."JobExpensesItem" IS ''JobExpensesItem for each job.'';
		CREATE SEQUENCE ' || r.NAME || '."JobExpensesItem_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."JobExpensesItem_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."JobExpensesItem_id_seq" OWNED BY ' || r.NAME || '."JobExpensesItem"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."JobExpensesItem" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."JobExpensesItem_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."JobExpensesItem" ADD CONSTRAINT "JobExpensesItem_pkey" PRIMARY KEY (id);
        ALTER TABLE ONLY  ' || r.NAME || '."JobExpensesItem" ADD CONSTRAINT "JobExpensesItem_jobExpensesId_fkey" FOREIGN KEY ("jobExpensesId") REFERENCES '|| r.NAME ||'."JobExpenses"(id) ON DELETE CASCADE ON UPDATE CASCADE;

        
		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (127, ''JOB_EXPENSES'', ''ACCESS''),
                        (128, ''JOB_EXPENSES'', ''VIEW''),
                        (129, ''JOB_EXPENSES'', ''CREATE''),
                        (130, ''JOB_EXPENSES'', ''EDIT''),
                        (131, ''JOB_EXPENSES'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 127),
                        (1, 128),
                        (1, 129),
                        (1, 130),
                        (1, 131),
                        (2, 127),
                        (2, 128),
                        (2, 129),
                        (2, 130),
                        (2, 131);';
        END IF;
    END LOOP;
END$$;
