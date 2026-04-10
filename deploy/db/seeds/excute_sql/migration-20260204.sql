--
-- Insert job export fields
--

DO $$
DECLARE 
    r record;
    v_value text := $json$
[
  { "label": "Job ID", "key": "jobId" },
  { "label": "Client", "key": "clientName" },
  { "label": "Contact Person", "key": "contactPerson" },
  { "label": "Contact Number", "key": "contactNumber" },
  { "label": "Contact Email", "key": "contactEmail" },
  { "label": "Quotation Title", "key": "serviceName" },
  { "label": "Service Address", "key": "serviceAddress" },
  { "label": "Type", "key": "serviceType" },
  { "label": "Job Status", "key": "jobStatus" },
  { "label": "Start Time", "key": "startTime" },
  { "label": "End Time", "key": "endTime" },
  { "label": "Actual Start", "key": "actualStartTime" },
  { "label": "Actual End", "key": "actualEndTime" },
  { "label": "Actual Duration (mins)", "key": "actualDuration" },
  { "label": "Vehicle", "key": "assignedVehicle" },
  { "label": "Employee", "key": "assignedEmployee" },
  { "label": "Invoice Number", "key": "invoiceNumber" },
  { "label": "Invoice Status", "key": "invoiceStatus" },
  { "label": "Additional Invoice Number", "key": "additionalInvoiceNumber" },
  { "label": "Additional Invoice Status", "key": "additionalInvoiceStatus" },
  { "label": "Quotation Amount", "key": "totalServiceAmount" },
  { "label": "Total Completed Job", "key": "totalCompletedJobs" },
  { "label": "Number of Job Quotation", "key": "totalJob" },
  { "label": "Job Amount", "key": "jobAmount" },
  { "label": "Job GST Amount", "key": "jobGstAmount" },
  { "label": "Job Discount Amount", "key": "jobDiscountAmount" },
  { "label": "Total Job Amount", "key": "totalJobAmount" },
  { "label": "Additional Service Item", "key": "totalAdditionalAmountBeforeGst" },
  { "label": "Additional GST Amount", "key": "additionalGstAmount" },
  { "label": "Total Additional Amount", "key": "totalAdditionalAmount" },
  { "label": "Total Amount", "key": "totalJobAndAdditionalAmount" },
  { "label": "Job Collected Amount", "key": "collectedAmount" },
  { "label": "Additional Collected Amount", "key": "additionalCollectedAmount" },
  { "label": "Payment Method", "key": "paymentMethod" },
  { "label": "Service Items Name", "key": "serviceItems" },
  { "label": "Service Items Description", "key": "serviceItemsDescription" },
  { "label": "Service Items Qty", "key": "serviceItemsQty" },
  { "label": "Service Items Price", "key": "serviceItemsPrice" },
  { "label": "Additional Service Items Name", "key": "additionalServiceItems" },
  { "label": "Additional Service Items Description", "key": "additionalServiceItemsDescription" },
  { "label": "Additional Service Items Qty", "key": "additionalServiceItemsQty" },
  { "label": "Additional Service Items Price", "key": "additionalServiceItemsPrice" },
  { "label": "Expenses Item", "key": "expensesItems" },
  { "label": "Sales Person", "key": "salesPerson" },
  { "label": "Client Agent", "key": "agentName" },
  { "label": "Entity", "key": "entityName" },
  { "label": "Custom Field Label 1", "key": "customFieldLabel1" },
  { "label": "Custom Field Value 1", "key": "customFieldValue1" },
  { "label": "Custom Field Label 2", "key": "customFieldLabel2" },
  { "label": "Custom Field Value 2", "key": "customFieldValue2" }
]
$json$;
BEGIN
    FOR r IN SELECT LOWER(key) AS name FROM shared."Tenant"
    LOOP
        IF EXISTS (
            SELECT 1 
            FROM information_schema.schemata 
            WHERE schema_name = r.name
        ) THEN
            EXECUTE format(
                'INSERT INTO %I."Setting"
                 VALUES (33, %L, %L, %L, true, %L, %L)',
                r.name,
                'JobExportFields',
                'JOBEXPORTFIELDS',
                v_value,
                '2026-02-04 11:41:25.187+00',
                '2026-02-04 11:41:25.187+00'
            );
        END IF;
    END LOOP;
END$$;
