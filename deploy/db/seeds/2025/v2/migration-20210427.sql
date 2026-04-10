--
-- Name: SkillTemplate; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."SkillTemplate" (
    id integer NOT NULL,
    "name" character varying(255),
    "description" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    wellac."SkillTemplate" OWNER TO simplify;

--
-- Name: TABLE "SkillTemplate"; Type: COMMENT; Schema: wellac; Owner: simplify
--
COMMENT ON TABLE wellac."SkillTemplate" IS 'SkillTemplate for see log of user action in app.';

--
-- Name: SkillTemplate_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--
CREATE SEQUENCE wellac."SkillTemplate_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    wellac."SkillTemplate_id_seq" OWNER TO simplify;

--
-- Name: SkillTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--
ALTER SEQUENCE wellac."SkillTemplate_id_seq" OWNED BY wellac."SkillTemplate".id;

--
-- Name: SkillTemplate id; Type: DEFAULT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."SkillTemplate"
ALTER COLUMN
    id
SET
    DEFAULT nextval('wellac."SkillTemplate_id_seq"' :: regclass);

--
-- Name: SkillTemplate SkillTemplate_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."SkillTemplate"
ADD
    CONSTRAINT "SkillTemplate_pkey" PRIMARY KEY (id);

-- for update permission data
INSERT INTO
    wellac."Permission"
VALUES
    (72, 'SKILL_TEMPLATES', 'ACCESS'),
    (73, 'SKILL_TEMPLATES', 'VIEW'),
    (74, 'SKILL_TEMPLATES', 'CREATE'),
    (75, 'SKILL_TEMPLATES', 'EDIT'),
    (76, 'SKILL_TEMPLATES', 'DELETE');

INSERT INTO
    wellac."RolePermission" ("roleId", "permissionId")
VALUES
    (1, 72),
    (1, 73),
    (1, 74),
    (1, 75),
    (1, 76);