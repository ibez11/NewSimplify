--
-- Update Table View Setting for Quotation List
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
    ) THEN EXECUTE 'UPDATE ' || r.name || '."TableColumnSetting" SET "column" = ''[{"field":"id","name":"Quotation Title & ID","isVisible":true,"isDisabled":true, "sort":true},{"field":"entity","name":"Entity Name","isVisible":true,"isDisabled":true, "sort":false},{"field":"serviceAddress","name":"Service Address","isVisible":true,"isDisabled":false, "sort": false},{"field":"term","name":"Quotation Term","isVisible":true,"isDisabled":false, "sort":true},{"field":"contractType","name":"Quotation Type","isVisible":true,"isDisabled":true, "sort": false},{"field":"contractStatus","name":"Quotation Status","isVisible":true,"isDisabled":false, "sort": false},{"field":"contractProgress","name":"Quotation Progress","isVisible":true,"isDisabled":false, "sort": false},{"field":"invoiceNo","name":"Invoice Number","isVisible":true,"isDisabled":true, "sort": false},{"field":"contractAmount","name":"Quotation Amount","isVisible":true,"isDisabled":true, "sort": false},{"field":"collectedAmount","name":"Collected Amount","isVisible":true,"isDisabled":false, "sort":false}]'' WHERE id=2;';

END IF;

END LOOP;

END $$;