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

## 2026-11-18 — importador-inventario (analyze → correcciones)

- `analyze` encontró que la spec listaba `km` como campo obligatorio, contradiciendo el plan y el alta manual real (`km` opcional). Corregido en la spec (§What it must respect + `## Clarifications`).
- Añadido el caso "todas las filas con error" al done-check de T009, que la spec ya describía (§Behaviour) pero ninguna tarea cubría explícitamente.
- Añadidos bloques `Interfaces` (Consume/Produce, firmas exactas) a T008, T011, T012, T013, T014 y T015, para que un implementador con contexto aislado no tenga que adivinar los contratos entre tareas.

## 2026-11-18 — importador-inventario (implement, T001)

Contexto — El plan dejó abierta la librería de lectura de CSV/XLSX (decisión de implement). El archivo lo sube el usuario, así que el contenido es no confiable.
Opciones — (a) `xlsx` (SheetJS): más popular, pero con dos vulnerabilidades de severidad alta sin fix disponible (prototype pollution, ReDoS) explotables justo al parsear un archivo adversario. (b) `exceljs`: sin vulnerabilidades de severidad alta; una dependencia transitiva (`uuid`) con una vulnerabilidad moderada que no aplica a cómo se usa aquí (no le pasamos buffers controlados por el atacante a `uuid`). (c) Escribir un parser propio: descartado, reinventar el formato .xlsx no es razonable para esta feature.
Decisión — `exceljs` para `.xlsx`, `papaparse` para `.csv`.
Por qué — El archivo de entrada es contenido subido por el usuario (no confiable); una librería con prototype pollution/ReDoS sin fix es el riesgo equivocado a aceptar justo en la superficie que recibe el archivo.

## 2026-11-18 — importador-inventario (implement, T002–T008)

- Pruebas de integración contra una base de datos de prueba separada (`outlet_db_test`, mismo Postgres local, nunca la base real `outlet_db`) — variables en `.env.test` (ignorado por git), cargadas por `vitest.config.mjs` antes de las pruebas.
- Las pruebas que ejercitan `requirePermiso`/JWT corren con `// @vitest-environment node` en vez de `jsdom`: `jose` usa WebCrypto y, bajo jsdom, el `Uint8Array` de `TextEncoder` de Node no es `instanceof` el `Uint8Array` del realm de jsdom — la firma fallaba por eso, no por un bug real.
- `vitest.config.mjs` corre los archivos de prueba en serie (`fileParallelism: false`): varios archivos comparten la misma base de prueba, y en paralelo el `beforeEach` de un archivo pisaba los datos que otro archivo estaba usando.
- `clasificarFilas` (T007) reutiliza `normalizarTexto` (ya escrito para `mapeoCabeceras`) para comparar marca/unidad de negocio contra el catálogo — nunca auto-acepta un match que no sea exacto tras normalizar, tal como fija el plan.

## 2026-11-18 — importador-inventario (implement, T012/T013)

- `resolucionCatalogo.js` deja de cortar en seco al primer campo sin resolver: ahora intenta marca y unidad de negocio de forma independiente, así una fila "pendiente-marca" ya trae conocida su unidad de negocio (`unidadNegocioIdResuelto`) y viceversa (`marcaIdResuelto`) — la pantalla de revisión solo pide al usuario lo que de verdad falta, en vez de forzarlo a resolver ambas aunque solo una esté mal.
- El endpoint de análisis ahora devuelve también `catalogo: { marcas, unidadesNegocio }` completo (no solo los candidatos de cada fila), para que la pantalla pueda ofrecer cualquiera de las dos resoluciones sin una segunda llamada.
- La "pantalla de importación" de T012 se dividió en dos componentes: `ImportadorRevision` (puro: mapeo + resolución manual + confirmar) e `ImportadorInventario` (contenedor: sube el archivo, llama a los dos endpoints, muestra `ImportadorRevision` y luego `ImportadorResumen`). Facilita probar la lógica de mapeo/resolución sin tener que mockear `fetch`.
- Se integró en `InventarioView.jsx` con un botón "Importar desde archivo" junto a "Agregar vehículo"; al completarse, refresca la lista (`refetchVehiculos`).

## 2026-11-18 — importador-inventario (implement, hallazgo T014/T015)

Contexto — Al escribir las pruebas de flujo completo (camino mixto) se encontró que una fila con error detectado en el análisis (campo faltante, VIN duplicado en ese momento, etc.), si la pantalla la descarta en vez de intentar importarla, desaparecía del resumen final sin dejar rastro — `confirmarFilas` solo reportaba errores que ocurrían en el momento mismo de confirmar, no los ya detectados en el análisis.
Decisión — `FilaDecidida` con `decision: 'descartar'` ahora puede llevar `motivoDescartado`; `ImportadorRevision` lo rellena desde `motivoError` al construir la fila; `confirmarFilas` lo vuelca al `conError` del resumen.
Por qué — El criterio de aceptación AC4 de la spec exige que "la fila incompleta aparezca en el resumen final con su motivo" — sin este cambio, ese motivo solo era visible en la pantalla de revisión, nunca en el resumen que la spec define como el resultado observable de la importación.

## 2026-11-18 — importador-inventario (implement, T014/T015)

Contexto — El plan preveía pruebas e2e en navegador para el camino feliz y el camino mixto; Playwright no estaba instalado y añadirlo (con descarga de binarios de navegador) es una dependencia pesada para este ciclo.
Decisión (confirmada por el usuario) — T014/T015 se implementaron como pruebas de flujo completo sin navegador: encadenan los dos endpoints reales (`analizar` → `confirmar`) contra la base de datos de prueba real, sin mocks de la lógica de negocio.
Por qué — Prueban el comportamiento observable de punta a punta (lo que importa para las ACs) sin la inversión de una suite de navegador; la pantalla en sí ya quedó cubierta por los tests de componente de T012/T013.
