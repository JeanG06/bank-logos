const fs = require('fs');
const path = require('path');
const config = require('./config');
const svgUtils = require('./svg-utils');

function validateFile(filePath) {
  const errors = [];
  const warnings = [];
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);

  if (!svgUtils.isValidSvg(content)) {
    errors.push(`${fileName}: Invalid SVG`);
    return { valid: false, errors, warnings, file: fileName, size: stats.size };
  }

  const $ = svgUtils.load(content);
  const $svg = $('svg');

  const vb = $svg.attr('viewBox');
  if (vb !== config.validation.viewBox) {
    errors.push(`${fileName}: viewBox must be "${config.validation.viewBox}", got "${vb}"`);
  }

  if ($svg.attr('width')) {
    errors.push(`${fileName}: width attribute must not be present`);
  }

  if ($svg.attr('height')) {
    errors.push(`${fileName}: height attribute must not be present`);
  }

  if (svgUtils.hasRasterImages($svg)) {
    errors.push(`${fileName}: contains raster images`);
  }

  if ($('metadata').length > 0) {
    warnings.push(`${fileName}: contains metadata element`);
  }

  if (stats.size > config.validation.maxSize) {
    errors.push(`${fileName}: size ${stats.size} bytes exceeds maximum ${config.validation.maxSize} bytes`);
  } else if (stats.size > config.validation.idealSize) {
    warnings.push(`${fileName}: size ${stats.size} bytes exceeds ideal ${config.validation.idealSize} bytes`);
  }

  const ids = [];
  $('[id]').each((_, el) => {
    ids.push($(el).attr('id'));
  });
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) {
      errors.push(`${fileName}: duplicate id "${id}"`);
    }
    seen.add(id);
  }

  return { valid: errors.length === 0, errors, warnings, file: fileName, size: stats.size };
}

function validateAll() {
  const logosDir = config.paths.logos;
  const files = fs.readdirSync(logosDir).filter(f => f.endsWith('.svg'));

  const results = [];
  for (const file of files) {
    const result = validateFile(path.join(logosDir, file));
    results.push(result);
  }
  return results;
}

module.exports = { validateFile, validateAll };
