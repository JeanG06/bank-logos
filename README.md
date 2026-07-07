# financial-logos

Biblioteca estandarizada de logos financieros en SVG.

Pipeline automatizado de generación de assets. El desarrollador solo copia SVGs oficiales a `source/{categoria}/` y ejecuta `npm run import`.

## Flujo de trabajo

```bash
# 1. Copiar SVG oficial a la carpeta de categoria correspondiente
cp ~/Descargas/santander.svg source/banks/es_santander.svg

# 2. Importar (normaliza, optimiza, valida, cataloga, genera preview)
npm run import

# O regenerar todo el pipeline
npm run build
```

## Organización

```
source/
├── banks/      ← Logos de bancos
├── wallets/    ← Billeteras digitales / crypto
├── cards/      ← Tarjetas de credito / debito
└── brands/     ← Marcas corporativas / holdings
```

## Convención de nombres

```
{country}_{name}.svg
```

| Archivo | country | name | id | Categoría (directorio) |
|---|---|---|---|---|
| `source/banks/es_santander.svg` | es | Santander | santander | bank |
| `source/banks/mx_bbva.svg` | mx | BBVA | bbva | bank |
| `source/cards/global_visa.svg` | global | Visa | visa | card |

> Si el mismo `name` aparece en dos categorías distintas, se usa `{category}-{name}` como id para evitar colisiones.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run normalize` | Normaliza SVGs: viewBox 128×128, centrado, padding |
| `npm run optimize` | Optimiza con SVGO |
| `npm run validate` | Valida estructura, peso, duplicados |
| `npm run catalog` | Genera `metadata/logos.json` |
| `npm run preview` | Genera PNGs en `preview/` |
| `npm run import` | Procesa solo SVGs nuevos en `source/` |
| `npm run build` | Pipeline completo |

## Estructura del proyecto

```
financial-logos/
├── source/       ← SVG originales organizados por categoria
│   ├── banks/
│   ├── wallets/
│   ├── cards/
│   └── brands/
├── logos/        ← SVG produccion (auto-generados, plano)
├── metadata/     ← logos.json (auto-generado)
├── scripts/      ← CLI entry points
├── lib/          ← Logica reutilizable
├── preview/      ← PNGs para revision visual
├── package.json
└── README.md
```

## Estandar SVG

- Canvas 128×128, viewBox `0 0 128 128`
- Proporcion original, centrado, padding uniforme
- Sin width/height, sin comentarios, sin metadatos
- Colores corporativos preservados
- Peso ideal ≤ 8 KB, maximo ≤ 12 KB
