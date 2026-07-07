const fs = require('fs');
const path = require('path');
const config = require('./config');

function scanSourceFiles() {
  const results = [];

  function walk(dir, category) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, entry.name);
      } else if (entry.isFile() && entry.name.endsWith('.svg')) {
        const relPath = path.relative(config.paths.source, fullPath);
        results.push({
          filePath: fullPath,
          relativePath: relPath,
          category: category || 'unknown',
          fileName: entry.name,
        });
      }
    }
  }

  walk(config.paths.source, null);
  return results;
}

module.exports = { scanSourceFiles };
