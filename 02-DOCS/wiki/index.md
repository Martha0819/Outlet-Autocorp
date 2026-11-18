# Knowledge map

Índice de la wiki del proyecto. Añadir filas, nunca borrar.

## sdd/specs

| Spec | Estado | Qué cubre |
|------|--------|-----------|
| [importador-inventario](sdd/specs/importador-inventario.md) | clarified | Importador de inventario de vehículos desde archivo (mapeo de cabeceras, resolución contra catálogo marca/unidad de negocio, revisión previa a guardar). |

## sdd/plans

| Plan | Estado | Qué cubre |
|------|--------|-----------|
| [importador-inventario](sdd/plans/importador-inventario.md) | implementado (T001–T016) |

## sdd/progress

| Progreso | Qué cubre |
|------|-----------|
| [importador-inventario](sdd/progress/importador-inventario.md) | Bitácora append-only de las 16 tareas implementadas (red/green, hallazgos, decisiones). |

## sdd/analysis

| Análisis | Veredicto | Qué cubre |
|------|--------|-----------|
| [importador-inventario](sdd/analysis/importador-inventario.md) | GATE: PASS | Cruce spec/plan/tasks; 1 HIGH (campo `km`) y 2 MEDIUM corregidos tras el primer corrido. | Dos endpoints (analizar / confirmar) + pantalla de revisión; sin estado de servidor entre pasos; sin migración de datos. |
