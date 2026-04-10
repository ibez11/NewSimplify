import boto3
region = 'ap-southeast-1'
rds = boto3.client('rds', region_name=region)

def lambda_handler(event, context):
    # Not able to describe by tag
    instances = rds.describe_db_instances()

    instanceNames = []
    for instance in instances['DBInstances']:
      instanceName = instance['DBInstanceIdentifier']
      instanceStatus = instance['DBInstanceStatus']
      tags = rds.list_tags_for_resource(ResourceName=instance['DBInstanceArn'])
      for tag in tags['TagList']:
        if instanceStatus == 'stopped' and tag['Key'] == 'autoScheduledOn' and tag['Value'] == 'true':
            instanceNames.append(instanceName)

    if len(instanceNames) > 0:
      print(f'Starting RDS instances: {str(instanceNames)}')
      for instanceName in instanceNames:
        rds.start_db_instance(DBInstanceIdentifier=instanceName)
      print(f'Started RDS instances: {str(instanceNames)}')
    else:
      print('Found 0 applicable instance')
