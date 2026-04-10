--
-- Create New Table TableColumnSetting
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'CREATE TABLE ' || r.NAME || '."TableColumnSetting" (
			id integer NOT NULL,
			"tableName" varchar(255) NOT NULL,
			"column" json NOT NULL,
			"createdAt" timestamp with time zone NOT NULL,
			"updatedAt" timestamp with time zone NOT NULL
			);
		ALTER TABLE ' || r.NAME || '."TableColumnSetting" OWNER TO simplify;
		COMMENT ON TABLE ' || r.NAME || '."TableColumnSetting" IS ''TableColumnSetting for each job.'';
		CREATE SEQUENCE ' || r.NAME || '."TableColumnSetting_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."TableColumnSetting_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."TableColumnSetting_id_seq" OWNED BY ' || r.NAME || '."TableColumnSetting"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."TableColumnSetting" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."TableColumnSetting_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."TableColumnSetting" ADD CONSTRAINT "TableColumnSetting_pkey" PRIMARY KEY (id);

		INSERT INTO '|| r.name ||'."Permission" VALUES 
                        (132, ''TABLE_COLUMN_SETTING'', ''ACCESS''),
                        (133, ''TABLE_COLUMN_SETTING'', ''VIEW''),
                        (134, ''TABLE_COLUMN_SETTING'', ''CREATE''),
                        (135, ''TABLE_COLUMN_SETTING'', ''EDIT''),
                        (136, ''TABLE_COLUMN_SETTING'', ''DELETE'');
        INSERT INTO '|| r.name ||'."RolePermission" ("roleId", "permissionId") VALUES
                        (1, 132),
                        (1, 133),
                        (1, 134),
                        (1, 135),
                        (1, 136);
        INSERT INTO '|| r.name ||'."TableColumnSetting" VALUES 
                        (1, ''CLIENT'', ''[{"field":"clientName", "name":"Client Name", "isVisible":true, "isDisabled":true}, {"field":"clientType", "name":"Client Type", "isVisible":true, "isDisabled":false}, {"field":"serviceAddress", "name":"Service Address", "isVisible":true, "isDisabled":true}, {"field":"contactPerson", "name":"Contact Person", "isVisible":true, "isDisabled":true}, {"field":"agent", "name":"Agent Name", "isVisible":true, "isDisabled":true}, {"field":"activeContract", "name":"Active Quotation", "isVisible":true, "isDisabled":false}, {"field":"totalContractAmount", "name":"Quotation Amount", "isVisible":true, "isDisabled":false}]'', now(), now()),
                        (2, ''CLIENT_CONTRACT'', ''[{"field":"id","name":"Quotation Title & ID","isVisible":true,"isDisabled":true},{"field":"serviceAddress","name":"Service Address","isVisible":true,"isDisabled":false},{"field":"term","name":"Quotation Term","isVisible":true,"isDisabled":false},{"field":"contractType","name":"Quotation Type","isVisible":true,"isDisabled":true},{"field":"contractStatus","name":"Quotation Status","isVisible":true,"isDisabled":false},{"field":"contractProgress","name":"Quotation Progress","isVisible":true,"isDisabled":false},{"field":"invoiceNo","name":"Invoice Number","isVisible":true,"isDisabled":true},{"field":"contractAmount","name":"Quotation Amount","isVisible":true,"isDisabled":true},{"field":"collectedAmount","name":"Collected Amount","isVisible":true,"isDisabled":false}]'', now(), now()),
                        (3, ''CLIENT_JOB'', ''[{"field":"id","name":"ID","isVisible":true,"isDisabled":true}, {"field":"contract","name":"Quotation & Invoice","isVisible":true,"isDisabled":false}, {"field":"serviceAddress","name":"Service Address","isVisible":true,"isDisabled":true},{"field":"jobStatus","name":"Job Status","isVisible":true,"isDisabled":true},{"field":"startDateTime","name":"Start Date & Time","isVisible":true,"isDisabled":true},{"field":"serviceType","name":"Job Type","isVisible":true,"isDisabled":false}, {"field":"jobAmount","name":"Job Amount","isVisible":true,"isDisabled":false}, {"field":"collectedAmount","name":"Collected Amount","isVisible":true,"isDisabled":false}, {"field":"paymentMethod","name":"Payment Method","isVisible":true,"isDisabled":false}, {"field":"vehicleNo","name":"Vehicle","isVisible":true,"isDisabled":false}, {"field":"employee","name":"Employee","isVisible":true,"isDisabled":false}, {"field":"jobLabels","name":"Job Labels","isVisible":true,"isDisabled":false}]'', now(), now()),
                        (4, ''CONTRACT'', ''[{"field":"id","name":"Quotation Title & ID","isVisible":true,"isDisabled":true},{"field":"clientName","name":"Client & Entity Name","isVisible":true,"isDisabled":true},{"field":"serviceAddress","name":"Service Address","isVisible":true,"isDisabled":false},{"field":"term","name":"Quotation Term","isVisible":true,"isDisabled":false},{"field":"contractType","name":"Quotation Type","isVisible":true,"isDisabled":true},{"field":"contractStatus","name":"Quotation Status","isVisible":true,"isDisabled":false},{"field":"contractProgress","name":"Quotation Progress","isVisible":true,"isDisabled":false},{"field":"invoiceNo","name":"Invoice Number","isVisible":true,"isDisabled":true},{"field":"contractAmount","name":"Quotation Amount","isVisible":true,"isDisabled":true},{"field":"collectedAmount","name":"Collected Amount","isVisible":true,"isDisabled":false}]'', now(), now()),
                        (5, ''INVOICE'', ''[{"field":"invoiceNumber", "name":"Invoice Number", "isVisible":true, "isDisabled":true}, {"field":"generate", "name":"Generated Date & Time", "isVisible":true, "isDisabled":false}, {"field":"clientName", "name":"Client Name", "isVisible":true, "isDisabled":true}, {"field":"contractTitle", "name":"Quotation Title", "isVisible":true, "isDisabled":false}, {"field":"term", "name":"Term", "isVisible":true, "isDisabled":false}, {"field":"invoiceAmount", "name":"Invoice Amount", "isVisible":true, "isDisabled":true}, {"field":"amountCollected", "name":"Amount Collected", "isVisible":true, "isDisabled":true}, {"field":"outstandingAmount", "name":"Outstanding Amount", "isVisible":true, "isDisabled":true}, {"field":"invoiceStatus", "name":"Invoice Status", "isVisible":true, "isDisabled":true}, {"field":"totalJob", "name":"Total Job", "isVisible":true, "isDisabled":false}]'', now(), now()),
                        (6, ''JOB'', ''[{"field":"id","name":"ID & Job Sequence","isVisible":true,"isDisabled":true}, {"field":"clientName","name":"Client Name","isVisible":true,"isDisabled":true}, {"field":"contract","name":"Quotation & Invoice","isVisible":true,"isDisabled":false}, {"field":"serviceAddress","name":"Service Address","isVisible":true,"isDisabled":true}, {"field":"startDateTime","name":"Start Date & Time","isVisible":true,"isDisabled":true}, {"field":"serviceType","name":"Job Type","isVisible":true,"isDisabled":false}, {"field":"jobAmount","name":"Job Amount","isVisible":true,"isDisabled":false}, {"field":"collectedAmount","name":"Collected Amount","isVisible":true,"isDisabled":false}, {"field":"paymentMethod","name":"Payment Method","isVisible":true,"isDisabled":false}, {"field":"vehicleNo","name":"Vehicle","isVisible":true,"isDisabled":false}, {"field":"employee","name":"Employee","isVisible":true,"isDisabled":false}, {"field":"jobLabels","name":"Job Labels","isVisible":true,"isDisabled":false}]'', now(), now());';
        END IF;
    END LOOP;
END$$;
