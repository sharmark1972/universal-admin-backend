#!/usr/bin/env node

/**
 * Migration script: Convert ijarcm local file paths to R2 URLs
 *
 * Usage:
 *   node scripts/migrate-ijarcm-to-r2.js
 *
 * What it does:
 *   1. Connects to ijarcm_db via Prisma
 *   2. Finds all papers with /uploads/ paths
 *   3. Converts paths to R2 URLs
 *   4. Updates database
 *   5. Logs progress and results
 */

require('dotenv').config({ path: '.env' });

const { PrismaClient } = require('@prisma/client');

const IJARCM_DB_URL = process.env.DATABASE_URL_IJARCM;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL_IJARCM;

if (!IJARCM_DB_URL) {
  console.error('❌ ERROR: DATABASE_URL_IJARCM not found in .env');
  process.exit(1);
}

if (!R2_PUBLIC_URL) {
  console.error('❌ ERROR: R2_PUBLIC_URL_IJARCM not found in .env');
  process.exit(1);
}

async function migrateToR2() {
  console.log('🚀 Starting IJARCM file migration to R2...\n');
  console.log(`📦 Database: ijarcm_db`);
  console.log(`☁️  R2 URL: ${R2_PUBLIC_URL}\n`);

  const prisma = new PrismaClient({
    datasources: { db: { url: IJARCM_DB_URL } },
  });

  try {
    console.log('✅ Connected to ijarcm_db\n');

    // Fetch all papers with /uploads/ paths using raw SQL
    const papers = await prisma.$queryRaw`
      SELECT id, file_path as filePath
      FROM papers
      WHERE file_path LIKE '/uploads/%'
      ORDER BY id
    `;

    if (papers.length === 0) {
      console.log('ℹ️  No papers found with /uploads/ paths');
      console.log('   All papers are already migrated or have no file path');
      return;
    }

    console.log(`📋 Found ${papers.length} papers to migrate:\n`);

    let successCount = 0;
    let failureCount = 0;

    // Migrate each paper
    for (const paper of papers) {
      try {
        // Convert path: /uploads/papers/file.pdf → https://...r2.dev/papers/file.pdf
        const oldPath = paper.file_path;
        const relativePath = oldPath.replace('/uploads/', '');
        const newPath = `${R2_PUBLIC_URL}/${relativePath}`;

        // Update database
        await prisma.paper.update({
          where: { id: paper.id },
          data: { filePath: newPath },
        });

        console.log(`✅ ${paper.id.substring(0, 8)}...`);
        console.log(`   ${oldPath}`);
        console.log(`   → ${newPath}\n`);

        successCount++;
      } catch (err) {
        console.error(`❌ Failed to migrate ${paper.id}:`);
        console.error(`   ${err.message}\n`);
        failureCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📊 Total: ${papers.length}`);
    console.log('='.repeat(60) + '\n');

    if (failureCount === 0) {
      console.log('🎉 Migration completed successfully!');
      console.log('   All papers are now using R2 URLs');
    } else {
      console.log('⚠️  Migration completed with errors.');
      console.log('   Please review failed entries above.');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateToR2();
