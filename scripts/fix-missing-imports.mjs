import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/app/api/**/*.ts', { cwd: 'e:/wjiis.com' });
let fixed = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');
  let changed = false;

  // Add NextRequest import if missing but used
  if (content.includes('NextRequest') && !content.includes("from 'next/server'")) {
    content = `import { NextRequest, NextResponse } from 'next/server';\n` + content;
    changed = true;
  }

  // Add getServerSession import if missing
  if (content.includes('getServerSession') && !content.includes("from 'next-auth'")) {
    content = `import { getServerSession } from 'next-auth';\n` + content;
    changed = true;
  }

  // Add getPrismaClient import if missing
  if (content.includes('getPrismaClient') && !content.includes("from '@/lib/prisma-registry'")) {
    content = content.replace(
      /^(import.*from '@\/lib\/site-context';)/m,
      `import { getPrismaClient } from '@/lib/prisma-registry';\n$1`
    );
    changed = true;
  }

  // Add getAuthOptions import if missing
  if (content.includes('getAuthOptions') && !content.includes("from '@/lib/auth-factory'")) {
    content = content.replace(
      /^(import.*from '@\/lib\/site-context';)/m,
      `import { getAuthOptions } from '@/lib/auth-factory';\n$1`
    );
    changed = true;
  }

  if (changed) {
    writeFileSync(path, content, 'utf8');
    fixed++;
  }
}

console.log(`Missing imports fixed in ${fixed} files.`);
