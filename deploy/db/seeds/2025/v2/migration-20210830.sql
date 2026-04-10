--
-- Name: JobDocument; Type: TABLE; Schema: wellac; Owner: simplify
--

CREATE TABLE wellac."JobDocument" (
    id integer NOT NULL,
    "notes" TEXT,
    "documentUrl" TEXT,
    "isHide" boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "jobId" integer
);

ALTER TABLE wellac."JobDocument" OWNER TO simplify;

--
-- Name: TABLE "JobDocument"; Type: COMMENT; Schema: wellac; Owner: simplify
--

COMMENT ON TABLE wellac."JobDocument" IS 'A job document represent note for job';


--
-- Name: JobDocument_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--

CREATE SEQUENCE wellac."JobDocument_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE wellac."JobDocument_id_seq" OWNER TO simplify;

--
-- Name: JobDocument_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--

ALTER SEQUENCE wellac."JobDocument_id_seq" OWNED BY wellac."JobDocument".id;

--
-- Name: JobDocument id; Type: DEFAULT; Schema: wellac; Owner: simplify
--

ALTER TABLE ONLY wellac."JobDocument" ALTER COLUMN id SET DEFAULT nextval('wellac."JobDocument_id_seq"'::regclass);

--
-- Name: JobDocument JobDocument_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--

ALTER TABLE ONLY wellac."JobDocument"
    ADD CONSTRAINT "JobDocument_pkey" PRIMARY KEY (id);

--
-- Name: JobDocument JobDocument_jobId_fkey; Type: FK CONSTRAINT; Schema: wellac; Owner: simplify
--

ALTER TABLE ONLY wellac."JobDocument"
    ADD CONSTRAINT "JobDocument_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES wellac."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;

