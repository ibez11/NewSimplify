--
-- Query for role grant permission
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
            'ALTER TABLE ' || r.NAME || '."Role" ADD COLUMN "description" text;
            Alter table ' || r.NAME || '."Role" ADD COLUMN "isEdited" boolean default true;
            UPDATE ' || r.NAME || '."Role" SET "isEdited" = false WHERE id in(1,2);
 
            INSERT INTO ' || r.NAME || '."Role" VALUES 
                (3, ''MANAGER'', ''2024-10-28 11:41:25.187+00'', ''2024-10-28 11:41:25.187+00'', ''All access Except exporting data on job & invoice list'', true);

            CREATE TABLE ' || r.NAME || '."RoleGrant" (
            "id" integer NOT NULL,
			"module" varchar(255),
			"function" varchar(255),
            "label" varchar(255),
            "description" text,
            "isMain" boolean
			);

			ALTER TABLE ' || r.NAME || '."RoleGrant" OWNER TO simplify;
			COMMENT ON TABLE ' || r.NAME || '."RoleGrant" IS ''Permission Grant for each role.'';
            
            CREATE SEQUENCE ' || r.NAME || '."RoleGrant_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
            ALTER TABLE ' || r.NAME || '."RoleGrant_id_seq" OWNER TO simplify;
            ALTER SEQUENCE ' || r.NAME || '."RoleGrant_id_seq" OWNED BY ' || r.NAME || '."RoleGrant"."id";
            ALTER TABLE ONLY  ' || r.NAME || '."RoleGrant" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."RoleGrant_id_seq"''::regclass);
            ALTER TABLE ONLY  ' || r.NAME || '."RoleGrant" ADD CONSTRAINT "RoleGrant_pkey" PRIMARY KEY (id);


			INSERT INTO '|| r.name ||'."RoleGrant" VALUES 
                (1, ''JOBS'', ''ACCESS'', ''Jobs Page'', ''Granting Access to the Job Page.'', true),
                (2, ''JOBS'', ''EXPORT'', ''Export Job Data'', ''Granting access to export data from the job page.'', false),
                (3, ''QUOTATIONS'', ''ACCESS'', ''Quotations Page'', ''Granting Access to the Quotations Page.'', true),
                (4, ''QUOTATIONS'', ''DELETE'', ''Delete Quotation'', ''Granting access to deleting quotation data from the quotation page.'', false),
                (5, ''INVOICES'', ''ACCESS'', ''Invoices Page'', ''Granting Access to the Invoices Page.'', true),
                (6, ''INVOICES'', ''EXPORT'', ''Export Invoice Data'', ''Granting access to export data from the invoice page.'', false),
                (7, ''INVOICES'', ''DELETE'', ''Delete Invoice'', ''Granting access to deleting invoice data from the invoice page.'', false),
                (8, ''SCHEDULES'', ''ACCESS'', ''Schedules Page'', ''Granting Access to the Schedules Page.'', true),
                (9, ''CLIENTS'', ''ACCESS'', ''Clients Page'', ''Granting Access to the Clients Page.'', true),
                (10, ''CLIENTS'', ''DELETE'', ''Delete Client'', ''Granting access to deleting client data from the client page.'', false),
                (11, ''ANALYTICS'', ''ACCESS'', ''Analytics Page'', ''Granting Access to the Analytics Page.'', true),
                (12, ''SETTINGS'', ''ACCESS'', ''Settings Page'', ''Granting Access to the Settings Page.'', true);
                            
            CREATE TABLE ' || r.NAME || '."RoleGrantPermission" (
            "roleGrantId" integer NOT NULL,
			"roleId" integer NOT NULL,
            "isActive" boolean
			);

			ALTER TABLE ' || r.NAME || '."RoleGrantPermission" OWNER TO simplify;
			COMMENT ON TABLE ' || r.NAME || '."RoleGrantPermission" IS ''Permission Grant for each role.'';
            
            ALTER TABLE ONLY  ' || r.NAME || '."RoleGrantPermission" ADD CONSTRAINT "RoleGrantPermission_roleGrantId_fkey" FOREIGN KEY ("roleGrantId") REFERENCES '|| r.NAME ||'."RoleGrant"(id) ON DELETE CASCADE ON UPDATE CASCADE;
            ALTER TABLE ONLY  ' || r.NAME || '."RoleGrantPermission" ADD CONSTRAINT "RoleGrantPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES '|| r.NAME ||'."Role"(id) ON DELETE CASCADE ON UPDATE CASCADE;
        
            INSERT INTO '|| r.name ||'."RoleGrantPermission" ("roleGrantId", "roleId", "active") VALUES
                (1, 1, true),
                (2, 1, true),
                (3, 1, true),
                (4, 1, true),
                (5, 1, true),
                (6, 1, true),
                (7, 1, true),
                (8, 1, true),
                (9, 1, true),
                (10, 1, true),
                (11, 1, true),
                (12, 1, true),
                
                (1, 3, true),
                (2, 3, false),
                (3, 3, true),
                (4, 3, true),
                (5, 3, false),
                (6, 3, false),
                (7, 3, false),
                (8, 3, true),
                (9, 3, true),
                (10, 3, true),
                (11, 3, true),
                (12, 3, false);
            ';
        END IF;
		
	END LOOP;

END $$;