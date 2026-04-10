--
-- add column country code for shared.user table
--

DO $$DECLARE
    r record;
BEGIN
   EXECUTE 'ALTER TABLE "shared"."User" ADD COLUMN "countryCode" varchar(255) DEFAULT ''+65''';
END$$;

