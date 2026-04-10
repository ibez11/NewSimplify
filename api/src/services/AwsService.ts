import Logger from '../Logger';

import { getTenantKey } from '../database/models';
import aws from 'aws-sdk';

const LOG = new Logger('AwsService.ts');
const { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET_NAME } = process.env;

export const s3BucketStringGenerate = (subDirectory?: string): string => {
  LOG.debug('Get S3 Bucket ');

  const tenantKey = getTenantKey();

  return `${S3_BUCKET_NAME}/${tenantKey}/${subDirectory}`;
};

export const s3BucketGetSignedUrl = async (key: string, subDirectory?: string, tenantKey?: string): Promise<string> => {
  LOG.debug('Get Signed Url S3 Bucket Object');

  aws.config.update({ accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY, region: AWS_REGION });
  tenantKey = tenantKey || getTenantKey();
  const s3 = new aws.S3();
  const awsOptions = {
    Bucket: `${S3_BUCKET_NAME}/${tenantKey}/${subDirectory}`,
    Key: key,
    Expires: 365 * 24 * 60 * 60
  };

  return await new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', awsOptions, (err, url) => {
      err ? reject(err) : resolve(url);
    });
  });
};

export const s3BucketGetPutSignedUrl = async (key: string, subDirectory?: string): Promise<string> => {
  LOG.debug('Get Put Signed Url S3 Bucket Object');

  const tenantKey = getTenantKey();
  const s3 = new aws.S3({
    endpoint: `s3-${AWS_REGION}.amazonaws.com`,
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    signatureVersion: 'v4',
    region: AWS_REGION
  });

  const options = {
    Bucket: `${S3_BUCKET_NAME}/${tenantKey}/${subDirectory}`,
    Key: key
  };

  return await new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', options, (err, url) => {
      err ? reject(err) : resolve(url);
    });
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const s3BucketGetObject = async (key: string, subDirectory?: string): Promise<any> => {
  LOG.debug('Get Object S3 Bucket Object');

  const tenantKey = getTenantKey();
  const s3 = new aws.S3({
    endpoint: `s3-${AWS_REGION}.amazonaws.com`,
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    signatureVersion: 'v4',
    region: AWS_REGION
  });

  const options = {
    Bucket: `${S3_BUCKET_NAME}/${tenantKey}/${subDirectory}`,
    Key: key
  };

  try {
    const data = await s3.getObject(options).promise();
    return data.Body; // This is the content of the object
  } catch (error) {
    console.error('Error getting object from S3:', error);
    throw error; // Rethrow the error for further handling
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const s3BucketUpload = async (params: any): Promise<void> => {
  LOG.debug('Get Signed Url S3 Bucket Object');

  aws.config.update({ accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY, region: AWS_REGION });
  const tenantKey = getTenantKey();
  const s3 = new aws.S3();

  const options = {
    ...params,
    Bucket: `${S3_BUCKET_NAME}/${tenantKey}/jobs_resized`
  };

  try {
    await s3.upload(options).promise();
    console.log('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error; // Rethrow the error for further handling
  }
};

export const s3BucketDeleteObject = async (key: string, subDirectory?: string): Promise<boolean> => {
  LOG.debug('Delete S3 Bucket Object');

  aws.config.update({ accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY, region: AWS_REGION });
  const tenantKey = getTenantKey();
  const s3 = new aws.S3();
  const options = {
    Bucket: `${S3_BUCKET_NAME}/${tenantKey}/${subDirectory}`,
    Key: key
  };

  return await new Promise((resolve, reject) => {
    s3.deleteObject(options, async err => {
      err ? reject(err) : resolve(true);
    });
  });
};
