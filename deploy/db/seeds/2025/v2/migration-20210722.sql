--
-- FIXING MIGRATION JOB HISTORY DATA 
-- 

UPDATE wellac."JobHistory" as jh
SET "userProfileId" = (
    SELECT "userProfileId" 
    FROM wellac."UserProfileJob" as uj
    WHERE uj."jobId" = jh."jobId"
    LIMIT 1
)
WHERE jh."userProfileId" ISNULL;