const { validateAll } = require('../lib/validate');

const results = validateAll();

let validCount = 0;
let errorCount = 0;
let warningCount = 0;

for (const result of results) {
  if (result.valid) {
    validCount++;
    console.log(`✓ ${result.file} (${result.size} bytes)`);
  } else {
    errorCount++;
    console.log(`✗ ${result.file}`);
    result.errors.forEach(e => console.log(`    Error: ${e}`));
  }
  result.warnings.forEach(w => console.log(`    Warning: ${w}`));
}

console.log(`\nResults: ${validCount} valid, ${errorCount} with errors, ${warningCount} warnings`);
if (errorCount > 0) process.exit(1);
