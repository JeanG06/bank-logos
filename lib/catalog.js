const fs = require('fs');
const path = require('path');
const config = require('./config');
const { scanSourceFiles } = require('./file-utils');

function toTitleCase(str) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

function metadataFromSource(sourceFile, registry) {
  const base = path.basename(sourceFile.fileName, '.svg');
  const fromRegistry = registry.overrides && registry.overrides[base];

  if (fromRegistry) {
    return {
      name: fromRegistry.name || toTitleCase(base),
      category: fromRegistry.category || sourceFile.category || 'unknown',
      country: fromRegistry.country || 'unknown',
    };
  }

  const parts = base.split('_');
  const country = parts.length >= 2 ? parts[0] : 'unknown';
  const name = parts.length >= 2 ? parts.slice(1).join(' ') : base;

  return {
    name: toTitleCase(name),
    category: sourceFile.category || 'unknown',
    country,
  };
}

function buildIdMap(sourceFiles, registry) {
  const idMap = {};

  for (const sf of sourceFiles) {
    const base = path.basename(sf.fileName, '.svg');
    const fromRegistry = registry.overrides && registry.overrides[base];

    if (fromRegistry && fromRegistry.id) {
      idMap[sf.filePath] = fromRegistry.id;
      continue;
    }

    const parts = base.split('_');
    const rawId = parts.length >= 2 ? parts.slice(1).join('-') : base;
    idMap[sf.filePath] = rawId;
  }

  const idCounts = {};
  for (const sf of sourceFiles) {
    const id = idMap[sf.filePath];
    idCounts[id] = (idCounts[id] || 0) + 1;
  }

  const collisions = new Set(
    Object.entries(idCounts).filter(([, c]) => c > 1).map(([id]) => id)
  );

  for (const sf of sourceFiles) {
    const id = idMap[sf.filePath];
    if (collisions.has(id)) {
      idMap[sf.filePath] = `${sf.category}-${id}`;
    }
  }

  return idMap;
}

function loadRegistry() {
  try {
    return JSON.parse(fs.readFileSync(config.paths.registry, 'utf-8'));
  } catch {
    return { overrides: {} };
  }
}

function extractId(fileName) {
  const base = path.basename(fileName, '.svg');
  const registry = loadRegistry();
  const fromRegistry = registry.overrides && registry.overrides[base];

  if (fromRegistry && fromRegistry.id) return fromRegistry.id;

  const parts = base.split('_');
  return parts.length >= 2 ? parts.slice(1).join('-') : base;
}

function generateCatalog() {
  const registry = loadRegistry();
  const sourceFiles = scanSourceFiles();
  const idMap = buildIdMap(sourceFiles, registry);

  const logoFiles = fs.readdirSync(config.paths.logos).filter(f => f.endsWith('.svg'));

  const entries = logoFiles.map(file => {
    const id = path.basename(file, '.svg');

    const sourceFile = sourceFiles.find(sf => idMap[sf.filePath] === id);
    const { name, category, country } = sourceFile
      ? metadataFromSource(sourceFile, registry)
      : { name: toTitleCase(id), category: 'unknown', country: 'unknown' };

    return { id, name, category, country, path: `logos/${file}` };
  });

  entries.sort((a, b) => a.id.localeCompare(b.id));

  return {
    version: Date.now(),
    logos: entries,
  };
}

function writeCatalog() {
  const catalog = generateCatalog();
  fs.mkdirSync(config.paths.metadata, { recursive: true });
  fs.writeFileSync(config.paths.catalog, JSON.stringify(catalog, null, 2), 'utf-8');
  return catalog;
}

module.exports = { generateCatalog, writeCatalog, extractId };
