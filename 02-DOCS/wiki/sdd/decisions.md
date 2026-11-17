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
