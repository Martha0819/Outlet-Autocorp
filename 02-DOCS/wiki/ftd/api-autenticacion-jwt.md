---
author: equipo
branch: main
status: in-progress
---

# API de autenticación — JWT access/refresh por cookies

## Intent

Diseñar e implementar la API de autenticación para el evento: login con JWT
access+refresh en cookies `httpOnly`, logout que revoca el refresh (no solo
borra la cookie), y un endpoint `verify` para que el middleware de Next.js
proteja rutas completas.

## Scope

Decisiones resueltas con el usuario antes de implementar:
- Revocación: `tokenVersion` en `Usuario` (incrementa en logout, invalida
  todos los tokens viejos de ese usuario — simple, sin tabla extra; cierra
  sesión en todos los dispositivos a la vez, aceptable para el evento).
- Duración: access 1h; refresh expira en `EVENT_END_DATE` (env var), no por
  duración fija.
- Hashing: `bcryptjs` (sin binarios nativos).
- Uso de `verify`: proteger rutas vía Next.js Middleware (Edge runtime).

Fuera de alcance: UI de login real (el `/login` actual sigue siendo mock con
`StoreContext`, sin conectar a esta API — queda en Next), "¿olvidé mi
contraseña?" real, rate-limiting de login.

### Decisión de arquitectura no preguntada explícitamente

Next.js Middleware corre en Edge runtime, que no soporta Prisma (requiere
Node.js runtime). Por eso el middleware (`src/middleware.js`) solo valida
firma+expiración del access token con `jose` — **no** consulta `tokenVersion`
en BD. La revocación real ocurre en `/api/auth/verify` (Node.js runtime, sí
usa Prisma). Efecto práctico: tras un logout, el middleware puede dejar
renderizar el cascarón de una página protegida hasta por 1h con un token ya
revocado, pero esa página no puede traer datos reales sin pasar por una ruta
que haga el chequeo completo. Ver comentario en `src/middleware.js`.

## Checklist

- [x] `Usuario.passwordHash` y `Usuario.tokenVersion` añadidos al schema — migración `20261113221753_auth_usuario_password` aplicada.
- [x] `src/lib/auth/{config,jwt,password,cookies}.js` — helpers de JWT (jose), hashing (bcryptjs) y cookies.
- [x] `POST /api/auth/login` — probado con curl: devuelve 200, setea `access_token` (Max-Age=3600) y `refresh_token` (Max-Age hasta `EVENT_END_DATE`).
- [x] `GET /api/auth/verify` — probado: 401 sin cookie, 200 con sesión válida.
- [x] `POST /api/auth/refresh` — probado: emite un access token nuevo a partir del refresh.
- [x] `POST /api/auth/logout` — probado: incrementa `tokenVersion`, borra ambas cookies.
- [x] Revocación real (no solo cookie) — probado reusando manualmente un access token capturado antes del logout: después del logout ese mismo token devuelve `authenticated:false`.
- [x] `src/middleware.js` — probado: `/` sin cookie redirige 307 a `/login`; `/login` sin cookie responde 200.
- [x] `npm run build` — compila sin errores (solo warnings benignos de `jose` sobre APIs de compresión que no usamos).

## Evidence

Sesión de pruebas con curl contra `npm run dev`, usuario de prueba sembrado y
eliminado al terminar (`test@outlet.mx`, catálogos mínimos `Marca`,
`UnidadNegocio`, `TipoUsuario`):
- Login → `set-cookie` con ambos tokens, body con datos del usuario (sin
  password).
- Verify con sesión → `{"authenticated":true,...}`.
- Refresh → nuevo `access_token` en `set-cookie`.
- Logout → `set-cookie` con `Max-Age=0` en ambas cookies.
- Verify después de logout, **reusando el access token viejo capturado antes
  del logout** → `{"authenticated":false}` (confirma que la revocación es por
  `tokenVersion`, no solo por borrar la cookie del navegador).
- Middleware: `GET /` sin cookie → 307 a `/login`; `GET /login` sin cookie →
  200.
- `npm run build` exitoso, incluyendo las 4 rutas de `/api/auth/*` y el
  middleware (31.6 kB, corre en Edge).

## Next

- Definir qué pasa con el formulario de registro/alta de `Usuario` (hoy no
  existe ningún endpoint para crear usuarios con password).

## Actualización — Redux/RTK Query + huecos de UI encontrados y resueltos

Al pedir el usuario validar "¿el verify o el middleware ya cubren todas las
vistas logueadas?", se encontraron y corrigieron tres huecos reales que el
middleware por sí solo no resolvía (vivían en la capa de UI):

1. `AppHeader`/`Sidebar` seguían leyendo `currentUser` de `StoreContext`
   (mock, nunca actualizado por el login real) → ahora leen `auth.usuario`
   de Redux.
2. El botón "Salir" llamaba al `logout()` mock, sin revocar la sesión real
   → ahora usa `useLogout` (`src/store/features/auth/useLogout.js`), que
   llama `POST /api/auth/logout`.
3. El estado de Redux no sobrevive un refresh de página (memoria del
   navegador) aunque la cookie siga viva → `AppLayoutWrapper.jsx` llama
   `useVerifyQuery` y rehidrata `auth.usuario` cuando `isAuthenticated` es
   falso.

Se agregó `tipoUsuarioNombre` a las respuestas de `/api/auth/login` y
`/api/auth/verify` (join con `tipoUsuario`) para mostrar un rol legible en
vez del ID crudo.

Infraestructura Redux creada en el camino (a petición del usuario, con
patrones que compartió y se adaptaron a JS + a este dominio):
`src/store/{store.js,hooks.js,ReduxProvider.jsx,services/apiSlice.js,features/auth/{authSlice,authApiSlice,useLogin,useLogout}.js}`,
montado en `layout.jsx`. Se descartó a propósito `alertSlice` (duplica el
`Toast` existente) y `changeUnidad`/`persistUnidadMiddleware` (sin feature
que lo necesite todavía).

### Evidencia adicional

- Login/verify/logout probados contra el usuario real
  `coordinador.crm@autocorp.mx` (no un usuario de prueba descartable): el
  `tipoUsuarioNombre` devuelto es "Administrador", como corresponde.
- `GET /` sin cookie → 307 a `/login` (gate confirmado).
- **Limitación de la prueba**: `curl` no ejecuta JS, así que no puede
  confirmar que el header realmente muestre "Coordinador CRM" tras hidratar
  — solo que el servidor no bloqueó la página (middleware ya validó la
  cookie) y que el HTML del shell inicial carga sin usuario (esperado antes
  de la hidratación). Falta una verificación visual en navegador real.
