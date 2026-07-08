const path = require('path');

const ROOT = path.resolve(__dirname, '..');

module.exports = {
  paths: {
    root: ROOT,
    source: path.join(ROOT, 'source'),
    logos: path.join(ROOT, 'logos'),
    metadata: path.join(ROOT, 'metadata'),
    preview: path.join(ROOT, 'preview'),
    registry: path.join(ROOT, 'metadata', 'registry.json'),
    catalog: path.join(ROOT, 'metadata', 'logos.json'),
  },

  svgo: {
    multipass: true,
    plugins: [
      'removeXMLProcInst',
      'removeComments',
      'removeMetadata',
      'removeDimensions',
      'sortAttrs',
      'removeUselessStrokeAndFill',
      'cleanupIds',
      'mergeStyles',
      'inlineStyles',
      'removeEmptyAttrs',
      'removeEmptyContainers',
      'convertStyleToAttrs',
      'collapseGroups',
      'convertShapeToPath',
    ],
  },

  validation: {
    maxSize: 12 * 1024,
    idealSize: 8 * 1024,
    viewBox: '0 0 128 128',
    canvasSize: 128,
    padding: 8,
  },

  preview: {
    width: 256,
    height: 256,
  },
};
