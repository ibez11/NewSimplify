
--
-- Added expiry date every tenant on shared 
--
ALTER TABLE shared."Tenant" ADD COLUMN "subscriptExpDate" date NULL;

-- UPDATE EXISTING DATA --
UPDATE
    shared."Tenant"
SET
    "subscriptExpDate" = '2022-12-12';