# Manual técnico — levantar Outlet Autocorp en local

Dirigido a un agente de IA (o persona) que clona este repo y necesita
dejarlo corriendo en una máquina local desde cero. Sigue los pasos en
orden; cada uno asume que el anterior ya funcionó.

## 0. Qué es esto

CRM para un evento comercial multi-dealer (varias agencias/marcas en el
mismo evento). Next.js 14 (App Router) + PostgreSQL vía Prisma + Redux
Toolkit/RTK Query + autenticación JWT por cookies httpOnly + control de
acceso por rol y por unidad de negocio (dealer).

No es un prototipo con datos simulados: todo lo que no sea catálogo o
login es real contra Postgres. No existe `localStorage` ni mock de datos
en el código actual — si ves referencias a eso en `README.md`, están
obsoletas (documentan una versión anterior del proyecto).

## 1. Prerrequisitos

- Node.js (18+; el repo se desarrolló con v24, cualquier LTS reciente sirve).
- PostgreSQL corriendo, accesible por TCP (no solo socket local) — Prisma
  Migrate necesita crear una "shadow database" temporal.
- `npm`.

## 2. Instalar dependencias

```bash
npm install
```

El `postinstall` corre `prisma generate` automáticamente. Si `npm` bloquea
los install-scripts de Prisma (`npm warn install-scripts`), apruébalos
explícitamente:

```bash
npm install-scripts approve @prisma/client @prisma/engines prisma
```

**Importante sobre la versión de Prisma**: el CLI de Prisma en `npm install
prisma` sin fijar versión instala por defecto la rama 8.x/"Developer
Platform" (orientada a su nube, sin `datasource.url` clásico en el
schema). Este proyecto usa el flujo clásico y está fijado a `prisma` y
`@prisma/client` en `6.19.3` en `package.json` — no actualices a `^7` o
`^8` sin adaptar `prisma/schema.prisma` y el flujo de migraciones.

## 3. Base de datos: crear rol y base

Necesitas un usuario de Postgres con permiso `CREATEDB` (Prisma Migrate lo
usa para la shadow database en `migrate dev`). Con un Postgres local recién
instalado (Fedora/Debian/etc., servicio `postgresql`):

```bash
sudo -u postgres psql -c "CREATE ROLE outlet_user WITH LOGIN PASSWORD 'elige-una-password' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE outlet_db OWNER outlet_user;"
```

Si las conexiones TCP a Postgres usan autenticación `ident` (en vez de
`scram-sha-256`/`md5`) en `pg_hba.conf`, el login con usuario/password por
TCP falla. Revisa `pg_hba.conf` (ruta típica `/var/lib/pgsql/data/`) y, si
hace falta, cambia `ident` por `scram-sha-256` en las líneas `host`, luego
`sudo systemctl reload postgresql`.

## 4. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:

```bash
DATABASE_URL="postgresql://outlet_user:elige-una-password@localhost:5432/outlet_db?schema=public"

JWT_ACCESS_SECRET="genera-algo-largo-y-aleatorio"
JWT_REFRESH_SECRET="genera-otro-distinto"

# El refresh token expira en esta fecha exacta (fin del evento), no por
# duración fija desde el login. Debe ser una fecha futura o el login
# funcionará pero las sesiones casi no durarán.
EVENT_END_DATE="2026-12-31T23:59:59-06:00"
```

Generar secretos:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 5. Migraciones

```bash
npm run db:migrate
```

Esto corre `prisma migrate dev`, que aplica todas las migraciones en
`prisma/migrations/` y regenera el cliente. Si falla con un error sobre
"non-interactive environment" al detectar un cambio con advertencia
(pérdida de datos potencial en una tabla que en realidad está vacía), no
hay forma de forzarlo con flags en esta versión — hay que escribir la
migración SQL a mano en `prisma/migrations/<timestamp>_<nombre>/migration.sql`
siguiendo el mismo formato que las migraciones ya existentes, y aplicarla
con `npx prisma migrate deploy` (ese comando no es interactivo).

## 6. Sembrar datos mínimos

Sin esto no hay ningún usuario con el que iniciar sesión — la base migrada
está completamente vacía.

```bash
SEED_ADMIN_EMAIL="admin@tuevento.mx" SEED_ADMIN_PASSWORD="una-password-de-8+caracteres" npm run db:seed
```

Esto crea (ver `prisma/seed.js` para el detalle completo y las variables
opcionales `SEED_ADMIN_NOMBRE`/`SEED_MARCA_NOMBRE`/`SEED_UNIDAD_NOMBRE`):
- Los 4 `tipo_usuario` (Administrador, Gerente, Vendedor, Hostes).
- La matriz completa de permisos (8 recursos × 4 acciones) — vacía de
  asignaciones; el rol Administrador no la necesita (tiene bypass total
  en el servidor, ver §8).
- Una marca y una unidad de negocio placeholder.
- Un usuario con rol Administrador, con el email/password que diste.

Es idempotente: correrlo de nuevo con el mismo email solo actualiza la
contraseña.

## 7. Levantar el servidor

```bash
npm run dev
```

Por defecto en `http://localhost:3000`. Si el puerto ya está ocupado,
Next.js salta automáticamente a 3001 y lo avisa en la salida — revisa el
log, no asumas el puerto.

Entra con el email/password que sembraste en el paso 6. El sidebar debe
mostrar todas las secciones (Administrador ve todo).

## 8. Cómo verificar que quedó bien (sin navegador)

```bash
curl -s -c /tmp/cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@tuevento.mx","password":"una-password-de-8+caracteres"}'
```

Debe responder 200 con un JSON que incluye `"esAdministrador":true`. Con
esa cookie, cualquier endpoint debe responder:

```bash
curl -s -b /tmp/cookies.txt http://localhost:3000/api/vehiculos
curl -s -b /tmp/cookies.txt http://localhost:3000/api/catalogos/marca
```

## 9. Arquitectura, en una página

- **Auth**: JWT access (corto, ~1h) + refresh (vive hasta `EVENT_END_DATE`)
  en cookies `httpOnly`. Rutas en `src/app/api/auth/`. Helpers en
  `src/lib/auth/` (`jwt.js`, `password.js` con bcryptjs, `cookies.js`,
  `rateLimit.js` — 5 intentos fallidos/15min **en memoria**, se reinicia
  si reinicias el servidor, `bitacora.js` — auditoría de escrituras).
- **Autorización**: `src/lib/auth/authorize.js` → `requirePermiso(recurso,
  accion)` al inicio de cada route handler que escribe o lee datos
  operacionales. El `tipoUsuario` llamado exactamente `"Administrador"`
  tiene bypass total (sin esto, la primera vez que se activa esto nadie
  podría entrar a asignar permisos). Todo lo demás es deny-by-default:
  si un rol no tiene el permiso asignado en la matriz, 403.
- **Aislamiento por unidad de negocio**: usuario/vehículo/cliente/
  guardia/actividad/demo se filtran por `unidadNegocioId` del usuario que
  hace la petición (salvo Administrador, que ve todo). Un no-Administrador
  no puede crear ni mover nada a otra unidad — el servidor lo fuerza,
  ignora lo que mande el body.
- **Middleware** (`src/middleware.js`): corre en Edge runtime, por eso
  *solo* valida firma+expiración del JWT, no `tokenVersion` (eso
  necesita Prisma, que no corre en Edge). La revocación real (logout,
  reset de password) vive en `/api/auth/verify`, que sí corre en Node.js
  runtime y sí consulta la base.
- **Catálogos**: `src/lib/catalogos/config.js` define una whitelist de
  campos por catálogo; `/api/catalogos/[tipo]` es un CRUD genérico sobre
  esa whitelist. **Nunca se paginan** — son listas chicas que alimentan
  `<select>` en el resto de la app.
- **Paginación**: opt-in vía `?page=&pageSize=` en
  usuarios/vehiculos/clientes/guardias/actividades/demos. Sin esos query
  params, la misma ruta devuelve el arreglo plano de siempre (así los
  `<select>` que usan estas rutas como fuente de opciones no se rompen).
- **Permisos en la UI**: `src/store/features/auth/usePermiso.js` lee
  `esAdministrador`/`permisos` (que ya vienen en la respuesta de
  login/verify) y expone `puede(recurso, accion)`. Se usa para
  ocultar botones y secciones del sidebar — nunca es la autorización real,
  solo evita mostrar algo que el servidor de todos modos rechazaría.
- **Estado**: Redux Toolkit + RTK Query (`src/store/`). El wrapper
  `baseQueryWithReauth` en `src/store/services/apiSlice.js` reintenta con
  `/api/auth/refresh` en un 401 (con `Mutex` para no disparar refresh
  duplicados) antes de rendirse y hacer logout.
- **Lo que falta a propósito** (no es un bug, es alcance no construido):
  `Negocio` (el cierre de venta real) no tiene API ni UI — `Demo` (prueba
  de manejo) sí existe completa. Sin paginación real en Catálogos ni
  auditoría de lecturas (solo de escrituras). Sin pruebas automatizadas.

## 10. Problemas comunes

- **`EADDRINUSE` / Next arranca en 3001 en vez de 3000**: algo ya está
  escuchando en 3000 (otra instancia de `next dev` que no se cerró). Mata
  el proceso correcto, no asumas cuál: `ps aux | grep next` antes de
  matar nada.
- **`P1012` / "the datasource property url is no longer supported"**:
  Prisma se actualizó solo a la rama 8.x. Reinstala la versión fijada:
  `npm install prisma@6.19.3 @prisma/client@6.19.3`.
- **Login da 401 con credenciales correctas, repetidamente**: revisa si
  ya agotaste el rate limit (5 intentos fallidos/15min, por email). Como
  es en memoria, reiniciar `npm run dev` lo limpia.
- **Un catálogo usado como `<select>` aparece vacío o trunco**: confirma
  que la llamada a `useGetCatalogoQuery(...)` no le esté pasando
  `page`/`pageSize` — los catálogos no deben paginarse nunca (§9).
