--
-- Name: UserSkill; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."UserSkill" (
    id integer NOT NULL,
    "userProfileId" integer,
    "skill" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    wellac."UserSkill" OWNER TO simplify;

--
-- Name: TABLE "UserSkill"; Type: COMMENT; Schema: wellac; Owner: simplify
--
COMMENT ON TABLE wellac."UserSkill" IS 'UserSkill for see log of user action in app.';

--
-- Name: UserSkill_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--
CREATE SEQUENCE wellac."UserSkill_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    wellac."UserSkill_id_seq" OWNER TO simplify;

--
-- Name: UserSkill_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--
ALTER SEQUENCE wellac."UserSkill_id_seq" OWNED BY wellac."UserSkill".id;

--
-- Name: UserSkill id; Type: DEFAULT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."UserSkill"
ALTER COLUMN
    id
SET
    DEFAULT nextval('wellac."UserSkill_id_seq"' :: regclass);

--
-- Name: UserSkill UserSkill_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."UserSkill"
ADD
    CONSTRAINT "UserSkill_pkey" PRIMARY KEY (id);

--
-- Name: UserSkill UserSkill_jobId_fkey; Type: FK CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."UserSkill"
ADD
    CONSTRAINT "UserSkill_jobId_fkey" FOREIGN KEY ("userProfileId") REFERENCES wellac."UserProfile"(id) ON DELETE CASCADE ON UPDATE CASCADE;