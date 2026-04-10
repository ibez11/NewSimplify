--
-- Create New Table Equipment
DO $$DECLARE r record;

BEGIN FOR r IN
SELECT
    LOWER(key) as name
FROM
    "shared"."Tenant" LOOP IF (
        SELECT
            EXISTS(
                SELECT
                    1
                FROM
                    information_schema.schemata
                WHERE
                    schema_name = r.name
            )
    ) THEN EXECUTE 'CREATE TABLE ' || r.NAME || '."Equipment" (
			id integer NOT NULL,
            "brand" character varying(255),
            "model" character varying(255),
            "serialNumber" character varying(255),
            "location" character varying(255),
            "dateWorkDone" date,
            "remarks" character varying(255),
            "serviceAddressId" integer NOT NULL,
            "updatedBy" integer NOT NULL,
            "isActive" boolean,
            "createdAt" timestamp with time zone NOT NULL,
            "updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."Equipment" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."Equipment" IS ''Equipment for see log of user action in app.'';
		CREATE SEQUENCE ' || r.NAME || '."Equipment_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."Equipment_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."Equipment_id_seq" OWNED BY ' || r.NAME || '."Equipment"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."Equipment" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."Equipment_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."Equipment" ADD CONSTRAINT "Equipment_pkey" PRIMARY KEY (id);
		ALTER TABLE ONLY  ' || r.NAME || '."Equipment" ADD CONSTRAINT "Equipmnet_serviceAddressId_fkey" FOREIGN KEY ("serviceAddressId") REFERENCES ' || r.NAME || '."ServiceAddress"(id) ON DELETE CASCADE ON UPDATE CASCADE;
		ALTER TABLE ONLY  ' || r.NAME || '."Equipment" ADD CONSTRAINT "Equipmnet_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES ' || r.NAME || '."UserProfile"(id) ON UPDATE CASCADE;
		INSERT INTO ' || r.name || '."Permission" VALUES 
                        (87, ''EQUIPMENTS'', ''ACCESS''),
                        (88, ''EQUIPMENTS'', ''VIEW''),
                        (89, ''EQUIPMENTS'', ''CREATE''),
                        (90, ''EQUIPMENTS'', ''EDIT''),
                        (91, ''EQUIPMENTS'', ''DELETE'');
        INSERT INTO ' || r.name || '."RolePermission" ("roleId", "permissionId") VALUES
                        (2, 82),
                        (2, 83),
                        (2, 84),
                        (2, 85),
                        (2, 86),
                        (1, 87),
                        (1, 88),
                        (1, 89),
                        (1, 90),
                        (1, 91),
                        (2, 87),
                        (2, 88),
                        (2, 89),
                        (2, 90),
                        (2, 91);';

END IF;

END LOOP;

END $$;