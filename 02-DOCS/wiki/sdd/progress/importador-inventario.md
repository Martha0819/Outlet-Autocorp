# Progress — importador-inventario

Append-only. Nunca se reescriben entradas viejas.

## T001 — 2026-11-18
- status: complete
- hecho: añadido Vitest + React Testing Library (`vitest`, `@vitejs/plugin-react`, `jsdom`,
  `@testing-library/react`, `@testing-library/jest-dom`), script `npm test`, `vitest.config.mjs`.
- test de humo: `npm test` → 1 archivo, 1 test, verde.
- files: `package.json`, `vitest.config.mjs`, `vitest.setup.mjs`, `src/lib/__tests__/smoke.test.js`.
- riesgo: tier 1 (`rsc risk`, clase `default` — sin `config.yaml` de SDD).
- revisión: autorrevisión (ver nota de alcance en el chat); sin panel de revisores por tarea en este ciclo.
- controles: tests ✅ build pendiente de T016 · security: no aplica (sin lógica propia) · traceability: infra, sin AC.
- decisión: ninguna pendiente.

## T002/T003 — 2026-11-18
- status: complete
- red: `npx vitest run parseoArchivo` → 6 fallas (stub devolvía siempre `ok` vacío).
- green: mismo comando, 6/6 verde. Librerías: `papaparse` (CSV), `exceljs` (XLSX) — ver decisión de seguridad en decisions.md (no `xlsx`/SheetJS).
- files: `src/lib/importador/parseoArchivo.js`, `src/lib/importador/__tests__/parseoArchivo.test.js`.
- riesgo: tier 1. controles: tests ✅ (resto en T016). traceability: AC-formato, caso límite archivo vacío.

## T004/T005 — 2026-11-18
- status: complete
- red: `npx vitest run mapeoCabeceras` → 2 fallas (stub devolvía `[]`).
- green: mismo comando, 2/2 verde.
- files: `src/lib/importador/mapeoCabeceras.js`, `src/lib/importador/normalizar.js`, `src/lib/importador/__tests__/mapeoCabeceras.test.js`.
- riesgo: tier 1. traceability: AC1.

## T006/T007 — 2026-11-18
- status: complete
- red: `npx vitest run resolucionCatalogo` → 9/10 fallas (stub devolvía `[]`).
- green: mismo comando, 10/10 verde, contra `outlet_db_test` real (catálogo sembrado, sin mocks de Prisma).
- files: `src/lib/importador/resolucionCatalogo.js`, `src/lib/importador/__tests__/resolucionCatalogo.test.js`, `src/lib/importador/__tests__/testDb.js`.
- riesgo: tier 1. traceability: AC2, AC3, AC4, AC5, "sin catálogo nuevo".

## T008 — 2026-11-18
- status: complete
- red: `npx vitest run src/app/api/importador-vehiculos/analizar` → 3/3 fallas (stub 501).
- green: mismo comando, 3/3 verde. Requirió entorno `node` (no jsdom) por `jose`/WebCrypto — ver decisión.
- files: `src/app/api/importador-vehiculos/analizar/route.js`, su test, `src/lib/importador/__tests__/testAuth.js`.
- riesgo: tier 1. controles: tests ✅, no persiste nada verificado por conteo antes/después.
- traceability: AC1, AC2, AC3, AC4, AC5, permiso `vehiculo.crear`.
- hallazgo de infra: ejecutar los 5 archivos de prueba juntos (`npm test`) producía fallos por condición de carrera en la base compartida → `fileParallelism: false` en `vitest.config.mjs` (ver decisión). `npm test` completo: 22/22 verde.

## T009/T010 — 2026-11-18
- status: complete
- red: `npx vitest run confirmarImportacion` → 5/5 fallas (stub devolvía resumen vacío).
- green: mismo comando, 5/5 verde, contra `outlet_db_test` real, con bitácora verificada.
- files: `src/lib/importador/confirmarImportacion.js`, su test.
- riesgo: tier 1. traceability: AC3, AC4, AC6, caso límite "todas las filas con error".

## T011 — 2026-11-18
- status: complete
- red: `npx vitest run src/app/api/importador-vehiculos/confirmar` → 3/3 fallas (stub 501).
- green: mismo comando, 3/3 verde.
- files: `src/app/api/importador-vehiculos/confirmar/route.js`, su test.
- riesgo: tier 1. traceability: AC5, AC6, permiso `vehiculo.crear`.
- `npm test` completo tras T011: 30/30 verde.

## T012/T013 — 2026-11-18
- status: complete
- red/green: `ImportadorRevision` (3 pruebas), `ImportadorResumen` (2 pruebas), `ImportadorInventario` (1 prueba) — cada uno stub→rojo por la razón correcta→implementación→verde.
- hallazgo durante el trabajo: `resolucionCatalogo.js` cortaba en seco al primer campo sin resolver (marca O unidad de negocio, nunca ambos informados); se corrigió para resolver ambos de forma independiente — ver decisions.md.
- integrado en `InventarioView.jsx` (botón "Importar desde archivo").
- files: `ImportadorRevision.jsx`, `ImportadorResumen.jsx`, `ImportadorInventario.jsx` + sus pruebas; `InventarioView.jsx` (integración).
- riesgo: tier 1. traceability: AC1, AC2, AC6.
- `npm run build` verde con las nuevas rutas reconocidas.

## T014/T015 — 2026-11-18
- status: complete
- decisión de alcance (confirmada por el usuario): sin Playwright/navegador — flujo completo encadenando los dos endpoints reales contra `outlet_db_test`. Ver decisions.md.
- hallazgo real durante la escritura: una fila con error en el análisis que la pantalla descarta no llegaba al resumen final con su motivo (violaba AC4) → se agregó `motivoDescartado` a `FilaDecidida`, propagado por `ImportadorRevision` y consumido por `confirmarFilas`. Cubierto también con pruebas unitarias en T012/T009.
- red/green: `npx vitest run flujoCompleto` → 2 fallas reales (una por expectativa de prueba incorrecta, corregida; otra por el hallazgo real de `motivoDescartado`) → 2/2 verde.
- files: `src/app/api/importador-vehiculos/__tests__/flujoCompleto.test.js`.
- riesgo: tier 1. traceability: AC1, AC2, AC3, AC4, AC6.

## T016 — 2026-11-18
- status: complete
- `npm test`: 40/40 verde. `npm run build`: verde, sin errores de tipo/compilación.
- `npm run lint`: **no corrido** — ESLint nunca se configuró en este proyecto (pide configuración interactiva al primer uso); condición preexistente, no introducida por esta feature. Reportado como no corrido, no como pasado.
- Todas las filas de la tabla de tareas (T001–T015) con su done-check comprobado arriba.
- Pendiente para el humano antes de dar por cerrado el ciclo completo (stage 5): `verify`/`review` de cierre sobre toda la rama, y revisión adversarial (`/code-review`) antes de cualquier envío — ver mensaje de cierre en el chat.
