import psycopg2
import json
import os
import traceback
import boto3
from datetime import datetime
from textwrap import wrap
from pathlib import Path

region = 'ap-southeast-1'
ssm = boto3.client('ssm')
client = boto3.client('ses',region_name=region)
ecs = boto3.client('ecs', region_name=region)

# Configuration Values
AWS_RDS_ENDPOINT = os.environ["AWS_RDS_ENDPOINT"]
AWS_RDS_USERNAME = os.environ["AWS_RDS_USERNAME"]
AWS_RDS_PASSWORD = os.environ["AWS_RDS_PASSWORD"]
AWS_RDS_DATABASENAME = os.environ["AWS_RDS_DATABASENAME"]
AWS_RDS_PORT = os.environ["AWS_RDS_PORT"]

def lambda_handler(event, context):
    conn = psycopg2.connect(
        host=AWS_RDS_ENDPOINT,
        port=AWS_RDS_PORT,
        database=AWS_RDS_DATABASENAME,
        user=AWS_RDS_USERNAME,
        password=AWS_RDS_PASSWORD,
    )

    try: 
        cursor = conn.cursor()
        cursor.execute('SELECT LOWER(key) as name, name as "tenantName" FROM "shared"."Tenant" WHERE "emailService" = true')
        
        rows = cursor.fetchall()
        
        templateEmail = Path('./template.html').read_text()
        # templateEmail = open('./template.html', 'r').read()
    	

        for row in rows:

            sql2 = ('SELECT value FROM "{0}"."Setting" WHERE code = {1} and "isActive" = true ').format(row[0],"'EMAILNOTIFICATION'")
 
            cursor.execute(sql2)

            for value in cursor:
                if value:
                    sql3 = (
                        'SELECT j."id", j."jobStatus", j."startDateTime", cl."name", s."id" as "serviceId", s."serviceTitle", j."endDateTime", e."name" as "entityName", e."contactNumber" as "entityContactNumber", \
                        ( EXTRACT ( epoch FROM age( j."startDateTime", now( ) ) ) / 86400 ) :: INT AS "days", s."serviceStatus", e."countryCode" \
                        FROM "{0}"."Job" as j \
                            INNER JOIN "{0}"."Service" AS s ON j."serviceId" = s."id" \
                                INNER JOIN "{0}"."Entity" AS e ON s."entityId" = e."id" \
                                    INNER JOIN "{0}"."Client" AS cl ON s."clientId" = cl."id" WHERE j."jobStatus" IN {1} AND ( EXTRACT ( epoch FROM age( j."startDateTime"::date, now( ) ) ) / 86400 ) :: INT = {2} AND s."serviceStatus" = {3} AND cl."emailReminder" = true '
                    ).format(row[0], "('UNASSIGNED', 'CONFIRMED', 'ASSIGNED')", value[0], "'CONFIRMED'")
                    cursor.execute(sql3)
                    # print(sql3)
                    
                    for job in cursor:
                        if job:
                            
                            getEmail = ('SELECT cp."contactEmail" FROM "{0}"."ContactPerson" cp INNER JOIN "{0}"."ServiceContactPerson" as scp ON scp."contactPersonId" = cp."id" WHERE scp."serviceId" = {1}').format(row[0],job[4])
                            cursor.execute(getEmail)
                            
                            emailResults = cursor.fetchall()
                            
                            clientEmails = [result[0] for result in emailResults]
                            # print(clientEmails)
                            
                            try:
                                newEntityContactNumber = job[11] + job[8]
                                BODY_TEXT1 = "Hello,\r\n"
                                # The HTML body of the email.
                                BODY_HTML1 = templateEmail.replace('{{1}}', job[7]).replace('{{2}}', job[5]).replace('{{3}}', job[2].strftime("%d/%m/%Y")).replace('{{4}}', job[2].strftime("%I:%M %p")).replace('{{5}}', newEntityContactNumber)
                                
                                if job[3] is not None and len(job[3]) != 0:
                                    client.send_email(
                                        Destination={
                                            'ToAddresses': clientEmails,
                                        },
                                        Message={
                                            'Body': {
                                                'Html': {
                                                    'Charset': 'utf-8',
                                                    'Data': BODY_HTML1,
                                                },
                                                'Text': {
                                                    'Charset': 'utf-8',
                                                    'Data': BODY_TEXT1,
                                                },
                                            },
                                            'Subject': {
                                                'Charset': 'utf-8',
                                                'Data': 'Appointment Confirmation',
                                            },
                                        },
                                        Source='noreply-admin-support@simplify.asia',
                                    )
                                    print('Success send '+ job[3])
                                
                            except Exception as exc:
                                print('test')
                                print(traceback.format_exc())
                                continue
                            

                    # return None

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