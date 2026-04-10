DO $$ 
DECLARE
  r record;
BEGIN
  FOR r IN 
    SELECT LOWER("key") AS name 
    FROM "shared"."Tenant"
  LOOP
    IF EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name) THEN
      EXECUTE 
      '
      INSERT INTO ' || quote_ident(r.name) || '."TableColumnSetting" 
      ("id", "tableName", "column", "createdAt", "updatedAt") 
      VALUES (
        7, 
        ''EQUIPMENT'', 
        ''[
          {"field":"id","name":"ID","isVisible":true,"isDisabled":true,"sort":true},
          {"field":"name","name":"Name/Description","isVisible":true,"isDisabled":false,"sort":true},
          {"field":"clientName","name":"Client & Service Address","isVisible":true,"isDisabled":true,"sort":false},
          {"field":"location","name":"Location","isVisible":true,"isDisabled":true,"sort":false},
          {"field":"brand","name":"Brand","isVisible":true,"isDisabled":true,"sort":true},
          {"field":"model","name":"Model","isVisible":true,"isDisabled":false,"sort":false},
          {"field":"serialNumber","name":"Serial Number","isVisible":true,"isDisabled":false,"sort":false},
          {"field":"workDate","name":"Last Work Date","isVisible":true,"isDisabled":true,"sort":false},
          {"field":"createdDate","name":"Created Date","isVisible":true,"isDisabled":true,"sort":false},
          {"field":"warrantyDate","name":"Warranty Date","isVisible":true,"isDisabled":false,"sort":false},
          {"field":"status","name":"Status","isVisible":true,"isDisabled":true,"sort":false}
        ]'', 
        now(), 
        now()
      );
      ';
    END IF;
  END LOOP;
END $$;
