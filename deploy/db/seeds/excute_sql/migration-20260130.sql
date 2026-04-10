--
-- update value for Setting copy message template
--
DO $$ DECLARE r record;

BEGIN FOR r IN
SELECT
  LOWER(key) as name
FROM
  "shared"."Tenant" LOOP IF (
    SELECT
      EXISTS(
        SELECT
          1
        FROM
          information_schema.schemata
        WHERE
          schema_name = r.name
      )
  ) THEN EXECUTE 'UPDATE ' || r.NAME || '."Setting" SET "value" = ''Hi {clientName},

Here are your confirmed job details:

📞 Contact Person(s): {contactPersons}
📍 Service Address: {serviceAddress}
📋 Service: {quotationTitle}
🔧 Service Items : 
{serviceItems}
📅 Date: {jobDate}
🕐 Estimated Arrival: {startTime} to {endTime}

Thank you for choosing {entityName}!'' WHERE id = 31';

END IF;

END LOOP;

END $$;