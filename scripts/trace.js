const fs = require('fs');
const path = require('path');
const config = require('../lib/config');
const { optimize } = require('../lib/optimize');
const { cropContent, normalize, hasRasterImages, load } = require('../lib/svg-utils');
const { vectorizeSync, ColorMode, Hierarchical, PathSimplifyMode } = require('@neplex/vectorizer');

const TRACE_CONFIG = {
  colorMode: ColorMode.Color,
  hierarchical: Hierarchical.Cutout,
  filterSpeckle: 12,
  colorPrecision: 4,
  layerDifference: 32,
  mode: PathSimplifyMode.Spline,
  cornerThreshold: 65,
  lengthThreshold: 5,
  maxIterations: 2,
  spliceThreshold: 50,
  pathPrecision: 2,
  keyingThreshold: 0.1,
};

function extractRasterBuffer(content) {
  const match = content.match(/base64,([A-Za-z0-9+/=]+)"/);
  if (match) return Buffer.from(match[1], 'base64');
  return null;
}

async function traceOne(filePath) {
  const fileName = path.basename(filePath, '.svg');
  const content = fs.readFileSync(filePath, 'utf-8');

  const rasterBuf = extractRasterBuffer(content);
  if (!rasterBuf) {
    const $ = load(content);
    if (!hasRasterImages($('svg'))) {
      console.log(`  ○ ${fileName}: already vector — skipping`);
      return;
    }
    throw new Error(`${fileName}: has raster but no extractable base64`);
  }

  const traced = vectorizeSync(rasterBuf, TRACE_CONFIG);

  const $t = load(traced);
  if (hasRasterImages($t('svg'))) {
    throw new Error(`${fileName}: still contains raster after trace`);
  }

  const cropped = cropContent(traced);
  const optimized = await optimize(cropped);
  const normalized = normalize(optimized);

  fs.writeFileSync(filePath, normalized, 'utf-8');
  console.log(`  ✓ ${fileName}: ${Buffer.byteLength(normalized)} bytes`);
}

async function main() {
  const target = process.argv[2];
  let files;

  if (target === 'logos') {
    files = fs.readdirSync(config.paths.logos)
      .filter(f => f.endsWith('.svg'))
      .map(f => path.join(config.paths.logos, f));
  } else {
    files = [path.resolve(target)];
  }

  console.log('Tracing raster SVGs → vector…\n');
  for (const f of files) {
    await traceOne(f);
  }
  console.log('\nDone.');
}

main().catch(err => {
  console.error('Trace failed:', err.message);
  process.exit(1);
});