const { optimize: svgoOptimize } = require('svgo');
const config = require('./config');

async function optimize(svgContent) {
  const result = await svgoOptimize(svgContent, config.svgo);
  return result.data;
}

module.exports = { optimize };
