import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/app/api/**/*.ts', { cwd: 'e:/wjiis.com' });
let fixed = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');

  // Fix: export async function GET() { → export async function GET(request: NextRequest) {
  const updated = content.replace(
    /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*\)\s*\{/g,
    'export async function $1(request: NextRequest) {'
  );

  if (updated !== content) {
    writeFileSync(path, updated, 'utf8');
    fixed++;
  }
}

console.log(`Request param added in ${fixed} files.`);
