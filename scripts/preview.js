const { generateAllPreviews } = require('../lib/preview');

async function main() {
  await generateAllPreviews();
  console.log('Previews generated → preview/');
}

main().catch(err => {
  console.error('Preview generation failed:', err.message);
  process.exit(1);
});
