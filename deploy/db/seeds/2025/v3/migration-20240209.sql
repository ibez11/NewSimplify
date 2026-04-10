--
-- query for update contact person in service table
--

DO $$ DECLARE
r record;
BEGIN
		FOR r IN SELECT LOWER
		( KEY ) AS NAME 
	FROM
		"shared"."Tenant"
		LOOP
	IF
		EXISTS ( SELECT 1 FROM information_schema.schemata WHERE SCHEMA_NAME = r.NAME ) THEN
			EXECUTE'
			UPDATE ' || r.NAME || '."Service" s
			SET "contactPerson" = COALESCE(subquery."contactPerson", s."contactPerson")
			FROM (
			SELECT CASE
			WHEN COUNT(c."contactEmail") > 0 THEN ARRAY_AGG(c."contactEmail")
			ELSE NULL
			END AS "contactPerson", c."id", s."id" AS "serviceId", s."clientId"
			FROM
			' || r.NAME || '."Service" s
			JOIN ' || r.NAME || '."Client" c ON s."clientId" = c."id"
			GROUP BY
			s."id", c."id"
			) subquery
			WHERE s."clientId" = subquery."clientId";';
		
	END IF;
	
END LOOP;

END $$;