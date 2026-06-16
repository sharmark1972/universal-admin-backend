import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/app/api/**/*.ts', { cwd: 'e:/wjiis.com' });
let fixed = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');

  if (!content.includes('getPrismaForRequest')) continue;

  // Find all exported HTTP handler functions that don't already have prisma injected
  // Pattern: export async function GET/POST/PUT/DELETE/PATCH(request...) {
  // followed by a line that does NOT start with "  const prisma"
  const funcPattern = /(export\s+async\s+function\s+(?:GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*\{)(\s*(?!const prisma))/g;

  let updated = content.replace(funcPattern, (match, funcSig, whitespace) => {
    // Only inject if prisma is used in the function and not already injected right after
    return `${funcSig}\n  const prisma = getPrismaForRequest(request);${whitespace}`;
  });

  // Remove duplicate injections (in case first function already had it)
  updated = updated.replace(
    /(const prisma = getPrismaForRequest\(request\);\s*)+const prisma = getPrismaForRequest\(request\);/g,
    'const prisma = getPrismaForRequest(request);'
  );

  if (updated !== content) {
    writeFileSync(path, updated, 'utf8');
    fixed++;
  }
}

console.log(`Fixed prisma injection in ${fixed} files.`);
