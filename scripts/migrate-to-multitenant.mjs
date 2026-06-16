import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/app/api/**/*.ts', { cwd: 'e:/wjiis.com' });

let prismaFixed = 0;
let authFixed = 0;
let skipped = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');
  let changed = false;

  // 1. Replace prisma import
  if (content.includes("from '@/lib/prisma'")) {
    content = content.replace(
      /import\s*\{\s*prisma\s*\}\s*from\s*'@\/lib\/prisma';?/g,
      `import { getPrismaForRequest } from '@/lib/site-context';`
    );
    changed = true;
    prismaFixed++;
  }

  // 2. Replace authOptions import
  if (content.includes("from '@/lib/auth'")) {
    content = content.replace(
      /import\s*\{\s*authOptions\s*\}\s*from\s*'@\/lib\/auth';?/g,
      `import { getAuthOptions } from '@/lib/auth-factory';\nimport { getPrismaClient } from '@/lib/prisma-registry';`
    );
    changed = true;
    authFixed++;
  }

  // 3. Replace getServerSession(authOptions) with site-aware version
  if (content.includes('getServerSession(authOptions)')) {
    content = content.replace(
      /const\s+session\s*=\s*await\s+getServerSession\(authOptions\)/g,
      `const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';\n  const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);\n  const session = await getServerSession(_authOptions)`
    );
    changed = true;
  }

  // 4. Add prisma const after function signature if prisma is used but not yet replaced via import
  if (content.includes('getPrismaForRequest') && !content.includes('const prisma = getPrismaForRequest')) {
    // Insert after first opening of exported function body
    content = content.replace(
      /(export\s+async\s+function\s+(?:GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*\{)/,
      `$1\n  const prisma = getPrismaForRequest(request);`
    );
    changed = true;
  }

  if (changed) {
    writeFileSync(path, content, 'utf8');
  } else {
    skipped++;
  }
}

console.log(`Done.`);
console.log(`  Prisma imports replaced: ${prismaFixed}`);
console.log(`  Auth imports replaced:   ${authFixed}`);
console.log(`  Skipped (no match):      ${skipped}`);
