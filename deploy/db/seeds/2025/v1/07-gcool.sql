--
-- PostgreSQL database dump
--

-- Dumped from database version 11.3 (Debian 11.3-1.pgdg90+1)
-- Dumped by pg_dump version 11.3 (Debian 11.3-1.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: gcool; Type: SCHEMA; Schema: -; Owner: simplify
--

CREATE SCHEMA gcool;

GRANT USAGE ON SCHEMA gcool TO simplify;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA gcool TO simplify;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: Client; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."Client" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "clientType" character varying(255) NOT NULL,
    "contactPerson" character varying(255) NOT NULL,
    "contactNumber" character varying(255) NOT NULL,
    "contactEmail" character varying(255) NOT NULL,
    "secondaryContactPerson" character varying(255),
    "secondaryContactNumber" character varying(255),
    "secondaryContactEmail" character varying(255),
    country character varying(255) NOT NULL,
    "billingAddress" character varying(255) NOT NULL,
    "billingFloorNo" character varying(255),
    "billingUnitNo" character varying(255),
    "billingPostal" character varying(255) NOT NULL,
    "needGST" boolean DEFAULT true NOT NULL,
    "paymentStatus" character varying(255) DEFAULT 'PENDING'::character varying NOT NULL,
    "remarks" character varying(255),
    "idQboWithGST" integer,
    "idQboWithoutGST" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE gcool."Client" OWNER TO simplify;

--
-- Name: TABLE "Client"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."Client" IS 'Clients information';


--
-- Name: Client_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."Client_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."Client_id_seq" OWNER TO simplify;

--
-- Name: Client_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."Client_id_seq" OWNED BY gcool."Client".id;


--
-- Name: Job; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."Job" (
    id integer NOT NULL,
    "jobDate" date NOT NULL,
    "startTime" time without time zone,
    "endTime" time without time zone,
    "jobStatus" character varying(255) DEFAULT 'UNASSIGNED'::character varying NOT NULL,
    "remarks" TEXT,
    "collectedAmount" double precision DEFAULT NULL,
    "paymentMethod" character varying(50) DEFAULT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "assignedBy" integer,
    "assignedVehicle" integer,
    "serviceId" integer,
    "additionalServiceId" integer
);


ALTER TABLE gcool."Job" OWNER TO simplify;

--
-- Name: TABLE "Job"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."Job" IS 'A job represent the day when the service is being delivered';


--
-- Name: Job_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."Job_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."Job_id_seq" OWNER TO simplify;

--
-- Name: Job_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."Job_id_seq" OWNED BY gcool."Job".id;


--
-- Name: JobNote; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."JobNote" (
    id integer NOT NULL,
    "notes" TEXT,
    "imageUrl" TEXT,
    "isHide" boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "jobId" integer
);


ALTER TABLE gcool."JobNote" OWNER TO simplify;

--
-- Name: TABLE "JobNote"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."JobNote" IS 'A job note represent note for job';


--
-- Name: JobNote_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."JobNote_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."JobNote_id_seq" OWNER TO simplify;

--
-- Name: JobNote_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."JobNote_id_seq" OWNED BY gcool."JobNote".id;


--
-- Name: Permission; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."Permission" (
    id integer NOT NULL,
    module character varying(255) NOT NULL,
    "accessLevel" character varying(255) NOT NULL
);


ALTER TABLE gcool."Permission" OWNER TO simplify;

--
-- Name: TABLE "Permission"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."Permission" IS 'List of Permission for the whole applcation';


--
-- Name: Permission_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."Permission_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."Permission_id_seq" OWNER TO simplify;

--
-- Name: Permission_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."Permission_id_seq" OWNED BY gcool."Permission".id;


--
-- Name: Role; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."Role" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE gcool."Role" OWNER TO simplify;

--
-- Name: TABLE "Role"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."Role" IS 'User role, which contains a group of permission';


--
-- Name: RolePermission; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."RolePermission" (
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL
);


ALTER TABLE gcool."RolePermission" OWNER TO simplify;

--
-- Name: TABLE "RolePermission"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."RolePermission" IS 'User role, which contains a group of permission';


--
-- Name: Role_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."Role_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."Role_id_seq" OWNER TO simplify;

--
-- Name: Role_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."Role_id_seq" OWNED BY gcool."Role".id;


--
-- Name: Service; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."Service" (
    id integer NOT NULL,
    "serviceType" character varying(255) NOT NULL,
    "serviceNumber" character varying(255) NOT NULL,
    "serviceTitle" character varying(255) NOT NULL,
    description TEXT,
    "serviceStatus" character varying(255) DEFAULT 'PENDING'::character varying NOT NULL,
    "needGST" boolean DEFAULT true NOT NULL,
    "repeatType" character varying(10) DEFAULT NULL,
    "repeatEvery" integer DEFAULT NULL,
    "selectedDay" character varying(10) DEFAULT NULL,
    "selectedWeek" character varying(10) DEFAULT NULL,
    "selectedMonth" character varying(10) DEFAULT NULL,
    "repeatEndType" character varying(10) DEFAULT NULL,
    "repeatEndAfter" integer DEFAULT NULL,
    "repeatEndOnDate" date DEFAULT NULL,
    "termStart" date NOT NULL,
    "termEnd" date NOT NULL,
    "originalAmount" double precision DEFAULT '0'::double precision NOT NULL,
    "discountType" character varying(255) DEFAULT 'NA'::character varying NOT NULL,
    "discountAmount" double precision DEFAULT '0'::double precision NOT NULL,
    "gstAmount" double precision DEFAULT '0'::double precision NOT NULL,
    "totalAmount" double precision DEFAULT '0'::double precision NOT NULL,
    "remarks" character varying(255),
    "termCondition" TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "clientId" integer,
    "serviceAddressId" integer,
    "entityId" integer
);


ALTER TABLE gcool."Service" OWNER TO simplify;

--
-- Name: TABLE "Service"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."Service" IS 'A group of service item. Can be taken as contract';


--
-- Name: ServiceAddress; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."ServiceAddress" (
    id integer NOT NULL,
    "contactPerson" character varying(255) NOT NULL,
    "contactNumber" character varying(255) NOT NULL,
    "secondaryContactPerson" character varying(255),
    "secondaryContactNumber" character varying(255),
    country character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    "floorNo" character varying(255),
    "unitNo" character varying(255),
    "postalCode" character varying(255) NOT NULL,
    "clientId" integer
);


ALTER TABLE gcool."ServiceAddress" OWNER TO simplify;

--
-- Name: TABLE "ServiceAddress"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."ServiceAddress" IS 'Client service address';


--
-- Name: ServiceAddress_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."ServiceAddress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."ServiceAddress_id_seq" OWNER TO simplify;

--
-- Name: ServiceAddress_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."ServiceAddress_id_seq" OWNED BY gcool."ServiceAddress".id;


--
-- Name: ServiceItem; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."ServiceItem" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    quantity double precision DEFAULT '0'::double precision NOT NULL,
    "unitPrice" double precision DEFAULT '0'::double precision NOT NULL,
    "discountType" character varying(255) DEFAULT 'NA'::character varying NOT NULL,
    "discountAmt" double precision DEFAULT '0'::double precision NOT NULL,
    "totalPrice" double precision DEFAULT '0'::double precision NOT NULL,
    "idQboWithGST" integer,
    "IdQboWithoutGST" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "serviceId" integer
);


ALTER TABLE gcool."ServiceItem" OWNER TO simplify;

--
-- Name: TABLE "ServiceItem"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."ServiceItem" IS 'Each line item in a service';


--
-- Name: ServiceItemJob; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."ServiceItemJob" (
    "serviceItemId" integer NOT NULL,
    "jobId" integer NOT NULL
);


ALTER TABLE gcool."ServiceItemJob" OWNER TO simplify;

--
-- Name: TABLE "ServiceItemJob"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."ServiceItemJob" IS 'Each line item in a service';


--
-- Name: ServiceItemTemplate; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."ServiceItemTemplate" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    "unitPrice" double precision NOT NULL,
    "idQboWithGST" integer,
    "IdQboWithoutGST" integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE gcool."ServiceItemTemplate" OWNER TO simplify;

--
-- Name: TABLE "ServiceItemTemplate"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."ServiceItemTemplate" IS 'ServiceItem template for quick selection. Can be taken catelog.';


--
-- Name: ServiceItemTemplate_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."ServiceItemTemplate_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."ServiceItemTemplate_id_seq" OWNER TO simplify;

--
-- Name: ServiceItemTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."ServiceItemTemplate_id_seq" OWNED BY gcool."ServiceItemTemplate".id;


--
-- Name: ServiceItem_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."ServiceItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."ServiceItem_id_seq" OWNER TO simplify;

--
-- Name: ServiceItem_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."ServiceItem_id_seq" OWNED BY gcool."ServiceItem".id;


--
-- Name: Service_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."Service_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."Service_id_seq" OWNER TO simplify;

--
-- Name: Service_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."Service_id_seq" OWNED BY gcool."Service".id;


--
-- Name: UserProfile; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."UserProfile" (
    id integer NOT NULL,
    "displayName" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "contactNumber" character varying(255) NOT NULL,
    "token" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE gcool."UserProfile" OWNER TO simplify;

--
-- Name: TABLE "UserProfile"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."UserProfile" IS 'UserProfile contains User metadata that are not related to log in';


--
-- Name: UserProfileJob; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."UserProfileJob" (
    "userProfileId" integer NOT NULL,
    "jobId" integer NOT NULL
);


ALTER TABLE gcool."UserProfileJob" OWNER TO simplify;

--
-- Name: TABLE "UserProfileJob"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."UserProfileJob" IS 'UserProfile contains User metadata that are not related to log in';


--
-- Name: UserProfileRole; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."UserProfileRole" (
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userProfileId" integer NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE gcool."UserProfileRole" OWNER TO simplify;

--
-- Name: TABLE "UserProfileRole"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."UserProfileRole" IS 'UserProfile contains User metadata that are not related to log in';


--
-- Name: Vehicle; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."Vehicle" (
    id integer NOT NULL,
    model character varying(255),
    "carplateNumber" character varying(255) NOT NULL,
    "coeExpiryDate" date,
    "vehicleStatus" boolean NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "employeeInCharge" integer
);


ALTER TABLE gcool."Vehicle" OWNER TO simplify;

--
-- Name: TABLE "Vehicle"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."Vehicle" IS 'Company vehicles information';


--
-- Name: Vehicle_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."Vehicle_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."Vehicle_id_seq" OWNER TO simplify;

--
-- Name: Vehicle_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."Vehicle_id_seq" OWNED BY gcool."Vehicle".id;


--
-- Name: Entity; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."Entity" (
  id integer NOT NULL,
  "name" character varying(255) NOT NULL,
  "address" character varying(255) NOT NULL,
  "logo" character varying(255),
  "contactNumber" character varying(255) NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
)
;


ALTER TABLE gcool."Entity" OWNER TO simplify;

--
-- Name: TABLE "Entity"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."Entity" IS 'Entity for quick selection. Can be taken catalog';


--
-- Name: Entity_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."Entity_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."Entity_id_seq" OWNER TO simplify;

--
-- Name: Entity_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."Entity_id_seq" OWNED BY gcool."Entity".id;


--
-- Name: Invoice; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."Invoice" (
  id integer NOT NULL,
  "invoiceNumber" character varying(255) NOT NULL,
  "termStart" date NOT NULL,
  "termEnd" date NOT NULL,
  "invoiceAmount" double precision DEFAULT '0'::double precision NOT NULL,
  "collectedAmount" double precision DEFAULT '0'::double precision NOT NULL,
  "chargeAmount" double precision DEFAULT '0'::double precision NOT NULL,
  "paymentMethod" character varying(50) DEFAULT NULL,
  "invoiceStatus" character varying(50) DEFAULT NULL,
  "isSynchronize" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "serviceId" integer
)
;


ALTER TABLE gcool."Invoice" OWNER TO simplify;

--
-- Name: TABLE "Invoice"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."Invoice" IS 'Invoice for quick selection. Can be taken catalog';


--
-- Name: Invoice_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."Invoice_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."Invoice_id_seq" OWNER TO simplify;

--
-- Name: Invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."Invoice_id_seq" OWNED BY gcool."Invoice".id;


--
-- Name: ServiceTemplate; Type: TABLE; Schema: gcool; Owner: simplify
--

CREATE TABLE gcool."ServiceTemplate" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description TEXT,
    "termCondition" TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE gcool."ServiceTemplate" OWNER TO simplify;


--
-- Name: TABLE "ServiceTemplate"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."ServiceTemplate" IS 'Service template for quick selection. Can be taken catelog.';


--
-- Name: ServiceTemplate_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."ServiceTemplate_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."ServiceTemplate_id_seq" OWNER TO simplify;


--
-- Name: ServiceTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."ServiceTemplate_id_seq" OWNED BY gcool."ServiceTemplate".id;

--
-- Name: Setting; Type: TABLE; Schema: gcool; Owner: simplify
--
CREATE TABLE gcool."Setting" (
    id integer NOT NULL,
    "label" character varying(255) NOT NULL,
    "code" character varying(255),
    "value" character varying(255),
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE gcool."Setting" OWNER TO simplify;


--
-- Name: TABLE "Setting"; Type: COMMENT; Schema: gcool; Owner: simplify
--

COMMENT ON TABLE gcool."Setting" IS 'Setting for manage additional feature.';


--
-- Name: Setting_id_seq; Type: SEQUENCE; Schema: gcool; Owner: simplify
--

CREATE SEQUENCE gcool."Setting_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE gcool."Setting_id_seq" OWNER TO simplify;


--
-- Name: Setting_id_seq; Type: SEQUENCE OWNED BY; Schema: gcool; Owner: simplify
--

ALTER SEQUENCE gcool."Setting_id_seq" OWNED BY gcool."Setting".id;



--
-- Name: Client id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Client" ALTER COLUMN id SET DEFAULT nextval('gcool."Client_id_seq"'::regclass);


--
-- Name: Job id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Job" ALTER COLUMN id SET DEFAULT nextval('gcool."Job_id_seq"'::regclass);


--
-- Name: JobNote id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."JobNote" ALTER COLUMN id SET DEFAULT nextval('gcool."JobNote_id_seq"'::regclass);


--
-- Name: Permission id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Permission" ALTER COLUMN id SET DEFAULT nextval('gcool."Permission_id_seq"'::regclass);


--
-- Name: Role id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Role" ALTER COLUMN id SET DEFAULT nextval('gcool."Role_id_seq"'::regclass);


--
-- Name: Service id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Service" ALTER COLUMN id SET DEFAULT nextval('gcool."Service_id_seq"'::regclass);


--
-- Name: ServiceAddress id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceAddress" ALTER COLUMN id SET DEFAULT nextval('gcool."ServiceAddress_id_seq"'::regclass);


--
-- Name: ServiceItem id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceItem" ALTER COLUMN id SET DEFAULT nextval('gcool."ServiceItem_id_seq"'::regclass);


--
-- Name: ServiceItemTemplate id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceItemTemplate" ALTER COLUMN id SET DEFAULT nextval('gcool."ServiceItemTemplate_id_seq"'::regclass);


--
-- Name: Vehicle id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Vehicle" ALTER COLUMN id SET DEFAULT nextval('gcool."Vehicle_id_seq"'::regclass);

--
-- Name: Invoice id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Invoice" ALTER COLUMN id SET DEFAULT nextval('gcool."Invoice_id_seq"'::regclass);

--
-- Name: Entity id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Entity" ALTER COLUMN id SET DEFAULT nextval('gcool."Entity_id_seq"'::regclass);


--
-- Name: ServiceTemplate id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceTemplate" ALTER COLUMN id SET DEFAULT nextval('gcool."ServiceTemplate_id_seq"'::regclass);

--
-- Name: Setting id; Type: DEFAULT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Setting" ALTER COLUMN id SET DEFAULT nextval('gcool."Setting_id_seq"'::regclass);


--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: Job Job_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Job"
    ADD CONSTRAINT "Job_pkey" PRIMARY KEY (id);


--
-- Name: JobNote JobNote_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."JobNote"
    ADD CONSTRAINT "JobNote_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_module_accessLevel_key; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Permission"
    ADD CONSTRAINT "Permission_module_accessLevel_key" UNIQUE (module, "accessLevel");


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId");


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: ServiceAddress ServiceAddress_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceAddress"
    ADD CONSTRAINT "ServiceAddress_pkey" PRIMARY KEY (id);


--
-- Name: ServiceItemJob ServiceItemJob_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceItemJob"
    ADD CONSTRAINT "ServiceItemJob_pkey" PRIMARY KEY ("serviceItemId", "jobId");


--
-- Name: ServiceItemTemplate ServiceItemTemplate_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceItemTemplate"
    ADD CONSTRAINT "ServiceItemTemplate_pkey" PRIMARY KEY (id);


--
-- Name: ServiceItem ServiceItem_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceItem"
    ADD CONSTRAINT "ServiceItem_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: ServiceTemplate ServiceTemplate_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceTemplate"
    ADD CONSTRAINT "ServiceTemplate_pkey" PRIMARY KEY (id);



--
-- Name: Setting Setting_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Setting"
    ADD CONSTRAINT "Setting_pkey" PRIMARY KEY (id);



--
-- Name: UserProfileJob UserProfileJob_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."UserProfileJob"
    ADD CONSTRAINT "UserProfileJob_pkey" PRIMARY KEY ("userProfileId", "jobId");


--
-- Name: UserProfileRole UserProfileRole_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."UserProfileRole"
    ADD CONSTRAINT "UserProfileRole_pkey" PRIMARY KEY ("userProfileId", "roleId");


--
-- Name: UserProfile UserProfile_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."UserProfile"
    ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY (id);


--
-- Name: Entity Entity_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Entity"
    ADD CONSTRAINT "Entity_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: Vehicle Vehicle_pkey; Type: CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Vehicle"
    ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY (id);

--
-- Name: Vehicle Vehicle_carplateNumber_unique; Type: UNIQUE CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Vehicle"
    ADD CONSTRAINT "Vehicle_carplateNumber_unique" UNIQUE ("carplateNumber");


--
-- Name: Job Job_assignedBy_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Job"
    ADD CONSTRAINT "Job_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES gcool."UserProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Job Job_assignedVehicle_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Job"
    ADD CONSTRAINT "Job_assignedVehicle_fkey" FOREIGN KEY ("assignedVehicle") REFERENCES gcool."Vehicle"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Job Job_serviceId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Job"
    ADD CONSTRAINT "Job_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES gcool."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;


--
-- Name: Job Job_additionalServiceId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Job"
    ADD CONSTRAINT "Job_additionalServiceId_fkey" FOREIGN KEY ("additionalServiceId") REFERENCES gcool."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;


--
-- Name: JobNote JobNote_jobId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."JobNote"
    ADD CONSTRAINT "JobNote_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES gcool."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;


--
-- Name: RolePermission RolePermission_permissionId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."RolePermission"
    ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES gcool."Permission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES gcool."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceAddress ServiceAddress_clientId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceAddress"
    ADD CONSTRAINT "ServiceAddress_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES gcool."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceItemJob ServiceItemJob_jobId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceItemJob"
    ADD CONSTRAINT "ServiceItemJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES gcool."Job"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceItemJob ServiceItemJob_serviceItemId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceItemJob"
    ADD CONSTRAINT "ServiceItemJob_serviceItemId_fkey" FOREIGN KEY ("serviceItemId") REFERENCES gcool."ServiceItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceItem ServiceItem_serviceId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."ServiceItem"
    ADD CONSTRAINT "ServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES gcool."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;


--
-- Name: Service Service_clientId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Service"
    ADD CONSTRAINT "Service_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES gcool."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Service Service_entityId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Service"
    ADD CONSTRAINT "Service_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES gcool."Entity"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Service Service_serviceAddressId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Service"
    ADD CONSTRAINT "Service_serviceAddressId_fkey" FOREIGN KEY ("serviceAddressId") REFERENCES gcool."ServiceAddress"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserProfileJob UserProfileJob_jobId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."UserProfileJob"
    ADD CONSTRAINT "UserProfileJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES gcool."Job"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProfileJob UserProfileJob_userProfileId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."UserProfileJob"
    ADD CONSTRAINT "UserProfileJob_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES gcool."UserProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProfileRole UserProfileRole_roleId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."UserProfileRole"
    ADD CONSTRAINT "UserProfileRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES gcool."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProfileRole UserProfileRole_userProfileId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."UserProfileRole"
    ADD CONSTRAINT "UserProfileRole_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES gcool."UserProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProfile UserProfile_id_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."UserProfile"
    ADD CONSTRAINT "UserProfile_id_fkey" FOREIGN KEY (id) REFERENCES shared."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Vehicle Vehicle_employeeInCharge_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Vehicle"
    ADD CONSTRAINT "Vehicle_employeeInCharge_fkey" FOREIGN KEY ("employeeInCharge") REFERENCES gcool."UserProfile" (id) ON DELETE SET NULL ON UPDATE CASCADE;


--
-- Name: Invoice Invoice_serviceId_fkey; Type: FK CONSTRAINT; Schema: gcool; Owner: simplify
--

ALTER TABLE ONLY gcool."Invoice"
    ADD CONSTRAINT "Invoice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES gcool."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

