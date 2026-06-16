import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// All files in pages + components that import from @/components/
const files = await glob('src/**/*.{ts,tsx}', { cwd: 'e:/wjiis.com', ignore: 'src/components/shared/**' });

let fixed = 0;

for (const rel of files) {
  const path = `e:/wjiis.com/${rel}`;
  let content = readFileSync(path, 'utf8');

  // Replace @/components/X with @/components/shared/X
  // But don't double-replace already-correct paths
  const updated = content.replace(
    /from ['"]@\/components\/((?!shared\/|wjiis\/|ijarcm\/)[\w\/.'-]+)['"]/g,
    (match, p1) => `from '@/components/shared/${p1}'`
  );

  if (updated !== content) {
    writeFileSync(path, updated, 'utf8');
    fixed++;
  }
}

console.log(`Component paths fixed in ${fixed} files.`);
