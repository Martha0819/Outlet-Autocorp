# Decisiones SDD

Registro append-only de decisiones de alcance tomadas durante specify/clarify/plan.

## 2026-11-17 — importador-inventario

- Se escribe la spec `importador-inventario` para un importador de inventario de vehículos por archivo.
- Dirección elegida: importador asistido con pantalla de revisión previa (no automático sin revisión), para evitar que un valor de marca/unidad de negocio mal resuelto entre al catálogo sin confirmación.
- Resolución de catálogo: ningún valor sin match crea una entrada de catálogo nueva automáticamente; queda pendiente de asignación manual en la revisión.
- Permisos: una fila que apunta a una unidad de negocio distinta a la del usuario no-administrador se trata como error, igual que en el alta manual existente.
- VIN duplicado contra el inventario existente: siempre error, nunca actualiza el vehículo existente (importar es solo alta, no edición masiva).
- Filas inválidas no bloquean la importación completa: se excluyen individualmente y se reportan en el resumen final.
- La constitución del proyecto está en `status: draft` (sin ratificar); esta spec no hereda principios formales y lo deja anotado como punto a revisar si la constitución se ratifica antes de `plan`.

## 2026-11-17 — importador-inventario (clarify)

- Formatos de archivo aceptados: CSV y Excel (.xlsx) únicamente, sin límite estricto de filas.
- La ambigüedad de significado de columnas entre proveedores (p. ej. "modelo" como año-modelo) no necesitó regla nueva: la cubre el mapeo de cabeceras editable que ya estaba en la spec.
- La referencia visual de la pantalla de revisión/resumen se aprueba como boceto concreto en `plan`, no en la spec.
- Spec pasa a `status: clarified`.

## 2026-11-17 — importador-inventario (plan)

- Flujo partido en dos llamadas al servidor (analizar archivo, luego confirmar importación), sin estado de importación persistido a medias en el servidor: el resultado del análisis viaja completo en la respuesta y vive en el estado de la pantalla hasta que el usuario confirma. Evita introducir una entidad/almacenamiento temporal nuevo para un flujo que cabe en una ida y vuelta.
- La confirmación crea los vehículos fila por fila (no en una transacción todo-o-nada), y re-valida cada fila en el momento de crear — así una fila que se vuelve inválida entre el análisis y la confirmación (p. ej. VIN duplicado por una alta concurrente) no revierte las demás.
- Resolución de marca/unidad de negocio contra catálogo: solo coincidencia exacta tras normalizar (minúsculas, sin acentos, espacios colapsados) pasa automáticamente a "lista"; cualquier otro caso va a resolución manual — nunca se auto-acepta un match aproximado.
- No se elige todavía la librería de lectura de CSV/XLSX — queda para `implement`, junto con el boceto exacto de la pantalla de revisión/resumen.

## 2026-11-17 — importador-inventario (tasks)

- El proyecto no tenía ningún framework de pruebas instalado (sin jest/vitest/playwright, sin archivos `*.test.js` en el repo). Se añade **Vitest** como primera tarea (T001) porque es requisito para que cualquier done-check del plan sea ejecutable. Es una decisión de tooling, reversible, no de arquitectura.
- 16 tareas (T001–T016), TDD por pares prueba→implementación donde aplica. Todas forecast en tier de riesgo 1 (`rsc risk`, clase `default`, porque `02-DOCS/wiki/sdd/config.yaml` todavía no existe).
- Entrega sugerida: `ask-on-risk` — el volumen cabe en un PR, pero toca permisos y alta de inventario, así que conviene revisión humana antes de mezclar.
