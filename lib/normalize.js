const fs = require('fs');
const svgUtils = require('./svg-utils');

function normalizeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return svgUtils.normalize(content);
}

module.exports = { normalizeFile };
