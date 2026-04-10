--
-- Alter value column and insert Email templates in Setting Table 
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'ALTER TABLE '|| r.name ||'."Setting" 
                ALTER COLUMN "value" TYPE TEXT';
            EXECUTE
            'INSERT INTO ' || r.NAME || '."Setting" VALUES 
                (24, ''InvoiceEmailTemplate'', ''INVOICEEMAILTEMPLATE'', ''<p>Dear {clientName}, </p> <p>Please find attached your invoice <strong>{invoiceNumber}-{contractTitle}</strong>.</p><br><p> Thank you.</p> '', false, ''2023-07-10 10:11:25.187+00'',''2023-07-10 10:11:25.187+00''),
                (25, ''ContractEmailTemplate'', ''CONTRACTEMAILTEMPLATE'', ''<p>Dear {clientName}, </p><p>Please find attached your quotation <strong>{serviceNumber}-{serviceTitle}</strong>.</p><br><p>Thank you.</p>'' , false, ''2023-07-10 10:11:25.187+00'',''2023-07-10 10:11:25.187+00''),
                (26, ''JobEmailTemplate'', ''JOBEMAILTEMPLATE'', ''<p>Dear {clientName},</p><p>Please find attached for your service report for service performed at on <strong>{jobDateTime}</strong>at: <strong>{address}<strong></p><br><p> Thank you. </p>'', false, ''2023-07-10 10:11:25.187+00'',''2023-07-10 10:11:25.187+00'')';
        END IF;
    END LOOP;
END$$;
