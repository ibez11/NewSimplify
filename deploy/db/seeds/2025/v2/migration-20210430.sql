--
-- Name: ChecklistTemplate; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."ChecklistTemplate" (
    id integer NOT NULL,
    "name" character varying(255),
    "description" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    wellac."ChecklistTemplate" OWNER TO simplify;

--
-- Name: TABLE "ChecklistTemplate"; Type: COMMENT; Schema: wellac; Owner: simplify
--
COMMENT ON TABLE wellac."ChecklistTemplate" IS 'ChecklistTemplate for see log of user action in app.';

--
-- Name: ChecklistTemplate_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--
CREATE SEQUENCE wellac."ChecklistTemplate_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    wellac."ChecklistTemplate_id_seq" OWNER TO simplify;

--
-- Name: ChecklistTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--
ALTER SEQUENCE wellac."ChecklistTemplate_id_seq" OWNED BY wellac."ChecklistTemplate".id;

--
-- Name: ChecklistTemplate id; Type: DEFAULT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ChecklistTemplate"
ALTER COLUMN
    id
SET
    DEFAULT nextval('wellac."ChecklistTemplate_id_seq"' :: regclass);

--
-- Name: ChecklistTemplate ChecklistTemplate_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ChecklistTemplate"
ADD
    CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY (id);

--
-- Name: ChecklistItemTemplate; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."ChecklistItemTemplate" (
    id integer NOT NULL,
    "checklistId" integer NOT NULL,
    "name" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE
    wellac."ChecklistItemTemplate" OWNER TO simplify;

--
-- Name: TABLE "ChecklistItemTemplate"; Type: COMMENT; Schema: wellac; Owner: simplify
--
COMMENT ON TABLE wellac."ChecklistItemTemplate" IS 'ChecklistItemTemplate for see log of user action in app.';

--
-- Name: ChecklistItemTemplate_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--
CREATE SEQUENCE wellac."ChecklistItemTemplate_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    wellac."ChecklistItemTemplate_id_seq" OWNER TO simplify;

--
-- Name: ChecklistItemTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--
ALTER SEQUENCE wellac."ChecklistItemTemplate_id_seq" OWNED BY wellac."ChecklistItemTemplate".id;

--
-- Name: ChecklistItemTemplate id; Type: DEFAULT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ChecklistItemTemplate"
ALTER COLUMN
    id
SET
    DEFAULT nextval(
        'wellac."ChecklistItemTemplate_id_seq"' :: regclass
    );

--
-- Name: ChecklistItemTemplate ChecklistItemTemplate_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ChecklistItemTemplate"
ADD
    CONSTRAINT "ChecklistItemTemplate_pkey" PRIMARY KEY (id);

--
-- Name: ChecklistItemTemplate ChecklistItemTemplate_checklistId_fkey; Type: FK CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."ChecklistItemTemplate"
ADD
    CONSTRAINT "ChecklistItemTemplate_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES wellac."ChecklistTemplate"(id) ON DELETE CASCADE ON UPDATE CASCADE;


-- for update permission data
INSERT INTO
    wellac."Permission"
VALUES
    (77, 'CHECKLIST_TEMPLATES', 'ACCESS'),
    (78, 'CHECKLIST_TEMPLATES', 'VIEW'),
    (79, 'CHECKLIST_TEMPLATES', 'CREATE'),
    (80, 'CHECKLIST_TEMPLATES', 'EDIT'),
    (81, 'CHECKLIST_TEMPLATES', 'DELETE');

INSERT INTO
    wellac."RolePermission" ("roleId", "permissionId")
VALUES
    (1, 77),
    (1, 78),
    (1, 79),
    (1, 80),
    (1, 81);