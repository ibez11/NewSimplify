 --
-- add invoiceId, paymentMethod and isDeleted column in CollectedAmountHostory table
--

DO $$DECLARE r record;
BEGIN
    FOR r IN SELECT LOWER(key) as name FROM "shared"."Tenant"
    LOOP
        IF (SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = r.name)) THEN
            EXECUTE 
            'ALTER TABLE '|| r.name ||'."CollectedAmountHistory" ADD COLUMN "paymentMethod" varchar(255);';
            EXECUTE 
            'ALTER TABLE '|| r.name ||'."CollectedAmountHistory" ADD COLUMN "isDeleted" boolean DEFAULT false;';
            EXECUTE
            'UPDATE ' || r.name || '."CollectedAmountHistory" SET "isDeleted" = false;';
            EXECUTE
            'ALTER TABLE '|| r.name ||'."CollectedAmountHistory" ADD COLUMN "invoiceId" integer;';
            EXECUTE
            'ALTER TABLE ONLY  ' || r.NAME || '."CollectedAmountHistory" ADD CONSTRAINT "CollectedAmountHistory_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES '|| r.NAME ||'."Invoice"(id) ON DELETE SET NULL;';

        END IF;
    END LOOP;
END$$;
