const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('./config');

async function generatePreview(svgContent, outputPath) {
  const { width, height } = config.preview;
  await sharp(Buffer.from(svgContent))
    .resize(width, height)
    .png()
    .toFile(outputPath);
}

async function generateAllPreviews() {
  const logosDir = config.paths.logos;
  const previewDir = config.paths.preview;

  fs.mkdirSync(previewDir, { recursive: true });

  const files = fs.readdirSync(logosDir).filter(f => f.endsWith('.svg'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(logosDir, file), 'utf-8');
    const pngName = path.basename(file, '.svg') + '.png';
    const outputPath = path.join(previewDir, pngName);
    await generatePreview(content, outputPath);
  }
}

module.exports = { generatePreview, generateAllPreviews };
