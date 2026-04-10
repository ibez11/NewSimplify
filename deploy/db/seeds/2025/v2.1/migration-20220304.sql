--
-- Insert Price Visibility value setting
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
			'INSERT INTO ' || r.NAME || '."Setting" VALUES (13, ''PriceVisibility'', ''PRICEVISIBILITY'', NULL, true, ''2019-03-04 15:48:25.187+00'',''2019-03-04 15:48:25.187+00'')';
        END IF;
    END LOOP;
END$$;
