import { AwsClient } from 'aws4fetch';
import { env } from 'cloudflare:workers';

// Logos live in Neon's S3-compatible object storage. The bucket is private, so the Worker
// proxies reads through /media/logo/; keys are unique per upload and can be cached forever.

export const logoTypes: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

export const maxLogoBytes = 1024 * 1024;

function bucketUrl(key: string): string {
  if (!env.S3_ENDPOINT || !env.S3_BUCKET) throw new Error('S3 storage is not configured');
  const path = key.split('/').map(encodeURIComponent).join('/');
  return `${env.S3_ENDPOINT.replace(/\/$/, '')}/${env.S3_BUCKET}/${path}`;
}

function client(): AwsClient {
  if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    throw new Error('S3 storage is not configured');
  }
  return new AwsClient({
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    region: env.S3_REGION ?? 'eu-central-1',
    service: 's3',
  });
}

export async function putObject(key: string, body: ArrayBuffer, contentType: string) {
  const response = await client().fetch(bucketUrl(key), {
    method: 'PUT',
    body,
    headers: { 'Content-Type': contentType },
  });
  if (!response.ok) throw new Error(`S3 upload failed with status ${response.status}`);
}

export async function getObject(key: string): Promise<Response | undefined> {
  const response = await client().fetch(bucketUrl(key));
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`S3 read failed with status ${response.status}`);
  return response;
}

export async function deleteObject(key: string) {
  const response = await client().fetch(bucketUrl(key), { method: 'DELETE' });
  if (!response.ok && response.status !== 404) {
    throw new Error(`S3 delete failed with status ${response.status}`);
  }
}
