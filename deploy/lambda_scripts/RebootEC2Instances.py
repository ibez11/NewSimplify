import boto3
region = 'ap-southeast-2'
ec2 = boto3.client('ec2', region_name=region)

def lambda_handler(event, context):
    instances = ec2.describe_instances(Filters=[{'Name': 'tag:autoRebootOn', 'Values': ['true']}])

    instanceIds = []
    instanceNames = []
    for reservation in instances['Reservations']:
      for instance in reservation['Instances']:
        instanceIds.append(instance['InstanceId'])
        for tag in instance['Tags']:
          if tag['Key'] == 'Name':
              instanceNames.append(tag['Value'])

    if len(instanceIds) > 0:
      print(f'Rebooting instances: {str(instanceNames)}')
      ec2.reboot_instances(InstanceIds=instanceIds)
      print(f'Rebooted instances: {str(instanceNames)}')
    else:
      print("Found 0 applicable instance")
