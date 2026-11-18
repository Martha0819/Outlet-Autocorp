---
type: analysis
title: Analyze — Importador de inventario de vehículos
description: Cruce de consistencia entre constitución, spec, plan y tareas del importador de inventario, antes de implementar.
tags: [sdd, analysis]
timestamp: 2026-11-17T00:00:00Z
topic: sdd
---

# Analyze — Importador de inventario de vehículos

> Spec: [../specs/importador-inventario.md](../specs/importador-inventario.md) · Plan: [../plans/importador-inventario.md](../plans/importador-inventario.md) · Constitution: [../constitution.md](../constitution.md)

## Veredicto

**GATE: PASS** (re-corrido 2026-11-18, tras aplicar las correcciones) — 0 CRITICAL, 0 HIGH.

Hallazgo original (ver abajo): la spec decía que `km` era obligatorio, pero el plan (y el código ya existente de alta manual) lo trata como opcional — corregido en la spec. Los dos MEDIUM (caso "todas las filas con error" sin prueba, bloques de interfaz faltantes) también se corrigieron en el plan/tareas. El LOW queda abierto a propósito, para decidirse en `implement`.

### Estado de los hallazgos tras la corrección

| # | Hallazgo | Estado |
| --- | --- | --- |
| 1 (HIGH) | `km` obligatorio en spec vs opcional en plan/código | **Corregido** — spec §What it must respect ya no lista `km`; `## Clarifications` registra el porqué. |
| 2 (MEDIUM) | Caso "todas las filas con error" sin prueba | **Corregido** — añadido al done-check de T009. |
| 3 (MEDIUM) | Faltan bloques `Interfaces` en T008/T011–T015 | **Corregido** — los 6 bloques añadidos al plan. |
| 4 (LOW) | Candidatos de resolución sin definir orden/filtro | Abierto, diferido a `implement` (no bloquea). |

## Mapa de cobertura

| REQ-ID | Requisito (resumen) | Plan | Tarea(s) | Estado |
| --- | --- | --- | --- | --- |
| AC0 | Formato no soportado se rechaza antes de leer cabeceras | §0, §Testing fila 1 | T002, T003, T008 | covered |
| AC1 | Mapeo de cabeceras sugerido y editable | §2, §3, §Testing fila 2 | T004, T005, T008, T012, T014 | covered |
| AC2 | Marca/unidad de negocio sin match → resolución manual, nunca auto-creación | §3, §Testing fila 3 | T006, T007, T008, T012, T014 | covered |
| AC3 | VIN duplicado → error, vehículo existente intacto | §0, §3, §Testing fila 4 | T006, T007, T009, T010, T015 | covered |
| AC4 | Fila inválida no bloquea al resto (importación parcial) | §0, §4, §Testing fila 5 | T006, T007, T009, T010, T015 | covered |
| AC5 | No-administrador solo importa a su propia unidad de negocio | §0, §Testing fila 6 | T006, T007, T011 | covered |
| AC6 | Resumen final con los tres números | §3, §Testing fila 7 | T009, T010, T013, T014, T015 | covered |
| B1 | Caso límite: archivo vacío se indica claramente | §Testing fila 1 (implícito) | T002, T003 | covered |
| B2 | Caso límite: todas las filas con error ≠ falla del sistema | — | — | **GAP** |
| KM | Campos obligatorios de una fila importada | §0 dice `km` opcional | T006, T007 implementan "opcional" | **CONTRADICTION** vs spec §What it must respect |

## Hallazgos

| # | Severidad | Tipo | Artefacto A (ubicación) | Artefacto B (ubicación) | Conflicto | Resolver en |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **HIGH** | Contradicción | Spec §What it must respect, línea 57: "...modelo, descripción/nombre, año, **km**, transmisión, condición, marca, unidad de negocio) deben estar presentes y válidos..." | Plan §0 Global Constraints, línea 24: "`km`, `vin`, `precio` son opcionales" — y el propio `POST /api/vehiculos` (`src/app/api/vehiculos/route.js`), donde `km` nunca se exige (`km: Number(km) \|\| 0`) | La spec lista `km` como campo obligatorio para que una fila se importe; el plan (correctamente alineado con el código real de alta manual) lo trata como opcional. Si se implementa tal como está escrita la spec, filas sin `km` se rechazarían como "campo obligatorio faltante", rompiendo el propio objetivo de la spec de que el importador se comporte "igual que el alta manual" (spec §What result they get, línea 52). Si se implementa tal como está el plan, el criterio de aceptación de "fila sin un campo obligatorio" (AC4) queda ambiguo sobre si `km` cuenta. | `clarify` (o una pasada corta de `specify`): corregir la lista de campos obligatorios en §What it must respect para que coincida con el alta manual real (`km` opcional). |
| 2 | MEDIUM | Gap de cobertura | Spec §Behaviour, línea 70: "Caso límite — todas las filas tienen error: el resumen final lo refleja (cero importadas, N con error) sin que esto se trate como una falla del sistema." | Plan §5 Testing strategy (no tiene fila para este caso) · Tasks (ninguna de T009/T015 lo nombra en su done-check) | Un comportamiento explícitamente descrito en la spec no tiene ninguna prueba ni tarea que lo cubra. Nada impide que, por accidente, un archivo 100% inválido se trate como error de sistema (p. ej. una excepción no controlada) en vez de un resumen válido con cero importados. | `tasks`: añadir el caso a la condición de prueba de T009 (confirmarImportacion) y/o T015 (e2e camino mixto), sin crear una tarea nueva. |
| 3 | MEDIUM | Ambigüedad (carrier completeness) | Plan §3 Interfaces & contracts (da la forma de datos de `AnalisisImportacion`/`ResumenImportacion`, pero no nombra módulos/funciones concretas) | Tasks T008, T011, T012, T013, T014, T015 (cada una depende de contratos producidos por una tarea anterior, pero ninguna lleva un bloque `**Txxx — Interfaces**` con `Consumes`/`Produces` exactos) | `implement`/`parallel` despachan cada tarea a un agente que solo ve su propia fila. T008 necesita saber exactamente qué exporta T003/T005/T007 (nombres de función, módulo); T012 necesita la forma exacta que entrega T008 por HTTP. Sin esos bloques, un implementador aislado tiene que adivinar nombres de módulo/función que solo están en prosa dispersa (Review Workload Forecast), no en un contrato citable. | `tasks`: añadir un bloque `Interfaces` (`Consumes`/`Produces`, firmas exactas) a T008, T011, T012, T013, T014 y T015 antes de `implement`. |
| 4 | LOW | Ambigüedad menor | Plan §3, línea 87-88: `candidatosResolucion` — "lista de entradas del catálogo que el usuario puede elegir para esa fila", sin decir si es el catálogo completo o una lista filtrada/ordenada por similitud | Tasks T006/T007/T012 (consumen `candidatosResolucion` sin fijar ese detalle tampoco) | No bloquea construir nada (mostrar el catálogo completo como candidatos es una implementación válida), pero queda sin decidir si se ordena por similitud o se deja como lista plana — afecta la experiencia de resolución manual, no la corrección. | `implement`: decidir al construir T007/T012; no requiere volver a `plan`. |

## Otras observaciones (no bloquean)

- **T001 (añadir Vitest) no traza a ningún criterio de la spec** — esto es tooling de infraestructura, no requisito de producto; se queda, pero se marca explícitamente para que no se confunda con alcance no solicitado (no es DRIFT real).
- **Constitución**: sigue en `status: draft`, sin principios ratificados más allá del stack detectado (Next.js/Node/React). No hay violación posible porque no hay regla formal que violar — esto ya está anotado como riesgo de proceso en la spec y el plan; no se repite aquí como hallazgo nuevo.
- Ninguna otra duplicación ni drift de alcance encontrados: cada tarea traza a al menos un criterio real, y ningún criterio queda sin ninguna tarea salvo el B2 ya listado.

## Ruteo recomendado

1. **Hallazgo #1 (HIGH, bloqueante)** → `clarify`, corrección rápida de redacción en la spec (quitar `km` de los campos obligatorios en §What it must respect). Costo: una frase.
2. **Hallazgo #2 (MEDIUM)** → `tasks`, ampliar el done-check de T009/T015.
3. **Hallazgo #3 (MEDIUM)** → `tasks`, añadir bloques `Interfaces` a las 6 tareas señaladas antes de `implement`.
4. **Hallazgo #4 (LOW)** → se deja para `implement`, no requiere retroceder de fase.

Con #1 corregido (y #2/#3 al menos reconocidos), se puede volver a correr `analyze` y esperar `GATE: PASS`.
