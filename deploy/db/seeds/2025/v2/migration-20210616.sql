--
-- Name: JobHistory; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."JobHistory" (
    id integer NOT NULL,
    "jobId" integer NOT NULL,
    "userProfileId" integer NULL,
    "jobStatus" character varying(100) NOT NULL,
    "location" character varying(255) NULL,
    "dateTime" timestamp with time zone NOT NULL
);

ALTER TABLE
    wellac."JobHistory" OWNER TO simplify;

--
-- Name: TABLE "JobHistory"; Type: COMMENT; Schema: wellac; Owner: simplify
--
COMMENT ON TABLE wellac."JobHistory" IS 'JobHistory for list of history of job for all technician do.';

--
-- Name: JobHistory_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--
CREATE SEQUENCE wellac."JobHistory_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    wellac."JobHistory_id_seq" OWNER TO simplify;

--
-- Name: JobHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--
ALTER SEQUENCE wellac."JobHistory_id_seq" OWNED BY wellac."JobHistory".id;

--
-- Name: JobHistory id; Type: DEFAULT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."JobHistory"
ALTER COLUMN
    id
SET
    DEFAULT nextval('wellac."JobHistory_id_seq"' :: regclass);

--
-- Name: JobHistory JobHistory_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."JobHistory"
ADD
    CONSTRAINT "JobHistory_pkey" PRIMARY KEY (id);

ALTER TABLE
    ONLY wellac."JobHistory"
ADD
    CONSTRAINT "JobHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES wellac."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Migrate exist data
-- 
INSERT INTO
    wellac."JobHistory" ("jobId", "jobStatus", "dateTime") (
        SELECT
            "id",
            "jobStatus",
            "updatedAt"
        FROM
            wellac."Job"
        WHERE
            "jobStatus" != 'UNASSIGNED'
    );