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
| [importador-inventario](sdd/analysis/importador-inventario.md) | GATE: BLOCKED (1 HIGH) | Cruce spec/plan/tasks: campo `km` listado como obligatorio en la spec pero opcional en plan/código real. | Dos endpoints (analizar / confirmar) + pantalla de revisión; sin estado de servidor entre pasos; sin migración de datos. |
