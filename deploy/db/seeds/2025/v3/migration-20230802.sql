--
-- Create New Table JobNoteMedia
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."JobNoteMedia" (
			id integer NOT NULL,
			"jobNoteId" integer NOT NULL,
			"fileName" varchar(255),
            "fileType" varchar(255),
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."JobNoteMedia" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."JobNoteMedia" IS ''JobNoteMedia for each job note.'';
		CREATE SEQUENCE ' || r.NAME || '."JobNoteMedia_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."JobNoteMedia_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."JobNoteMedia_id_seq" OWNED BY ' || r.NAME || '."JobNoteMedia"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."JobNoteMedia" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."JobNoteMedia_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."JobNoteMedia" ADD CONSTRAINT "JobNoteMedia_pkey" PRIMARY KEY (id);
        ALTER TABLE ONLY  ' || r.NAME || '."JobNoteMedia" ADD CONSTRAINT "JobNoteMedia_jobNoteId_fkey" FOREIGN KEY ("jobNoteId") REFERENCES '|| r.NAME ||'."JobNote"(id) ON DELETE CASCADE ON UPDATE CASCADE;

		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (137, ''JOB_NOTE_MEDIA'', ''ACCESS''),
                        (138, ''JOB_NOTE_MEDIA'', ''VIEW''),
                        (139, ''JOB_NOTE_MEDIA'', ''CREATE''),
                        (140, ''JOB_NOTE_MEDIA'', ''EDIT''),
                        (141, ''JOB_NOTE_MEDIA'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 137),
                        (1, 138),
                        (1, 139),
                        (1, 140),
                        (1, 141),
                        (2, 137),
                        (2, 138),
                        (2, 139),
                        (2, 140),
                        (2, 141);

        INSERT INTO ' || r.name || '."JobNoteMedia" ("jobNoteId", "fileName", "createdAt", "updatedAt")
            SELECT
                jn.id,
                jn."imageUrl", 
                NOW() AS "createdAt",
                NOW() AS "updatedAt"
            FROM ' || r.name || '."JobNote" jn;

        UPDATE ' || r.name || '."JobNoteMedia" SET "fileType" =  CASE WHEN "fileName" LIKE ''%.mp4'' OR "fileName" LIKE ''%.MOV'' THEN ''video'' ELSE ''image'' END;

        ALTER TABLE ' || r.name || '."JobNote" DROP COLUMN "imageUrl";';

        END IF;
    END LOOP;
END$$;
