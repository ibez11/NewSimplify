--
-- Query for create booking setting table
--

ALTER TABLE "shared"."Tenant"
  ADD COLUMN "isBookingEnabled" boolean DEFAULT false,
  ADD COLUMN "messageTemplate" varchar(255),
  ADD COLUMN "domain" varchar(255);

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
      'DROP TABLE IF EXISTS ' || r.NAME || '."BookingSetting" CASCADE;
      DROP SEQUENCE IF EXISTS ' || r.NAME || '."BookingSetting_id_seq" CASCADE;
      
      CREATE TABLE ' || r.NAME || '."BookingSetting" (
        "id" integer NOT NULL,
        "label" varchar(255),
        "code" varchar(255),
        "value" TEXT,
        "isActive" boolean,
        "createdAt" timestamp NOT NULL,
        "updatedAt" timestamp NOT NULL
      );

      ALTER TABLE ' || r.NAME || '."BookingSetting" OWNER TO simplify;
      COMMENT ON TABLE ' || r.NAME || '."BookingSetting" IS ''Setting for manage customer Booking Website.'';
      
      CREATE SEQUENCE ' || r.NAME || '."BookingSetting_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
      ALTER TABLE ' || r.NAME || '."BookingSetting_id_seq" OWNER TO simplify;
      ALTER SEQUENCE ' || r.NAME || '."BookingSetting_id_seq" OWNED BY ' || r.NAME || '."BookingSetting"."id";
      ALTER TABLE ONLY  ' || r.NAME || '."BookingSetting" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."BookingSetting_id_seq"''::regclass);
      ALTER TABLE ONLY  ' || r.NAME || '."BookingSetting" ADD CONSTRAINT "BookingSetting_pkey" PRIMARY KEY (id);

      INSERT INTO ' || r.NAME || '."BookingSetting"
      VALUES
      (1, ''BusinessName'', ''BUSINESS_NAME'', null, true, now(), now()),
      (2, ''Logo'', ''LOGO'', null, true, now(), now()),
      (3, ''Instructions'', ''INSTRUCTIONS'', null, true, now(), now()),
      (4, ''LimitTimeSlot'', ''LIMIT_TIME_SLOT'', null, true, now(), now()),
      (5, ''TimeSlots'', ''TIME_SLOTS'', null, true, now(), now()),
      (6, ''WorkingDays'', ''WORKING_DAYS'', null, true, now(), now()),
      (7, ''IncludePublicHoliday'', ''INCLUDE_PUBLIC_HOLIDAY'', null, true, now(), now()),
      (8, ''TimeSlotsHoliday'', ''TIME_SLOTS_HOLIDAY'', null, true, now(), now()),
      (9, ''LimitEndTimeShift'', ''LIMIT_END_TIME_SHIFT'', null, true, now(), now());

      DELETE FROM '|| r.name ||'."Permission" WHERE "module" = ''BOOKING_SETTING'';

      INSERT INTO '|| r.name ||'."Permission" VALUES 
        (184, ''BOOKING_SETTING'', ''ACCESS''),
        (185, ''BOOKING_SETTING'', ''VIEW''),
        (186, ''BOOKING_SETTING'', ''CREATE''),
        (187, ''BOOKING_SETTING'', ''EDIT''),
        (188, ''BOOKING_SETTING'', ''DELETE'');

      INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
        (1, 184),
        (1, 185),
        (1, 186),
        (1, 187),
        (1, 188),
        (3, 184),
        (3, 185),
        (3, 186),
        (3, 187),
        (3, 188);
      ';
    END IF;
		
	END LOOP;

END $$;
