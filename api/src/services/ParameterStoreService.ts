// ParameterStoreService.ts
import aws from 'aws-sdk';

const { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY } = process.env;

aws.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION
});
const ssm = new aws.SSM();

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Get parameter from AWS Systems Manager Parameter Store
 */
export const getParameter = async (name: string): Promise<string | null> => {
  try {
    const result = await ssm
      .getParameter({
        Name: name,
        WithDecryption: true
      })
      .promise();

    return result.Parameter?.Value ?? null;
  } catch (error) {
    // NotFound is common for first boot; just return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === 'ParameterNotFound') return null;
    console.error(`Failed to get parameter ${name}:`, error);
    return null;
  }
};

/**
 * Set parameter in AWS Systems Manager Parameter Store with retry on TooManyUpdates
 * Skips write if the value is identical (reduces contention).
 */
export const setParameter = async (name: string, value: string): Promise<void> => {
  // Skip redundant writes
  try {
    const current = await getParameter(name);
    if (current === value) return;
  } catch {
    // ignore read failures, proceed to attempt write
  }

  const maxAttempts = 6;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await ssm
        .putParameter({
          Name: name,
          Value: value,
          Type: 'SecureString',
          Overwrite: true
        })
        .promise();
      return;
    } catch (error) {
      const code = error?.code;
      const status = error?.statusCode;
      const retriable = code === 'TooManyUpdates' || code === 'ThrottlingException' || status === 429;

      if (retriable && attempt < maxAttempts) {
        const backoff = Math.min(200 * 2 ** attempt, 2000) + Math.floor(Math.random() * 200);
        await sleep(backoff);
        continue;
      }

      console.error(`Failed to set parameter ${name}:`, error);
      throw error;
    }
  }
};
