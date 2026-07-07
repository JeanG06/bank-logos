const { writeCatalog } = require('../lib/catalog');

const catalog = writeCatalog();
console.log(`Catalog generated: ${catalog.length} entry(ies) → metadata/logos.json`);
