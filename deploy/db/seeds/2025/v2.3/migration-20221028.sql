--
-- Name: WaTemplate; Type: TABLE; Schema: shared; Owner: simplify
--
CREATE TABLE shared."WaTemplate" (
    "name" character varying(255),
    "messageBody" TEXT,
    "isActive" boolean
);

ALTER TABLE
    shared."WaTemplate" OWNER TO simplify;

--
-- Name: TABLE "WaTemplate"; Type: COMMENT; Schema: shared; Owner: simplify
--
COMMENT ON TABLE shared."WaTemplate" IS 'WaTemplate for saving wa message template.';

--
-- Name: WaTemplate WaTemplate_pkey; Type: CONSTRAINT; Schema: shared; Owner: simplify
--
ALTER TABLE
    ONLY shared."WaTemplate"
ADD
    CONSTRAINT "WaTemplate_pkey" PRIMARY KEY (name);