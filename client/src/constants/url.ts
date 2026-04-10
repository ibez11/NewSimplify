const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const LOGIN_URL = `${BASE_URL}/login`;
export const LOGOUT_URL = `${BASE_URL}/logout`;
export const FORGOT_PASSWORD_URL = `${BASE_URL}/forgotpassword`;
export const RESET_PASSWORD_URL = `${BASE_URL}/resetpassword`;
export const CHANGE_PASSWORD_URL = `${BASE_URL}/changepassword`;

export const JOB_BASE_URL = `${BASE_URL}/jobs`;
export const JOB_BASE_INFO_URL = `${JOB_BASE_URL}/infojob`;
export const JOB_BASE_INFO_COLUMNFILTER_URL = `${JOB_BASE_URL}/columnfilter`;
export const GET_JOB_DETAIL_BY_ID = (jobId: string) => `${JOB_BASE_URL}/${jobId}`;
export const GET_JOB_DETAIL_BY_ADDITIONAL_SERVICE_ID = (additionalServiceId: string) => `${JOB_BASE_URL}/additional/${additionalServiceId}`;
export const GET_EDIT_JOB_URL = (jobId: number) => `${JOB_BASE_URL}/${jobId}`;
export const GET_CANCEL_JOB_URL = (jobId: number) => `${JOB_BASE_URL}/cancelJob/${jobId}`;
export const GET_EDIT_JOB_SERVICE_ITEM_URL = (jobId: number) => `${JOB_BASE_URL}/jobServiceItems/${jobId}`;
export const GET_DELETE_JOB_URL = (jobId: number[]) => `${JOB_BASE_URL}/${jobId}`;
export const GET_NOTIF_COMPLETED_BY_ID = (jobId: number) => `${JOB_BASE_URL}/notifcompleted/${jobId}`;
export const GET_EXPORT_JOBS_URL = (jobId: number) => `${JOB_BASE_URL}/export/${jobId}`;
export const GET_EXPORT_SCHEDULE_JOBS_URL = `${JOB_BASE_URL}/exportSchedule`;
export const GET_ASSIGN_JOB_BY_SERVICE_ID = `${JOB_BASE_URL}/assignContract`;
export const GET_SEND_JOB_URL = (jobId: number) => `${JOB_BASE_URL}/sendEmail/${jobId}`;
export const GET_JOB_CSV_URL = `${JOB_BASE_URL}/exportCsv`;
export const GET_LAST_JOB_URL = `${JOB_BASE_URL}/last`;
export const GET_SUMMARY_JOB_URL = `${JOB_BASE_URL}/summarycount`;

export const JOB_NOTE_BASE_URL = `${BASE_URL}/jobnotes`;
export const GET_EDIT_JOB_NOTE_URL = (jobNoteId: number) => `${JOB_NOTE_BASE_URL}/${jobNoteId}`;
export const GET_EDIT_JOB_NOTE_VISIBILITY_URL = (jobNoteId: number) => `${JOB_NOTE_BASE_URL}/visibility/${jobNoteId}`;
export const GET_DELETE_JOB_NOTE_URL = (jobNoteId: number) => `${JOB_NOTE_BASE_URL}/${jobNoteId}`;
export const GET_JOB_NOTE_BY_JOB_ID_URL = (jobId: string) => `${JOB_NOTE_BASE_URL}/${jobId}`;
export const GET_DELETE_JOB_NOTE_BY_ID_URL = (jobNoteId: number) => `${JOB_NOTE_BASE_URL}/${jobNoteId}`;
export const GET_JOB_NOTE_IMAGE_URL = (imageKey: string) => `${JOB_NOTE_BASE_URL}/getimage/${imageKey}`;
export const GET_JOB_NOTE_BY_EQUIPMENT_ID_URL = (equipmentId: number) => `${JOB_NOTE_BASE_URL}/equipmentNote/${equipmentId}`;
export const GET_PRESIGNED_URL = (fileName: string) => `${JOB_NOTE_BASE_URL}/preSignedUrl/${fileName}`;
export const GENERATE_TEXT_URL = `${JOB_NOTE_BASE_URL}/generate-text`;
export const AI_SPELL_CHECK_URL = `${JOB_NOTE_BASE_URL}/spelling-check`;

export const JOB_DOCUMENT_BASE_URL = `${BASE_URL}/jobdocuments`;
export const GET_JOB_DOCUMENT_URL = (documentKey: string) => `${JOB_DOCUMENT_BASE_URL}/getdocument/${documentKey}`;
export const GET_DELETE_JOB_DOCUMENT_BY_ID_URL = (jobDocumentId: number) => `${JOB_DOCUMENT_BASE_URL}/${jobDocumentId}`;

export const JOB_EXPENSES_BASE_URL = `${BASE_URL}/job-expenses`;
export const GET_JOB_EXPENSES_URL = (jobExpensesId: number) => `${JOB_EXPENSES_BASE_URL}/${jobExpensesId}`;
export const GET_EDIT_JOB_EXPENSES_URL = (jobExpensesId: number) => `${JOB_EXPENSES_BASE_URL}/${jobExpensesId}`;
export const GET_DELETE_JOB_EXPENSES_BY_ID_URL = (jobExpensesId: number) => `${JOB_EXPENSES_BASE_URL}/${jobExpensesId}`;

export const SERVICE_BASE_URL = `${BASE_URL}/services`;
export const GET_DELETE_SERVICES_URL = (serviceId: number) => `${SERVICE_BASE_URL}/${serviceId}`;
export const GET_EDIT_SERVICE_URL = (serviceId: number) => `${SERVICE_BASE_URL}/detail/${serviceId}`;
export const GET_SERVICE_DETAIL_BY_ID = (serviceId: string) => `${SERVICE_BASE_URL}/${serviceId}`;
export const GET_CONFIRM_SERVICE_URL = (serviceId: number) => `${SERVICE_BASE_URL}/confirm/${serviceId}`;
export const GET_CANCEL_SERVICE_URL = (serviceId: number) => `${SERVICE_BASE_URL}/cancel/${serviceId}`;
export const ADDITIONAL_SERVICE_URL = `${SERVICE_BASE_URL}/additionalService`;
export const GET_EDIT_ADDITIONAL_SERVICE_URL = (additionalServiceId: number) => `${SERVICE_BASE_URL}/additionalService/${additionalServiceId}`;
export const GET_EXPORT_SERVICES_URL = (serviceId: number) => `${SERVICE_BASE_URL}/export/${serviceId}`;
export const GENERATE_SCHEDULE_URL = `${SERVICE_BASE_URL}/schedule`;
export const GET_SCHEDULE_BY_SERVICE_ID_URL = (serviceId: number) => `${SERVICE_BASE_URL}/schedule/${serviceId}`;
export const GET_RENEW_SERVICE_URL = (serviceId: number) => `${SERVICE_BASE_URL}/renew/${serviceId}`;
export const RENEW_SERVICE_URL = (serviceId: number) => `${SERVICE_BASE_URL}/renew/${serviceId}`;
export const GET_SEND_SERVICE_URL = (serviceId: number) => `${SERVICE_BASE_URL}/sendEmail/${serviceId}`;
export const GET_SERVICE_CSV_URL = `${SERVICE_BASE_URL}/exportCsv`;
export const GET_LAST_SERVICE_URL = `${SERVICE_BASE_URL}/last`;

export const ENTITY_BASE_URL = `${BASE_URL}/entities`;
export const GET_EDIT_ENTITY_URL = (entityId: number) => `${ENTITY_BASE_URL}/${entityId}`;
export const GET_DELETE_ENTITY_URL = `${ENTITY_BASE_URL}/delete`;
export const GET_ENTITY_IMAGE_URL = (imageKey: string) => `${ENTITY_BASE_URL}/getimage/${imageKey}`;

export const SERVICE_ITEM_TEMPLATE_BASE_URL = `${BASE_URL}/serviceitemtemplates`;
export const GET_EDIT_SERVICE_ITEM_TEMPLATE_URL = (serviceItemTemplateId: number) => `${SERVICE_ITEM_TEMPLATE_BASE_URL}/${serviceItemTemplateId}`;
export const GET_DELETE_SERVICE_ITEM_TEMPLATE_URL = (serviceItemTemplateId: number) => `${SERVICE_ITEM_TEMPLATE_BASE_URL}/${serviceItemTemplateId}`;

export const VEHICLE_BASE_URL = `${BASE_URL}/vehicles`;
export const GET_ACTIVE_VEHICLE_URL = `${VEHICLE_BASE_URL}/active`;
export const GET_EDIT_VEHICLE_URL = (vehicleId: number) => `${VEHICLE_BASE_URL}/${vehicleId}`;
export const GET_DELETE_VEHICLE_URL = (vehicleId: number) => `${VEHICLE_BASE_URL}/${vehicleId}`;
export const GET_DEACTIVATE_VEHICLE_URL = (vehicleId: number) => `${VEHICLE_BASE_URL}/${vehicleId}/deactivate`;
export const GET_ACTIVATE_VEHICLE_URL = (vehicleId: number) => `${VEHICLE_BASE_URL}/${vehicleId}/activate`;

export const USER_BASE_URL = `${BASE_URL}/users`;
export const GET_CURRENT_USER_URL = `${USER_BASE_URL}/current`;
export const GET_ACTIVE_USERS_URL = `${USER_BASE_URL}/active`;
export const GET_ACTIVE_TECHNICIANS_URL = `${USER_BASE_URL}/activeTechnician`;
export const GET_USER_VERIFY_PASSWORD_URL = `${USER_BASE_URL}/currentPassword`;
export const GET_EDIT_USER_URL = (userId: number) => `${USER_BASE_URL}/${userId}`;
export const GET_UNLOCK_USER_URL = (userId: number) => `${USER_BASE_URL}/${userId}/unlock`;
export const GET_DEACTIVATE_USER_URL = (userId: number) => `${USER_BASE_URL}/${userId}`;
export const GET_ACTIVATE_USER_URL = (userId: number) => `${USER_BASE_URL}/${userId}/activate`;
export const GET_EDIT_USER_TOKEN_URL = `${USER_BASE_URL}/token`;

export const CLIENT_BASE_URL = `${BASE_URL}/clients`;
export const GET_CLIENT_BY_ID_URL = (clientId?: string) => `${CLIENT_BASE_URL}/${clientId}`;
export const GET_EMAIL_CLIENT_BY_SERVICE_ID_URL = (serviceId: number) => `${CLIENT_BASE_URL}/emailClient/${serviceId}`;
export const GET_CONTACT_PERSONS_CLIENT_BY_ID_URL = (clientId: number) => `${CLIENT_BASE_URL}/contactpersons/${clientId}`;
export const GET_EDIT_CLIENT_URL = (clientId: number) => `${CLIENT_BASE_URL}/${clientId}`;
export const GET_DELETE_CLIENT_URL = (clientId: number) => `${CLIENT_BASE_URL}/${clientId}`;

export const SERVICE_ADDRESS_BASE_URL = `${BASE_URL}/serviceaddresses`;
export const GET_SERVICE_ADDRESS_BY_CLIENT_ID_URL = (clientId: number) => `${SERVICE_ADDRESS_BASE_URL}/${clientId}`;
export const GET_EDIT_SERVICE_ADDRESS_URL = (serviceAddressId?: number) => `${SERVICE_ADDRESS_BASE_URL}/${serviceAddressId}`;
export const CHECK_ATTACH_SERVICE_ADDRESS_URL = (serviceAddressId: number) => `${SERVICE_ADDRESS_BASE_URL}/check-attach-service/${serviceAddressId}`;
export const GET_DELETE_SERVICE_ADDRESS_URL = (serviceAddressId?: number) => `${SERVICE_ADDRESS_BASE_URL}/${serviceAddressId}`;

export const SERVICE_ITEMS_BASE_URL = `${BASE_URL}/serviceitems`;
export const GET_SERVICE_ITEMS_BY_JOB_ID_URL = (jobId: string) => `${SERVICE_ITEMS_BASE_URL}/${jobId}`;

export const INVOICES_BASE_URL = `${BASE_URL}/invoices`;
export const GET_EDIT_INVOICE_URL = (id: number) => `${INVOICES_BASE_URL}/${id}`;
export const GET_INVOICE_BY_ID_URL = (id: number) => `${INVOICES_BASE_URL}/${id}`;
export const GET_EXPORT_INVOICE_URL = (id: number) => `${INVOICES_BASE_URL}/export/${id}`;
export const GET_SEND_INVOICE_URL = (id: number) => `${INVOICES_BASE_URL}/sendEmail/${id}`;
export const SYNCING_INVOICE_URL = `${INVOICES_BASE_URL}/sync-invoice`;
export const GET_INVOICE_INFO_URL = `${INVOICES_BASE_URL}/info`;
export const GET_INVOICE_CSV_URL = `${INVOICES_BASE_URL}/exportCsv`;
export const GET_DELETE_INVOICE_URL = (invoiceId: number) => `${INVOICES_BASE_URL}/${invoiceId}`;
export const GET_LAST_INVOICE_URL = `${INVOICES_BASE_URL}/last`;

export const SERVICE_TEMPLATE_BASE_URL = `${BASE_URL}/servicetemplates`;
export const GET_EDIT_SERVICE_TEMPLATE_URL = (serviceTemplateId: number) => `${SERVICE_TEMPLATE_BASE_URL}/${serviceTemplateId}`;
export const GET_DELETE_SERVICE_TEMPLATE_URL = (serviceTemplateId: number) => `${SERVICE_TEMPLATE_BASE_URL}/${serviceTemplateId}`;

export const ROLE_BASE_URL = `${BASE_URL}/roles`;
export const ROLE_ACCESS_BASE_URL = `${ROLE_BASE_URL}/access-settings`;
export const GET_EDIT_ROLE_ACCESS_BASE_URL = (id: number) => `${ROLE_BASE_URL}/${id}`;

export const SETTING_BASE_URL = `${BASE_URL}/settings`;
export const GET_SETTING_CODE_BASE_URL = (code: string) => `${SETTING_BASE_URL}/${code}`;
export const GET_SETTING_UPDATE_BASE_URL = (settingId: number) => `${SETTING_BASE_URL}/${settingId}`;

export const APPLOG_BASE_URL = `${BASE_URL}/applogs`;

export const AGENT_BASE_URL = `${BASE_URL}/agents`;
export const GET_EDIT_AGENT_URL = (agentId: number) => `${AGENT_BASE_URL}/${agentId}`;

export const SKILL_TEMPLATE_BASE_URL = `${BASE_URL}/skill-templates`;
export const GET_EDIT_SKILL_TEMPLATE_URL = (skillTemplateId: number) => `${SKILL_TEMPLATE_BASE_URL}/${skillTemplateId}`;
export const GET_DELETE_SKILL_TEMPLATE_URL = (skillTemplateId: number) => `${SKILL_TEMPLATE_BASE_URL}/${skillTemplateId}`;

export const CHECKLIST_TEMPLATE_BASE_URL = `${BASE_URL}/checklist-templates`;
export const GET_EDIT_CHECKLIST_TEMPLATE_URL = (checklistTemplateId: number) => `${CHECKLIST_TEMPLATE_BASE_URL}/${checklistTemplateId}`;
export const GET_DELETE_CHECKLIST_TEMPLATE_URL = (checklistTemplateId: number) => `${CHECKLIST_TEMPLATE_BASE_URL}/${checklistTemplateId}`;

export const CHECKLIST_JOB_BASE_URL = `${BASE_URL}/checklist-jobs`;
export const GET_EDIT_CHECKLIST_JOB_BASE_URL = (checklistJobId: number) => `${CHECKLIST_JOB_BASE_URL}/${checklistJobId}`;
export const GET_DELETE_CHECKLIST_JOB_BASE_URL = (checklistJobId: number) => `${CHECKLIST_JOB_BASE_URL}/${checklistJobId}`;

export const REPORT_BASE_URL = `${BASE_URL}/reports`;
export const REPORT_JOB_COMPLETED_URL = `${REPORT_BASE_URL}/jobs`;
export const REPORT_JOB_VALUE_COMPLETED_URL = `${REPORT_BASE_URL}/value-jobs`;
export const ANALYTIC_REVENUE_URL = `${REPORT_BASE_URL}/revenue`;
export const ANALYTIC_POPULAR_ITEM_URL = `${REPORT_BASE_URL}/popular-items`;
export const ANALYTIC_POPULAR_CONTRACT_URL = `${REPORT_BASE_URL}/popular-contracts`;
export const ANALYTIC_OVERVIEW_JOB_URL = `${REPORT_BASE_URL}/overview`;

export const RATING_BASE_URL = `${BASE_URL}/ratings`;
export const RATING_TECHNICIAN_URL = `${RATING_BASE_URL}/technician-rating`;
export const RATING_FEEDBACK_URL = `${RATING_BASE_URL}/feedbacks`;
export const RATING_COMPANY_URL = `${RATING_BASE_URL}/company-rating`;

export const JOB_NOTE_TEMPLATE_BASE_URL = `${BASE_URL}/jobnote-templates`;
export const GET_EDIT_JOB_NOTE_TEMPLATE_URL = (jobNoteTemplateId: number) => `${JOB_NOTE_TEMPLATE_BASE_URL}/${jobNoteTemplateId}`;
export const GET_DELETE_JOB_NOTE_TEMPLATE_URL = (jobNoteTemplateId: number) => `${JOB_NOTE_TEMPLATE_BASE_URL}/${jobNoteTemplateId}`;

export const EQUIPMENT_BASE_URL = `${BASE_URL}/equipments`;
export const SUBEQUIPMENT_BASE_URL = `${EQUIPMENT_BASE_URL}/subequipments`;
export const GET_EQUIPEMENT_BY_ID_URL = (equipmentId: string) => `${EQUIPMENT_BASE_URL}/${equipmentId}`;
export const GET_EQUIPEMENT_BY_SERVICE_ADDRESS_ID_URL = (serviceAddressId: number) => `${EQUIPMENT_BASE_URL}/byserviceaddress/${serviceAddressId}`;
export const GET_EDIT_EQUIPMENT_URL = (equipmentId: number) => `${EQUIPMENT_BASE_URL}/${equipmentId}`;
export const GET_EDIT_STATUS_EQUIPMENT_URL = (equipmentId: number) => `${EQUIPMENT_BASE_URL}/updateStatus/${equipmentId}`;
export const GET_DELETE_EQUIPMENT_URL = (equipmentId: number) => `${EQUIPMENT_BASE_URL}/${equipmentId}`;
export const GET_CSV_EQUIPMENT_URL = `${BASE_URL}/equipments/exportcsv`;

export const JOB_LABEL_TEMPLATE_BASE_URL = `${BASE_URL}/joblabel-templates`;
export const GET_EDIT_JOB_LABEL_TEMPLATE_URL = (jobLabelTemplateId: number) => `${JOB_LABEL_TEMPLATE_BASE_URL}/${jobLabelTemplateId}`;
export const GET_DELETE_JOB_LABEL_TEMPLATE_URL = (jobLabelTemplateId: number) => `${JOB_LABEL_TEMPLATE_BASE_URL}/${jobLabelTemplateId}`;

export const NOTIFICATION_BASE_URL = `${BASE_URL}/notifications`;
export const GET_EDIT_INDIVIDUAL_NOTIFICATION_BASE_URL = (notifId: number) => `${NOTIFICATION_BASE_URL}/${notifId}`;
export const GET_EDIT_ALL_NOTIFICATION_BASE_URL = `${NOTIFICATION_BASE_URL}`;

export const BRAND_TEMPLATE_BASE_URL = `${BASE_URL}/brand-templates`;
export const GET_EDIT_BRAND_TEMPLATE_URL = (brandTemplateId: number) => `${BRAND_TEMPLATE_BASE_URL}/${brandTemplateId}`;
export const GET_DELETE_BRAND_TEMPLATE_URL = (brandTemplateId: number) => `${BRAND_TEMPLATE_BASE_URL}/${brandTemplateId}`;

export const CLIENT_DOCUMENT_BASE_URL = `${BASE_URL}/client-documents`;
export const GET_CLIENT_DOCUMENT_URL = (documentKey: string) => `${CLIENT_DOCUMENT_BASE_URL}/getdocument/${documentKey}`;
export const GET_DELETE_CLIENT_DOCUMENT_BY_ID_URL = (jobDocumentId: number) => `${CLIENT_DOCUMENT_BASE_URL}/${jobDocumentId}`;

export const GST_TEMPLATE_BASE_URL = `${BASE_URL}/gst-templates`;

export const TABLE_COLUMN_SETTING_BASE_URL = `${BASE_URL}/tableColumnSettings`;
export const GET_EDIT_TABLE_COLUMN_SETTING_URL = (tableSettingId: number) => `${TABLE_COLUMN_SETTING_BASE_URL}/${tableSettingId}`;

export const TIMEOFF_BASE_URL = `${BASE_URL}/timeoff`;
export const GET_EDIT_TIMEOFF_BY_ID_URLL = (timeOffId: number) => `${TIMEOFF_BASE_URL}/${timeOffId}`;
export const GET_DELETE_TIMEOFF_BY_ID_URL = (timeOffId: number) => `${TIMEOFF_BASE_URL}/${timeOffId}`;

export const PDF_LAYOUT_BASE_URL = `${BASE_URL}/pdf-templates`;
export const GET_PDF_LAYOUT_BY_FILE_NAME_URL = (fileName: string) => `${PDF_LAYOUT_BASE_URL}/${fileName}`;
export const GET_EDIT_PDF_LAYOUT_URL = (fileName: string) => `${PDF_LAYOUT_BASE_URL}/${fileName}`;
export const GET_PDF_PREVIEW_LAYOUT_URL = (fileName: string) => `${PDF_LAYOUT_BASE_URL}/preview/${fileName}`;

export const ONEMAP_BASE_URL = `${BASE_URL}/onemap`;
export const GET_ADDRESS_ONEMAP_URL = (postalCode: string) => `${ONEMAP_BASE_URL}/search/${postalCode}`;
export const SMART_RANKING_BASE_URL = `${BASE_URL}/smart-ranking`;
export const GET_PROXIMITY_TECHNICIAN_URL = `${SMART_RANKING_BASE_URL}/technician`;

export const BOOKING_SETTINGS_URL = `${BASE_URL}/booking-settings`;

const getBaseUrl = (): string => {
  const env = process.env.REACT_APP_ENV;

  if (env === 'local') {
    return `http://${window?.location.hostname}:3000`;
  }

  if (env === 'production') {
    return 'https://app.simplify.asia';
  }

  if (env === 'development') {
    return 'https://dev.app.simplify.asia';
  }

  return 'http://localhost:3000'; // fallback
};

export const WEBHOOK_BASE_URL = getBaseUrl();
export const WEBHOOK_URL = `${WEBHOOK_BASE_URL}${BASE_URL}/webhooks`;
export const GET_TENANT_WEBHOOK_URL = (domain: string) => `${WEBHOOK_URL}/tenant/${domain}`;
export const GET_BOOKING_SETTING_WEBHOOKS_URL = (tenant: string) => `${WEBHOOK_URL}/booking-setting/${tenant}`;
export const GET_BOOKING_TIME_SLOTS_WEBHOOKS_URL = (tenant: string) => `${WEBHOOK_URL}/booking-timeslots/${tenant}`;
export const GET_BOOKING_JOB_WEBHOOKS_URL = (tenant: string, quotationNumber: string) => `${WEBHOOK_URL}/booking/${tenant}/${quotationNumber}`;
export const BOOKING_JOB_WEBHOOKS_URL = (tenant: string) => `${WEBHOOK_URL}/booking/${tenant}`;
export const VERIFY_BOOKING_URL = `${WEBHOOK_URL}/booking-link/verify`;

export const DISTRICT_BASE_URL = `${BASE_URL}/districts`;
// export const ONEMAP_BASE_URL = `https://www.onemap.gov.sg/api/common/elastic/search`;
export const GCALANDER_HOLIDAY_URL = `https://www.googleapis.com/calendar/v3/calendars/en.singapore%23holiday%40group.v.calendar.google.com/events?key=AIzaSyDfKWdpeRjC-731P6PQkR8DsKuuVewHpqc`;
export const REST_COUNTRIES_API_URL = `https://restcountries.com/v3.1/region/Asia`;
