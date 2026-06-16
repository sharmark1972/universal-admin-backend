import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('src/app/api/**/*.ts', { cwd: 'e:/wjiis.com' });
let fixed = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');

  // Fix indentation of the 3-line session block
  const bad = `const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';\n  const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);\n  const session = await getServerSession(_authOptions)`;
  const good = `const _siteSlug = request.headers.get('x-site-slug') ?? 'wjiis';\n    const _authOptions = getAuthOptions(getPrismaClient(_siteSlug), _siteSlug);\n    const session = await getServerSession(_authOptions)`;

  if (content.includes(bad)) {
    content = content.replace(bad, good);
    writeFileSync(path, content, 'utf8');
    fixed++;
  }
}

console.log(`Indentation fixed in ${fixed} files.`);
