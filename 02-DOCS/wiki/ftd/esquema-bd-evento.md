---
author: equipo
branch: main
status: in-progress
---

# Esquema de base de datos — evento multi-dealer

## Intent

Establecer el esquema relacional (Prisma + PostgreSQL) para el sistema de un
solo evento comercial multi-marca/multi-dealer, a partir del borrador provisto
por el usuario, corregido en: nomenclatura singular consistente, timestamps de
auditoría, enums para estatus/condición de vehículo en lugar de texto libre, y
separación de `condicion` (NUEVO/SEMINUEVO) de `estatus` (disponibilidad).

## Scope

- Alcance confirmado por el usuario: evento real con varios dealers/agencias
  (`unidad_negocio`) y varias marcas participando, no solo Outlet Autocorp.
- Stack: Prisma + PostgreSQL.
- Fuera de alcance por ahora: tablas de financiamiento (`solicitud`,
  `enganche_pago`) que sí existen como conceptos en el prototipo frontend
  actual (`seedData.js`) pero el usuario decidió dejarlas fuera del MVP de BD.
- No incluye migración de datos del prototipo actual (`seedData.js`) ni
  conexión real a una base de datos (no hay `DATABASE_URL` de un Postgres real
  en este entorno).

## Checklist

- [x] Esquema Prisma con las 18 entidades del borrador, corregido — probado con `npx prisma validate`.
- [x] `prisma`/`@prisma/client` instalados en `package.json`.
- [x] `.env.example` con `DATABASE_URL` placeholder documentado.
- [x] Regla de negocio `dioEnganche`/`enganche` (no expresable como constraint nativo de Prisma) documentada y validada en capa de aplicación (`src/lib/validations/negocio.js`).
- [x] Migración inicial aplicada contra una base de datos real — `npx prisma migrate dev --name init` corrió contra Postgres local (`outlet_db`, rol `outlet_user` con `CREATEDB` para la shadow database); las 18 tablas quedaron creadas (verificado con `\dt`).
- [ ] CHECK constraints de Postgres para la regla de enganche añadidos a la migración SQL — pendiente.

## Evidence

- `npx prisma validate` → esquema válido (ver salida de la sesión).
- Revisión de `src/lib/seedData.js` y componentes (`ClientesView`, `GuardiasView`, `InventarioView`) confirmó que el prototipo actual no tiene las entidades `unidad_negocio`/`linea_negocio`; el usuario confirmó que el esquema nuevo representa un negocio distinto (evento multi-dealer), no una migración 1:1 del prototipo.
- `npx prisma migrate dev --name init` aplicado contra Postgres local del usuario (Fedora, servicio `postgresql.service`, rol `outlet_user`, BD `outlet_db`) → migración `20261113221030_init` creada y aplicada; `\dt` confirma las 18 tablas.

## Next

- Añadir manualmente el `CHECK` constraint de la regla de enganche en una migración adicional (`npx prisma migrate dev --create-only` + editar el SQL generado).
- Decidir si/cuándo se conectan los componentes de UI actuales (`InventarioView`, `ClientesView`, `GuardiasView`) a este esquema vía Server Actions, sustituyendo `StoreContext`/`seedData.js`.
