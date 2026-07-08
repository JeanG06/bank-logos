const fs = require('fs');
const svgUtils = require('./svg-utils');

function normalizeFile(input) {
  const content = input.startsWith('<') ? input : fs.readFileSync(input, 'utf-8');
  return svgUtils.normalize(content);
}

module.exports = { normalizeFile };
