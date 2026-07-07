const fs = require('fs');
const path = require('path');
const config = require('../lib/config');
const { normalizeFile } = require('../lib/normalize');
const { extractId } = require('../lib/catalog');
const { scanSourceFiles } = require('../lib/file-utils');

const sourceFiles = scanSourceFiles();

if (sourceFiles.length === 0) {
  console.log('No SVG files found in source/');
  process.exit(0);
}

fs.mkdirSync(config.paths.logos, { recursive: true });

let count = 0;
for (const sf of sourceFiles) {
  const id = extractId(sf.fileName);
  const normalized = normalizeFile(sf.filePath);
  const outputPath = path.join(config.paths.logos, `${id}.svg`);
  fs.writeFileSync(outputPath, normalized, 'utf-8');
  count++;
  console.log(`✓ Normalized: ${sf.relativePath} → logos/${id}.svg`);
}

console.log(`\nDone. ${count} file(s) normalized.`);
