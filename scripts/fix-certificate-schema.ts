const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCertificateSchema() {
  try {
    // Make user_id nullable
    await prisma.$executeRaw`
      ALTER TABLE certificates MODIFY COLUMN user_id VARCHAR(191) NULL
    `;
    
    console.log('Successfully updated certificates table - user_id is now nullable');
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateCertificateSchema();
