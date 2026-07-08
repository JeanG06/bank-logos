const fs = require('fs');
const path = require('path');
const config = require('../lib/config');
const { normalizeFile } = require('../lib/normalize');
const { optimize } = require('../lib/optimize');
const { cropContent } = require('../lib/svg-utils');
const { validateFile } = require('../lib/validate');
const { writeCatalog, extractId } = require('../lib/catalog');
const { generateAllPreviews } = require('../lib/preview');
const { scanSourceFiles } = require('../lib/file-utils');

async function runImport() {
  fs.mkdirSync(config.paths.logos, { recursive: true });

  const sourceFiles = scanSourceFiles();
  const logoFiles = fs.readdirSync(config.paths.logos).filter(f => f.endsWith('.svg'));
  const existingIds = new Set(logoFiles.map(f => path.basename(f, '.svg')));

  const newFiles = sourceFiles.filter(sf => {
    const id = extractId(sf.fileName);
    return !existingIds.has(id);
  });

  if (newFiles.length === 0) {
    console.log('No new SVG files to import.');
    return;
  }

  console.log(`Found ${newFiles.length} new file(s) to import:\n`);

  const imported = [];
  for (const sf of newFiles) {
    const id = extractId(sf.fileName);
    const outputPath = path.join(config.paths.logos, `${id}.svg`);

    console.log(`  Processing: ${sf.relativePath}`);

    const sourceContent = fs.readFileSync(sf.filePath, 'utf-8');
    const cropped = cropContent(sourceContent);
    const optimized = await optimize(cropped);
    const normalized = normalizeFile(optimized);
    fs.writeFileSync(outputPath, normalized, 'utf-8');
    console.log(`    Optimized → Normalized → logos/${id}.svg`);

    const validation = validateFile(outputPath);
    if (validation.valid) {
      console.log(`    Valid (${validation.size} bytes)`);
    } else {
      validation.errors.forEach(e => console.log(`    Validation error: ${e}`));
    }

    imported.push(id);
  }

  console.log(`\nUpdating catalog...`);
  const catalog = writeCatalog();
  console.log(`Catalog updated: ${catalog.logos.length} entries`);

  console.log(`Generating previews...`);
  await generateAllPreviews();
  console.log(`Previews regenerated`);

  console.log(`\n✓ Import complete. ${imported.length} file(s) imported.`);
}

runImport().catch(err => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
