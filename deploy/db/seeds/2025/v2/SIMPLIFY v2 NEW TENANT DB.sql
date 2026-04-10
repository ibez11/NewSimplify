/*
 Navicat Premium Data Transfer

 Source Server         : simplifyPrd Live
 Source Server Type    : PostgreSQL
 Source Server Version : 120007
 Source Host           : rds-simplify-prd-simplify.cpdrnt4xlohf.ap-southeast-1.rds.amazonaws.com:55432
 Source Catalog        : simplify
 Source Schema         : graphictech

 Target Server Type    : PostgreSQL
 Target Server Version : 120007
 File Encoding         : 65001

 Date: 15/02/2022 14:05:11
*/


-- ----------------------------
-- Sequence structure for AdditionalContactPerson_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."AdditionalContactPerson_id_seq";
CREATE SEQUENCE "graphictech"."AdditionalContactPerson_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."AdditionalContactPerson_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for Agent_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."Agent_id_seq";
CREATE SEQUENCE "graphictech"."Agent_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."Agent_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for AppLog_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."AppLog_id_seq";
CREATE SEQUENCE "graphictech"."AppLog_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."AppLog_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for ChecklistItemTemplate_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."ChecklistItemTemplate_id_seq";
CREATE SEQUENCE "graphictech"."ChecklistItemTemplate_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."ChecklistItemTemplate_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for ChecklistJobItem_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."ChecklistJobItem_id_seq";
CREATE SEQUENCE "graphictech"."ChecklistJobItem_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."ChecklistJobItem_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for ChecklistJob_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."ChecklistJob_id_seq";
CREATE SEQUENCE "graphictech"."ChecklistJob_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."ChecklistJob_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for ChecklistTemplate_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."ChecklistTemplate_id_seq";
CREATE SEQUENCE "graphictech"."ChecklistTemplate_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."ChecklistTemplate_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for Client_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."Client_id_seq";
CREATE SEQUENCE "graphictech"."Client_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."Client_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for Entity_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."Entity_id_seq";
CREATE SEQUENCE "graphictech"."Entity_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."Entity_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for Invoice_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."Invoice_id_seq";
CREATE SEQUENCE "graphictech"."Invoice_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."Invoice_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for JobDocument_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."JobDocument_id_seq";
CREATE SEQUENCE "graphictech"."JobDocument_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."JobDocument_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for JobHistory_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."JobHistory_id_seq";
CREATE SEQUENCE "graphictech"."JobHistory_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."JobHistory_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for JobNote_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."JobNote_id_seq";
CREATE SEQUENCE "graphictech"."JobNote_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."JobNote_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for Job_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."Job_id_seq";
CREATE SEQUENCE "graphictech"."Job_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."Job_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for Permission_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."Permission_id_seq";
CREATE SEQUENCE "graphictech"."Permission_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."Permission_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for Role_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."Role_id_seq";
CREATE SEQUENCE "graphictech"."Role_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."Role_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for Schedule_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."Schedule_id_seq";
CREATE SEQUENCE "graphictech"."Schedule_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."Schedule_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for ServiceAddress_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."ServiceAddress_id_seq";
CREATE SEQUENCE "graphictech"."ServiceAddress_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."ServiceAddress_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for ServiceItemTemplate_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."ServiceItemTemplate_id_seq";
CREATE SEQUENCE "graphictech"."ServiceItemTemplate_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."ServiceItemTemplate_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for ServiceItem_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."ServiceItem_id_seq";
CREATE SEQUENCE "graphictech"."ServiceItem_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."ServiceItem_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for ServiceSkill_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."ServiceSkill_id_seq";
CREATE SEQUENCE "graphictech"."ServiceSkill_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."ServiceSkill_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for ServiceTemplate_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."ServiceTemplate_id_seq";
CREATE SEQUENCE "graphictech"."ServiceTemplate_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."ServiceTemplate_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for Service_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."Service_id_seq";
CREATE SEQUENCE "graphictech"."Service_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."Service_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for Setting_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."Setting_id_seq";
CREATE SEQUENCE "graphictech"."Setting_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."Setting_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for SkillTemplate_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."SkillTemplate_id_seq";
CREATE SEQUENCE "graphictech"."SkillTemplate_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."SkillTemplate_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for UserSkill_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."UserSkill_id_seq";
CREATE SEQUENCE "graphictech"."UserSkill_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."UserSkill_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for VehicleJob_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."VehicleJob_id_seq";
CREATE SEQUENCE "graphictech"."VehicleJob_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."VehicleJob_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for Vehicle_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."Vehicle_id_seq";
CREATE SEQUENCE "graphictech"."Vehicle_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."Vehicle_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Sequence structure for rating_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "graphictech"."rating_id_seq";
CREATE SEQUENCE "graphictech"."rating_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "graphictech"."rating_id_seq" OWNER TO "simplify";

-- ----------------------------
-- Table structure for AdditionalContactPerson
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."AdditionalContactPerson";
CREATE TABLE "graphictech"."AdditionalContactPerson" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."AdditionalContactPerson_id_seq"'::regclass),
  "clientId" int4 NOT NULL,
  "contactPerson" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "contactNumber" varchar(100) COLLATE "pg_catalog"."default",
  "contactEmail" varchar(100) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "graphictech"."AdditionalContactPerson" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."AdditionalContactPerson" IS 'AdditionalContactPerson for list of vehicle assigned of job.';

-- ----------------------------
-- Table structure for Agent
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Agent";
CREATE TABLE "graphictech"."Agent" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."Agent_id_seq"'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "description" text COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."Agent" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Agent" IS 'Agent for grouping client.';

-- ----------------------------
-- Table structure for AppLog
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."AppLog";
CREATE TABLE "graphictech"."AppLog" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."AppLog_id_seq"'::regclass),
  "user" varchar(255) COLLATE "pg_catalog"."default",
  "description" text COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."AppLog" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."AppLog" IS 'AppLog for see log of user action in app.';

-- ----------------------------
-- Table structure for ChecklistItemTemplate
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."ChecklistItemTemplate";
CREATE TABLE "graphictech"."ChecklistItemTemplate" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."ChecklistItemTemplate_id_seq"'::regclass),
  "checklistId" int4 NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."ChecklistItemTemplate" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."ChecklistItemTemplate" IS 'ChecklistItemTemplate for see log of user action in app.';

-- ----------------------------
-- Table structure for ChecklistJob
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."ChecklistJob";
CREATE TABLE "graphictech"."ChecklistJob" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."ChecklistJob_id_seq"'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "description" varchar(255) COLLATE "pg_catalog"."default",
  "jobId" int4 NOT NULL,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."ChecklistJob" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."ChecklistJob" IS 'ChecklistJob for list of checklist of job.';

-- ----------------------------
-- Table structure for ChecklistJobItem
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."ChecklistJobItem";
CREATE TABLE "graphictech"."ChecklistJobItem" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."ChecklistJobItem_id_seq"'::regclass),
  "checklistJobId" int4 NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "status" bool NOT NULL,
  "remarks" text COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."ChecklistJobItem" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."ChecklistJobItem" IS 'ChecklistJobItem for items of each job checklist.';

-- ----------------------------
-- Table structure for ChecklistTemplate
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."ChecklistTemplate";
CREATE TABLE "graphictech"."ChecklistTemplate" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."ChecklistTemplate_id_seq"'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "description" varchar(255) COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."ChecklistTemplate" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."ChecklistTemplate" IS 'ChecklistTemplate for see log of user action in app.';

-- ----------------------------
-- Table structure for Client
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Client";
CREATE TABLE "graphictech"."Client" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."Client_id_seq"'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "clientType" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "contactPerson" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "contactNumber" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "contactEmail" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "country" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "billingAddress" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "billingFloorNo" varchar(255) COLLATE "pg_catalog"."default",
  "billingUnitNo" varchar(255) COLLATE "pg_catalog"."default",
  "billingPostal" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "needGST" bool NOT NULL DEFAULT true,
  "paymentStatus" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'PENDING'::character varying,
  "remarks" varchar(255) COLLATE "pg_catalog"."default",
  "idQboWithGST" varchar(255) COLLATE "pg_catalog"."default",
  "idQboWithoutGST" varchar(255) COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "agentId" int4
)
;
ALTER TABLE "graphictech"."Client" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Client" IS 'Clients information';

-- ----------------------------
-- Table structure for Entity
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Entity";
CREATE TABLE "graphictech"."Entity" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."Entity_id_seq"'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "address" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "logo" varchar(255) COLLATE "pg_catalog"."default",
  "contactNumber" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "graphictech"."Entity" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Entity" IS 'Entity for quick selection. Can be taken catalog';

-- ----------------------------
-- Table structure for Invoice
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Invoice";
CREATE TABLE "graphictech"."Invoice" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."Invoice_id_seq"'::regclass),
  "invoiceNumber" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "termStart" date NOT NULL,
  "termEnd" date NOT NULL,
  "invoiceAmount" float8 NOT NULL DEFAULT '0'::double precision,
  "collectedAmount" float8 NOT NULL DEFAULT '0'::double precision,
  "chargeAmount" float8 NOT NULL DEFAULT '0'::double precision,
  "paymentMethod" varchar(50) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying,
  "invoiceStatus" varchar(50) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying,
  "isSynchronize" bool NOT NULL DEFAULT false,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "serviceId" int4
)
;
ALTER TABLE "graphictech"."Invoice" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Invoice" IS 'Invoice for quick selection. Can be taken catalog';

-- ----------------------------
-- Table structure for Job
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Job";
CREATE TABLE "graphictech"."Job" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."Job_id_seq"'::regclass),
  "jobStatus" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'UNASSIGNED'::character varying,
  "signature" text COLLATE "pg_catalog"."default",
  "collectedAmount" float8,
  "paymentMethod" varchar(50) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "assignedBy" int4,
  "serviceId" int4,
  "additionalServiceId" int4,
  "startDateTime" timestamp(6),
  "endDateTime" timestamp(6),
  "remarks" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "graphictech"."Job" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Job" IS 'A job represent the day when the service is being delivered';

-- ----------------------------
-- Table structure for JobDocument
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."JobDocument";
CREATE TABLE "graphictech"."JobDocument" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."JobDocument_id_seq"'::regclass),
  "notes" text COLLATE "pg_catalog"."default",
  "documentUrl" text COLLATE "pg_catalog"."default",
  "isHide" bool,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "jobId" int4
)
;
ALTER TABLE "graphictech"."JobDocument" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."JobDocument" IS 'A job document represent note for job';

-- ----------------------------
-- Table structure for JobHistory
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."JobHistory";
CREATE TABLE "graphictech"."JobHistory" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."JobHistory_id_seq"'::regclass),
  "jobId" int4 NOT NULL,
  "userProfileId" int4,
  "jobStatus" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "location" varchar(255) COLLATE "pg_catalog"."default",
  "dateTime" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."JobHistory" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."JobHistory" IS 'JobHistory for list of history of job for all technician do.';

-- ----------------------------
-- Table structure for JobNote
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."JobNote";
CREATE TABLE "graphictech"."JobNote" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."JobNote_id_seq"'::regclass),
  "notes" text COLLATE "pg_catalog"."default",
  "imageUrl" text COLLATE "pg_catalog"."default",
  "isHide" bool,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "jobId" int4
)
;
ALTER TABLE "graphictech"."JobNote" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."JobNote" IS 'A job note represent note for job';

-- ----------------------------
-- Table structure for Permission
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Permission";
CREATE TABLE "graphictech"."Permission" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."Permission_id_seq"'::regclass),
  "module" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "accessLevel" varchar(255) COLLATE "pg_catalog"."default" NOT NULL
)
;
ALTER TABLE "graphictech"."Permission" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Permission" IS 'List of Permission for the whole applcation';

-- ----------------------------
-- Table structure for Rating
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Rating";
CREATE TABLE "graphictech"."Rating" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech".rating_id_seq'::regclass),
  "feedback" text COLLATE "pg_catalog"."default",
  "rate" int4,
  "jobId" int4 NOT NULL,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."Rating" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Rating" IS 'Rating for see rate for company or technician.';

-- ----------------------------
-- Table structure for Role
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Role";
CREATE TABLE "graphictech"."Role" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."Role_id_seq"'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."Role" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Role" IS 'User role, which contains a group of permission';

-- ----------------------------
-- Table structure for RolePermission
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."RolePermission";
CREATE TABLE "graphictech"."RolePermission" (
  "roleId" int4 NOT NULL,
  "permissionId" int4 NOT NULL
)
;
ALTER TABLE "graphictech"."RolePermission" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."RolePermission" IS 'User role, which contains a group of permission';

-- ----------------------------
-- Table structure for Schedule
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Schedule";
CREATE TABLE "graphictech"."Schedule" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."Schedule_id_seq"'::regclass),
  "serviceId" int4,
  "startDateTime" timestamp(6),
  "endDateTime" timestamp(6),
  "repeatType" varchar(10) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying,
  "repeatEvery" int4,
  "repeatOnDate" int4,
  "repeatOnDay" varchar(100) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying,
  "repeatOnWeek" int4,
  "repeatOnMonth" int4,
  "repeatEndType" varchar(10) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying,
  "repeatEndAfter" int4,
  "repeatEndOnDate" date,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."Schedule" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Schedule" IS 'Schedule for mutliple schedule of service.';

-- ----------------------------
-- Table structure for Service
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Service";
CREATE TABLE "graphictech"."Service" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."Service_id_seq"'::regclass),
  "serviceType" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "serviceNumber" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "serviceTitle" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "serviceStatus" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'PENDING'::character varying,
  "needGST" bool NOT NULL DEFAULT true,
  "termStart" date NOT NULL,
  "termEnd" date NOT NULL,
  "originalAmount" float8 NOT NULL DEFAULT '0'::double precision,
  "discountType" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'NA'::character varying,
  "discountAmount" float8 NOT NULL DEFAULT '0'::double precision,
  "gstAmount" float8 NOT NULL DEFAULT '0'::double precision,
  "totalAmount" float8 NOT NULL DEFAULT '0'::double precision,
  "remarks" varchar(255) COLLATE "pg_catalog"."default",
  "termCondition" text COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "clientId" int4,
  "serviceAddressId" int4,
  "entityId" int4,
  "isJobCompleted" bool DEFAULT false,
  "totalJob" int4
)
;
ALTER TABLE "graphictech"."Service" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Service" IS 'A group of service item. Can be taken as contract';

-- ----------------------------
-- Table structure for ServiceAddress
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."ServiceAddress";
CREATE TABLE "graphictech"."ServiceAddress" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."ServiceAddress_id_seq"'::regclass),
  "contactPerson" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "contactNumber" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "secondaryContactPerson" varchar(255) COLLATE "pg_catalog"."default",
  "secondaryContactNumber" varchar(255) COLLATE "pg_catalog"."default",
  "country" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "address" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "floorNo" varchar(255) COLLATE "pg_catalog"."default",
  "unitNo" varchar(255) COLLATE "pg_catalog"."default",
  "postalCode" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "clientId" int4
)
;
ALTER TABLE "graphictech"."ServiceAddress" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."ServiceAddress" IS 'Client service address';

-- ----------------------------
-- Table structure for ServiceItem
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."ServiceItem";
CREATE TABLE "graphictech"."ServiceItem" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."ServiceItem_id_seq"'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "quantity" float8 NOT NULL DEFAULT '0'::double precision,
  "unitPrice" float8 NOT NULL DEFAULT '0'::double precision,
  "discountType" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'NA'::character varying,
  "discountAmt" float8 NOT NULL DEFAULT '0'::double precision,
  "totalPrice" float8 NOT NULL DEFAULT '0'::double precision,
  "idQboWithGST" varchar(255) COLLATE "pg_catalog"."default",
  "IdQboWithoutGST" varchar(255) COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "serviceId" int4,
  "scheduleId" int4
)
;
ALTER TABLE "graphictech"."ServiceItem" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."ServiceItem" IS 'Each line item in a service';

-- ----------------------------
-- Table structure for ServiceItemJob
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."ServiceItemJob";
CREATE TABLE "graphictech"."ServiceItemJob" (
  "serviceItemId" int4 NOT NULL,
  "jobId" int4 NOT NULL
)
;
ALTER TABLE "graphictech"."ServiceItemJob" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."ServiceItemJob" IS 'Each line item in a service';

-- ----------------------------
-- Table structure for ServiceItemTemplate
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."ServiceItemTemplate";
CREATE TABLE "graphictech"."ServiceItemTemplate" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."ServiceItemTemplate_id_seq"'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "unitPrice" float8 NOT NULL,
  "idQboWithGST" varchar(255) COLLATE "pg_catalog"."default",
  "IdQboWithoutGST" varchar(255) COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."ServiceItemTemplate" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."ServiceItemTemplate" IS 'ServiceItem template for quick selection. Can be taken catelog.';

-- ----------------------------
-- Table structure for ServiceSkill
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."ServiceSkill";
CREATE TABLE "graphictech"."ServiceSkill" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."ServiceSkill_id_seq"'::regclass),
  "serviceId" int4,
  "skill" varchar(255) COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."ServiceSkill" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."ServiceSkill" IS 'ServiceSkill for required skill of service.';

-- ----------------------------
-- Table structure for ServiceTemplate
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."ServiceTemplate";
CREATE TABLE "graphictech"."ServiceTemplate" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."ServiceTemplate_id_seq"'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "description" text COLLATE "pg_catalog"."default",
  "termCondition" text COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."ServiceTemplate" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."ServiceTemplate" IS 'Service template for quick selection. Can be taken catelog.';

-- ----------------------------
-- Table structure for Setting
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Setting";
CREATE TABLE "graphictech"."Setting" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."Setting_id_seq"'::regclass),
  "label" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "code" varchar(255) COLLATE "pg_catalog"."default",
  "value" varchar(255) COLLATE "pg_catalog"."default",
  "isActive" bool NOT NULL DEFAULT true,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."Setting" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Setting" IS 'Setting for manage additional feature.';

-- ----------------------------
-- Table structure for SkillTemplate
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."SkillTemplate";
CREATE TABLE "graphictech"."SkillTemplate" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."SkillTemplate_id_seq"'::regclass),
  "name" varchar(255) COLLATE "pg_catalog"."default",
  "description" varchar(255) COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."SkillTemplate" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."SkillTemplate" IS 'SkillTemplate for see log of user action in app.';

-- ----------------------------
-- Table structure for UserProfile
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."UserProfile";
CREATE TABLE "graphictech"."UserProfile" (
  "id" int4 NOT NULL,
  "displayName" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "contactNumber" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "token" varchar(255) COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."UserProfile" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."UserProfile" IS 'UserProfile contains User metadata that are not related to log in';

-- ----------------------------
-- Table structure for UserProfileJob
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."UserProfileJob";
CREATE TABLE "graphictech"."UserProfileJob" (
  "userProfileId" int4 NOT NULL,
  "jobId" int4 NOT NULL
)
;
ALTER TABLE "graphictech"."UserProfileJob" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."UserProfileJob" IS 'UserProfile contains User metadata that are not related to log in';

-- ----------------------------
-- Table structure for UserProfileRole
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."UserProfileRole";
CREATE TABLE "graphictech"."UserProfileRole" (
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "userProfileId" int4 NOT NULL,
  "roleId" int4 NOT NULL
)
;
ALTER TABLE "graphictech"."UserProfileRole" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."UserProfileRole" IS 'UserProfile contains User metadata that are not related to log in';

-- ----------------------------
-- Table structure for UserSkill
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."UserSkill";
CREATE TABLE "graphictech"."UserSkill" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."UserSkill_id_seq"'::regclass),
  "userProfileId" int4,
  "skill" varchar(255) COLLATE "pg_catalog"."default",
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL
)
;
ALTER TABLE "graphictech"."UserSkill" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."UserSkill" IS 'UserSkill for see log of user action in app.';

-- ----------------------------
-- Table structure for Vehicle
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."Vehicle";
CREATE TABLE "graphictech"."Vehicle" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."Vehicle_id_seq"'::regclass),
  "model" varchar(255) COLLATE "pg_catalog"."default",
  "carplateNumber" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "coeExpiryDate" date,
  "vehicleStatus" bool NOT NULL,
  "createdAt" timestamptz(6) NOT NULL,
  "updatedAt" timestamptz(6) NOT NULL,
  "employeeInCharge" int4
)
;
ALTER TABLE "graphictech"."Vehicle" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."Vehicle" IS 'Company vehicles information';

-- ----------------------------
-- Table structure for VehicleJob
-- ----------------------------
DROP TABLE IF EXISTS "graphictech"."VehicleJob";
CREATE TABLE "graphictech"."VehicleJob" (
  "id" int4 NOT NULL DEFAULT nextval('"graphictech"."VehicleJob_id_seq"'::regclass),
  "vehicleId" int4 NOT NULL,
  "jobId" int4 NOT NULL
)
;
ALTER TABLE "graphictech"."VehicleJob" OWNER TO "simplify";
COMMENT ON TABLE "graphictech"."VehicleJob" IS 'VehicleJob for list of vehicle assigned of job.';

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."AdditionalContactPerson_id_seq"
OWNED BY "graphictech"."AdditionalContactPerson"."id";
SELECT setval('"graphictech"."AdditionalContactPerson_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."Agent_id_seq"
OWNED BY "graphictech"."Agent"."id";
SELECT setval('"graphictech"."Agent_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."AppLog_id_seq"
OWNED BY "graphictech"."AppLog"."id";
SELECT setval('"graphictech"."AppLog_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."ChecklistItemTemplate_id_seq"
OWNED BY "graphictech"."ChecklistItemTemplate"."id";
SELECT setval('"graphictech"."ChecklistItemTemplate_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."ChecklistJobItem_id_seq"
OWNED BY "graphictech"."ChecklistJobItem"."id";
SELECT setval('"graphictech"."ChecklistJobItem_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."ChecklistJob_id_seq"
OWNED BY "graphictech"."ChecklistJob"."id";
SELECT setval('"graphictech"."ChecklistJob_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."ChecklistTemplate_id_seq"
OWNED BY "graphictech"."ChecklistTemplate"."id";
SELECT setval('"graphictech"."ChecklistTemplate_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."Client_id_seq"
OWNED BY "graphictech"."Client"."id";
SELECT setval('"graphictech"."Client_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."Entity_id_seq"
OWNED BY "graphictech"."Entity"."id";
SELECT setval('"graphictech"."Entity_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."Invoice_id_seq"
OWNED BY "graphictech"."Invoice"."id";
SELECT setval('"graphictech"."Invoice_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."JobDocument_id_seq"
OWNED BY "graphictech"."JobDocument"."id";
SELECT setval('"graphictech"."JobDocument_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."JobHistory_id_seq"
OWNED BY "graphictech"."JobHistory"."id";
SELECT setval('"graphictech"."JobHistory_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."JobNote_id_seq"
OWNED BY "graphictech"."JobNote"."id";
SELECT setval('"graphictech"."JobNote_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."Job_id_seq"
OWNED BY "graphictech"."Job"."id";
SELECT setval('"graphictech"."Job_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."Permission_id_seq"
OWNED BY "graphictech"."Permission"."id";
SELECT setval('"graphictech"."Permission_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."Role_id_seq"
OWNED BY "graphictech"."Role"."id";
SELECT setval('"graphictech"."Role_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."Schedule_id_seq"
OWNED BY "graphictech"."Schedule"."id";
SELECT setval('"graphictech"."Schedule_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."ServiceAddress_id_seq"
OWNED BY "graphictech"."ServiceAddress"."id";
SELECT setval('"graphictech"."ServiceAddress_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."ServiceItemTemplate_id_seq"
OWNED BY "graphictech"."ServiceItemTemplate"."id";
SELECT setval('"graphictech"."ServiceItemTemplate_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."ServiceItem_id_seq"
OWNED BY "graphictech"."ServiceItem"."id";
SELECT setval('"graphictech"."ServiceItem_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."ServiceSkill_id_seq"
OWNED BY "graphictech"."ServiceSkill"."id";
SELECT setval('"graphictech"."ServiceSkill_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."ServiceTemplate_id_seq"
OWNED BY "graphictech"."ServiceTemplate"."id";
SELECT setval('"graphictech"."ServiceTemplate_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."Service_id_seq"
OWNED BY "graphictech"."Service"."id";
SELECT setval('"graphictech"."Service_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."Setting_id_seq"
OWNED BY "graphictech"."Setting"."id";
SELECT setval('"graphictech"."Setting_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."SkillTemplate_id_seq"
OWNED BY "graphictech"."SkillTemplate"."id";
SELECT setval('"graphictech"."SkillTemplate_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."UserSkill_id_seq"
OWNED BY "graphictech"."UserSkill"."id";
SELECT setval('"graphictech"."UserSkill_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."VehicleJob_id_seq"
OWNED BY "graphictech"."VehicleJob"."id";
SELECT setval('"graphictech"."VehicleJob_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."Vehicle_id_seq"
OWNED BY "graphictech"."Vehicle"."id";
SELECT setval('"graphictech"."Vehicle_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "graphictech"."rating_id_seq"
OWNED BY "graphictech"."Rating"."id";
SELECT setval('"graphictech"."rating_id_seq"', 1, false);

-- ----------------------------
-- Primary Key structure for table AdditionalContactPerson
-- ----------------------------
ALTER TABLE "graphictech"."AdditionalContactPerson" ADD CONSTRAINT "AdditionalContactPerson_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table Agent
-- ----------------------------
ALTER TABLE "graphictech"."Agent" ADD CONSTRAINT "Agent_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table AppLog
-- ----------------------------
ALTER TABLE "graphictech"."AppLog" ADD CONSTRAINT "AppLog_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ChecklistItemTemplate
-- ----------------------------
ALTER TABLE "graphictech"."ChecklistItemTemplate" ADD CONSTRAINT "ChecklistItemTemplate_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ChecklistJob
-- ----------------------------
ALTER TABLE "graphictech"."ChecklistJob" ADD CONSTRAINT "ChecklistJob_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ChecklistJobItem
-- ----------------------------
ALTER TABLE "graphictech"."ChecklistJobItem" ADD CONSTRAINT "ChecklistJobItem_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ChecklistTemplate
-- ----------------------------
ALTER TABLE "graphictech"."ChecklistTemplate" ADD CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table Client
-- ----------------------------
ALTER TABLE "graphictech"."Client" ADD CONSTRAINT "Client_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table Entity
-- ----------------------------
ALTER TABLE "graphictech"."Entity" ADD CONSTRAINT "Entity_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table Invoice
-- ----------------------------
ALTER TABLE "graphictech"."Invoice" ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table Job
-- ----------------------------
ALTER TABLE "graphictech"."Job" ADD CONSTRAINT "Job_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table JobDocument
-- ----------------------------
ALTER TABLE "graphictech"."JobDocument" ADD CONSTRAINT "JobDocument_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table JobHistory
-- ----------------------------
ALTER TABLE "graphictech"."JobHistory" ADD CONSTRAINT "JobHistory_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table JobNote
-- ----------------------------
ALTER TABLE "graphictech"."JobNote" ADD CONSTRAINT "JobNote_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table Permission
-- ----------------------------
ALTER TABLE "graphictech"."Permission" ADD CONSTRAINT "Permission_module_accessLevel_key" UNIQUE ("module", "accessLevel");

-- ----------------------------
-- Primary Key structure for table Permission
-- ----------------------------
ALTER TABLE "graphictech"."Permission" ADD CONSTRAINT "Permission_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table Rating
-- ----------------------------
ALTER TABLE "graphictech"."Rating" ADD CONSTRAINT "rating_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table Role
-- ----------------------------
ALTER TABLE "graphictech"."Role" ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table RolePermission
-- ----------------------------
ALTER TABLE "graphictech"."RolePermission" ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId");

-- ----------------------------
-- Primary Key structure for table Schedule
-- ----------------------------
ALTER TABLE "graphictech"."Schedule" ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table Service
-- ----------------------------
ALTER TABLE "graphictech"."Service" ADD CONSTRAINT "Service_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ServiceAddress
-- ----------------------------
ALTER TABLE "graphictech"."ServiceAddress" ADD CONSTRAINT "ServiceAddress_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ServiceItem
-- ----------------------------
ALTER TABLE "graphictech"."ServiceItem" ADD CONSTRAINT "ServiceItem_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ServiceItemJob
-- ----------------------------
ALTER TABLE "graphictech"."ServiceItemJob" ADD CONSTRAINT "ServiceItemJob_pkey" PRIMARY KEY ("serviceItemId", "jobId");

-- ----------------------------
-- Primary Key structure for table ServiceItemTemplate
-- ----------------------------
ALTER TABLE "graphictech"."ServiceItemTemplate" ADD CONSTRAINT "ServiceItemTemplate_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ServiceSkill
-- ----------------------------
ALTER TABLE "graphictech"."ServiceSkill" ADD CONSTRAINT "ServiceSkill_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ServiceTemplate
-- ----------------------------
ALTER TABLE "graphictech"."ServiceTemplate" ADD CONSTRAINT "ServiceTemplate_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table Setting
-- ----------------------------
ALTER TABLE "graphictech"."Setting" ADD CONSTRAINT "Setting_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table SkillTemplate
-- ----------------------------
ALTER TABLE "graphictech"."SkillTemplate" ADD CONSTRAINT "SkillTemplate_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table UserProfile
-- ----------------------------
ALTER TABLE "graphictech"."UserProfile" ADD CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table UserProfileJob
-- ----------------------------
ALTER TABLE "graphictech"."UserProfileJob" ADD CONSTRAINT "UserProfileJob_pkey" PRIMARY KEY ("userProfileId", "jobId");

-- ----------------------------
-- Primary Key structure for table UserProfileRole
-- ----------------------------
ALTER TABLE "graphictech"."UserProfileRole" ADD CONSTRAINT "UserProfileRole_pkey" PRIMARY KEY ("userProfileId", "roleId");

-- ----------------------------
-- Primary Key structure for table UserSkill
-- ----------------------------
ALTER TABLE "graphictech"."UserSkill" ADD CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table Vehicle
-- ----------------------------
ALTER TABLE "graphictech"."Vehicle" ADD CONSTRAINT "Vehicle_carplateNumber_unique" UNIQUE ("carplateNumber");

-- ----------------------------
-- Primary Key structure for table Vehicle
-- ----------------------------
ALTER TABLE "graphictech"."Vehicle" ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table VehicleJob
-- ----------------------------
ALTER TABLE "graphictech"."VehicleJob" ADD CONSTRAINT "VehicleJob_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table AdditionalContactPerson
-- ----------------------------
ALTER TABLE "graphictech"."AdditionalContactPerson" ADD CONSTRAINT "AdditionalContactPerson_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "graphictech"."Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table ChecklistItemTemplate
-- ----------------------------
ALTER TABLE "graphictech"."ChecklistItemTemplate" ADD CONSTRAINT "ChecklistItemTemplate_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "graphictech"."ChecklistTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table ChecklistJob
-- ----------------------------
ALTER TABLE "graphictech"."ChecklistJob" ADD CONSTRAINT "ChecklistJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "graphictech"."Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table ChecklistJobItem
-- ----------------------------
ALTER TABLE "graphictech"."ChecklistJobItem" ADD CONSTRAINT "ChecklistJobItem_checklistId_fkey" FOREIGN KEY ("checklistJobId") REFERENCES "graphictech"."ChecklistJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table Client
-- ----------------------------
ALTER TABLE "graphictech"."Client" ADD CONSTRAINT "Client_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "graphictech"."Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table Invoice
-- ----------------------------
ALTER TABLE "graphictech"."Invoice" ADD CONSTRAINT "Invoice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "graphictech"."Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table Job
-- ----------------------------
ALTER TABLE "graphictech"."Job" ADD CONSTRAINT "Job_additionalServiceId_fkey" FOREIGN KEY ("additionalServiceId") REFERENCES "graphictech"."Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "graphictech"."Job" ADD CONSTRAINT "Job_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "graphictech"."UserProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "graphictech"."Job" ADD CONSTRAINT "Job_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "graphictech"."Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table JobDocument
-- ----------------------------
ALTER TABLE "graphictech"."JobDocument" ADD CONSTRAINT "JobDocument_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "graphictech"."Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table JobHistory
-- ----------------------------
ALTER TABLE "graphictech"."JobHistory" ADD CONSTRAINT "JobHistory_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "graphictech"."Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table JobNote
-- ----------------------------
ALTER TABLE "graphictech"."JobNote" ADD CONSTRAINT "JobNote_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "graphictech"."Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table Rating
-- ----------------------------
ALTER TABLE "graphictech"."Rating" ADD CONSTRAINT "RatingJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "graphictech"."Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table RolePermission
-- ----------------------------
ALTER TABLE "graphictech"."RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "graphictech"."Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "graphictech"."RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "graphictech"."Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table Schedule
-- ----------------------------
ALTER TABLE "graphictech"."Schedule" ADD CONSTRAINT "Schedule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "graphictech"."Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table Service
-- ----------------------------
ALTER TABLE "graphictech"."Service" ADD CONSTRAINT "Service_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "graphictech"."Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "graphictech"."Service" ADD CONSTRAINT "Service_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "graphictech"."Entity" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "graphictech"."Service" ADD CONSTRAINT "Service_serviceAddressId_fkey" FOREIGN KEY ("serviceAddressId") REFERENCES "graphictech"."ServiceAddress" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table ServiceAddress
-- ----------------------------
ALTER TABLE "graphictech"."ServiceAddress" ADD CONSTRAINT "ServiceAddress_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "graphictech"."Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table ServiceItem
-- ----------------------------
ALTER TABLE "graphictech"."ServiceItem" ADD CONSTRAINT "Schedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "graphictech"."Schedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "graphictech"."ServiceItem" ADD CONSTRAINT "ServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "graphictech"."Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table ServiceItemJob
-- ----------------------------
ALTER TABLE "graphictech"."ServiceItemJob" ADD CONSTRAINT "ServiceItemJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "graphictech"."Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "graphictech"."ServiceItemJob" ADD CONSTRAINT "ServiceItemJob_serviceItemId_fkey" FOREIGN KEY ("serviceItemId") REFERENCES "graphictech"."ServiceItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table ServiceSkill
-- ----------------------------
ALTER TABLE "graphictech"."ServiceSkill" ADD CONSTRAINT "ServiceSkill_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "graphictech"."Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table UserProfile
-- ----------------------------
ALTER TABLE "graphictech"."UserProfile" ADD CONSTRAINT "UserProfile_id_fkey" FOREIGN KEY ("id") REFERENCES "shared"."User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table UserProfileJob
-- ----------------------------
ALTER TABLE "graphictech"."UserProfileJob" ADD CONSTRAINT "UserProfileJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "graphictech"."Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "graphictech"."UserProfileJob" ADD CONSTRAINT "UserProfileJob_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "graphictech"."UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table UserProfileRole
-- ----------------------------
ALTER TABLE "graphictech"."UserProfileRole" ADD CONSTRAINT "UserProfileRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "graphictech"."Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "graphictech"."UserProfileRole" ADD CONSTRAINT "UserProfileRole_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "graphictech"."UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table UserSkill
-- ----------------------------
ALTER TABLE "graphictech"."UserSkill" ADD CONSTRAINT "UserSkill_jobId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "graphictech"."UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table Vehicle
-- ----------------------------
ALTER TABLE "graphictech"."Vehicle" ADD CONSTRAINT "Vehicle_employeeInCharge_fkey" FOREIGN KEY ("employeeInCharge") REFERENCES "graphictech"."UserProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table VehicleJob
-- ----------------------------
ALTER TABLE "graphictech"."VehicleJob" ADD CONSTRAINT "VehicleJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "graphictech"."Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "graphictech"."VehicleJob" ADD CONSTRAINT "VehicleJob_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "graphictech"."Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Records of Role
-- ----------------------------
BEGIN;
INSERT INTO "graphictech"."Role" VALUES (1, 'ADMIN', '2019-06-12 15:48:25.187+00', '2019-06-12 15:48:28.754+00');
INSERT INTO "graphictech"."Role" VALUES (2, 'TECHNICIAN', '2019-09-18 10:15:12+00', '2019-09-18 10:15:16+00');
COMMIT;


-- ----------------------------
-- Records of Permission
-- ----------------------------
BEGIN;
INSERT INTO "graphictech"."Permission" VALUES (1, 'ADMINISTRATION', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (2, 'USERS', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (3, 'USERS', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (4, 'USERS', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (5, 'USERS', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (6, 'USERS', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (7, 'SERVICE_ITEM_TEMPLATES', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (8, 'SERVICE_ITEM_TEMPLATES', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (9, 'SERVICE_ITEM_TEMPLATES', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (10, 'SERVICE_ITEM_TEMPLATES', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (11, 'SERVICE_ITEM_TEMPLATES', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (12, 'CLIENTS', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (13, 'CLIENTS', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (14, 'CLIENTS', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (15, 'CLIENTS', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (16, 'CLIENTS', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (17, 'VEHICLES', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (18, 'VEHICLES', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (19, 'VEHICLES', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (20, 'VEHICLES', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (21, 'VEHICLES', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (22, 'SERVICES', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (23, 'SERVICES', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (24, 'SERVICES', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (25, 'SERVICES', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (26, 'SERVICES', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (27, 'ENTITIES', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (28, 'ENTITIES', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (29, 'ENTITIES', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (30, 'ENTITIES', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (31, 'ENTITIES', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (32, 'JOBS', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (33, 'JOBS', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (34, 'JOBS', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (35, 'JOBS', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (36, 'JOBS', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (37, 'SERVICES_ADDRESSES', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (38, 'SERVICES_ADDRESSES', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (39, 'SERVICES_ADDRESSES', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (40, 'SERVICES_ADDRESSES', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (41, 'SERVICES_ADDRESSES', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (42, 'SERVICES_ITEMS', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (43, 'SERVICES_ITEMS', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (44, 'SERVICES_ITEMS', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (45, 'SERVICES_ITEMS', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (46, 'SERVICES_ITEMS', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (47, 'JOB_NOTES', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (48, 'JOB_NOTES', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (49, 'JOB_NOTES', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (50, 'JOB_NOTES', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (51, 'JOB_NOTES', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (52, 'INVOICES', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (53, 'INVOICES', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (54, 'INVOICES', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (55, 'INVOICES', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (56, 'INVOICES', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (57, 'SERVICE_TEMPLATES', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (58, 'SERVICE_TEMPLATES', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (59, 'SERVICE_TEMPLATES', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (60, 'SERVICE_TEMPLATES', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (61, 'SERVICE_TEMPLATES', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (62, 'SETTING', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (63, 'SETTING', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (64, 'SETTING', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (65, 'SETTING', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (66, 'SETTING', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (67, 'AGENT', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (68, 'AGENT', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (69, 'AGENT', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (70, 'AGENT', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (71, 'AGENT', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (72, 'SKILL_TEMPLATES', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (73, 'SKILL_TEMPLATES', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (74, 'SKILL_TEMPLATES', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (75, 'SKILL_TEMPLATES', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (76, 'SKILL_TEMPLATES', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (77, 'CHECKLIST_TEMPLATES', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (78, 'CHECKLIST_TEMPLATES', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (79, 'CHECKLIST_TEMPLATES', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (80, 'CHECKLIST_TEMPLATES', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (81, 'CHECKLIST_TEMPLATES', 'DELETE');
INSERT INTO "graphictech"."Permission" VALUES (82, 'RATINGS', 'ACCESS');
INSERT INTO "graphictech"."Permission" VALUES (83, 'RATINGS', 'VIEW');
INSERT INTO "graphictech"."Permission" VALUES (84, 'RATINGS', 'CREATE');
INSERT INTO "graphictech"."Permission" VALUES (85, 'RATINGS', 'EDIT');
INSERT INTO "graphictech"."Permission" VALUES (86, 'RATINGS', 'DELETE');
COMMIT;


-- ----------------------------
-- Records of RolePermission
-- ----------------------------
BEGIN;
INSERT INTO "graphictech"."RolePermission" VALUES (1, 1);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 2);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 3);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 4);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 5);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 6);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 7);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 8);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 9);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 10);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 11);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 12);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 13);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 14);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 15);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 16);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 17);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 18);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 19);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 20);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 21);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 22);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 23);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 24);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 25);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 26);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 27);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 28);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 29);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 30);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 31);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 32);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 33);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 34);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 35);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 36);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 37);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 38);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 39);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 40);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 41);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 42);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 43);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 44);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 45);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 46);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 47);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 48);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 49);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 50);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 51);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 52);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 53);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 54);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 55);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 56);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 57);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 58);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 59);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 60);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 61);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 62);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 63);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 64);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 65);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 66);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 1);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 2);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 3);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 5);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 7);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 8);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 12);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 13);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 17);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 18);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 22);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 23);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 24);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 32);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 33);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 35);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 37);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 38);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 42);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 43);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 47);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 48);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 49);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 50);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 51);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 52);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 53);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 57);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 58);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 15);
INSERT INTO "graphictech"."RolePermission" VALUES (2, 45);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 67);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 68);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 69);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 70);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 71);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 72);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 73);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 74);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 75);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 76);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 77);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 78);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 79);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 80);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 81);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 82);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 83);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 84);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 85);
INSERT INTO "graphictech"."RolePermission" VALUES (1, 86);
COMMIT;

-- ----------------------------
-- Records of UserProfile
-- ----------------------------
BEGIN;
INSERT INTO "graphictech"."UserProfile" VALUES (98, 'Kat', 'kat@graphic-tech.com.sg', '65123123', NULL, '2022-02-15 14:16:17+00', '2022-02-15 14:16:19+00');
COMMIT;

-- ----------------------------
-- Records of UserProfileRole
-- ----------------------------
BEGIN;
INSERT INTO "graphictech"."UserProfileRole" VALUES ('2022-02-15 14:16:27+00', '2022-02-15 14:16:29+00', 98, 1);
COMMIT;

-- ----------------------------
-- Records of Setting
-- ----------------------------
BEGIN;
INSERT INTO "graphictech"."Setting" VALUES (4, 'CompanyName', 'COMPANY_SETTING', 'GCOOL DEMO', 't', '2021-08-26 08:19:39.358+00', '2021-08-26 08:19:39.358+00');
INSERT INTO "graphictech"."Setting" VALUES (5, 'CompanyAddress', 'COMPANY_SETTING', 'SINGAPORE', 't', '2021-08-26 08:19:39.459+00', '2021-08-26 08:19:39.459+00');
INSERT INTO "graphictech"."Setting" VALUES (6, 'CompanyContactNumber', 'COMPANY_SETTING', '12345623', 't', '2021-08-26 08:19:39.55+00', '2021-08-26 08:19:39.55+00');
INSERT INTO "graphictech"."Setting" VALUES (7, 'CompanyUnitNumber', 'COMPANY_SETTING', '', 't', '2021-08-26 08:19:39.664+00', '2021-08-26 08:19:39.664+00');
INSERT INTO "graphictech"."Setting" VALUES (8, 'CompanyPostalCode', 'COMPANY_SETTING', '123345', 't', '2021-08-26 08:19:39.774+00', '2021-08-26 08:19:39.774+00');
INSERT INTO "graphictech"."Setting" VALUES (12, 'OperationHours', 'COMPANY_SETTING', '08:00:00,21:00:00', 't', '2021-11-19 08:19:41.052+00', '2021-11-19 08:19:41.052+00');
INSERT INTO "graphictech"."Setting" VALUES (3, 'Duplicateclient', 'DUPLICATECLIENT', '', 'f', '2021-07-16 02:31:31.855+00', '2022-01-05 09:55:38.902+00');
INSERT INTO "graphictech"."Setting" VALUES (1, 'Email Notification Completed Job', 'NOTIFCOMPLETEJOBEMAIL', NULL, 't', '2019-08-05 07:18:25+00', '2022-01-05 10:29:56.032+00');
INSERT INTO "graphictech"."Setting" VALUES (9, 'CompanyImage', 'COMPANY_SETTING', ' ', 't', '2021-08-26 08:19:39.869+00', '2022-02-08 06:14:59.837+00');
INSERT INTO "graphictech"."Setting" VALUES (10, 'PaynowGstImage', 'COMPANY_SETTING', ' ', 't', '2021-08-26 08:19:40.619+00', '2022-02-08 06:15:00.433+00');
INSERT INTO "graphictech"."Setting" VALUES (11, 'PaynowNonGstImage', 'COMPANY_SETTING', ' ', 't', '2021-08-26 08:19:41.052+00', '2022-02-08 06:15:00.637+00');
COMMIT;
