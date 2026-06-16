import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Only admin pages/components — not API routes
const files = await glob('src/app/admin/**/*.{ts,tsx}', { cwd: 'e:/wjiis.com' });
let fixed = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');

  // Only process files that call fetch('/api/admin/...')
  if (!content.includes("fetch('/api/admin/") && !content.includes('fetch(`/api/admin/')) continue;

  // Add adminFetch import if not already present
  if (!content.includes("from '@/lib/admin-fetch'")) {
    content = content.replace(
      /^('use client';\n?)/m,
      `$1import { adminFetch } from '@/lib/admin-fetch';\n`
    );
  }

  // Replace fetch('/api/admin/...) with adminFetch(
  content = content.replace(/\bfetch\((['"`]\/api\/admin\/)/g, 'adminFetch($1');
  content = content.replace(/\bfetch\((`\/api\/admin\/)/g, 'adminFetch($1');

  writeFileSync(path, content, 'utf8');
  fixed++;
}

console.log(`Admin pages updated: ${fixed} files.`);
