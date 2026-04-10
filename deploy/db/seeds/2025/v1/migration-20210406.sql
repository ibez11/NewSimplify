--
-- Name: Agent; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."Agent" (
    id integer NOT NULL,
    "name" character varying(255),
    "description" TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE wellac."Agent" OWNER TO simplify;

--
-- Name: TABLE "Agent"; Type: COMMENT; Schema: wellac; Owner: simplify
--

COMMENT ON TABLE wellac."Agent" IS 'Agent for grouping client.';

--
-- Name: Agent_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--

CREATE SEQUENCE wellac."Agent_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE wellac."Agent_id_seq" OWNER TO simplify;

--
-- Name: Agent_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--

ALTER SEQUENCE wellac."Agent_id_seq" OWNED BY wellac."Agent".id;

--
-- Name: Agent id; Type: DEFAULT; Schema: wellac; Owner: simplify
--

ALTER TABLE ONLY wellac."Agent" ALTER COLUMN id SET DEFAULT nextval('wellac."Agent_id_seq"'::regclass);


--
-- Name: Agent Agent_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--

ALTER TABLE ONLY wellac."Agent" ADD CONSTRAINT "Agent_pkey" PRIMARY KEY (id);
