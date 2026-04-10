--
-- Query for Create new associate table between Service and Sontact Person
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
            'CREATE TABLE ' || r.NAME || '."ServiceContactPerson" (
			"serviceId" integer NOT NULL,
			"contactPersonId" integer NOT NULL
			);
			ALTER TABLE ' || r.NAME || '."ServiceContactPerson" OWNER TO simplify;
			COMMENT ON TABLE ' || r.NAME || '."ServiceContactPerson" IS ''Contact Persons for each contract.'';
			ALTER TABLE ONLY  ' || r.NAME || '."ServiceContactPerson" ADD CONSTRAINT "ServiceContactPerson_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES '|| r.NAME ||'."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;
			ALTER TABLE ONLY  ' || r.NAME || '."ServiceContactPerson" ADD CONSTRAINT "ServiceContactPerson_contactPersonId_fkey" FOREIGN KEY ("contactPersonId") REFERENCES '|| r.NAME ||'."ContactPerson"(id) ON DELETE CASCADE ON UPDATE CASCADE;

			INSERT INTO '|| r.name ||'."Permission" VALUES 
							(157, ''SERVICE_CONTACT_PERSON'', ''ACCESS''),
							(158, ''SERVICE_CONTACT_PERSON'', ''VIEW''),
							(159, ''SERVICE_CONTACT_PERSON'', ''CREATE''),
							(160, ''SERVICE_CONTACT_PERSON'', ''EDIT''),
							(161, ''SERVICE_CONTACT_PERSON'', ''DELETE'');
			INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
							(1, 157),
							(1, 158),
							(1, 159),
							(1, 160),
                        	(1, 161);';
        END IF;
		
	END LOOP;

END $$;