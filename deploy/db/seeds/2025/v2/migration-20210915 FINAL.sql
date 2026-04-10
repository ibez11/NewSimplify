--
-- Name: SkillTemplate; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."SkillTemplate" (
    id integer NOT NULL,
    "name" character varying(255),
    "description" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    gcool."SkillTemplate" OWNER TO simplify;

--
-- Name: TABLE "SkillTemplate"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."SkillTemplate" IS 'SkillTemplate for see log of user action in app.';

--
-- Name: SkillTemplate_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."SkillTemplate_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    gcool."SkillTemplate_id_seq" OWNER TO simplify;

--
-- Name: SkillTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."SkillTemplate_id_seq" OWNED BY gcool."SkillTemplate".id;

--
-- Name: SkillTemplate id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."SkillTemplate"
ALTER COLUMN
    id
SET
    DEFAULT nextval('gcool."SkillTemplate_id_seq"' :: regclass);

--
-- Name: SkillTemplate SkillTemplate_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."SkillTemplate"
ADD
    CONSTRAINT "SkillTemplate_pkey" PRIMARY KEY (id);

-- for update permission data
INSERT INTO
    gcool."Permission"
VALUES
    (72, 'SKILL_TEMPLATES', 'ACCESS'),
    (73, 'SKILL_TEMPLATES', 'VIEW'),
    (74, 'SKILL_TEMPLATES', 'CREATE'),
    (75, 'SKILL_TEMPLATES', 'EDIT'),
    (76, 'SKILL_TEMPLATES', 'DELETE');

INSERT INTO
    gcool."RolePermission" ("roleId", "permissionId")
VALUES
    (1, 72),
    (1, 73),
    (1, 74),
    (1, 75),
    (1, 76);

--
-- Name: ChecklistTemplate; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."ChecklistTemplate" (
    id integer NOT NULL,
    "name" character varying(255),
    "description" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    gcool."ChecklistTemplate" OWNER TO simplify;

--
-- Name: TABLE "ChecklistTemplate"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."ChecklistTemplate" IS 'ChecklistTemplate for see log of user action in app.';

--
-- Name: ChecklistTemplate_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."ChecklistTemplate_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    gcool."ChecklistTemplate_id_seq" OWNER TO simplify;

--
-- Name: ChecklistTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."ChecklistTemplate_id_seq" OWNED BY gcool."ChecklistTemplate".id;

--
-- Name: ChecklistTemplate id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ChecklistTemplate"
ALTER COLUMN
    id
SET
    DEFAULT nextval('gcool."ChecklistTemplate_id_seq"' :: regclass);

--
-- Name: ChecklistTemplate ChecklistTemplate_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ChecklistTemplate"
ADD
    CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY (id);

--
-- Name: ChecklistItemTemplate; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."ChecklistItemTemplate" (
    id integer NOT NULL,
    "checklistId" integer NOT NULL,
    "name" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    gcool."ChecklistItemTemplate" OWNER TO simplify;

--
-- Name: TABLE "ChecklistItemTemplate"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."ChecklistItemTemplate" IS 'ChecklistItemTemplate for see log of user action in app.';

--
-- Name: ChecklistItemTemplate_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."ChecklistItemTemplate_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    gcool."ChecklistItemTemplate_id_seq" OWNER TO simplify;

--
-- Name: ChecklistItemTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."ChecklistItemTemplate_id_seq" OWNED BY gcool."ChecklistItemTemplate".id;

--
-- Name: ChecklistItemTemplate id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ChecklistItemTemplate"
ALTER COLUMN
    id
SET
    DEFAULT nextval(
        'gcool."ChecklistItemTemplate_id_seq"' :: regclass
    );

--
-- Name: ChecklistItemTemplate ChecklistItemTemplate_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ChecklistItemTemplate"
ADD
    CONSTRAINT "ChecklistItemTemplate_pkey" PRIMARY KEY (id);

--
-- Name: ChecklistItemTemplate ChecklistItemTemplate_checklistId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ChecklistItemTemplate"
ADD
    CONSTRAINT "ChecklistItemTemplate_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES gcool."ChecklistTemplate"(id) ON DELETE CASCADE ON UPDATE CASCADE;


-- for update permission data
INSERT INTO
    gcool."Permission"
VALUES
    (77, 'CHECKLIST_TEMPLATES', 'ACCESS'),
    (78, 'CHECKLIST_TEMPLATES', 'VIEW'),
    (79, 'CHECKLIST_TEMPLATES', 'CREATE'),
    (80, 'CHECKLIST_TEMPLATES', 'EDIT'),
    (81, 'CHECKLIST_TEMPLATES', 'DELETE');

INSERT INTO
    gcool."RolePermission" ("roleId", "permissionId")
VALUES
    (1, 77),
    (1, 78),
    (1, 79),
    (1, 80),
    (1, 81);

--
-- Name: UserSkill; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."UserSkill" (
    id integer NOT NULL,
    "userProfileId" integer,
    "skill" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    gcool."UserSkill" OWNER TO simplify;

--
-- Name: TABLE "UserSkill"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."UserSkill" IS 'UserSkill for see log of user action in app.';

--
-- Name: UserSkill_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."UserSkill_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    gcool."UserSkill_id_seq" OWNER TO simplify;

--
-- Name: UserSkill_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."UserSkill_id_seq" OWNED BY gcool."UserSkill".id;

--
-- Name: UserSkill id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."UserSkill"
ALTER COLUMN
    id
SET
    DEFAULT nextval('gcool."UserSkill_id_seq"' :: regclass);

--
-- Name: UserSkill UserSkill_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."UserSkill"
ADD
    CONSTRAINT "UserSkill_pkey" PRIMARY KEY (id);

--
-- Name: UserSkill UserSkill_jobId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."UserSkill"
ADD
    CONSTRAINT "UserSkill_jobId_fkey" FOREIGN KEY ("userProfileId") REFERENCES gcool."UserProfile"(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- New Service Feature --

-- ADD JOB DATE TIME [DATA MIGRATION]
ALTER TABLE gcool."Job" ADD  COLUMN "startDateTime" VARCHAR DEFAULT NULL;
ALTER TABLE gcool."Job" ADD  COLUMN "endDateTime" VARCHAR DEFAULT NULL;

-- MOVE DATA
UPDATE gcool."Job" SET "startDateTime" = CONCAT("jobDate", ' ', "startTime");
UPDATE gcool."Job" SET "endDateTime" = CONCAT("jobDate", ' ', "endTime");

-- CHANGE JOB TABLE STRUCTURE
ALTER TABLE gcool."Job" DROP COLUMN "jobDate";
ALTER TABLE gcool."Job" DROP COLUMN "startTime";
ALTER TABLE gcool."Job" DROP COLUMN "endTime";

ALTER TABLE gcool."Job" ALTER COLUMN "startDateTime" TYPE timestamp USING "startDateTime"::timestamp;
ALTER TABLE gcool."Job" ALTER COLUMN "endDateTime" TYPE timestamp USING "endDateTime"::timestamp;

--
-- Name: ServiceSkill; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."ServiceSkill" (
    id integer NOT NULL,
    "serviceId" integer,
    "skill" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    gcool."ServiceSkill" OWNER TO simplify;

--
-- Name: TABLE "ServiceSkill"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."ServiceSkill" IS 'ServiceSkill for required skill of service.';

--
-- Name: ServiceSkill_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."ServiceSkill_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    gcool."ServiceSkill_id_seq" OWNER TO simplify;

--
-- Name: ServiceSkill_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."ServiceSkill_id_seq" OWNED BY gcool."ServiceSkill".id;

--
-- Name: ServiceSkill id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ServiceSkill"
ALTER COLUMN
    id
SET
    DEFAULT nextval('gcool."ServiceSkill_id_seq"' :: regclass);

--
-- Name: ServiceSkill ServiceSkill_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ServiceSkill"
ADD
    CONSTRAINT "ServiceSkill_pkey" PRIMARY KEY (id);

--
-- Name: ServiceSkill ServiceSkill_serviceId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ServiceSkill"
ADD
    CONSTRAINT "ServiceSkill_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES gcool."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- END of ServiceSkill

--
-- Name: Schedule; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."Schedule" (
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
    gcool."Schedule" OWNER TO simplify;

--
-- Name: TABLE "Schedule"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."Schedule" IS 'Schedule for mutliple schedule of service.';

--
-- Name: Schedule_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."Schedule_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    gcool."Schedule_id_seq" OWNER TO simplify;

--
-- Name: Schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."Schedule_id_seq" OWNED BY gcool."Schedule".id;

--
-- Name: Schedule id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."Schedule"
ALTER COLUMN
    id
SET
    DEFAULT nextval('gcool."Schedule_id_seq"' :: regclass);

--
-- Name: Schedule Schedule_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."Schedule"
ADD
    CONSTRAINT "Schedule_pkey" PRIMARY KEY (id);

--
-- Name: Schedule Schedule_serviceId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."Schedule"
ADD
    CONSTRAINT "Schedule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES gcool."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;


-- END OF SCHEDULE

-- TODO MOVE DATA TO SCHEDULE [DATA MIGRATION]
UPDATE gcool."Service" SET "selectedWeek" = null WHERE "selectedWeek" IN ('');
UPDATE gcool."Service" SET "selectedMonth" = null WHERE "selectedMonth" IN ('');

INSERT INTO gcool."Schedule" 
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
                (SELECT "startDateTime" FROM gcool."Job" as "job" WHERE "job"."additionalServiceId" = "service"."id")
            ELSE 
                (SELECT "startDateTime" FROM gcool."Job" as "job" WHERE "job"."serviceId" = "service"."id" ORDER BY id ASC LIMIT 1)
        END),
        (CASE
            WHEN "service"."serviceType" = 'ADDITIONAL'
            THEN
                (SELECT "endDateTime" FROM gcool."Job" as "job" WHERE "job"."additionalServiceId" = "service"."id")
            ELSE 
                (SELECT "endDateTime" FROM gcool."Job" as "job" WHERE "job"."serviceId" = "service"."id" ORDER BY id ASC LIMIT 1)
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
        gcool."Service" as "service"
);

-- CHANGE SCHEDULE DATE TIME TIME
ALTER TABLE gcool."Schedule" ALTER COLUMN "startDateTime" TYPE timestamp USING "endDateTime"::timestamp;
ALTER TABLE gcool."Schedule" ALTER COLUMN "endDateTime" TYPE timestamp USING "endDateTime"::timestamp;

-- TODO ALTER REMOVE OF SERVICE
ALTER TABLE gcool."Service" DROP COLUMN "repeatType";
ALTER TABLE gcool."Service" DROP COLUMN "repeatEvery";
ALTER TABLE gcool."Service" DROP COLUMN "selectedDay";
ALTER TABLE gcool."Service" DROP COLUMN "selectedWeek";
ALTER TABLE gcool."Service" DROP COLUMN "selectedMonth";
ALTER TABLE gcool."Service" DROP COLUMN "repeatEndType";
ALTER TABLE gcool."Service" DROP COLUMN "repeatEndAfter";
ALTER TABLE gcool."Service" DROP COLUMN "repeatEndOnDate";

-- TODO ADD SECHEDULE ID ON SERVICE ITEM [DATA MIGRATION]
ALTER TABLE
    gcool."ServiceItem"
ADD
    COLUMN "scheduleId" integer;

ALTER TABLE
    ONLY gcool."ServiceItem"
ADD
    CONSTRAINT "Schedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES gcool."Schedule"(id) ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE gcool."ServiceItem" AS si
SET "scheduleId" = (SELECT id FROM gcool."Schedule" AS sc WHERE sc."serviceId" = si."serviceId");

-- END OF SERVICE, SCHEDULE, & SERVICEITEM

--
-- Name: ChecklistJob; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."ChecklistJob" (
    id integer NOT NULL,
    "name" character varying(255),
    "description" character varying(255),
    "jobId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE gcool."ChecklistJob" OWNER TO simplify;

--
-- Name: TABLE "ChecklistJob"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."ChecklistJob" IS 'ChecklistJob for list of checklist of job.';

--
-- Name: ChecklistJob_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."ChecklistJob_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE gcool."ChecklistJob_id_seq" OWNER TO simplify;

--
-- Name: ChecklistJob_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."ChecklistJob_id_seq" OWNED BY gcool."ChecklistJob".id;

--
-- Name: ChecklistJob id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ChecklistJob"
ALTER COLUMN
    id
SET
    DEFAULT nextval('gcool."ChecklistJob_id_seq"' :: regclass);

--
-- Name: ChecklistJob ChecklistJob_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ChecklistJob"
ADD
    CONSTRAINT "ChecklistJob_pkey" PRIMARY KEY (id);

ALTER TABLE
    ONLY gcool."ChecklistJob"
ADD
    CONSTRAINT "ChecklistJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES gcool."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Name: ChecklistJobItem; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."ChecklistJobItem" (
    id integer NOT NULL,
    "checklistJobId" integer NOT NULL,
    "name" character varying(255),
    "status" boolean NOT NULL,
    "remarks" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    gcool."ChecklistJobItem" OWNER TO simplify;

--
-- Name: TABLE "ChecklistJobItem"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."ChecklistJobItem" IS 'ChecklistJobItem for items of each job checklist.';

--
-- Name: ChecklistJobItem_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."ChecklistJobItem_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    gcool."ChecklistJobItem_id_seq" OWNER TO simplify;

--
-- Name: ChecklistJobItem_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."ChecklistJobItem_id_seq" OWNED BY gcool."ChecklistJobItem".id;

--
-- Name: ChecklistJobItem id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ChecklistJobItem"
ALTER COLUMN
    id
SET
    DEFAULT nextval(
        'gcool."ChecklistJobItem_id_seq"' :: regclass
    );

--
-- Name: ChecklistJobItem ChecklistJobItem_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ChecklistJobItem"
ADD
    CONSTRAINT "ChecklistJobItem_pkey" PRIMARY KEY (id);

--
-- Name: ChecklistJobItem ChecklistJobItem_checklistId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."ChecklistJobItem"
ADD
    CONSTRAINT "ChecklistJobItem_checklistId_fkey" FOREIGN KEY ("checklistJobId") REFERENCES gcool."ChecklistJob"(id) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Name: VehicleJob; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."VehicleJob" (
    id integer NOT NULL,
    "vehicleId" integer NOT NULL,
    "jobId" integer NOT NULL
);

ALTER TABLE
    gcool."VehicleJob" OWNER TO simplify;

--
-- Name: TABLE "VehicleJob"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."VehicleJob" IS 'VehicleJob for list of vehicle assigned of job.';

--
-- Name: VehicleJob_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."VehicleJob_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    gcool."VehicleJob_id_seq" OWNER TO simplify;

--
-- Name: VehicleJob_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."VehicleJob_id_seq" OWNED BY gcool."VehicleJob".id;

--
-- Name: VehicleJob id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."VehicleJob"
ALTER COLUMN
    id
SET
    DEFAULT nextval('gcool."VehicleJob_id_seq"' :: regclass);

--
-- Name: VehicleJob VehicleJob_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."VehicleJob"
ADD
    CONSTRAINT "VehicleJob_pkey" PRIMARY KEY (id);

ALTER TABLE
    ONLY gcool."VehicleJob"
ADD
    CONSTRAINT "VehicleJob_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES gcool."Vehicle"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE
    ONLY gcool."VehicleJob"
ADD
    CONSTRAINT "VehicleJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES gcool."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- TODO :: migrate exist data
--
INSERT INTO gcool."VehicleJob" ("jobId", "vehicleId")
(
    SELECT
        "id",
        "assignedVehicle"
    FROM
        gcool."Job"
    WHERE
        "assignedVehicle" NOTNULL
);

--
-- TODO :: remove old field
--
ALTER TABLE gcool."Job" DROP COLUMN "assignedVehicle";

--
-- Name: JobHistory; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."JobHistory" (
    id integer NOT NULL,
    "jobId" integer NOT NULL,
    "userProfileId" integer NULL,
    "jobStatus" character varying(100) NOT NULL,
    "location" character varying(255) NULL,
    "dateTime" timestamp with time zone NOT NULL
);

ALTER TABLE
    gcool."JobHistory" OWNER TO simplify;

--
-- Name: TABLE "JobHistory"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."JobHistory" IS 'JobHistory for list of history of job for all technician do.';

--
-- Name: JobHistory_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."JobHistory_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    gcool."JobHistory_id_seq" OWNER TO simplify;

--
-- Name: JobHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."JobHistory_id_seq" OWNED BY gcool."JobHistory".id;

--
-- Name: JobHistory id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."JobHistory"
ALTER COLUMN
    id
SET
    DEFAULT nextval('gcool."JobHistory_id_seq"' :: regclass);

--
-- Name: JobHistory JobHistory_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."JobHistory"
ADD
    CONSTRAINT "JobHistory_pkey" PRIMARY KEY (id);

ALTER TABLE
    ONLY gcool."JobHistory"
ADD
    CONSTRAINT "JobHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES gcool."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Migrate exist data
-- 
INSERT INTO
    gcool."JobHistory" ("jobId", "jobStatus", "dateTime") (
        SELECT
            "id",
            "jobStatus",
            "updatedAt"
        FROM
            gcool."Job"
        WHERE
            "jobStatus" != 'UNASSIGNED'
    );

    --
-- Name: AdditionalContactPerson; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."AdditionalContactPerson" (
    id integer NOT NULL,
    "clientId" integer NOT NULL,
    "contactPerson" character varying(100) NOT NULL,
    "contactNumber" character varying(100) NULL,
    "contactEmail" character varying(100) NULL
);

ALTER TABLE
    gcool."AdditionalContactPerson" OWNER TO simplify;

--
-- Name: TABLE "AdditionalContactPerson"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."AdditionalContactPerson" IS 'AdditionalContactPerson for list of vehicle assigned of job.';

--
-- Name: AdditionalContactPerson_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."AdditionalContactPerson_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    gcool."AdditionalContactPerson_id_seq" OWNER TO simplify;

--
-- Name: AdditionalContactPerson_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."AdditionalContactPerson_id_seq" OWNED BY gcool."AdditionalContactPerson".id;

--
-- Name: AdditionalContactPerson id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."AdditionalContactPerson"
ALTER COLUMN
    id
SET
    DEFAULT nextval('gcool."AdditionalContactPerson_id_seq"' :: regclass);

--
-- Name: AdditionalContactPerson AdditionalContactPerson_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."AdditionalContactPerson"
ADD
    CONSTRAINT "AdditionalContactPerson_pkey" PRIMARY KEY (id);

ALTER TABLE
    ONLY gcool."AdditionalContactPerson"
ADD
    CONSTRAINT "AdditionalContactPerson_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES gcool."Client"(id) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- TODO :: migrate exist data
--
INSERT INTO
    gcool."AdditionalContactPerson" (
        "clientId",
        "contactPerson",
        "contactNumber",
        "contactEmail"
    ) (
        SELECT
            "id",
            "secondaryContactPerson",
            "secondaryContactNumber",
            "secondaryContactEmail"
        FROM
            gcool."Client"
        WHERE
            "secondaryContactPerson" NOTNULL
    );

INSERT INTO
    gcool."AdditionalContactPerson" (
        "clientId",
        "contactPerson",
        "contactNumber",
        "contactEmail"
    ) (
        SELECT
            "id",
            "thirdContactPerson",
            "thirdContactNumber",
            "thirdContactEmail"
        FROM
            gcool."Client"
        WHERE
            "thirdContactPerson" NOTNULL
    );

INSERT INTO
    gcool."AdditionalContactPerson" (
        "clientId",
        "contactPerson",
        "contactNumber",
        "contactEmail"
    ) (
        SELECT
            "id",
            "fourthContactPerson",
            "fourthContactNumber",
            "fourthContactEmail"
        FROM
            gcool."Client"
        WHERE
            "fourthContactPerson" NOTNULL
    );

--
-- TODO :: remove old field
--
ALTER TABLE gcool."Client" DROP COLUMN "secondaryContactPerson";
ALTER TABLE gcool."Client" DROP COLUMN "secondaryContactNumber";
ALTER TABLE gcool."Client" DROP COLUMN "secondaryContactEmail";
ALTER TABLE gcool."Client" DROP COLUMN "thirdContactPerson";
ALTER TABLE gcool."Client" DROP COLUMN "thirdContactNumber";
ALTER TABLE gcool."Client" DROP COLUMN "thirdContactEmail";
ALTER TABLE gcool."Client" DROP COLUMN "fourthContactPerson";
ALTER TABLE gcool."Client" DROP COLUMN "fourthContactNumber";
ALTER TABLE gcool."Client" DROP COLUMN "fourthContactEmail";

-- update field about job Contract --

-- ADD FIELD --
ALTER TABLE gcool."Service" ADD COLUMN "isJobCompleted" boolean DEFAULT false NULL;
ALTER TABLE gcool."Service" ADD COLUMN "totalJob" integer NULL;

-- MIGRATE EXISTING DATA --
UPDATE
    gcool."Service" as s
SET
    "isJobCompleted" = true
WHERE 
    (( SELECT COUNT ( j."id" ) FROM gcool."Job" AS j WHERE j."serviceId" = s."id" AND j."jobStatus" = 'COMPLETED' ) = ( SELECT COUNT ( j."id" ) FROM gcool."Job" AS j WHERE j."serviceId" = s."id" )) 
AND 
    (( SELECT COUNT ( ja."id" ) FROM gcool."Job" AS ja WHERE ja."additionalServiceId" = s."id" AND ja."jobStatus" = 'COMPLETED' ) = ( SELECT COUNT ( ja."id" ) FROM gcool."Job" AS ja WHERE ja."additionalServiceId" = s."id" ))
;

UPDATE
    gcool."Service" as s
SET
    "totalJob" = (SELECT COUNT ( j."id" ) FROM gcool."Job" AS j WHERE j."serviceId" = s."id");


--
-- FIXING MIGRATION JOB HISTORY DATA 
-- 

UPDATE gcool."JobHistory" as jh
SET "userProfileId" = (
    SELECT "userProfileId" 
    FROM gcool."UserProfileJob" as uj
    WHERE uj."jobId" = jh."jobId"
    LIMIT 1
)
WHERE jh."userProfileId" ISNULL;

--
-- MIGRATION CHANGE COLUMN REMARKS TO SINGANTURE AND ADD COLUMN REMARKS TO TABLE JOB
-- 

ALTER TABLE gcool."Job"
RENAME COLUMN remarks TO signature;

ALTER TABLE gcool."Job"
ADD remarks TEXT; 

--
-- Name: JobDocument; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."JobDocument" (
    id integer NOT NULL,
    "notes" TEXT,
    "documentUrl" TEXT,
    "isHide" boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "jobId" integer
);

ALTER TABLE gcool."JobDocument" OWNER TO simplify;

--
-- Name: TABLE "JobDocument"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."JobDocument" IS 'A job document represent note for job';


--
-- Name: JobDocument_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."JobDocument_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."JobDocument_id_seq" OWNER TO simplify;

--
-- Name: JobDocument_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."JobDocument_id_seq" OWNED BY gcool."JobDocument".id;

--
-- Name: JobDocument id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."JobDocument" ALTER COLUMN id SET DEFAULT nextval('gcool."JobDocument_id_seq"'::regclass);

--
-- Name: JobDocument JobDocument_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."JobDocument"
    ADD CONSTRAINT "JobDocument_pkey" PRIMARY KEY (id);

--
-- Name: JobDocument JobDocument_jobId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."JobDocument"
    ADD CONSTRAINT "JobDocument_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES gcool."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "gcool"."Setting" VALUES (3, 'Duplicateclient', 'DUPLICATECLIENT', '', 'f', '2021-07-16 02:31:31.855+00', '2021-07-18 04:16:56.464+00');
INSERT INTO "gcool"."Setting" VALUES (4, 'CompanyName', 'COMPANY_SETTING', 'GCOOL DEMO', 't', '2021-08-26 08:19:39.358+00', '2021-08-26 08:19:39.358+00');
INSERT INTO "gcool"."Setting" VALUES (5, 'CompanyAddress', 'COMPANY_SETTING', 'SINGAPORE', 't', '2021-08-26 08:19:39.459+00', '2021-08-26 08:19:39.459+00');
INSERT INTO "gcool"."Setting" VALUES (6, 'CompanyContactNumber', 'COMPANY_SETTING', '12345623', 't', '2021-08-26 08:19:39.55+00', '2021-08-26 08:19:39.55+00');
INSERT INTO "gcool"."Setting" VALUES (7, 'CompanyUnitNumber', 'COMPANY_SETTING', '', 't', '2021-08-26 08:19:39.664+00', '2021-08-26 08:19:39.664+00');
INSERT INTO "gcool"."Setting" VALUES (8, 'CompanyPostalCode', 'COMPANY_SETTING', '123345', 't', '2021-08-26 08:19:39.774+00', '2021-08-26 08:19:39.774+00');
INSERT INTO "gcool"."Setting" VALUES (9, 'CompanyImage', 'COMPANY_SETTING', '1629965979064.png', 't', '2021-08-26 08:19:39.869+00', '2021-08-26 08:19:39.869+00');
INSERT INTO "gcool"."Setting" VALUES (10, 'PaynowGstImage', 'COMPANY_SETTING', '1629965979826.jpg', 't', '2021-08-26 08:19:40.619+00', '2021-08-26 08:19:40.619+00');
INSERT INTO "gcool"."Setting" VALUES (11, 'PaynowNonGstImage', 'COMPANY_SETTING', '1629965980262.jpg', 't', '2021-08-26 08:19:41.052+00', '2021-08-26 08:19:41.052+00');
