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

function getBoundsFromPath(d) {
  if (!d) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let cx = 0, cy = 0;

  const update = (x, y) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  const tokens = d.match(/[MLHVCSQTAZmlhvcsqtaz]|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g);
  if (!tokens) return null;

  let i = 0;
  let activeCmd = '';

  while (i < tokens.length) {
    const t = tokens[i];

    if (/^[MLHVCSQTAZmlhvcsqtaz]$/.test(t)) {
      activeCmd = t;
      i++;
      continue;
    }

    if (!activeCmd) activeCmd = 'M';
    const isRel = activeCmd === activeCmd.toLowerCase();
    const lc = activeCmd.toLowerCase();
    let step = 0;

    switch (lc) {
      case 'm': {
        const x = isRel ? cx + parseFloat(t) : parseFloat(t);
        const y = isRel ? cy + parseFloat(tokens[i + 1]) : parseFloat(tokens[i + 1]);
        cx = x; cy = y;
        update(x, y);
        step = 2;
        activeCmd = isRel ? 'l' : 'L';
        break;
      }
      case 'l': {
        const x = isRel ? cx + parseFloat(t) : parseFloat(t);
        const y = isRel ? cy + parseFloat(tokens[i + 1]) : parseFloat(tokens[i + 1]);
        cx = x; cy = y;
        update(x, y);
        step = 2;
        break;
      }
      case 'h': {
        const x = isRel ? cx + parseFloat(t) : parseFloat(t);
        cx = x;
        update(x, cy);
        step = 1;
        break;
      }
      case 'v': {
        const y = isRel ? cy + parseFloat(t) : parseFloat(t);
        cy = y;
        update(cx, y);
        step = 1;
        break;
      }
      case 'c': {
        const startX = cx, startY = cy;
        const dx1 = parseFloat(t), dy1 = parseFloat(tokens[i + 1]);
        const dx2 = parseFloat(tokens[i + 2]), dy2 = parseFloat(tokens[i + 3]);
        const dx = parseFloat(tokens[i + 4]), dy = parseFloat(tokens[i + 5]);
        const c1x = isRel ? startX + dx1 : dx1, c1y = isRel ? startY + dy1 : dy1;
        const c2x = isRel ? startX + dx2 : dx2, c2y = isRel ? startY + dy2 : dy2;
        const ex = isRel ? startX + dx : dx, ey = isRel ? startY + dy : dy;
        update(c1x, c1y); update(c2x, c2y); update(ex, ey);
        cx = ex; cy = ey;
        step = 6;
        break;
      }
      case 's': {
        const startX = cx, startY = cy;
        const dx2 = parseFloat(t), dy2 = parseFloat(tokens[i + 1]);
        const dx = parseFloat(tokens[i + 2]), dy = parseFloat(tokens[i + 3]);
        const c2x = isRel ? startX + dx2 : dx2, c2y = isRel ? startY + dy2 : dy2;
        const ex = isRel ? startX + dx : dx, ey = isRel ? startY + dy : dy;
        update(c2x, c2y); update(ex, ey);
        cx = ex; cy = ey;
        step = 4;
        break;
      }
      case 'q': {
        const startX = cx, startY = cy;
        const dx1 = parseFloat(t), dy1 = parseFloat(tokens[i + 1]);
        const dx = parseFloat(tokens[i + 2]), dy = parseFloat(tokens[i + 3]);
        const c1x = isRel ? startX + dx1 : dx1, c1y = isRel ? startY + dy1 : dy1;
        const ex = isRel ? startX + dx : dx, ey = isRel ? startY + dy : dy;
        update(c1x, c1y); update(ex, ey);
        cx = ex; cy = ey;
        step = 4;
        break;
      }
      case 't': {
        const x = isRel ? cx + parseFloat(t) : parseFloat(t);
        const y = isRel ? cy + parseFloat(tokens[i + 1]) : parseFloat(tokens[i + 1]);
        cx = x; cy = y;
        update(x, y);
        step = 2;
        break;
      }
      case 'a': {
        const startX = cx, startY = cy;
        const rx = parseFloat(t), ry = parseFloat(tokens[i + 1]);
        const x = isRel ? startX + parseFloat(tokens[i + 5]) : parseFloat(tokens[i + 5]);
        const y = isRel ? startY + parseFloat(tokens[i + 6]) : parseFloat(tokens[i + 6]);
        update(x, y);
        cx = x; cy = y;
        step = 7;
        break;
      }
      case 'z': {
        step = 0;
        break;
      }
      default: {
        step = 1;
      }
    }

    i += step;
  }

  if (minX === Infinity) return null;
  return { minX, minY, maxX, maxY };
}

function computeContentBounds($svg) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  const update = (x, y) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  const extractNums = (str) => (str.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || []).map(Number);

  // Paths
  $svg.find('path[d]').each((_, el) => {
    const bounds = getBoundsFromPath(el.attribs.d);
    if (bounds) {
      update(bounds.minX, bounds.minY);
      update(bounds.maxX, bounds.maxY);
    }
  });

  // Polygons & polylines
  $svg.find('polygon, polyline').each((_, el) => {
    const pts = el.attribs.points;
    if (pts) {
      const nums = extractNums(pts);
      for (let i = 0; i + 1 < nums.length; i += 2) {
        update(nums[i], nums[i + 1]);
      }
    }
  });

  // Circles
  $svg.find('circle').each((_, el) => {
    const cx = parseFloat(el.attribs.cx);
    const cy = parseFloat(el.attribs.cy);
    const r = parseFloat(el.attribs.r);
    if (!isNaN(cx) && !isNaN(cy) && !isNaN(r)) {
      update(cx - r, cy - r);
      update(cx + r, cy + r);
    }
  });

  // Rects
  $svg.find('rect').each((_, el) => {
    const x = parseFloat(el.attribs.x) || 0;
    const y = parseFloat(el.attribs.y) || 0;
    const w = parseFloat(el.attribs.width);
    const h = parseFloat(el.attribs.height);
    if (!isNaN(w) && !isNaN(h)) {
      update(x, y);
      update(x + w, y + h);
    }
  });

  // Ellipses
  $svg.find('ellipse').each((_, el) => {
    const cx = parseFloat(el.attribs.cx);
    const cy = parseFloat(el.attribs.cy);
    const rx = parseFloat(el.attribs.rx);
    const ry = parseFloat(el.attribs.ry);
    if (!isNaN(cx) && !isNaN(cy) && !isNaN(rx) && !isNaN(ry)) {
      update(cx - rx, cy - ry);
      update(cx + rx, cy + ry);
    }
  });

  // Lines
  $svg.find('line').each((_, el) => {
    const x1 = parseFloat(el.attribs.x1);
    const y1 = parseFloat(el.attribs.y1);
    const x2 = parseFloat(el.attribs.x2);
    const y2 = parseFloat(el.attribs.y2);
    if (!isNaN(x1)) update(x1, y1);
    if (!isNaN(x2)) update(x2, y2);
  });

  if (minX === Infinity) return null;

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function normalize(svgContent) {
  const $ = load(svgContent);
  const $svg = $('svg');

  const [vbX, vbY, vbW, vbH] = extractViewBox($svg);
  const { canvasSize, padding } = config.validation;
  const contentSize = canvasSize - 2 * padding;

  const bounds = computeContentBounds($svg);
  let contentW = vbW;
  let contentH = vbH;
  let originX = vbX;
  let originY = vbY;

  if (bounds) {
    const margin = Math.max(bounds.width, bounds.height) * 0.02;
    contentW = bounds.width + 2 * margin;
    contentH = bounds.height + 2 * margin;
    originX = bounds.minX - margin;
    originY = bounds.minY - margin;
  }

  const innerContent = $svg.html();

  const hasXlink = innerContent.includes('xlink:');
  const ns = hasXlink ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : '';

  const aspectRatio = contentW / contentH;
  let scale, tx, ty;

  if (aspectRatio >= 1) {
    scale = contentSize / contentW;
    const scaledH = contentH * scale;
    tx = padding;
    ty = (canvasSize - scaledH) / 2;
  } else {
    scale = contentSize / contentH;
    const scaledW = contentW * scale;
    tx = (canvasSize - scaledW) / 2;
    ty = padding;
  }

  tx -= originX * scale;
  ty -= originY * scale;

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
