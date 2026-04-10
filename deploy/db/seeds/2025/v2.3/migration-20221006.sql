--
-- Insert Price Visibility Report value setting
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
			'INSERT INTO ' || r.NAME || '."Setting" VALUES (17, ''PriceReportVisibility'', ''PRICEREPORTVISIBILITY'', null, true, ''2022-10-06 15:48:25.187+00'',''20022-10-06 15:48:25.187+00'')';
        END IF;
    END LOOP;
END$$;
