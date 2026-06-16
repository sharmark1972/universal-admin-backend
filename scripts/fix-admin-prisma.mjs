import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Only admin API routes need super-admin aware prisma
const files = await glob('src/app/api/admin/**/*.ts', { cwd: 'e:/wjiis.com' });
let fixed = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');

  // Replace getPrismaForRequest import with getPrismaForAdminRequest
  if (content.includes('getPrismaForRequest')) {
    content = content.replace(
      /import \{ getPrismaForRequest \} from '@\/lib\/site-context';/g,
      `import { getPrismaForAdminRequest } from '@/lib/site-context';`
    );
    content = content.replace(
      /const prisma = getPrismaForRequest\(request\);/g,
      `const prisma = getPrismaForAdminRequest(request);`
    );
    writeFileSync(path, content, 'utf8');
    fixed++;
  }
}

console.log(`Admin routes updated: ${fixed} files.`);
