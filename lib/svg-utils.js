const cheerio = require('cheerio');
const config = require('./config');

function load(svgContent) {
  return cheerio.load(svgContent, { xmlMode: true });
}

function extractViewBox($svg) {
  const vb = $svg.attr('viewBox');
  if (vb) {
    const parts = vb.trim().split(/\s+/).map(Number);
    if (parts.length === 4 && parts.every(n => !isNaN(n))) {
      return parts;
    }
  }
  const w = parseFloat($svg.attr('width')) || config.validation.canvasSize;
  const h = parseFloat($svg.attr('height')) || config.validation.canvasSize;
  return [0, 0, w, h];
}

function normalize(svgContent) {
  const $ = load(svgContent);
  const $svg = $('svg');

  const [vbX, vbY, vbW, vbH] = extractViewBox($svg);
  const { canvasSize, padding } = config.validation;
  const contentSize = canvasSize - 2 * padding;

  const innerContent = $svg.html();

  const hasXlink = innerContent.includes('xlink:');
  const ns = hasXlink ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : '';

  const aspectRatio = vbW / vbH;
  let scale, tx, ty;

  if (aspectRatio >= 1) {
    scale = contentSize / vbW;
    const scaledH = vbH * scale;
    tx = padding;
    ty = (canvasSize - scaledH) / 2;
  } else {
    scale = contentSize / vbH;
    const scaledW = vbW * scale;
    tx = (canvasSize - scaledW) / 2;
    ty = padding;
  }

  tx -= vbX * scale;
  ty -= vbY * scale;

  const $result = load(`<svg xmlns="http://www.w3.org/2000/svg"${ns} viewBox="0 0 ${canvasSize} ${canvasSize}"></svg>`);
  const $resultSvg = $result('svg');
  const $g = $result('<g>');
  $g.attr('transform', `translate(${tx}, ${ty}) scale(${scale})`);
  $g.html(innerContent);
  $resultSvg.append($g);

  return $result.xml();
}

function isValidSvg(svgContent) {
  try {
    const $ = load(svgContent);
    return $('svg').length > 0;
  } catch {
    return false;
  }
}

function hasRasterImages($svg) {
  const hasImageTag = $svg.find('image').length > 0;
  const hasDataUri = $svg.html().includes('data:image/');
  return hasImageTag || hasDataUri;
}

module.exports = {
  load,
  extractViewBox,
  normalize,
  isValidSvg,
  hasRasterImages,
};
