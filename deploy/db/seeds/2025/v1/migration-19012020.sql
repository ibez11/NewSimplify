--
-- Name: AppLog; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."AppLog" (
    id integer NOT NULL,
    "user" character varying(255),
    "description" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE wellac."AppLog" OWNER TO simplify;

--
-- Name: TABLE "AppLog"; Type: COMMENT; Schema: wellac; Owner: simplify
--

COMMENT ON TABLE wellac."AppLog" IS 'AppLog for see log of user action in app.';

--
-- Name: AppLog_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--

CREATE SEQUENCE wellac."AppLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE wellac."AppLog_id_seq" OWNER TO simplify;

--
-- Name: AppLog_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--

ALTER SEQUENCE wellac."AppLog_id_seq" OWNED BY wellac."AppLog".id;

--
-- Name: AppLog id; Type: DEFAULT; Schema: wellac; Owner: simplify
--

ALTER TABLE ONLY wellac."AppLog" ALTER COLUMN id SET DEFAULT nextval('wellac."AppLog_id_seq"'::regclass);


--
-- Name: AppLog AppLog_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--

ALTER TABLE ONLY wellac."AppLog" ADD CONSTRAINT "AppLog_pkey" PRIMARY KEY (id);
