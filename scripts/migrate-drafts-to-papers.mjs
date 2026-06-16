/**
 * Migration: research_paper_drafts → papers (IJARCM DB)
 *
 * What this does:
 * 1. Reads all 3 drafts from research_paper_drafts
 * 2. For each draft — checks if a paper already exists (by source_file_path match)
 * 3. If no matching paper exists — creates Paper + PaperSection + PaperAuthor records
 * 4. Reports result — no deletes, read-only verification first
 *
 * Run: node scripts/migrate-drafts-to-papers.mjs
 * Add --dry-run flag to preview without writing
 */

import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

const DRY_RUN = process.argv.includes('--dry-run');

const DB = {
  host: '51.222.200.179',
  port: 3306,
  user: 'ijarcm_user',
  password: '***REMOVED***',
  database: 'ijarcm_db',
  connectTimeout: 30000,
};

// Map ResearchPaperStatus → PaperStatus
function mapStatus(draftStatus) {
  if (draftStatus === 'PUBLISHED') return 'PUBLISHED';
  return 'SUBMITTED';
}

async function run() {
  console.log(DRY_RUN ? '\n[DRY RUN] No changes will be written.\n' : '\n[LIVE RUN] Changes will be written to DB.\n');

  const conn = await mysql.createConnection(DB);

  // 1. Read all drafts
  const [drafts] = await conn.execute('SELECT * FROM research_paper_drafts');
  console.log(`Found ${drafts.length} draft(s) to migrate.\n`);

  // 2. Read all authors and sections
  const [allAuthors] = await conn.execute('SELECT * FROM research_paper_authors');
  const [allSections] = await conn.execute('SELECT * FROM research_paper_sections ORDER BY section_order ASC');

  let migrated = 0;
  let skipped = 0;

  for (const draft of drafts) {
    console.log(`\n--- Draft: "${draft.title?.slice(0, 60)}..."`);
    console.log(`    ID: ${draft.id}`);
    console.log(`    Status: ${draft.status}`);

    // Check if paper already exists by source_file_path
    let existingPaper = null;
    if (draft.source_file_path) {
      const [rows] = await conn.execute(
        'SELECT id, title FROM papers WHERE source_file_path = ?',
        [draft.source_file_path]
      );
      if (rows.length > 0) existingPaper = rows[0];
    }

    // Also check by source_file_name as fallback
    if (!existingPaper && draft.source_file_name) {
      const [rows] = await conn.execute(
        'SELECT id, title FROM papers WHERE source_file_name = ?',
        [draft.source_file_name]
      );
      if (rows.length > 0) existingPaper = rows[0];
    }

    if (existingPaper) {
      console.log(`    SKIP — paper already exists: ${existingPaper.id}`);
      skipped++;
      continue;
    }

    // Parse keywords JSON → comma string
    let keywordsString = '';
    try {
      const kw = JSON.parse(draft.keywords || '[]');
      keywordsString = Array.isArray(kw) ? kw.join(', ') : (draft.keywords || '');
    } catch {
      keywordsString = draft.keywords || '';
    }

    const paperId = randomUUID();
    const paperStatus = mapStatus(draft.status);

    console.log(`    ACTION: Create paper ID ${paperId} — status: ${paperStatus}`);

    if (!DRY_RUN) {
      // Insert paper
      await conn.execute(
        `INSERT INTO papers
          (id, title, abstract, keywords, file_path, status, submitted_at, published_at,
           submitter_id, issue_id, doi, source_file_path, source_file_name, source_file_size,
           body_column_mode, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          paperId,
          draft.title || '',
          draft.abstract || '',
          keywordsString,
          draft.pdf_path || '',
          paperStatus,
          draft.published_at || null,
          draft.created_by,
          draft.issue_id || null,
          draft.doi || null,
          draft.source_file_path || null,
          draft.source_file_name || null,
          draft.source_file_size || null,
          draft.body_column_mode || 'two-column',
        ]
      );
      console.log(`    Paper inserted ✅`);
    }

    // Insert sections
    const draftSections = allSections.filter((s) => s.draft_id === draft.id);
    console.log(`    Sections: ${draftSections.length}`);

    for (const section of draftSections) {
      const sectionId = randomUUID();
      console.log(`      Section: "${section.heading?.slice(0, 50)}" order=${section.section_order}`);
      if (!DRY_RUN) {
        await conn.execute(
          `INSERT INTO paper_sections (id, paper_id, heading, content, section_order, is_full_width)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            sectionId,
            paperId,
            section.heading || '',
            section.content || '',
            section.section_order || 0,
            section.is_full_width ?? 1,
          ]
        );
      }
    }
    if (!DRY_RUN && draftSections.length > 0) console.log(`    Sections inserted ✅`);

    // Insert authors
    const draftAuthors = allAuthors.filter((a) => a.draft_id === draft.id);
    console.log(`    Authors: ${draftAuthors.length}`);

    for (let i = 0; i < draftAuthors.length; i++) {
      const a = draftAuthors[i];
      console.log(`      Author: "${a.name}" email=${a.email || 'null'}`);

      if (!DRY_RUN) {
        // Find or create user by email
        let userId = null;

        if (a.email?.trim()) {
          const email = a.email.trim().toLowerCase();
          const [existing] = await conn.execute('SELECT id FROM users WHERE email = ?', [email]);
          if (existing.length > 0) {
            userId = existing[0].id;
            console.log(`        User found: ${userId}`);
          } else {
            userId = randomUUID();
            const nameParts = (a.name || '').trim().split(' ');
            await conn.execute(
              `INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_verified, created_at, updated_at)
               VALUES (?, ?, ?, ?, '', 'AUTHOR', 0, NOW(), NOW())`,
              [
                userId,
                nameParts[0] || a.name,
                nameParts.slice(1).join(' ') || 'Author',
                email,
              ]
            );
            console.log(`        User created: ${userId}`);
          }
        } else {
          // No email — create user without email
          userId = randomUUID();
          const nameParts = (a.name || '').trim().split(' ');
          await conn.execute(
            `INSERT INTO users (id, first_name, last_name, password_hash, role, is_verified, created_at, updated_at)
             VALUES (?, ?, ?, '', 'AUTHOR', 0, NOW(), NOW())`,
            [
              userId,
              nameParts[0] || a.name,
              nameParts.slice(1).join(' ') || 'Author',
            ]
          );
          console.log(`        User created (no email): ${userId}`);
        }

        const paId = randomUUID();
        await conn.execute(
          `INSERT INTO paper_authors (id, paper_id, user_id, author_order, is_corresponding)
           VALUES (?, ?, ?, ?, ?)`,
          [paId, paperId, userId, a.author_order ?? i, a.is_corresponding ? 1 : 0]
        );
      }
    }
    if (!DRY_RUN && draftAuthors.length > 0) console.log(`    Authors inserted ✅`);

    migrated++;
  }

  await conn.end();

  console.log('\n=============================');
  console.log(`Total drafts:  ${drafts.length}`);
  console.log(`Migrated:      ${migrated}`);
  console.log(`Skipped:       ${skipped} (already existed in papers table)`);
  console.log(DRY_RUN ? '\n[DRY run complete — no changes made]' : '\n[Migration complete ✅]');
}

run().catch((err) => {
  console.error('\nMigration FAILED:', err);
  process.exit(1);
});
