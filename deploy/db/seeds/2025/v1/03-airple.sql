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
-- Name: airple; Type: SCHEMA; Schema: -; Owner: simplify
--

CREATE SCHEMA airple;


ALTER SCHEMA airple OWNER TO simplify;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: Client; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."Client" (
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
    "billingPostal" character varying(255) NOT NULL,
    "needGST" boolean DEFAULT true NOT NULL,
    "paymentStatus" character varying(255) DEFAULT 'PENDING'::character varying NOT NULL,
    "remarks" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE airple."Client" OWNER TO simplify;

--
-- Name: TABLE "Client"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."Client" IS 'Clients information';


--
-- Name: Client_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."Client_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."Client_id_seq" OWNER TO simplify;

--
-- Name: Client_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."Client_id_seq" OWNED BY airple."Client".id;


--
-- Name: Job; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."Job" (
    id integer NOT NULL,
    "jobDate" date NOT NULL,
    "startTime" time without time zone,
    "endTime" time without time zone,
    "jobStatus" character varying(255) DEFAULT 'UNASSIGNED'::character varying NOT NULL,
    "remarks" TEXT,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "assignedBy" integer,
    "assignedVehicle" integer,
    "serviceId" integer,
    "additionalServiceId" integer
);


ALTER TABLE airple."Job" OWNER TO simplify;

--
-- Name: TABLE "Job"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."Job" IS 'A job represent the day when the service is being delivered';


--
-- Name: Job_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."Job_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."Job_id_seq" OWNER TO simplify;

--
-- Name: Job_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."Job_id_seq" OWNED BY airple."Job".id;


--
-- Name: JobNote; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."JobNote" (
    id integer NOT NULL,
    "notes" TEXT,
    "imageUrl" TEXT,
    "isHide" boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "jobId" integer
);


ALTER TABLE airple."JobNote" OWNER TO simplify;

--
-- Name: TABLE "JobNote"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."JobNote" IS 'A job note represent note for job';


--
-- Name: JobNote_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."JobNote_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."JobNote_id_seq" OWNER TO simplify;

--
-- Name: JobNote_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."JobNote_id_seq" OWNED BY airple."JobNote".id;


--
-- Name: Permission; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."Permission" (
    id integer NOT NULL,
    module character varying(255) NOT NULL,
    "accessLevel" character varying(255) NOT NULL
);


ALTER TABLE airple."Permission" OWNER TO simplify;

--
-- Name: TABLE "Permission"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."Permission" IS 'List of Permission for the whole applcation';


--
-- Name: Permission_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."Permission_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."Permission_id_seq" OWNER TO simplify;

--
-- Name: Permission_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."Permission_id_seq" OWNED BY airple."Permission".id;


--
-- Name: Role; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."Role" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE airple."Role" OWNER TO simplify;

--
-- Name: TABLE "Role"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."Role" IS 'User role, which contains a group of permission';


--
-- Name: RolePermission; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."RolePermission" (
    "roleId" integer NOT NULL,
    "permissionId" integer NOT NULL
);


ALTER TABLE airple."RolePermission" OWNER TO simplify;

--
-- Name: TABLE "RolePermission"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."RolePermission" IS 'User role, which contains a group of permission';


--
-- Name: Role_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."Role_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."Role_id_seq" OWNER TO simplify;

--
-- Name: Role_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."Role_id_seq" OWNED BY airple."Role".id;


--
-- Name: Service; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."Service" (
    id integer NOT NULL,
    "serviceType" character varying(255) NOT NULL,
    "serviceNumber" character varying(255) NOT NULL,
    "serviceTitle" character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
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
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "clientId" integer,
    "serviceAddressId" integer,
    "entityId" integer
);


ALTER TABLE airple."Service" OWNER TO simplify;

--
-- Name: TABLE "Service"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."Service" IS 'A group of service item. Can be taken as contract';


--
-- Name: ServiceAddress; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."ServiceAddress" (
    id integer NOT NULL,
    "contactPerson" character varying(255) NOT NULL,
    "contactNumber" character varying(255) NOT NULL,
    "secondaryContactPerson" character varying(255),
    "secondaryContactNumber" character varying(255),
    country character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    "postalCode" character varying(255) NOT NULL,
    "clientId" integer
);


ALTER TABLE airple."ServiceAddress" OWNER TO simplify;

--
-- Name: TABLE "ServiceAddress"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."ServiceAddress" IS 'Client service address';


--
-- Name: ServiceAddress_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."ServiceAddress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."ServiceAddress_id_seq" OWNER TO simplify;

--
-- Name: ServiceAddress_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."ServiceAddress_id_seq" OWNED BY airple."ServiceAddress".id;


--
-- Name: ServiceItem; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."ServiceItem" (
    id integer NOT NULL,
    description character varying(255) NOT NULL,
    quantity double precision DEFAULT '0'::double precision NOT NULL,
    "unitPrice" double precision DEFAULT '0'::double precision NOT NULL,
    "discountType" character varying(255) DEFAULT 'NA'::character varying NOT NULL,
    "discountAmt" double precision DEFAULT '0'::double precision NOT NULL,
    "totalPrice" double precision DEFAULT '0'::double precision NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "serviceId" integer
);


ALTER TABLE airple."ServiceItem" OWNER TO simplify;

--
-- Name: TABLE "ServiceItem"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."ServiceItem" IS 'Each line item in a service';


--
-- Name: ServiceItemJob; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."ServiceItemJob" (
    "serviceItemId" integer NOT NULL,
    "jobId" integer NOT NULL
);


ALTER TABLE airple."ServiceItemJob" OWNER TO simplify;

--
-- Name: TABLE "ServiceItemJob"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."ServiceItemJob" IS 'Each line item in a service';


--
-- Name: ServiceItemTemplate; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."ServiceItemTemplate" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    "unitPrice" double precision NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE airple."ServiceItemTemplate" OWNER TO simplify;

--
-- Name: TABLE "ServiceItemTemplate"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."ServiceItemTemplate" IS 'ServiceItem template for quick selection. Can be taken catelog.';


--
-- Name: ServiceItemTemplate_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."ServiceItemTemplate_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."ServiceItemTemplate_id_seq" OWNER TO simplify;

--
-- Name: ServiceItemTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."ServiceItemTemplate_id_seq" OWNED BY airple."ServiceItemTemplate".id;


--
-- Name: ServiceItem_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."ServiceItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."ServiceItem_id_seq" OWNER TO simplify;

--
-- Name: ServiceItem_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."ServiceItem_id_seq" OWNED BY airple."ServiceItem".id;


--
-- Name: Service_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."Service_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."Service_id_seq" OWNER TO simplify;

--
-- Name: Service_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."Service_id_seq" OWNED BY airple."Service".id;


--
-- Name: UserProfile; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."UserProfile" (
    id integer NOT NULL,
    "displayName" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "contactNumber" character varying(255) NOT NULL,
    "token" character varying(255) NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE airple."UserProfile" OWNER TO simplify;

--
-- Name: TABLE "UserProfile"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."UserProfile" IS 'UserProfile contains User metadata that are not related to log in';


--
-- Name: UserProfileJob; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."UserProfileJob" (
    "userProfileId" integer NOT NULL,
    "jobId" integer NOT NULL
);


ALTER TABLE airple."UserProfileJob" OWNER TO simplify;

--
-- Name: TABLE "UserProfileJob"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."UserProfileJob" IS 'UserProfile contains User metadata that are not related to log in';


--
-- Name: UserProfileRole; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."UserProfileRole" (
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userProfileId" integer NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE airple."UserProfileRole" OWNER TO simplify;

--
-- Name: TABLE "UserProfileRole"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."UserProfileRole" IS 'UserProfile contains User metadata that are not related to log in';


--
-- Name: Vehicle; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."Vehicle" (
    id integer NOT NULL,
    model character varying(255),
    "carplateNumber" character varying(255) NOT NULL,
    "coeExpiryDate" date,
    "vehicleStatus" boolean NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "employeeInCharge" integer
);


ALTER TABLE airple."Vehicle" OWNER TO simplify;

--
-- Name: TABLE "Vehicle"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."Vehicle" IS 'Company vehicles information';


--
-- Name: Vehicle_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."Vehicle_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."Vehicle_id_seq" OWNER TO simplify;

--
-- Name: Vehicle_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."Vehicle_id_seq" OWNED BY airple."Vehicle".id;


--
-- Name: Entity; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."Entity" (
  id integer NOT NULL,
  "name" character varying(255) NOT NULL,
  "address" character varying(255) NOT NULL,
  "logo" character varying(255) NOT NULL,
  "contactNumber" character varying(255) NOT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL
)
;


ALTER TABLE airple."Entity" OWNER TO simplify;

--
-- Name: TABLE "Entity"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."Entity" IS 'Entity for quick selection. Can be taken catalog';


--
-- Name: Entity_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."Entity_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."Entity_id_seq" OWNER TO simplify;

--
-- Name: Entity_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."Entity_id_seq" OWNED BY airple."Entity".id;


--
-- Name: Invoice; Type: TABLE; Schema: airple; Owner: simplify
--

CREATE TABLE airple."Invoice" (
  id integer NOT NULL,
  "invoiceNumber" character varying(255) NOT NULL,
  "termStart" date NOT NULL,
  "termEnd" date NOT NULL,
  "invoiceAmount" double precision DEFAULT '0'::double precision NOT NULL,
  "collectedAmount" double precision DEFAULT '0'::double precision NOT NULL,
  "invoiceStatus" character varying(50) DEFAULT NULL,
  "createdAt" timestamp with time zone NOT NULL,
  "updatedAt" timestamp with time zone NOT NULL,
  "serviceId" integer
)
;


ALTER TABLE airple."Invoice" OWNER TO simplify;

--
-- Name: TABLE "Invoice"; Type: COMMENT; Schema: airple; Owner: simplify
--

COMMENT ON TABLE airple."Invoice" IS 'Invoice for quick selection. Can be taken catalog';


--
-- Name: Invoice_id_seq; Type: SEQUENCE; Schema: airple; Owner: simplify
--

CREATE SEQUENCE airple."Invoice_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE airple."Invoice_id_seq" OWNER TO simplify;

--
-- Name: Invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: airple; Owner: simplify
--

ALTER SEQUENCE airple."Invoice_id_seq" OWNED BY airple."Invoice".id;


--
-- Name: Client id; Type: DEFAULT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Client" ALTER COLUMN id SET DEFAULT nextval('airple."Client_id_seq"'::regclass);


--
-- Name: Job id; Type: DEFAULT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Job" ALTER COLUMN id SET DEFAULT nextval('airple."Job_id_seq"'::regclass);


--
-- Name: JobNote id; Type: DEFAULT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."JobNote" ALTER COLUMN id SET DEFAULT nextval('airple."JobNote_id_seq"'::regclass);


--
-- Name: Permission id; Type: DEFAULT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Permission" ALTER COLUMN id SET DEFAULT nextval('airple."Permission_id_seq"'::regclass);


--
-- Name: Role id; Type: DEFAULT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Role" ALTER COLUMN id SET DEFAULT nextval('airple."Role_id_seq"'::regclass);


--
-- Name: Service id; Type: DEFAULT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Service" ALTER COLUMN id SET DEFAULT nextval('airple."Service_id_seq"'::regclass);


--
-- Name: ServiceAddress id; Type: DEFAULT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."ServiceAddress" ALTER COLUMN id SET DEFAULT nextval('airple."ServiceAddress_id_seq"'::regclass);


--
-- Name: ServiceItem id; Type: DEFAULT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."ServiceItem" ALTER COLUMN id SET DEFAULT nextval('airple."ServiceItem_id_seq"'::regclass);


--
-- Name: ServiceItemTemplate id; Type: DEFAULT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."ServiceItemTemplate" ALTER COLUMN id SET DEFAULT nextval('airple."ServiceItemTemplate_id_seq"'::regclass);


--
-- Name: Vehicle id; Type: DEFAULT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Vehicle" ALTER COLUMN id SET DEFAULT nextval('airple."Vehicle_id_seq"'::regclass);

--
-- Name: Invoice id; Type: DEFAULT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Invoice" ALTER COLUMN id SET DEFAULT nextval('airple."Invoice_id_seq"'::regclass);

--
-- Name: Client Client_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Client"
    ADD CONSTRAINT "Client_pkey" PRIMARY KEY (id);


--
-- Name: Job Job_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Job"
    ADD CONSTRAINT "Job_pkey" PRIMARY KEY (id);


--
-- Name: JobNote JobNote_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."JobNote"
    ADD CONSTRAINT "JobNote_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_module_accessLevel_key; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Permission"
    ADD CONSTRAINT "Permission_module_accessLevel_key" UNIQUE (module, "accessLevel");


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId");


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: ServiceAddress ServiceAddress_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."ServiceAddress"
    ADD CONSTRAINT "ServiceAddress_pkey" PRIMARY KEY (id);


--
-- Name: ServiceItemJob ServiceItemJob_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."ServiceItemJob"
    ADD CONSTRAINT "ServiceItemJob_pkey" PRIMARY KEY ("serviceItemId", "jobId");


--
-- Name: ServiceItemTemplate ServiceItemTemplate_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."ServiceItemTemplate"
    ADD CONSTRAINT "ServiceItemTemplate_pkey" PRIMARY KEY (id);


--
-- Name: ServiceItem ServiceItem_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."ServiceItem"
    ADD CONSTRAINT "ServiceItem_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: UserProfileJob UserProfileJob_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."UserProfileJob"
    ADD CONSTRAINT "UserProfileJob_pkey" PRIMARY KEY ("userProfileId", "jobId");


--
-- Name: UserProfileRole UserProfileRole_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."UserProfileRole"
    ADD CONSTRAINT "UserProfileRole_pkey" PRIMARY KEY ("userProfileId", "roleId");


--
-- Name: UserProfile UserProfile_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."UserProfile"
    ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY (id);


--
-- Name: Entity Entity_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Entity"
    ADD CONSTRAINT "Entity_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: Vehicle Vehicle_pkey; Type: CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Vehicle"
    ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY (id);

--
-- Name: Vehicle Vehicle_carplateNumber_unique; Type: UNIQUE CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Vehicle"
    ADD CONSTRAINT "Vehicle_carplateNumber_unique" UNIQUE ("carplateNumber");


--
-- Name: Job Job_assignedBy_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Job"
    ADD CONSTRAINT "Job_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES airple."UserProfile"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Job Job_assignedVehicle_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Job"
    ADD CONSTRAINT "Job_assignedVehicle_fkey" FOREIGN KEY ("assignedVehicle") REFERENCES airple."Vehicle"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Job Job_serviceId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Job" 
    ADD CONSTRAINT "Job_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES airple."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;


--
-- Name: Job Job_additionalServiceId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Job" 
    ADD CONSTRAINT "Job_additionalServiceId_fkey" FOREIGN KEY ("additionalServiceId") REFERENCES airple."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;


--
-- Name: JobNote JobNote_jobId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."JobNote" 
    ADD CONSTRAINT "JobNote_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES airple."Job"(id) ON DELETE CASCADE ON UPDATE CASCADE;


--
-- Name: RolePermission RolePermission_permissionId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."RolePermission"
    ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES airple."Permission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES airple."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceAddress ServiceAddress_clientId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."ServiceAddress"
    ADD CONSTRAINT "ServiceAddress_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES airple."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ServiceItemJob ServiceItemJob_jobId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."ServiceItemJob"
    ADD CONSTRAINT "ServiceItemJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES airple."Job"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceItemJob ServiceItemJob_serviceItemId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."ServiceItemJob"
    ADD CONSTRAINT "ServiceItemJob_serviceItemId_fkey" FOREIGN KEY ("serviceItemId") REFERENCES airple."ServiceItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ServiceItem ServiceItem_serviceId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."ServiceItem"
    ADD CONSTRAINT "ServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES airple."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;


--
-- Name: Service Service_clientId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Service"
    ADD CONSTRAINT "Service_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES airple."Client"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Service Service_entityId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Service"
    ADD CONSTRAINT "Service_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES airple."Entity"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Service Service_serviceAddressId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Service"
    ADD CONSTRAINT "Service_serviceAddressId_fkey" FOREIGN KEY ("serviceAddressId") REFERENCES airple."ServiceAddress"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserProfileJob UserProfileJob_jobId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."UserProfileJob"
    ADD CONSTRAINT "UserProfileJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES airple."Job"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProfileJob UserProfileJob_userProfileId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."UserProfileJob"
    ADD CONSTRAINT "UserProfileJob_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES airple."UserProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProfileRole UserProfileRole_roleId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."UserProfileRole"
    ADD CONSTRAINT "UserProfileRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES airple."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProfileRole UserProfileRole_userProfileId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."UserProfileRole"
    ADD CONSTRAINT "UserProfileRole_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES airple."UserProfile"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserProfile UserProfile_id_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."UserProfile"
    ADD CONSTRAINT "UserProfile_id_fkey" FOREIGN KEY (id) REFERENCES shared."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Vehicle Vehicle_employeeInCharge_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Vehicle"
    ADD CONSTRAINT "Vehicle_employeeInCharge_fkey" FOREIGN KEY ("employeeInCharge") REFERENCES airple."UserProfile" (id) ON DELETE SET NULL ON UPDATE CASCADE;


--
-- Name: Invoice Invoice_serviceId_fkey; Type: FK CONSTRAINT; Schema: airple; Owner: simplify
--

ALTER TABLE ONLY airple."Invoice" 
    ADD CONSTRAINT "Invoice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES airple."Service"(id) ON DELETE CASCADE ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

