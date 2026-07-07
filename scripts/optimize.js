const fs = require('fs');
const path = require('path');
const config = require('../lib/config');
const { optimize } = require('../lib/optimize');

async function main() {
  const files = fs.readdirSync(config.paths.logos).filter(f => f.endsWith('.svg'));

  if (files.length === 0) {
    console.log('No SVG files found in logos/');
    return;
  }

  let count = 0;
  for (const file of files) {
    const filePath = path.join(config.paths.logos, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const optimized = await optimize(content);
    fs.writeFileSync(filePath, optimized, 'utf-8');
    count++;
    console.log(`✓ Optimized: ${file}`);
  }

  console.log(`\nDone. ${count} file(s) optimized.`);
}

main().catch(err => {
  console.error('Optimization failed:', err.message);
  process.exit(1);
});
