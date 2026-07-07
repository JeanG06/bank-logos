const { writeCatalog } = require('../lib/catalog');

const catalog = writeCatalog();
console.log(`Catalog generated: ${catalog.logos.length} entry(ies) → metadata/logos.json`);
