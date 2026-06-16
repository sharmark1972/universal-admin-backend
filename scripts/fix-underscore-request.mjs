import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/app/api/**/*.ts', { cwd: 'e:/wjiis.com' });
let fixed = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');

  // If function uses _request as param but code uses request — rename _request to request
  if (content.includes('_request: NextRequest') && content.includes('getPrismaForRequest(request)') ||
      content.includes('_request: NextRequest') && content.includes('getPrismaForAdminRequest(request)') ||
      content.includes('_request: NextRequest') && content.includes("request.headers.get('x-site-slug')")) {
    content = content.replace(/\b_request\b/g, 'request');
    writeFileSync(path, content, 'utf8');
    fixed++;
  }
}

console.log(`_request renamed to request in ${fixed} files.`);
