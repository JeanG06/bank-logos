const fs = require('fs');
const path = require('path');
const config = require('../lib/config');
const { normalizeFile } = require('../lib/normalize');
const { optimize } = require('../lib/optimize');
const { validateAll } = require('../lib/validate');
const { writeCatalog, extractId } = require('../lib/catalog');
const { generateAllPreviews } = require('../lib/preview');
const { scanSourceFiles } = require('../lib/file-utils');

async function runBuild() {
  console.log('═══════════════════════════════');
  console.log('  financial-logos — Build');
  console.log('═══════════════════════════════\n');

  const sourceFiles = scanSourceFiles();

  if (sourceFiles.length === 0) {
    console.log('  No source files found. Nothing to build.\n');
    return;
  }

  // Step 1: Normalize
  console.log('▶ Step 1/5: Normalize');
  fs.mkdirSync(config.paths.logos, { recursive: true });
  for (const sf of sourceFiles) {
    const id = extractId(sf.fileName);
    const normalized = normalizeFile(sf.filePath);
    fs.writeFileSync(path.join(config.paths.logos, `${id}.svg`), normalized, 'utf-8');
    console.log(`  ✓ ${sf.relativePath}`);
  }

  // Step 2: Optimize
  console.log('\n▶ Step 2/5: Optimize');
  const logoFiles = fs.readdirSync(config.paths.logos).filter(f => f.endsWith('.svg'));
  for (const file of logoFiles) {
    const filePath = path.join(config.paths.logos, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const optimized = await optimize(content);
    fs.writeFileSync(filePath, optimized, 'utf-8');
    console.log(`  ✓ ${file}`);
  }

  // Step 3: Validate
  console.log('\n▶ Step 3/5: Validate');
  const results = validateAll();
  let hasErrors = false;
  for (const result of results) {
    if (result.valid) {
      console.log(`  ✓ ${result.file}`);
    } else {
      hasErrors = true;
      console.log(`  ✗ ${result.file}`);
      result.errors.forEach(e => console.log(`      ${e}`));
    }
  }

  if (hasErrors) {
    console.log('\n⚠ Validation errors found. Aborting.');
    process.exit(1);
  }

  // Step 4: Catalog
  console.log('\n▶ Step 4/5: Catalog');
  const catalog = writeCatalog();
  console.log(`  ${catalog.length} entries → metadata/logos.json`);

  // Step 5: Previews
  console.log('\n▶ Step 5/5: Previews');
  await generateAllPreviews();
  console.log(`  ${logoFiles.length} preview(s) → preview/`);

  console.log('\n═══════════════════════════════');
  console.log('  Build complete ✓');
  console.log('═══════════════════════════════');
}

runBuild().catch(err => {
  console.error('Build failed:', err.message);
  process.exit(1);
});
