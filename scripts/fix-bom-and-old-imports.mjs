import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/app/api/**/*.ts', { cwd: 'e:/wjiis.com' });
let fixed = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');
  let changed = false;

  // Remove BOM character
  if (content.includes('﻿')) {
    content = content.replace(/﻿/g, '');
    changed = true;
  }

  // Replace next-auth/next with next-auth
  if (content.includes("from 'next-auth/next'")) {
    content = content.replace(/from 'next-auth\/next'/g, "from 'next-auth'");
    changed = true;
  }

  // Remove duplicate getServerSession — keep only one
  const lines = content.split('\n');
  let gsFound = false;
  const deduped = lines.filter(line => {
    if (line.trim() === "import { getServerSession } from 'next-auth';") {
      if (gsFound) return false;
      gsFound = true;
    }
    return true;
  });
  if (deduped.length !== lines.length) {
    content = deduped.join('\n');
    changed = true;
  }

  if (changed) {
    writeFileSync(path, content, 'utf8');
    fixed++;
  }
}

console.log(`BOM + old imports fixed in ${fixed} files.`);
