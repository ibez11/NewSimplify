--
-- Name: VehicleJob; Type: TABLE; Schema: wellac; Owner: simplify
--
CREATE TABLE wellac."VehicleJob" (
    id integer NOT NULL,
    "vehicleId" integer NOT NULL,
    "jobId" integer NOT NULL
);

ALTER TABLE
    wellac."VehicleJob" OWNER TO simplify;

--
-- Name: TABLE "VehicleJob"; Type: COMMENT; Schema: wellac; Owner: simplify
--
COMMENT ON TABLE wellac."VehicleJob" IS 'VehicleJob for list of vehicle assigned of job.';

--
-- Name: VehicleJob_id_seq; Type: SEQUENCE; Schema: wellac; Owner: simplify
--
CREATE SEQUENCE wellac."VehicleJob_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
    wellac."VehicleJob_id_seq" OWNER TO simplify;

--
-- Name: VehicleJob_id_seq; Type: SEQUENCE OWNED BY; Schema: wellac; Owner: simplify
--
ALTER SEQUENCE wellac."VehicleJob_id_seq" OWNED BY wellac."VehicleJob".id;

--
-- Name: VehicleJob id; Type: DEFAULT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."VehicleJob"
ALTER COLUMN
    id
SET
    DEFAULT nextval('wellac."VehicleJob_id_seq"' :: regclass);

--
-- Name: VehicleJob VehicleJob_pkey; Type: CONSTRAINT; Schema: wellac; Owner: simplify
--
ALTER TABLE
    ONLY wellac."VehicleJob"
ADD
    CONSTRAINT "VehicleJob_pkey" PRIMARY KEY (id);

ALTER TABLE
    ONLY wellac."VehicleJob"
ADD
    CONSTRAINT "VehicleJob_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES wellac."Vehicle"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE
    ONLY wellac."VehicleJob"
ADD
    CONSTRAINT "VehicleJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES wellac."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- TODO :: migrate exist data
--
INSERT INTO wellac."VehicleJob" ("jobId", "vehicleId")
(
    SELECT
        "id",
        "assignedVehicle"
    FROM
        wellac."Job"
    WHERE
        "assignedVehicle" NOTNULL
);

--
-- TODO :: remove old field
--
ALTER TABLE wellac."Job" DROP COLUMN "assignedVehicle";
