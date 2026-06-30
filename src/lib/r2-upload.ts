import AWS from 'aws-sdk';
import { headers } from 'next/headers';

// Global R2 client cache (per site)
const globalForR2 = globalThis as {
  r2ClientPool?: Map<string, AWS.S3>;
};

function getR2Client(siteSlug?: string): AWS.S3 {
  const slug = siteSlug ?? getSiteSlugFromHeaders();

  // Initialize cache if needed
  if (!globalForR2.r2ClientPool) {
    globalForR2.r2ClientPool = new Map();
  }

  // Return cached client if available
  if (globalForR2.r2ClientPool.has(slug)) {
    return globalForR2.r2ClientPool.get(slug)!;
  }

  // Create new client only if not cached
  const accessKeyId =
    process.env[`CLOUDFLARE_ACCESS_KEY_ID_${slug.toUpperCase()}`] ??
    process.env.CLOUDFLARE_ACCESS_KEY_ID;

  const secretAccessKey =
    process.env[`CLOUDFLARE_SECRET_ACCESS_KEY_${slug.toUpperCase()}`] ??
    process.env.CLOUDFLARE_SECRET_ACCESS_KEY;

  const endpoint =
    process.env[`CLOUDFLARE_R2_ENDPOINT_${slug.toUpperCase()}`] ??
    process.env.CLOUDFLARE_R2_ENDPOINT;

  const client = new AWS.S3({
    accessKeyId,
    secretAccessKey,
    endpoint,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region: 'auto',
  });

  // Cache the client
  globalForR2.r2ClientPool.set(slug, client);
  return client;
}

function getBucketName(siteSlug?: string): string {
  const slug = siteSlug ?? getSiteSlugFromHeaders();
  return (
    process.env[`CLOUDFLARE_R2_BUCKET_NAME_${slug.toUpperCase()}`] ??
    process.env.CLOUDFLARE_R2_BUCKET_NAME ??
    'wjiis-files'
  );
}

function getPublicUrl(siteSlug?: string): string {
  const slug = siteSlug ?? getSiteSlugFromHeaders();
  return (
    process.env[`CLOUDFLARE_R2_PUBLIC_URL_${slug.toUpperCase()}`] ??
    process.env.CLOUDFLARE_R2_PUBLIC_URL ??
    ''
  );
}

function getSiteSlugFromHeaders(): string {
  try {
    const h = headers();
    return h.get('x-site-slug') ?? h.get('x-active-site') ?? 'wjiis';
  } catch {
    return 'wjiis';
  }
}

export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'uploads',
  contentType: string = 'application/octet-stream',
  siteSlug?: string
): Promise<string> {
  try {
    const client = getR2Client(siteSlug);
    const bucket = getBucketName(siteSlug);
    const publicUrl = getPublicUrl(siteSlug);
    const key = `${folder}/${Date.now()}-${fileName}`;

    await client.putObject({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    }).promise();

    return `${publicUrl}/${key}`;
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error('Failed to upload file to R2');
  }
}

export async function downloadFromR2(fileUrl: string, siteSlug?: string): Promise<Buffer> {
  try {
    const client = getR2Client(siteSlug);
    const bucket = getBucketName(siteSlug);
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1);

    const result = await client.getObject({ Bucket: bucket, Key: key }).promise();
    return result.Body as Buffer;
  } catch (error) {
    console.error('R2 download error:', error);
    throw new Error('Failed to download file from R2');
  }
}

export async function deleteFromR2(fileUrl: string, siteSlug?: string): Promise<void> {
  try {
    const client = getR2Client(siteSlug);
    const bucket = getBucketName(siteSlug);
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1);

    await client.deleteObject({ Bucket: bucket, Key: key }).promise();
  } catch (error) {
    console.error('R2 delete error:', error);
    throw new Error('Failed to delete file from R2');
  }
}
