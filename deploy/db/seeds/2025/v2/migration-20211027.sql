--
-- Name: Rating; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."Rating" (
    id integer NOT NULL,
    "feedback" TEXT,
    "rate" integer,
    "jobId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    gcool."Rating" OWNER TO simplify;

--
-- Name: TABLE "Rating"; Type: COMMENT; Schema: gcool; Owner: simplify
--
COMMENT ON TABLE gcool."Rating" IS 'Rating for see rate for company or technician.';

--
-- Name: rating_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--
CREATE SEQUENCE gcool."rating_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    gcool."rating_id_seq" OWNER TO simplify;

--
-- Name: rating_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--
ALTER SEQUENCE gcool."rating_id_seq" OWNED BY gcool."Rating".id;

--
-- Name: Rating id; Type: DEFAULT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."Rating"
ALTER COLUMN
    id
SET
    DEFAULT nextval('gcool."rating_id_seq"' :: regclass);

--
-- Name: Rating rating_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--
ALTER TABLE
    ONLY gcool."Rating"
ADD
    CONSTRAINT "rating_pkey" PRIMARY KEY (id);

ALTER TABLE
    ONLY gcool."Rating"
ADD
    CONSTRAINT "RatingJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES gcool."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- for update permission data
INSERT INTO
    gcool."Permission"
VALUES
    (82, 'RATINGS', 'ACCESS'),
    (83, 'RATINGS', 'VIEW'),
    (84, 'RATINGS', 'CREATE'),
    (85, 'RATINGS', 'EDIT'),
    (86, 'RATINGS', 'DELETE');

INSERT INTO
    gcool."RolePermission" ("roleId", "permissionId")
VALUES
    (1, 82),
    (1, 83),
    (1, 84),
    (1, 85),
    (1, 86);