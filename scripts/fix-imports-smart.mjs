import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/app/api/**/*.ts', { cwd: 'e:/wjiis.com' });
let fixed = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');
  let changed = false;

  // Fix duplicate getServerSession imports
  const gsMatches = [...content.matchAll(/import \{ getServerSession \} from 'next-auth';/g)];
  if (gsMatches.length > 1) {
    // Remove all, keep one at top
    content = content.replace(/import \{ getServerSession \} from 'next-auth';\n/g, '');
    content = `import { getServerSession } from 'next-auth';\n` + content;
    changed = true;
  }

  // Fix duplicate getPrismaClient imports
  const pcMatches = [...content.matchAll(/import \{ getPrismaClient \} from '@\/lib\/prisma-registry';/g)];
  if (pcMatches.length > 1) {
    content = content.replace(/import \{ getPrismaClient \} from '@\/lib\/prisma-registry';\n/g, '');
    content = `import { getPrismaClient } from '@/lib/prisma-registry';\n` + content;
    changed = true;
  }

  // Fix duplicate getAuthOptions imports
  const gaMatches = [...content.matchAll(/import \{ getAuthOptions \} from '@\/lib\/auth-factory';/g)];
  if (gaMatches.length > 1) {
    content = content.replace(/import \{ getAuthOptions \} from '@\/lib\/auth-factory';\n/g, '');
    content = `import { getAuthOptions } from '@/lib/auth-factory';\n` + content;
    changed = true;
  }

  // Add NextRequest to existing next/server import if missing
  if (content.includes('NextRequest') && content.includes("from 'next/server'")) {
    content = content.replace(
      /import \{ ((?!NextRequest)[^}]+) \} from 'next\/server';/g,
      (match, imports) => {
        if (!imports.includes('NextRequest')) {
          return `import { NextRequest, ${imports} } from 'next/server';`;
        }
        return match;
      }
    );
    changed = true;
  }

  if (changed) {
    writeFileSync(path, content, 'utf8');
    fixed++;
  }
}

console.log(`Smart import fix applied to ${fixed} files.`);
