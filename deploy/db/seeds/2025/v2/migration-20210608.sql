--
-- Name: ChecklistJob; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."ChecklistJob" (
    id integer NOT NULL,
    "name" character varying(255),
    "description" character varying(255),
    "jobId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE wellac."ChecklistJob" OWNER TO simplify;

--
-- Name: TABLE "ChecklistJob"; Type: COMMENT; Schema: wellac; Owner: simplify
--
COMMENT ON TABLE wellac."ChecklistJob" IS 'ChecklistJob for list of checklist of job.';

--
-- Name: ChecklistJob_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--
CREATE SEQUENCE wellac."ChecklistJob_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE wellac."ChecklistJob_id_seq" OWNER TO simplify;

--
-- Name: ChecklistJob_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--
ALTER SEQUENCE wellac."ChecklistJob_id_seq" OWNED BY wellac."ChecklistJob".id;

--
-- Name: ChecklistJob id; Type: DEFAULT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ChecklistJob"
ALTER COLUMN
    id
SET
    DEFAULT nextval('wellac."ChecklistJob_id_seq"' :: regclass);

--
-- Name: ChecklistJob ChecklistJob_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ChecklistJob"
ADD
    CONSTRAINT "ChecklistJob_pkey" PRIMARY KEY (id);

ALTER TABLE
    ONLY wellac."ChecklistJob"
ADD
    CONSTRAINT "ChecklistJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES wellac."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Name: ChecklistJobItem; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."ChecklistJobItem" (
    id integer NOT NULL,
    "checklistJobId" integer NOT NULL,
    "name" character varying(255),
    "status" boolean NOT NULL,
    "remarks" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    wellac."ChecklistJobItem" OWNER TO simplify;

--
-- Name: TABLE "ChecklistJobItem"; Type: COMMENT; Schema: wellac; Owner: simplify
--
COMMENT ON TABLE wellac."ChecklistJobItem" IS 'ChecklistJobItem for items of each job checklist.';

--
-- Name: ChecklistJobItem_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--
CREATE SEQUENCE wellac."ChecklistJobItem_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    wellac."ChecklistJobItem_id_seq" OWNER TO simplify;

--
-- Name: ChecklistJobItem_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--
ALTER SEQUENCE wellac."ChecklistJobItem_id_seq" OWNED BY wellac."ChecklistJobItem".id;

--
-- Name: ChecklistJobItem id; Type: DEFAULT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ChecklistJobItem"
ALTER COLUMN
    id
SET
    DEFAULT nextval(
        'wellac."ChecklistJobItem_id_seq"' :: regclass
    );

--
-- Name: ChecklistJobItem ChecklistJobItem_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ChecklistJobItem"
ADD
    CONSTRAINT "ChecklistJobItem_pkey" PRIMARY KEY (id);

--
-- Name: ChecklistJobItem ChecklistJobItem_checklistId_fkey; Type: FK CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ChecklistJobItem"
ADD
    CONSTRAINT "ChecklistJobItem_checklistId_fkey" FOREIGN KEY ("checklistJobId") REFERENCES wellac."ChecklistJob"(id) ON DELETE CASCADE ON UPDATE CASCADE;
