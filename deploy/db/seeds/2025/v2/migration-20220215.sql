
--
-- Added plan type every tenant on shared 
--
ALTER TABLE shared."Tenant" ADD COLUMN "planType" varchar(255);

-- UPDATE EXISTING DATA --
UPDATE
    shared."Tenant"
SET
    "planType" = 'Standard';