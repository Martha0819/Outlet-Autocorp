# FTD — Diseño Responsivo Multidispositivo (Pantallas Grandes, Pequeñas y Celular)

## Intención
Hacer que toda la aplicación Outlet Autocorp CRM sea 100% responsiva, ofreciendo una experiencia fluida, estética y totalmente operativa tanto en monitores de alta resolución (pantallas grandes >1400px), laptops/tabletas medianas y pequeñas (768px - 1200px), como en dispositivos móviles y celulares (<768px).

## Alcance
1. **Layout y Navegación Global**:
   - Menú lateral (Sidebar) con drawer deslizable y botón hamburguesa en `AppHeader` para pantallas móviles (<768px).
   - Fondo oscuro/backdrop interactivo para cerrar el menú en celular al tocar fuera o al navegar.
   - Contenedor principal con limitador fluido (`max-width: 1600px; margin: 0 auto`) para evitar estiramientos excesivos en pantallas grandes y ultrawide.
2. **Dashboard (Vista General)**:
   - Rejilla de 6 KPIs auto-adaptable: 6 columnas en pantallas grandes, 3 columnas en laptops/tabletas y 2 columnas en celulares con tipografía ajustada.
   - Barra de herramientas con filtros de periodo y botones de acción rápida ajustados a columnas táctiles en móvil.
   - Gráfica SVG de ventas y Embudo de conversión fluidos al 100% de ancho.
   - Sección inferior de guardias y actividades en cuadrícula colapsable a 1 columna en móvil.
3. **Guardias y Actividades**:
   - Calendario semanal con columnas adaptadas: en móvil, columnas con desplazamiento horizontal táctil suave (`scroll-snap`) para consultar viernes, sábado y domingo con comodidad.
   - Tarjetas de actividades en rejilla responsiva fluida (`repeat(auto-fill, minmax(240px, 1fr))`).
   - Popover de guardia adaptado para pantallas táctiles y escritorio sin desbordar el viewport.
4. **Directorio de Clientes**:
   - Barra de búsqueda y filtros apilables en móvil.
   - Contenedor de tabla con `overflow-x: auto` e indicador de scroll táctil para preservar la lectura de columnas.
   - Ficha 360 y modales de alta/edición fluidos al ancho del dispositivo con scroll interno.
5. **Modales Globales (Pruebas de Manejo, Clientes, Guardias)**:
   - Formularios en 1 columna en pantallas móviles y 2 columnas en pantallas medianas/grandes.
   - Botones de acción accesibles y cómodos al toque (área mínima táctil de 44px).

## Lista de verificación (Checklist)
- [x] Contexto/Estado de menú móvil en `AppLayoutWrapper` sincronizado con `Sidebar` y `AppHeader`.
- [x] Botón hamburguesa accesible en `AppHeader` visible únicamente en pantallas <= 768px.
- [x] Reglas CSS en `responsive.css` para breakpoints:
  - `@media (min-width: 1440px)` (Pantallas grandes y 2K/4K)
  - `@media (max-width: 1439px) and (min-width: 1025px)` (Laptops medianas)
  - `@media (max-width: 1024px) and (min-width: 769px)` (Tabletas)
  - `@media (max-width: 768px)` (Celulares)
  - `@media (max-width: 480px)` (Celulares pequeños)
- [x] Rejilla de KPIs del Dashboard adaptable a 6 columnas en desktop grande, 3 en laptop/tableta, y 2 en celular.
- [x] Calendario semanal en `GuardiasView` con visualización responsiva (carrusel táctil horizontal con snap en móvil).
- [x] Modales con `max-width: 95vw`, scroll vertical y campos de formulario fluidos.
- [x] Barra de herramientas de Inventario (`/inventario`): buscador y botón `+ Agregar vehículo` apilados fluidamente al 100% en pantallas móviles para eliminar desbordes laterales.

## Evidencia
- Archivo `src/app/responsive.css` creado e importado en `src/app/layout.jsx`.
- Menú lateral deslizable (drawer) con fondo backdrop interactivo para celulares.
- Verificación de HTTP 200 en todas las vistas (`/`, `/guardias`, `/clientes`, `/inventario`).
- Botón `+ Agregar vehículo` contenido al 100% dentro de la tarjeta en vista móvil.

## Siguiente paso
- Solicitar al usuario que pruebe redimensionando la ventana o abriendo en celular para confirmar el comportamiento visual.
