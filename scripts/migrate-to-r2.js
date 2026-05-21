const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
require('dotenv').config();

const s3Client = new AWS.S3({
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: 'auto',
});

const uploadsDir = path.join(__dirname, '../uploads');
const publicUploadsDir = path.join(__dirname, '../public/uploads');

async function uploadFilesFromDirectory(dir, folderPrefix) {
  if (!fs.existsSync(dir)) {
    console.log(`📁 Directory not found: ${dir}`);
    return [];
  }

  const uploadedFiles = [];
  const files = fs.readdirSync(dir, { recursive: true });

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (!stat.isFile()) continue;

    try {
      const fileContent = fs.readFileSync(filePath);
      const key = `${folderPrefix}/${file}`;

      await s3Client.putObject({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: 'application/octet-stream',
      }).promise();

      const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
      uploadedFiles.push({
        localPath: file,
        r2Url: publicUrl,
      });

      console.log(`✅ Uploaded: ${file}`);
    } catch (error) {
      console.error(`❌ Error uploading ${file}:`, error.message);
    }
  }

  return uploadedFiles;
}

async function migrateAllFiles() {
  console.log('🚀 Starting migration to Cloudflare R2...\n');

  try {
    const uploadedFromRoot = await uploadFilesFromDirectory(uploadsDir, 'legacy-uploads');
    const uploadedFromPublic = await uploadFilesFromDirectory(publicUploadsDir, 'legacy-public');

    const allFiles = [...uploadedFromRoot, ...uploadedFromPublic];

    console.log('\n✅ Migration Complete!');
    console.log(`📊 Total files uploaded: ${allFiles.length}`);

    // Save mapping for reference
    if (allFiles.length > 0) {
      fs.writeFileSync(
        path.join(__dirname, '../migration-log.json'),
        JSON.stringify(allFiles, null, 2)
      );
      console.log('📝 Migration log saved to: migration-log.json');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateAllFiles();
