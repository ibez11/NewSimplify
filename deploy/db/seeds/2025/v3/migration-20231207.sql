--
-- Update Default Value Email templates
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'UPDATE '|| r.name ||'."Setting" SET "value" = ''<p>Dear {clientName},</p><p>Please find attached your invoice <strong>{invoiceNumber}-{quotationTitle}</strong></p><p>Thank you.</p>'' WHERE id=24;
             UPDATE '|| r.name ||'."Setting" SET "value" = ''<p>Dear {clientName},</p><p>Please find attached your invoice <strong>{quotationTitle}-{quotationNumber}</strong></p><p>Thank you.</p>'' WHERE id=25;
             UPDATE '|| r.name ||'."Setting" SET "value" = ''<p>Dear {clientName},</p><p>Please find attached for your service report for service performed at on <strong>{jobDateTime}</strong> at: <strong>{serviceAddress}</strong></p><p><strong>Thank you.</strong></p>'' WHERE id=26;';
        END IF;
    END LOOP;
END$$;
