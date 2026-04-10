import psycopg2
import requests
import json
import os
import traceback
import time
from datetime import datetime
from textwrap import wrap
# Configuration Values
AWS_RDS_ENDPOINT = os.environ["AWS_RDS_ENDPOINT"]
AWS_RDS_USERNAME = os.environ["AWS_RDS_USERNAME"]
AWS_RDS_PASSWORD = os.environ["AWS_RDS_PASSWORD"]
AWS_RDS_DATABASENAME = os.environ["AWS_RDS_DATABASENAME"]
AWS_RDS_PORT = os.environ["AWS_RDS_PORT"]
WHATSAPP_TOKEN = os.environ["WHATSAPP_TOKEN"]
def lambda_handler(event, context):
    conn = psycopg2.connect(
        host=AWS_RDS_ENDPOINT,
        port=AWS_RDS_PORT,
        database=AWS_RDS_DATABASENAME,
        user=AWS_RDS_USERNAME,
        password=AWS_RDS_PASSWORD,
    )
    try:
        url = "https://graph.facebook.com/v13.0/112264078165872/messages"
        payload = json.dumps(
            {
                "messaging_product": "whatsapp",
                "to": "6282384006403",
                "type": "template",
                "template": {
                    "name": "dev_custom_template",
                    "language": {"code": "en"},
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {"type": "text", "text": "GCOOL"}
                            ],
                        }
                    ],
                },
            }
        )
        headers = {
            "Authorization": "Bearer " + WHATSAPP_TOKEN,
            "Content-Type": "application/json",
        }
        cursor = conn.cursor()
        cursor.execute('SELECT LOWER(key) as name, name as "tenantName" FROM "shared"."Tenant" WHERE "whatsappService" = true')
        rows = cursor.fetchall()
        for row in rows:
            sql2 = ('SELECT value FROM "{0}"."Setting" WHERE code = {1}').format(row[0],"'WHATSAPPNOTIFICATION'")
            cursor.execute(sql2)
            for value in cursor:
                if value:
                    sqlGetNameTemplateWA = ('SELECT value FROM "{0}"."Setting" WHERE code = {1}').format(row[0],"'WHATSAPPTEMPLATE'")
                    cursor.execute(sqlGetNameTemplateWA)
                    rowNameTemplateWA = cursor.fetchone()
                    sqlGetWATemplate = ("""SELECT "messageBody" FROM "shared"."WaTemplate" WHERE name = '{0}'""").format(rowNameTemplateWA[0])
                    cursor.execute(sqlGetWATemplate)
                    rowWATemplate = cursor.fetchone()
                    sql3 = (
                        'SELECT j."id", j."jobStatus", j."startDateTime", s."id", cl."name", s."serviceTitle", j."endDateTime", e."name" as "entityName", e."contactNumber" as "entityContactNumber", \
                        ( EXTRACT ( epoch FROM age( j."startDateTime", now( ) ) ) / 86400 ) :: INT AS "days", s."serviceStatus", sa."address", e."countryCode" \
                        FROM "{0}"."Job" as j \
                            INNER JOIN "{0}"."Service" AS s ON j."serviceId" = s."id" \
                                INNER JOIN "{0}"."Entity" AS e ON s."entityId" = e."id" \
                                    INNER JOIN "{0}"."Client" AS cl ON s."clientId" = cl."id" \
                                        INNER JOIN "{0}"."ServiceAddress" AS sa ON s."serviceAddressId" = sa."id" WHERE j."jobStatus" = {1} AND cl."whatsAppReminder" = true AND ( EXTRACT ( epoch FROM age( j."startDateTime"::date, now( ) ) ) / 86400 ) :: INT = {2} AND s."serviceStatus" = {3}'
                    ).format(row[0], "'UNASSIGNED'", value[0], "'CONFIRMED'")
                    cursor.execute(sql3)
                    print(sql3)
                    for job in cursor:
                        if job:
                            getNumber = ('SELECT concat(cp."countryCode", cp."contactNumber") FROM "{0}"."ContactPerson" cp INNER JOIN "{0}"."ServiceContactPerson" as scp ON scp."contactPersonId" = cp."id" WHERE scp."serviceId" = {1}').format(row[0],job[3])
                            cursor.execute(getNumber)
                            for clientContact in cursor:
                                print("sent to {0}".format(clientContact[0]))
                                if clientContact:
                                    try:
                                        print("job id: {0} status: {1} service id: {2}".format(job[0], job[1], job[3]))
                                        newPayload = json.loads(payload)
                                        startDate = job[2].strftime("%I:%M %p")
                                        endDate = job[6].strftime("%I:%M %p")
                                        contactNumber = wrap(job[8], 4)
                                        # newContactNumber = "+65 " + contactNumber[0] + " " + contactNumber[1]
                                        newContactNumber = job[12] + job[8]
                                        newPayload["to"] = clientContact[0]
                                        # newPayload["to"] = '+628117861966'
                                        newPayload["template"]["components"][0]["parameters"][0][
                                            "text"
                                        ] = rowWATemplate[0].replace('{1}', job[7]).replace('{2}', job[5]).replace('{3}', job[2].strftime("%d/%m/%Y")).replace('{4}', job[2].strftime("%I:%M %p")).replace('{5}', newContactNumber).replace('{6}', job[11])
                                        response = requests.request("POST", url, headers=headers, data=json.dumps(newPayload))
                                        resonseFromWA = json.loads(response.text);
                                        if "messages" in resonseFromWA:
                                            print(resonseFromWA["messages"][0]["id"])
                                            sql4 = (
                                                """INSERT INTO "shared"."WaJob" ("TenantKey", "JobId", "wamid", "status") VALUES ('{0}', {1}, '{2}', '{3}') """
                                            ).format(str(row[0]), job[0], resonseFromWA["messages"][0]["id"], 'sending')
                                            print(sql4)
                                            conn1 = get_connection()
                                            curr = conn1.cursor()
                                            curr.execute(sql4)
                                            conn1.commit()
                                    except Exception as exc:
                                        print('test')
                                        print(traceback.format_exc())
                                        continue
    except Exception as e:
        print(e)
    finally:
        if conn:
            conn.close()
            print("The DB connection is closed")
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
        print(e)
        return False