import AWS from 'aws-sdk';

const s3Client = new AWS.S3({
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: 'auto',
});

export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'uploads'
): Promise<string> {
  try {
    const key = `${folder}/${Date.now()}-${fileName}`;

    const params = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
      Body: fileBuffer,
      ContentType: 'application/octet-stream',
    };

    await s3Client.putObject(params).promise();

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
    return publicUrl;
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error('Failed to upload file to R2');
  }
}

export async function deleteFromR2(fileUrl: string): Promise<void> {
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const params = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
    };

    await s3Client.deleteObject(params).promise();
  } catch (error) {
    console.error('R2 delete error:', error);
    throw new Error('Failed to delete file from R2');
  }
}
