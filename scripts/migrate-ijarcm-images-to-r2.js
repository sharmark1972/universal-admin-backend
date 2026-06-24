#!/usr/bin/env node

/**
 * Migration script: Convert ijarcm image paths to R2 URLs
 * Updates ALL tables with /uploads/ image paths
 *
 * Usage:
 *   node scripts/migrate-ijarcm-images-to-r2.js --dry-run   (preview changes)
 *   node scripts/migrate-ijarcm-images-to-r2.js --execute    (apply changes)
 */

require('dotenv').config({ path: '.env' });

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: '51.222.200.179',
  port: 3306,
  user: 'ijarcm_user',
  password: 'dr12@WEX1504397',
  database: 'ijarcm_db',
};

const R2_PUBLIC_URL = 'https://pub-7e80c11ac86b40fab866b3a8a8f6056b.r2.dev';
const DRY_RUN = process.argv.includes('--dry-run');
const EXECUTE = process.argv.includes('--execute');

if (!DRY_RUN && !EXECUTE) {
  console.log('❌ ERROR: Must specify --dry-run or --execute');
  console.log('   node scripts/migrate-ijarcm-images-to-r2.js --dry-run');
  process.exit(1);
}

async function getConnection() {
  return await mysql.createConnection(DB_CONFIG);
}

async function findImageColumns(connection) {
  const [columns] = await connection.query(`
    SELECT TABLE_NAME, COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'ijarcm_db'
    AND (COLUMN_NAME LIKE '%image%' OR COLUMN_NAME LIKE '%path%' OR COLUMN_NAME LIKE '%url%')
    AND DATA_TYPE IN ('VARCHAR', 'TEXT', 'LONGTEXT')
  `);

  return columns;
}

async function findPathsToMigrate(connection, tableName, columnName) {
  const [rows] = await connection.query(
    `SELECT * FROM \`${tableName}\` WHERE \`${columnName}\` LIKE '/uploads/%'`
  );

  return rows;
}

async function migrateImages() {
  console.log('🚀 Starting IJARCM image migration to R2...\n');
  console.log(`📊 Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'EXECUTE (applying changes)'}`);
  console.log(`☁️  R2 URL: ${R2_PUBLIC_URL}\n`);

  const connection = await getConnection();

  try {
    const columns = await findImageColumns(connection);

    if (columns.length === 0) {
      console.log('ℹ️  No image columns found');
      return;
    }

    console.log(`📋 Found ${columns.length} potential image columns:\n`);

    let totalUpdates = 0;
    const updates = [];

    for (const column of columns) {
      const { TABLE_NAME, COLUMN_NAME } = column;

      try {
        const rows = await findPathsToMigrate(connection, TABLE_NAME, COLUMN_NAME);

        if (rows.length === 0) continue;

        console.log(`✅ ${TABLE_NAME}.${COLUMN_NAME}: Found ${rows.length} paths\n`);

        for (const row of rows) {
          const oldPath = row[COLUMN_NAME];
          const relativePath = oldPath.replace('/uploads/', '');
          const newPath = `${R2_PUBLIC_URL}/${relativePath}`;

          updates.push({
            table: TABLE_NAME,
            column: COLUMN_NAME,
            id: row.id || row.ID || 'unknown',
            oldPath,
            newPath,
          });

          console.log(`   ${oldPath}`);
          console.log(`   → ${newPath}\n`);

          totalUpdates++;
        }
      } catch (err) {
        console.error(`❌ Error scanning ${TABLE_NAME}.${COLUMN_NAME}: ${err.message}`);
      }
    }

    if (totalUpdates === 0) {
      console.log('ℹ️  No paths to migrate found\n');
      return;
    }

    console.log('\n' + '='.repeat(80));
    console.log(`📊 Summary: ${totalUpdates} image paths found\n`);

    if (EXECUTE) {
      console.log('⚠️  Applying updates...\n');

      let successCount = 0;
      let failureCount = 0;

      for (const update of updates) {
        try {
          await connection.query(
            `UPDATE \`${update.table}\` SET \`${update.column}\` = ? WHERE id = ?`,
            [update.newPath, update.id]
          );
          successCount++;
        } catch (err) {
          console.error(`❌ Failed to update ${update.table} (id: ${update.id}): ${err.message}`);
          failureCount++;
        }
      }

      console.log(`✅ Success: ${successCount}`);
      console.log(`❌ Failed: ${failureCount}`);
      console.log(`📊 Total: ${totalUpdates}`);
      console.log('\n🎉 Migration completed!');
    } else {
      console.log('✅ DRY RUN: No changes made');
      console.log('   Run with --execute to apply these updates');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrateImages();
