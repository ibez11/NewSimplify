--
-- Query for Create new JobNoteEquipment table
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
            'CREATE TABLE ' || r.NAME || '."JobNoteEquipment" (
			"jobNoteId" integer NOT NULL,
			"equipmentId" integer NOT NULL
			);
			ALTER TABLE ' || r.NAME || '."JobNoteEquipment" OWNER TO simplify;
			COMMENT ON TABLE ' || r.NAME || '."JobNoteEquipment" IS ''Equipment for each job note.'';
			ALTER TABLE ONLY  ' || r.NAME || '."JobNoteEquipment" ADD CONSTRAINT "JobNoteEquipment_jobNoteId_fkey" FOREIGN KEY ("jobNoteId") REFERENCES '|| r.NAME ||'."JobNote"(id) ON DELETE CASCADE ON UPDATE CASCADE;
			ALTER TABLE ONLY  ' || r.NAME || '."JobNoteEquipment" ADD CONSTRAINT "JobNoteEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES '|| r.NAME ||'."Equipment"(id) ON DELETE CASCADE ON UPDATE CASCADE;

			INSERT INTO '|| r.name ||'."Permission" VALUES 
							(164, ''JOB_NOTE_EQUIPMENT'', ''ACCESS''),
							(165, ''JOB_NOTE_EQUIPMENT'', ''VIEW''),
							(166, ''JOB_NOTE_EQUIPMENT'', ''CREATE''),
							(167, ''JOB_NOTE_EQUIPMENT'', ''EDIT''),
							(168, ''JOB_NOTE_EQUIPMENT'', ''DELETE'');
			INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
							(1, 164),
							(1, 165),
							(1, 166),
							(1, 167),
                        	(1, 168), 
                            (2, 164),
							(2, 165),
							(2, 166),
							(2, 167),
							(2, 168);
                            
            INSERT INTO ' || r.name || '."JobNoteEquipment" ("jobNoteId", "equipmentId")
            SELECT
                jn.id,
                jn."equipmentId"
            FROM ' || r.name || '."JobNote" jn
            WHERE jn."equipmentId" IS NOT NULL;                
            ';
        END IF;
		
	END LOOP;

END $$;