DO
$$
DECLARE
    rec record;
BEGIN
    FOR rec IN 
        SELECT LOWER(key) as key FROM shared."Tenant"
    LOOP
        EXECUTE format('ALTER TABLE %I."AppLog"
						ALTER COLUMN description TYPE TEXT;',
            rec.key);
    END LOOP;
END;
$$
LANGUAGE plpgsql;