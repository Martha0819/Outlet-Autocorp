---
type: spec
title: Spec — Importador de inventario de vehículos
description: WHAT y WHY para un importador de archivos que mapea cabeceras contra el catálogo de vehículos, resuelve marca/unidad de negocio y permite revisión antes de guardar.
tags: [sdd, spec]
timestamp: 2026-11-17T00:00:00Z
topic: sdd
slug: importador-inventario
status: draft
---

# Spec — Importador de inventario de vehículos

> Slug: `importador-inventario` · Status: draft · Created: 2026-11-17
> Inherits: ninguno — el proyecto no tiene constitución ratificada todavía (`02-DOCS/wiki/sdd/constitution.md` está en `status: draft`). Ver *Points to clarify*.

## Problem & why
Hoy, dar de alta vehículos en el inventario se hace uno por uno, a mano, en el formulario de la vista de inventario. Cuando llega un lote de vehículos (de otro dealer, de un proveedor, de una captura en Excel), no hay forma de cargarlo de golpe: alguien tiene que transcribir fila por fila, con el riesgo de error que eso trae en campos obligatorios como marca o unidad de negocio.

## Cost of not building it
Cada lote de vehículos sigue costando minutos por vehículo en captura manual, con el mismo riesgo de typo o de ligar mal una marca/unidad de negocio que ya existe en el inventario capturado a mano. Para un lote de tamaño moderado (decenas de vehículos), la carga manual es el cuello de botella que motivó esta spec; para lotes grandes se vuelve impráctico.

## The cheapest alternative
Pedir que quien entrega el archivo lo reformatee a mano con las cabeceras exactas que usa el catálogo, y seguir dando de alta uno por uno. No resuelve el problema: sigue siendo captura manual fila por fila, y además traslada el trabajo de adaptar el archivo a otra persona en vez de eliminarlo.

## Goals
- Permitir cargar un lote de vehículos desde un archivo, sin tener que transcribirlos uno por uno en el formulario.
- Que el archivo no tenga que llegar con las cabeceras exactas del catálogo: el sistema sugiere a qué campo corresponde cada columna del archivo.
- Que ningún vehículo entre al inventario con una marca o unidad de negocio mal ligada: toda relación con el catálogo se confirma antes de guardar.
- Que una importación con algunas filas problemáticas no bloquee a las filas que sí están correctas.

## Non-goals / out of scope
- No crea marcas, unidades de negocio ni ninguna otra entrada de catálogo automáticamente a partir del archivo — ver *What it must respect*.
- No actualiza ni sobrescribe vehículos ya existentes en el inventario (importar es siempre alta de vehículos nuevos, nunca edición masiva).
- No programa importaciones recurrentes ni sincronización automática con un proveedor externo; es una carga manual, bajo demanda, iniciada por un usuario.
- No incluye exportar el inventario a archivo (esta spec es solo de entrada).
- No decide el formato de archivo exacto que se acepta (ver *Points to clarify*) — pero sea cual sea, es un archivo tabular que el usuario sube explícitamente, no un feed ni una integración.

## Users & context
Un asesor o administrador que gestiona el inventario de vehículos (la misma persona que hoy usa la vista de inventario para dar de alta vehículos uno por uno), y que recibió un archivo con varios vehículos para cargar de una sola vez.

## What the user can do
Cualquier usuario con permiso para dar de alta vehículos (el mismo permiso que hoy habilita el alta manual en la vista de inventario) puede subir un archivo con uno o más vehículos.

Un usuario no-administrador solo puede importar vehículos hacia su propia unidad de negocio: si una fila del archivo indica otra unidad de negocio, esa fila se trata como fila con error (ver *Behaviour*) y no se importa; el resto del archivo no se ve afectado.

Antes de que cualquier vehículo quede guardado, el usuario revisa y confirma: (a) a qué campo del catálogo corresponde cada columna del archivo, y (b) a qué marca/unidad de negocio del catálogo corresponde cada valor del archivo que no se haya podido resolver automáticamente. Nada se guarda sin esa confirmación.

## What result they get
Al terminar una importación, el usuario ve un resumen con tres números: cuántas filas se importaron con éxito, cuántas quedaron fuera por error (con el motivo de cada una), y cuántas fueron resueltas manualmente durante la revisión (marca/unidad de negocio que el usuario tuvo que emparejar a mano). Los vehículos importados con éxito aparecen en la vista de inventario igual que si se hubieran dado de alta a mano uno por uno, con los mismos campos poblados.

*Referencia visual (pantalla de revisión y resumen final) pendiente de boceto aprobado por el usuario — ver Points to clarify.*

## What it must respect
- Los mismos campos obligatorios que ya exige el alta manual de un vehículo (modelo, descripción/nombre, año, km, transmisión, condición, marca, unidad de negocio) deben estar presentes y válidos para que una fila se importe; si falta alguno, esa fila es una fila con error, no una fila importada a medias.
- Toda marca y unidad de negocio de un vehículo importado debe corresponder a una entrada que ya existe en el catálogo — nunca se crea una marca o unidad de negocio nueva como efecto secundario de una importación.
- Un VIN duplicado contra el inventario ya existente nunca sobrescribe el vehículo existente; esa fila se trata como fila con error.
- El límite de acceso por unidad de negocio que ya aplica al alta manual (un no-administrador solo opera dentro de su propia unidad de negocio) aplica igual a cada fila importada.

## How it proves it
Para cada criterio de aceptación de abajo, una comprobación de extremo a extremo que sube un archivo de prueba con esa condición exacta (fila válida, fila con marca no resoluble, fila con VIN duplicado, fila con dato faltante, mezcla de filas válidas e inválidas) y verifica el resultado observable: qué quedó en el inventario y qué dice el resumen final. El registro de cada corrida y una captura de la pantalla de revisión y del resumen quedan como evidencia.

## Behaviour
- **Camino principal**: el usuario sube un archivo con vehículos; el sistema lee sus cabeceras y sugiere a qué campo del catálogo corresponde cada una; el usuario confirma o corrige esas correspondencias; el sistema intenta resolver marca y unidad de negocio de cada fila contra el catálogo; las filas totalmente resueltas y válidas quedan listas para importar; el usuario confirma la importación final y los vehículos quedan dados de alta.
- **Camino de resolución manual**: una fila cuyo valor de marca o unidad de negocio no coincide con ninguna entrada del catálogo se muestra aparte, y el usuario puede asignarle manualmente una entrada existente del catálogo (o descartar esa fila) antes de confirmar la importación.
- **Caso límite — archivo vacío o sin filas de datos**: el sistema lo indica claramente y no hay nada que importar.
- **Caso límite — todas las filas tienen error**: el resumen final lo refleja (cero importadas, N con error) sin que esto se trate como una falla del sistema.
- **Camino de error — fila inválida**: una fila con un campo obligatorio faltante o con un valor que no tiene sentido para ese campo (p. ej. año no numérico) se excluye de la importación y aparece en el resumen final con el motivo; las demás filas válidas del mismo archivo se importan igual.
- **Camino de error — VIN duplicado**: una fila cuyo VIN ya existe en el inventario se excluye y aparece en el resumen con ese motivo; el vehículo existente no se modifica.
- **Camino de error — fuera de la unidad de negocio permitida**: para un usuario no-administrador, una fila que apunta a otra unidad de negocio se excluye y aparece en el resumen con ese motivo.

## Acceptance criteria
- Given un archivo con cabeceras distintas a los nombres internos del catálogo, When el usuario lo sube, Then el sistema propone una correspondencia entre cada cabecera del archivo y un campo del catálogo, editable antes de continuar.
- Given una fila cuyo valor de marca (o unidad de negocio) no coincide con ninguna entrada del catálogo, When el usuario revisa la importación, Then esa fila se muestra como pendiente de resolución manual y no se importa hasta que el usuario le asigne una entrada existente del catálogo o la descarte.
- Given una fila cuyo VIN ya existe en el inventario, When se procesa la importación, Then esa fila se excluye y aparece en el resumen final con el motivo "VIN duplicado", y el vehículo existente permanece sin cambios.
- Given un archivo con una fila sin un campo obligatorio (p. ej. sin marca) y otras filas completas, When se confirma la importación, Then las filas completas se importan y la fila incompleta aparece en el resumen final con su motivo, sin bloquear a las demás.
- Given un usuario no-administrador y una fila que indica una unidad de negocio distinta a la suya, When se procesa la importación, Then esa fila se excluye y aparece en el resumen con el motivo correspondiente; las filas de su propia unidad de negocio se importan con normalidad.
- Given una importación terminada, When el usuario revisa el resumen, Then puede ver cuántas filas se importaron, cuántas quedaron excluidas (y por qué cada una) y cuántas requirieron resolución manual de marca/unidad de negocio.

## Points to clarify
- **pregunta abierta** — ¿qué formatos de archivo se aceptan exactamente (solo CSV, o también Excel/.xlsx), y hay un límite razonable de filas por importación?
- **pregunta abierta** — la referencia visual de la pantalla de revisión y del resumen final (ver *What result they get*) no existe todavía; ¿quién la aprueba antes de plan — un boceto rápido del usuario, o se deriva del estilo ya usado en la vista de inventario?
- **suposición tomada** — una fila con marca/unidad de negocio no resuelta se queda pendiente para asignación manual en pantalla, nunca crea una entrada de catálogo nueva automáticamente. *Base:* evita que un typo en el archivo contamine el catálogo con marcas o unidades de negocio basura. *Riesgo:* si el volumen de filas no resueltas es alto en la práctica, esta pantalla de resolución manual puede volverse el cuello de botella que la spec quiere evitar — en ese caso convendría revisar si se permite creación asistida de catálogo en un ciclo posterior.
- **suposición tomada** — un VIN duplicado siempre es error, nunca actualización del vehículo existente. *Base:* actualizar inventario existente por importación es una operación distinta (edición masiva) que esta spec explícitamente deja fuera de alcance. *Riesgo:* si en la práctica el caso de uso real es "refrescar" un inventario ya cargado, esto obligaría a un ciclo de importación por archivo completamente nuevo cada vez.
- **decisión diferida** — si en el futuro conviene permitir importaciones recurrentes o conectadas a un feed de proveedor, queda fuera de este ciclo (ver *Non-goals*).
- **área no formulable** — no está claro todavía si distintos proveedores entregan el mismo campo con significados sutilmente distintos (p. ej. "modelo" usado como año-modelo en algunos archivos); sospecho que hay una pregunta de mapeo semántico ahí, pero no la puedo formular con precisión sin ver un archivo real de ejemplo.
- **decisión diferida** — este proyecto no tiene constitución ratificada (`02-DOCS/wiki/sdd/constitution.md` en `status: draft`); esta spec no hereda ningún principio formal de calidad, seguridad o UX. Si la constitución se ratifica antes de `plan`, revisar esta spec contra ella.

## Revisions
- 2026-11-17 — Primera versión. Dirección A (importador asistido con revisión previa) y las 4 recomendaciones de resolución de catálogo, permisos, VIN duplicado e importación parcial, aprobadas por el usuario en el chat previo a escribir este documento.
