-- update field about job Contract --

-- ADD FIELD --
ALTER TABLE wellac."Service" ADD COLUMN "isJobCompleted" boolean DEFAULT false NULL;
ALTER TABLE wellac."Service" ADD COLUMN "totalJob" integer NULL;

-- MIGRATE EXISTING DATA --
UPDATE
    wellac."Service" as s
SET
    "isJobCompleted" = true
WHERE 
    (( SELECT COUNT ( j."id" ) FROM wellac."Job" AS j WHERE j."serviceId" = s."id" AND j."jobStatus" = 'COMPLETED' ) = ( SELECT COUNT ( j."id" ) FROM wellac."Job" AS j WHERE j."serviceId" = s."id" )) 
AND 
    (( SELECT COUNT ( ja."id" ) FROM wellac."Job" AS ja WHERE ja."additionalServiceId" = s."id" AND ja."jobStatus" = 'COMPLETED' ) = ( SELECT COUNT ( ja."id" ) FROM wellac."Job" AS ja WHERE ja."additionalServiceId" = s."id" ))
;

UPDATE
    wellac."Service" as s
SET
    "totalJob" = (SELECT COUNT ( j."id" ) FROM wellac."Job" AS j WHERE j."serviceId" = s."id");
