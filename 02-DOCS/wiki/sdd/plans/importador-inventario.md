---
type: plan
title: Plan — Importador de inventario de vehículos
description: Plan a nivel de estructura para el importador de inventario — contratos, flujo de datos, resolución de catálogo.
tags: [sdd, plan]
timestamp: 2026-11-17T00:00:00Z
topic: sdd
slug: importador-inventario
status: draft
---

# Plan — Importador de inventario de vehículos

> Spec: [../specs/importador-inventario.md](../specs/importador-inventario.md) · Constitution: [../constitution.md](../constitution.md) · Status: draft
> Last updated: 2026-11-17

## 0. Global Constraints

- **Formatos de archivo aceptados:** CSV y Excel (`.xlsx`) únicamente. Cualquier otro formato se rechaza antes de leer cabeceras (spec §Non-goals, §Behaviour).
- **Nunca se crea catálogo nuevo:** ninguna fila crea una `Marca` o `UnidadNegocio` nueva; una marca/unidad de negocio sin match queda pendiente de resolución manual (spec §What it must respect).
- **VIN duplicado = error, nunca actualización:** una fila con VIN ya presente en `Vehiculo` se excluye; el registro existente no se toca (spec §What it must respect).
- **Límite por unidad de negocio:** un usuario no-administrador solo puede importar filas cuya unidad de negocio sea `auth.usuario.unidadNegocioId`; cualquier otra fila es error (spec §What the user can do). Mismo criterio que ya aplica en `POST /api/vehiculos` (`esAdministrador`, `src/app/api/vehiculos/route.js`).
- **Permiso requerido:** el mismo permiso que ya exige el alta manual de vehículos — recurso `vehiculo`, acción `crear` (`requirePermiso('vehiculo', 'crear')`, `src/lib/auth/authorize.js`).
- **Campos obligatorios por vehículo:** `nombre` (descripción), `modelo`, `anio`, `transmision`, `condicion`, `marcaId`, `unidadNegocioId` — idénticos a los que ya exige `POST /api/vehiculos`. `km`, `vin`, `precio` son opcionales.
- **Importación parcial:** una fila inválida nunca bloquea al resto del archivo (spec §Goals, §Behaviour).
- **Sin límite de filas por archivo** (spec §Non-goals) — no se impone un tope artificial en esta fase.
- **Auditoría:** cada vehículo creado por el importador se registra en bitácora igual que el alta manual (`registrarBitacora`, recurso `vehiculo`, acción `crear`).

## 1. Context & constraints

- Acceptance criteria que fijan el diseño: spec §Acceptance #1 (mapeo editable), #2 (resolución manual de marca/unidad de negocio), #3 (VIN duplicado), #4 (importación parcial), #5 (límite de unidad de negocio), #6 (resumen final), más el criterio de formato agregado en clarify.
- Fuera de alcance que el diseño no debe invadir (spec §Non-goals): no se crea catálogo nuevo, no se actualiza inventario existente, no hay importación recurrente/feed, no hay exportación.
- Constitución: en `status: draft`, sin stack canon ratificado más allá de lo detectado al instalar (Next.js, Node, React). No hay bar de calidad/UX formal que este plan deba citar; se sigue el patrón ya existente en el código (API routes de Next.js bajo `src/app/api/`, Prisma, `requirePermiso`).
- Patrón existente a reutilizar, no reinventar: `src/app/api/vehiculos/route.js` (POST) ya valida los mismos campos obligatorios y ya aplica la regla de unidad de negocio por rol — el importador debe honrar exactamente las mismas reglas, no una versión paralela.
- Referencia visual pendiente (spec, punto a clarificar): el boceto concreto de la pantalla de revisión/resumen se aprueba durante la construcción de la UI (tarea de `tasks`/`implement`), usando como base el estilo visual ya usado en `InventarioView.jsx` (tablas, inputs, popovers). No bloquea este plan.

## 2. Architecture

```text
[ Vista Importador (cliente) ]
        |  (1) sube archivo
        v
[ Endpoint: analizar archivo ]  (interno, servidor)
        |  lee cabeceras + filas, sugiere mapeo,
        |  resuelve marca/unidadNegocio contra catálogo,
        |  clasifica cada fila: lista | pendiente | error
        v
[ Vista Importador (cliente) ]  <-- muestra mapeo editable,
        |                           pendientes para resolución manual,
        |                           errores con motivo
        |  (2) usuario confirma mapeo + resoluciones + descartes
        v
[ Endpoint: confirmar importación ]  (interno, servidor)
        |  re-valida con las decisiones finales del usuario,
        |  crea los vehículos válidos (uno por uno, no todo-o-nada),
        |  registra bitácora por cada alta
        v
[ Vehiculo (Prisma / Postgres) ]   [ Marca / UnidadNegocio ] (catálogo existente, solo lectura)
```

- **Vista Importador** (interno, cliente) — única responsabilidad: guiar al usuario por subir → mapear → resolver pendientes → confirmar → ver resumen. No contiene lógica de resolución de catálogo ni de persistencia.
- **Endpoint: analizar archivo** (interno, servidor) — única responsabilidad: convertir un archivo crudo en una propuesta estructurada (mapeo sugerido + filas clasificadas). No persiste nada.
- **Endpoint: confirmar importación** (interno, servidor) — única responsabilidad: tomar las decisiones finales del usuario y convertirlas en altas de `Vehiculo`, fila por fila. Es el único punto que escribe en la base de datos.
- **Catálogo (Marca / UnidadNegocio)** (interno, ya existe) — fuente de verdad contra la que se resuelven los valores del archivo; solo lectura desde este flujo.

**Decisión arquitectónica principal:** el flujo se parte en dos llamadas al servidor (analizar, luego confirmar) en vez de una sola subida que ya importe, y el resultado intermedio (cabeceras, mapeo sugerido, filas clasificadas) viaja completo en la respuesta y vive en el estado de la pantalla del cliente — no se guarda ningún estado a medias en el servidor. Se elige esto porque: (a) la spec exige revisión y confirmación humana *antes* de que nada se guarde (spec §What the user can do) — una sola llamada que ya persista no deja espacio para esa revisión; (b) no introduce una entidad ni un almacenamiento temporal nuevo (sesión de importación, archivo en disco) para un flujo que cabe en una sola ida y vuelta con el archivo ya parseado una vez; (c) es consistente con el resto de la app, que es stateless entre peticiones (Next.js API routes + Prisma, sin sesiones de servidor para flujos multi-paso). El costo es que el cliente debe reenviar el conjunto de filas decidido en la segunda llamada — aceptable dado que no hay límite de filas que lo vuelva pesado en la práctica esperada.

## 3. Interfaces & contracts

```text
analizarArchivoImportacion(archivo: Archivo) -> AnalisisImportacion | FormatoNoSoportado | ArchivoVacio
  - precondition: usuario autenticado con permiso vehiculo.crear
  - postcondition: no escribe nada en la base de datos
  - invariante: el mismo archivo analizado dos veces produce la misma clasificación de filas
    (determinista; no depende de qué más haya cambiado en el catálogo entre llamadas... salvo que
    el catálogo mismo haya cambiado, en cuyo caso se re-resuelve contra el catálogo vigente)

AnalisisImportacion:
  - mapeoSugerido: lista de (columnaDelArchivo -> campoDelCatalogo | sin-asignar)
  - filas: lista de FilaAnalizada

FilaAnalizada:
  - datosOriginales: valores crudos de la fila
  - estado: "lista" | "pendiente-marca" | "pendiente-unidadNegocio" | "error"
  - motivoError: presente solo si estado = "error" (p. ej. "campo obligatorio faltante: marca",
    "VIN duplicado", "unidad de negocio no permitida", "año no numérico")
  - candidatosResolucion: presente solo si estado empieza con "pendiente-"; lista de entradas del
    catálogo que el usuario puede elegir para esa fila

confirmarImportacion(mapeoFinal, filasDecididas: lista de FilaDecidida) -> ResumenImportacion
  - precondition: usuario autenticado con permiso vehiculo.crear
  - precondition: cada FilaDecidida marcada "importar" tiene marcaId y unidadNegocioId resueltos
    a una entrada existente del catálogo (ninguna queda en estado "pendiente")
  - postcondition: cada fila marcada "importar" y válida en el momento de confirmar crea un
    Vehiculo; las demás no tocan la base de datos
  - invariante: no es todo-o-nada — una fila que falla en el momento de confirmar (p. ej. VIN que
    se volvió duplicado entre el análisis y la confirmación) no revierte las filas ya creadas de
    la misma importación
  - postcondition: cada Vehiculo creado genera una entrada de bitácora (accion=crear,
    recurso=vehiculo), igual que el alta manual

FilaDecidida:
  - datosOriginales + decision: "importar" | "descartar"
  - si "importar": marcaId y unidadNegocioId ya resueltos (por el usuario o automáticamente)

ResumenImportacion:
  - importados: cuenta + lista (para enlazar a cada vehículo creado)
  - conError: cuenta + lista de (datosOriginales, motivo)
  - resueltosManualmente: cuenta (filas que necesitaron asignación manual de marca/unidad de negocio)
```

## 4. Data model & flow

**Entidades** (todas ya existen; ninguna cambia de forma)

- **Vehiculo** — igual que hoy (`prisma/schema.prisma`); el importador solo crea filas nuevas, nunca actualiza una existente.
- **Marca**, **UnidadNegocio** — catálogos existentes, usados solo para resolver/validar; el importador nunca escribe en ellos.

**Flujo principal** (spec: camino principal)

1. El usuario sube un archivo CSV/XLSX → `analizarArchivoImportacion` lo lee, sugiere el mapeo de cabeceras, y por cada fila intenta resolver `marcaId`/`unidadNegocioId` contra el catálogo (comparación normalizada de nombre: sin distinguir mayúsculas/acentos/espacios extra) y valida los campos obligatorios.
2. El usuario revisa: ajusta el mapeo si algo se sugirió mal, y para cada fila "pendiente" elige una entrada existente del catálogo o descarta la fila.
3. El usuario confirma → `confirmarImportacion` re-valida cada fila "importar" contra el estado actual del catálogo y de la base (por si algo cambió desde el análisis) y crea los vehículos válidos uno por uno.
4. El usuario ve el resumen con los tres números de la spec (importados, con error y motivo, resueltos manualmente).

- **Límites de consistencia:** cada alta de `Vehiculo` es una operación independiente (no hay transacción que abarque todo el archivo) — esto es intencional, porque la spec exige que una fila mala no bloquee a las buenas.
- **Impacto de migración:** ninguno. No hay tabla ni columna nueva; el importador reutiliza el modelo `Vehiculo` tal como está.

## 5. Testing strategy

| Criterio de aceptación | Nivel | Qué prueba | Qué se simula |
| --- | --- | --- | --- |
| Formato no soportado se rechaza (clarify) | unit | `analizarArchivoImportacion` devuelve `FormatoNoSoportado` sin leer cabeceras | archivo de prueba con extensión/contenido inválido |
| Mapeo de cabeceras editable (spec #1) | unit + integración | cabeceras distintas producen un mapeo sugerido; el mapeo corregido por el usuario se respeta en la confirmación | archivo con cabeceras no estándar |
| Resolución manual de marca/unidad de negocio (spec #2) | integración | una fila sin match queda "pendiente" con candidatos; tras resolución manual, confirma y crea el vehículo con el id elegido | catálogo de prueba con marcas conocidas |
| VIN duplicado (spec #3) | integración | una fila con VIN ya existente se excluye con motivo; el vehículo existente no cambia | un `Vehiculo` ya creado con ese VIN |
| Importación parcial (spec #4) | integración | en un archivo con filas válidas e inválidas mezcladas, las válidas quedan creadas y las inválidas aparecen en el resumen | archivo mixto |
| Límite de unidad de negocio (spec #5) | integración | con un usuario no-administrador, una fila de otra unidad de negocio se excluye; las propias se importan | dos usuarios de prueba (admin / no-admin) |
| Resumen final (spec #6) | e2e | tras una importación completa, el resumen muestra los tres números correctos | flujo completo subir→revisar→confirmar en un navegador |

- **Línea del e2e:** solo el camino completo (subir → revisar → confirmar → resumen) se prueba end to end, una vez con un archivo "feliz" y una vez con el archivo mixto del criterio #4; el resto de los casos (formato, VIN duplicado, límite de unidad de negocio, resolución manual) se prueban a nivel de integración contra los dos endpoints directamente, sin pasar por la UI.
- **Lo que debe ser real, no simulado:** la base de datos de prueba y el catálogo (`Marca`/`UnidadNegocio`) reales — simular la resolución de catálogo no probaría nada sobre si el emparejamiento de nombres funciona de verdad.

## 6. Sequencing & dependencies

1. Contrato y lógica de `analizarArchivoImportacion`: lectura de archivo, formato, sugerencia de mapeo, resolución de catálogo, clasificación de filas — depende de: ninguno — serial (todo lo demás depende de esta forma de datos)
2. Contrato y lógica de `confirmarImportacion`: re-validación final + creación fila por fila + resumen + bitácora — depende de: #1 (reutiliza la misma clasificación/validación) — serial
3. Pantalla de importación — subida de archivo + mapeo editable + vista de pendientes/errores — depende de: #1 (consume su forma de datos) — parallelizable con #2 una vez cerrado #1
4. Pantalla de resumen final tras confirmar — depende de: #2 (consume su forma de datos) — parallelizable con #3
5. Pruebas end-to-end del camino feliz y del camino mixto — depende de: #1, #2, #3, #4 — serial, al final

- Candidatos a paralelizar (alcance disjunto): #3 (cliente) y #2 (servidor) una vez que el contrato de #1 está fijo; #4 puede avanzar en paralelo con #3.
- Restricción dura: nada de UI puede construirse en forma final antes de que la forma de `AnalisisImportacion`/`ResumenImportacion` esté fija (#1/#2), porque son el contrato que la UI consume literalmente.

## 7. Risks & open decisions

**Riesgos** (de más a menos probable/impactante)

| Riesgo | Disparador | Impacto | Mitigación / spike |
| --- | --- | --- | --- |
| Emparejamiento de nombres de marca/unidad de negocio demasiado laxo o demasiado estricto | Nombres del archivo con mayúsculas, acentos o espacios distintos al catálogo | Filas que deberían resolverse automáticamente caen a "pendiente" (molesto pero seguro), o peor, se emparejan con la entrada equivocada (grave) | Normalizar (minúsculas, sin acentos, espacios colapsados) para la comparación; nunca auto-aceptar un match que no sea exacto tras normalizar — todo lo demás va a "pendiente" para confirmación humana, nunca a "lista" por sospecha |
| Condición de carrera entre el análisis y la confirmación (otro usuario importa el mismo VIN, o da de alta el mismo vehículo manualmente, mientras este usuario está revisando) | Dos importaciones/altas simultáneas | Un VIN que se volvió duplicado después de "analizar" no se detecta hasta confirmar | `confirmarImportacion` re-valida cada fila en el momento de crear (no confía en la clasificación del análisis); una fila que falla en ese momento se reporta como error en el resumen sin tumbar las demás |
| Archivo real con volumen alto de filas no resolubles (muchas marcas/unidades de negocio con nombres muy distintos a los del catálogo) | Archivo de un proveedor con nomenclatura propia | La pantalla de resolución manual se vuelve el nuevo cuello de botella que la spec quería evitar | Ya anotado como riesgo aceptado en la spec (`Points to clarify`); no se mitiga en este ciclo, se revisa con datos reales de uso |
| Elegir mal la librería de lectura de CSV/XLSX (decisión de `implement`, no de este plan) | — | Reescritura de la capa de parseo si la elegida no soporta bien algún formato real que llega | Validar con un archivo de ejemplo real de cada formato antes de fijar la librería en `implement` |

**Decisiones abiertas** (genuinamente sin decidir)

- Librería concreta de lectura de CSV/XLSX — se cierra en `implement`, al elegir el stack mecánico (no es una decisión de estructura).
- Boceto exacto de la pantalla de revisión y del resumen — se cierra cuando `tasks`/`implement` proponga el diseño concreto y el usuario lo apruebe (spec, punto a clarificar).
