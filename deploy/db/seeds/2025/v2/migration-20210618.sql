--
-- Name: AdditionalContactPerson; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."AdditionalContactPerson" (
    id integer NOT NULL,
    "clientId" integer NOT NULL,
    "contactPerson" character varying(100) NOT NULL,
    "contactNumber" character varying(100) NULL,
    "contactEmail" character varying(100) NULL
);

ALTER TABLE
    wellac."AdditionalContactPerson" OWNER TO simplify;

--
-- Name: TABLE "AdditionalContactPerson"; Type: COMMENT; Schema: wellac; Owner: simplify
--
COMMENT ON TABLE wellac."AdditionalContactPerson" IS 'AdditionalContactPerson for list of vehicle assigned of job.';

--
-- Name: AdditionalContactPerson_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--
CREATE SEQUENCE wellac."AdditionalContactPerson_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    wellac."AdditionalContactPerson_id_seq" OWNER TO simplify;

--
-- Name: AdditionalContactPerson_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--
ALTER SEQUENCE wellac."AdditionalContactPerson_id_seq" OWNED BY wellac."AdditionalContactPerson".id;

--
-- Name: AdditionalContactPerson id; Type: DEFAULT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."AdditionalContactPerson"
ALTER COLUMN
    id
SET
    DEFAULT nextval('wellac."AdditionalContactPerson_id_seq"' :: regclass);

--
-- Name: AdditionalContactPerson AdditionalContactPerson_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."AdditionalContactPerson"
ADD
    CONSTRAINT "AdditionalContactPerson_pkey" PRIMARY KEY (id);

ALTER TABLE
    ONLY wellac."AdditionalContactPerson"
ADD
    CONSTRAINT "AdditionalContactPerson_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES wellac."Client"(id) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- TODO :: migrate exist data
--
INSERT INTO
    wellac."AdditionalContactPerson" (
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
            wellac."Client"
        WHERE
            "secondaryContactPerson" NOTNULL
    );

INSERT INTO
    wellac."AdditionalContactPerson" (
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
            wellac."Client"
        WHERE
            "thirdContactPerson" NOTNULL
    );

INSERT INTO
    wellac."AdditionalContactPerson" (
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
            wellac."Client"
        WHERE
            "fourthContactPerson" NOTNULL
    );

--
-- TODO :: remove old field
--
ALTER TABLE wellac."Client" DROP COLUMN "secondaryContactPerson";
ALTER TABLE wellac."Client" DROP COLUMN "secondaryContactNumber";
ALTER TABLE wellac."Client" DROP COLUMN "secondaryContactEmail";
ALTER TABLE wellac."Client" DROP COLUMN "thirdContactPerson";
ALTER TABLE wellac."Client" DROP COLUMN "thirdContactNumber";
ALTER TABLE wellac."Client" DROP COLUMN "thirdContactEmail";
ALTER TABLE wellac."Client" DROP COLUMN "fourthContactPerson";
ALTER TABLE wellac."Client" DROP COLUMN "fourthContactNumber";
ALTER TABLE wellac."Client" DROP COLUMN "fourthContactEmail";
