import psycopg2
import requests
import json
import os
import traceback
from datetime import datetime
from textwrap import wrap

# Configuration Values from Lambda Environment Variables
AWS_RDS_ENDPOINT = os.environ["AWS_RDS_ENDPOINT"]
AWS_RDS_USERNAME = os.environ["AWS_RDS_USERNAME"]
AWS_RDS_PASSWORD = os.environ["AWS_RDS_PASSWORD"]
AWS_RDS_DATABASENAME = os.environ["AWS_RDS_DATABASENAME"]
AWS_RDS_PORT = os.environ["AWS_RDS_PORT"]
WHATSAPP_TOKEN = os.environ["WHATSAPP_TOKEN"]

WHATSAPP_URL = "https://graph.facebook.com/v21.0/496036543599313/messages"
WHATSAPP_TEMPLATE_NAME = "customer_booking_link"
WHATSAPP_LANG_CODE = "en"

def lambda_handler(event, context):
    conn = None
    try:
        conn = psycopg2.connect(
            host=AWS_RDS_ENDPOINT,
            port=AWS_RDS_PORT,
            database=AWS_RDS_DATABASENAME,
            user=AWS_RDS_USERNAME,
            password=AWS_RDS_PASSWORD,
        )
        cursor = conn.cursor()
        cursor.execute('SELECT LOWER(key) as name, name as "tenantName", domain FROM "shared"."Tenant" WHERE "isBookingEnabled" = true')
        tenants = cursor.fetchall()

        for tenant in tenants:
            tenant_key, tenant_name, tenant_domain = tenant
            print(f'Processing tenant: {tenant_key}, domain: {tenant_domain}')

            cursor.execute(f'SELECT value FROM "{tenant_key}"."Setting" WHERE code = \'WHATSAPPNOTIFICATION\'')
            notif_settings = cursor.fetchall()

            for notif_setting in notif_settings:
                notif_day = notif_setting[0]

                # Get template name from tenant setting
                cursor.execute(f'SELECT value FROM "{tenant_key}"."Setting" WHERE code = \'WHATSAPPTEMPLATE\'')
                rowNameTemplateWA = cursor.fetchone()
                if not rowNameTemplateWA:
                    print(f"Template name missing for tenant {tenant_key}, skipping.")
                    continue

                template_name = rowNameTemplateWA[0]

                # Optional: get the messageBody from WaTemplate (not used in sending, only for logging/reference)
                cursor.execute(f"""SELECT "messageBody" FROM "shared"."WaTemplate" WHERE name = '{template_name}'""")
                rowWATemplate = cursor.fetchone()

                # Get eligible jobs
                sql_jobs = f'''
                    SELECT j."id", j."jobStatus", j."startDateTime", s."id", s."serviceTitle", e."name", e."countryCode", e."contactNumber",
                           (EXTRACT(EPOCH FROM age(j."startDateTime", now())) / 86400)::INT AS "days"
                    FROM "{tenant_key}"."Job" j
                    INNER JOIN "{tenant_key}"."Service" s ON j."serviceId" = s."id"
                    INNER JOIN "{tenant_key}"."Entity" e ON s."entityId" = e."id"
                    INNER JOIN "{tenant_key}"."Client" cl ON s."clientId" = cl."id"
                    WHERE j."jobStatus" = 'UNASSIGNED'
                      AND cl."whatsAppReminder" = true
                      AND (EXTRACT(EPOCH FROM age(j."startDateTime"::date, now())) / 86400)::INT = {notif_day}
                      AND s."serviceStatus" = 'CONFIRMED'
                '''
                cursor.execute(sql_jobs)
                jobs = cursor.fetchall()

                for job in jobs:
                    job_id, _, start_datetime, service_id, service_title, entity_name, country_code, contact_number, _ = job
                    start_date = start_datetime.strftime("%B %Y")
                    booking_link = f"https://{tenant_domain}/?quotationCode={service_id}"
                    formatted_contact = f"{country_code}{contact_number}"

                    # Get client contact number
                    sql_contact = f'''
                        SELECT CONCAT(cp."countryCode", cp."contactNumber")
                        FROM "{tenant_key}"."ContactPerson" cp
                        INNER JOIN "{tenant_key}"."ServiceContactPerson" scp ON scp."contactPersonId" = cp."id"
                        WHERE scp."serviceId" = {service_id}
                    '''
                    cursor.execute(sql_contact)
                    contacts = cursor.fetchall()

                    for contact in contacts:
                        recipient = contact[0]

                        try:
                            print(f"Sending message to: {recipient} for job: {job_id}")

                            payload = {
                                "messaging_product": "whatsapp",
                                "to": recipient,
                                "type": "template",
                                "template": {
                                    "name": WHATSAPP_TEMPLATE_NAME,
                                    "language": {"code": WHATSAPP_LANG_CODE},
                                    "components": [
                                        {
                                            "type": "body",
                                            "parameters": [
                                                {"type": "text", "text": entity_name},
                                                {"type": "text", "text": service_title},
                                                {"type": "text", "text": start_date},
                                                {"type": "text", "text": booking_link},
                                                {"type": "text", "text": formatted_contact},
                                            ]
                                        }
                                    ]
                                }
                            }

                            response = requests.post(
                                WHATSAPP_URL,
                                headers={
                                    "Authorization": f"Bearer {WHATSAPP_TOKEN}",
                                    "Content-Type": "application/json"
                                },
                                data=json.dumps(payload),
                                timeout=10
                            )
                            result = response.json()
                            print("WhatsApp response:", result)

                            if "messages" in result:
                                wamid = result["messages"][0]["id"]
                                log_sql = f'''
                                    INSERT INTO "shared"."WaJob" ("TenantKey", "JobId", "wamid", "status")
                                    VALUES ('{tenant_key}', {job_id}, '{wamid}', 'sending')
                                '''
                                conn2 = get_connection()
                                with conn2:
                                    with conn2.cursor() as log_cursor:
                                        log_cursor.execute(log_sql)
                                print("Logged WhatsApp message:", wamid)

                        except Exception as send_error:
                            print("Error sending message:", traceback.format_exc())
                            continue

    except Exception as e:
        print("Unexpected error:", traceback.format_exc())
    finally:
        if conn:
            conn.close()
            print("Database connection closed.")

def get_connection():
    try:
        return psycopg2.connect(
            host=AWS_RDS_ENDPOINT,
            port=AWS_RDS_PORT,
            database=AWS_RDS_DATABASENAME,
            user=AWS_RDS_USERNAME,
            password=AWS_RDS_PASSWORD,
        )
    except Exception as e:
        print("Error connecting for logging:", e)
        return None
