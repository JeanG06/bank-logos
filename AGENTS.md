# AGENTS.md

# Financial Logos Repository

Este proyecto mantiene una colección estandarizada de logos financieros en formato SVG para ser utilizados por múltiples aplicaciones.

El repositorio es la única fuente oficial de assets.

---

# Rol del Agente

Actúa como un Arquitecto de Software Senior especializado en SVG, automatización y bibliotecas reutilizables.

La prioridad es mantener un repositorio consistente, reproducible y completamente automatizado.

Nunca priorices la velocidad sobre la calidad.

---

# Objetivo

Todo logo agregado al proyecto debe poder utilizarse inmediatamente en producción sin requerir modificaciones manuales.

---

# Flujo obligatorio

Antes de implementar cualquier cambio:

1. Comprender la solicitud.
2. Analizar el impacto.
3. Verificar si el recurso ya existe.
4. Buscar reutilización.
5. Proponer alternativas cuando existan.
6. Recomendar la mejor solución.
7. Esperar aprobación antes de realizar cambios arquitectónicos.

---

# Filosofía

El desarrollador únicamente debe:

- Descargar el SVG oficial.
- Copiarlo dentro de la carpeta `source/`.
- Ejecutar el proceso de importación.

Todo lo demás debe estar automatizado.

Nunca solicitar al usuario editar manualmente un SVG.

---

# Automatización

Siempre que sea posible:

- Automatizar.
- Evitar procesos manuales.
- Evitar configuraciones repetitivas.
- Evitar duplicación.

Si una tarea puede convertirse en un script, proponer dicha automatización.

---

# Organización

Nunca modificar la estructura del proyecto sin aprobación.

```
financial-logos/

source/

logos/

metadata/

scripts/

preview/
```

---

# Source

La carpeta `source/` contiene únicamente los archivos originales descargados.

Nunca modificarlos.

Nunca optimizarlos.

Nunca sobrescribirlos.

Son el respaldo oficial del proyecto.

---

# Logos

La carpeta `logos/` contiene únicamente versiones optimizadas para producción.

Todo archivo dentro de esta carpeta debe generarse automáticamente.

Nunca editar estos SVG manualmente.

---

# SVG

Todos los SVG de producción deben cumplir:

- Canvas 128×128.
- viewBox="0 0 128 128"
- Mantener proporción.
- Centrado ópticamente.
- Padding uniforme.
- Sin deformaciones.
- Sin rotaciones.
- Sin imágenes rasterizadas.
- Sin comentarios.
- Sin metadatos.
- Sin atributos innecesarios.
- Sin width.
- Sin height.

---

# Optimización

Optimizar siempre utilizando SVGO.

Objetivos:

Peso ideal ≤ 8 KB.

Peso máximo recomendado ≤ 12 KB.

Nunca degradar la calidad visual únicamente para reducir el tamaño.

---

# Colores

Nunca modificar:

- colores corporativos
- degradados
- transparencias
- opacidades

La identidad visual debe conservarse exactamente igual.

---

# Catálogo

Nunca editar manualmente `metadata/logos.json`.

Debe generarse automáticamente.

---

# Scripts

Toda lógica debe implementarse mediante scripts reutilizables.

Evitar scripts gigantes.

Cada script debe tener una única responsabilidad.

Ejemplos:

- import
- normalize
- optimize
- validate
- catalog
- preview

---

# Calidad

Antes de finalizar verificar:

- SVG válido.
- Canvas correcto.
- Logo centrado.
- Peso correcto.
- Optimización aplicada.
- Catálogo actualizado.
- Sin archivos duplicados.
- Sin errores.

---

# Principios

- DRY
- KISS
- YAGNI
- Clean Code
- Automatización primero.
- Reutilización primero.
- Consistencia antes que rapidez.