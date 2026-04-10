--
-- Create New Table ServiceItemEquipment
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."ServiceItemEquipment" (
			"serviceItemId" integer NOT NULL,
			"equipmentId" integer NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."ServiceItemEquipment" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."ServiceItemEquipment" IS ''Each item have equipment.'';
		ALTER TABLE ' || r.NAME || '."ServiceItemEquipment" ADD CONSTRAINT "ServiceItemEquipment_pkey" PRIMARY KEY ("serviceItemId","equipmentId");
		ALTER TABLE ' || r.NAME || '."ServiceItemEquipment" ADD CONSTRAINT "ServiceItemEquipment_serviceItemId_fkey" FOREIGN KEY ("serviceItemId") REFERENCES ' || r.NAME || '."ServiceItem"(id) ON DELETE CASCADE ON UPDATE CASCADE;
		ALTER TABLE ' || r.NAME || '."ServiceItemEquipment" ADD CONSTRAINT "ServiceItemEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES ' || r.NAME || '."Equipment"(id) ON DELETE CASCADE ON UPDATE CASCADE;';
        END IF;
    END LOOP;
END$$;
