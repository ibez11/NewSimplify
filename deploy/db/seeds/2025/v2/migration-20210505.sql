-- New Service Feature --

-- ADD JOB DATE TIME [DATA MIGRATION]
ALTER TABLE wellac."Job" ADD  COLUMN "startDateTime" VARCHAR DEFAULT NULL;
ALTER TABLE wellac."Job" ADD  COLUMN "endDateTime" VARCHAR DEFAULT NULL;

-- MOVE DATA
UPDATE wellac."Job" SET "startDateTime" = CONCAT("jobDate", ' ', "startTime");
UPDATE wellac."Job" SET "endDateTime" = CONCAT("jobDate", ' ', "endTime");

-- CHANGE JOB TABLE STRUCTURE
ALTER TABLE wellac."Job" DROP COLUMN "jobDate";
ALTER TABLE wellac."Job" DROP COLUMN "startTime";
ALTER TABLE wellac."Job" DROP COLUMN "endTime";

ALTER TABLE wellac."Job" ALTER COLUMN "startDateTime" TYPE timestamp USING "startDateTime"::timestamp;
ALTER TABLE wellac."Job" ALTER COLUMN "endDateTime" TYPE timestamp USING "endDateTime"::timestamp;

--
-- Name: ServiceSkill; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."ServiceSkill" (
    id integer NOT NULL,
    "serviceId" integer,
    "skill" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    wellac."ServiceSkill" OWNER TO simplify;

--
-- Name: TABLE "ServiceSkill"; Type: COMMENT; Schema: wellac; Owner: simplify
--
COMMENT ON TABLE wellac."ServiceSkill" IS 'ServiceSkill for required skill of service.';

--
-- Name: ServiceSkill_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--
CREATE SEQUENCE wellac."ServiceSkill_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    wellac."ServiceSkill_id_seq" OWNER TO simplify;

--
-- Name: ServiceSkill_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--
ALTER SEQUENCE wellac."ServiceSkill_id_seq" OWNED BY wellac."ServiceSkill".id;

--
-- Name: ServiceSkill id; Type: DEFAULT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ServiceSkill"
ALTER COLUMN
    id
SET
    DEFAULT nextval('wellac."ServiceSkill_id_seq"' :: regclass);

--
-- Name: ServiceSkill ServiceSkill_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ServiceSkill"
ADD
    CONSTRAINT "ServiceSkill_pkey" PRIMARY KEY (id);

--
-- Name: ServiceSkill ServiceSkill_serviceId_fkey; Type: FK CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ServiceSkill"
ADD
    CONSTRAINT "ServiceSkill_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES wellac."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- END of ServiceSkill

--
-- Name: Schedule; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."Schedule" (
    id integer NOT NULL,
    "serviceId" integer,
    "startDateTime" character varying(255),
    "endDateTime" character varying(255),
    "repeatType" character varying(10) DEFAULT NULL,
    "repeatEvery" integer DEFAULT NULL,
    "repeatOnDate" integer DEFAULT NULL,
    "repeatOnDay" character varying(100) DEFAULT NULL,
    "repeatOnWeek" integer DEFAULT NULL,
    "repeatOnMonth" integer DEFAULT NULL,
    "repeatEndType" character varying(10) DEFAULT NULL,
    "repeatEndAfter" integer DEFAULT NULL,
    "repeatEndOnDate" date DEFAULT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    wellac."Schedule" OWNER TO simplify;

--
-- Name: TABLE "Schedule"; Type: COMMENT; Schema: wellac; Owner: simplify
--
COMMENT ON TABLE wellac."Schedule" IS 'Schedule for mutliple schedule of service.';

--
-- Name: Schedule_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--
CREATE SEQUENCE wellac."Schedule_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    wellac."Schedule_id_seq" OWNER TO simplify;

--
-- Name: Schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--
ALTER SEQUENCE wellac."Schedule_id_seq" OWNED BY wellac."Schedule".id;

--
-- Name: Schedule id; Type: DEFAULT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."Schedule"
ALTER COLUMN
    id
SET
    DEFAULT nextval('wellac."Schedule_id_seq"' :: regclass);

--
-- Name: Schedule Schedule_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."Schedule"
ADD
    CONSTRAINT "Schedule_pkey" PRIMARY KEY (id);

--
-- Name: Schedule Schedule_serviceId_fkey; Type: FK CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."Schedule"
ADD
    CONSTRAINT "Schedule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES wellac."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;


-- END OF SCHEDULE

-- TODO MOVE DATA TO SCHEDULE [DATA MIGRATION]
UPDATE wellac."Service" SET "selectedWeek" = null WHERE "selectedWeek" IN ('');
UPDATE wellac."Service" SET "selectedMonth" = null WHERE "selectedMonth" IN ('');

INSERT INTO wellac."Schedule" 
(
    "serviceId",
    "startDateTime",
    "endDateTime",
    "repeatType",
    "repeatEvery",
    "repeatOnDate",
    "repeatOnDay",
    "repeatOnWeek",
    "repeatOnMonth",
    "repeatEndType",
    "repeatEndAfter",
    "repeatEndOnDate",
    "createdAt",
    "updatedAt"
) 
(
    SELECT
        "id",
        (CASE
            WHEN "service"."serviceType" = 'ADDITIONAL'
            THEN
                (SELECT "startDateTime" FROM wellac."Job" as "job" WHERE "job"."additionalServiceId" = "service"."id")
            ELSE 
                (SELECT "startDateTime" FROM wellac."Job" as "job" WHERE "job"."serviceId" = "service"."id" ORDER BY id ASC LIMIT 1)
        END),
        (CASE
            WHEN "service"."serviceType" = 'ADDITIONAL'
            THEN
                (SELECT "endDateTime" FROM wellac."Job" as "job" WHERE "job"."additionalServiceId" = "service"."id")
            ELSE 
                (SELECT "endDateTime" FROM wellac."Job" as "job" WHERE "job"."serviceId" = "service"."id" ORDER BY id ASC LIMIT 1)
        END),
        "repeatType",
        "repeatEvery",
        (CASE WHEN "selectedDay" = 'Day' THEN to_number("selectedWeek", '99999D9') ELSE NULL END),
        (CASE WHEN "selectedDay" != 'Day' THEN to_number("selectedDay", '99999D9') ELSE NULL END),
        to_number("selectedWeek", '99999D9'),
        to_number("selectedMonth", '99999D9'),
        "repeatEndType",
        "repeatEndAfter",
        "repeatEndOnDate",
        "createdAt",
        "updatedAt"
    FROM
        wellac."Service" as "service"
);

-- CHANGE SCHEDULE DATE TIME TIME
ALTER TABLE wellac."Schedule" ALTER COLUMN "startDateTime" TYPE timestamp USING "endDateTime"::timestamp;
ALTER TABLE wellac."Schedule" ALTER COLUMN "endDateTime" TYPE timestamp USING "endDateTime"::timestamp;

-- TODO ALTER REMOVE OF SERVICE
ALTER TABLE wellac."Service" DROP COLUMN "repeatType";
ALTER TABLE wellac."Service" DROP COLUMN "repeatEvery";
ALTER TABLE wellac."Service" DROP COLUMN "selectedDay";
ALTER TABLE wellac."Service" DROP COLUMN "selectedWeek";
ALTER TABLE wellac."Service" DROP COLUMN "selectedMonth";
ALTER TABLE wellac."Service" DROP COLUMN "repeatEndType";
ALTER TABLE wellac."Service" DROP COLUMN "repeatEndAfter";
ALTER TABLE wellac."Service" DROP COLUMN "repeatEndOnDate";

-- TODO ADD SECHEDULE ID ON SERVICE ITEM [DATA MIGRATION]
ALTER TABLE
    wellac."ServiceItem"
ADD
    COLUMN "scheduleId" integer;

ALTER TABLE
    ONLY wellac."ServiceItem"
ADD
    CONSTRAINT "Schedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES wellac."Schedule"(id) ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE wellac."ServiceItem" AS si
SET "scheduleId" = (SELECT id FROM wellac."Schedule" AS sc WHERE sc."serviceId" = si."serviceId");

-- END OF SERVICE, SCHEDULE, & SERVICEITEM
