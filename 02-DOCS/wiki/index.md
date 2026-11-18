# Knowledge map

Índice de la wiki del proyecto. Añadir filas, nunca borrar.

## sdd/specs

| Spec | Estado | Qué cubre |
|------|--------|-----------|
| [importador-inventario](sdd/specs/importador-inventario.md) | clarified | Importador de inventario de vehículos desde archivo (mapeo de cabeceras, resolución contra catálogo marca/unidad de negocio, revisión previa a guardar). |

## sdd/plans

| Plan | Estado | Qué cubre |
|------|--------|-----------|
| [importador-inventario](sdd/plans/importador-inventario.md) | tasks listas |

## sdd/analysis

| Análisis | Veredicto | Qué cubre |
|------|--------|-----------|
| [importador-inventario](sdd/analysis/importador-inventario.md) | GATE: PASS | Cruce spec/plan/tasks; 1 HIGH (campo `km`) y 2 MEDIUM corregidos tras el primer corrido. | Dos endpoints (analizar / confirmar) + pantalla de revisión; sin estado de servidor entre pasos; sin migración de datos. |
