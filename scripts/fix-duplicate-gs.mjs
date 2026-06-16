import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/app/api/**/*.ts', { cwd: 'e:/wjiis.com' });
let fixed = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');

  // Count occurrences
  const matches = content.match(/import \{ getServerSession \} from 'next-auth';/g);
  if (!matches || matches.length <= 1) continue;

  // Remove ALL occurrences
  content = content.replace(/import \{ getServerSession \} from 'next-auth';\n/g, '');
  // Add ONE at the very top (after 'use client' if present, else at top)
  if (content.startsWith("'use client'")) {
    content = content.replace("'use client';\n", `'use client';\nimport { getServerSession } from 'next-auth';\n`);
  } else {
    content = `import { getServerSession } from 'next-auth';\n` + content;
  }

  writeFileSync(path, content, 'utf8');
  fixed++;
}

console.log(`Duplicate getServerSession fixed in ${fixed} files.`);
