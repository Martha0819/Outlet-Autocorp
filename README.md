# Outlet Autocorp — Mini CRM para Outlet de Autos

Sistema de administración comercial, seguimiento de clientes, control de inventario de vehículos, programación de guardias y gestión de actividades operativas diseñado específicamente para un **outlet automotriz de autos seminuevos y garantizados**.

---

## 🌟 Los 4 Diseños Disponibles (Coexistentes y Conectados)

El proyecto ofrece **cuatro opciones de diseño visual y de experiencia de usuario**, todas interconectadas y compartiendo la misma base de datos reactiva en `localStorage` (`outlet_autocorp_data_v1`):

| Opción | Estilo / Filosofía | Archivo de Acceso | Representación de KPIs | Innovación en Vistas |
|---|---|---|---|---|
| **Diseño 1** | **Clásico Institucional** | [**`index.html`**](file:///c:/Users/mktpsf/Desktop/Outlet%20Autocorp/index.html) | **Tarjetas Clásicas Verticales** con iconos, valor en negrita y etiquetas delta de periodo. | Menú lateral permanente `#251f1d`, tabla detallada de clientes, catálogo 4:3 y calendario tradicional. |
| **Diseño 2** | **Executive Showroom Studio** | [**`diseno2/index.html`**](file:///c:/Users/mktpsf/Desktop/Outlet%20Autocorp/diseno2/index.html) | **Medidores Radiales, Anillos Donut y Velocímetro de Ventas (SVG)** con aguja de meta y telemetría de caja. | **Master-Detail Split Screen** en Clientes (directorio a la izquierda y expediente 360 en vivo a la derecha), **Tarjetas Horizontales Widescreen 16:9** en Inventario y **Tablero Kanban de 3 columnas** en Actividades. |
| **Diseño 3** | **Titanium Glass Studio** | [**`diseno3/index.html`**](file:///c:/Users/mktpsf/Desktop/Outlet%20Autocorp/diseno3/index.html) | **Matriz Holográfica Titanium Glass**: Tarjetas de cristal translúcido con barras dinámicas de cuota, niveles de lote y boveda líquida. | **Línea de Tiempo Operativa (Timeline de Guardias)**, **Actividades en Cristal 3D**, **CRM de Matriz de Prospectos con Semáforo de Intención** (`🔥 Alta`, `⚡ Media`, `❄️ Exploratoria`) y **Showroom Grid en Cristal**. |
| **Diseño 4** | **Carbon VIP Performance Lounge** | [**`diseno4/index.html`**](file:///c:/Users/mktpsf/Desktop/Outlet%20Autocorp/diseno4/index.html) | **Instrument Cluster Digital HUD**: Tacómetro RPM de Ventas, Barra LED de Tanque para Lote, Sport Chrono Dial y Radar Sonar. | **Conmutador Día/Noche en Vivo (`☀️ Modo Día / 🌙 Modo Noche`)**, **VIP Black Book** con insignias Platinum/Gold y botones directos (Llamar, WhatsApp), **Supercar Showroom Pods** y **Consola Táctica con 3D Flip Cards**. |

> **Conmutador Universal**: En la parte superior de cada uno de los 4 diseños encontrarás una barra de navegación que te permite saltar a cualquiera de las otras versiones con un solo clic.

---

## 1. Identidad Visual y Diseño

Toda la plataforma sigue estrictamente la identidad corporativa requerida:

- **Tipografía**:
  - **Montserrat** (alternativa autorizada a Gotham) cargada mediante Google Fonts con todas sus variantes de peso y estilo.
  - **Normal (`font-weight: 400`)**: Textos generales, formularios, tablas y leyendas.
  - **Itálica (`font-style: italic`)**: Notas comerciales, observaciones de vehículos, comentarios de clientes y bitácora.
  - **Negritas (`font-weight: 700 / 800`)**: Títulos, encabezados, botones, importes y valores principales de los KPIs.
  - **Itálica Negritas (`font-weight: 700; font-style: italic`)**: Avisos destacados, advertencias de duplicados y notas financieras de enganches.
- **Paleta de Colores**:
  - **Naranja `#ff8901`**: Acciones principales, iconos representativos, indicadores clave, estados seleccionados y elementos activos.
  - **Gris claro `#f6f6f6`**: Fondo general de la aplicación, superficies secundarias, pistas de barras y fondos de celdas.
  - **Oscuro `#251f1d`**: Encabezados principales, textos de alto contraste y fondo del menú lateral permanente.
- **Estilo de la Interfaz**:
  - Tarjetas con bordes redondeados y sombras discretas.
  - Botones principales en `#ff8901` con texto en `#251f1d` y tipografía en negrita.
  - Estados identificados mediante **texto, iconos y color** (Disponible, Apartado, Vendido; Pendiente, En proceso, Completada).
  - Animaciones suaves de entrada y respeto a `prefers-reduced-motion`.

---

## 2. Navegación Principal

La aplicación está estructurada en **cuatro vistas principales**:

1. **General (Dashboard)**
2. **Guardias y actividades** (Subsecciones: *Calendario de guardias* y *Tarjetas de actividades*)
3. **Clientes** (Directorio, búsqueda, detección de duplicados y Ficha 360)
4. **Inventario** (Catálogo con conmutador *Tarjetas / Tabla*, filtros avanzados y Ficha 360 del auto)

---

## 3. Vista General — Dashboard (Mejorada en Todos los Diseños)

Proporciona un panorama comercial inmediato y en tiempo real:

### 6 Indicadores Clave (KPIs)
| Indicador | Descripción | Conexión comercial |
|---|---|---|
| **Invitados** | Total de visitas registradas en el showroom durante el periodo. | Alimenta tanto clientes nuevos como visitas subsecuentes del mismo cliente. Incluye comparativa `% vs periodo anterior`. |
| **Inventario** | Número de vehículos disponibles actualmente en patio y sala. | **Refleja disponibilidad actual en tiempo real**, además de indicar unidades apartadas y el lote total. |
| **Pruebas de manejo** | Pruebas realizadas vs programadas en el periodo. | Cuenta citas agendadas y completadas para evaluación dinámica. |
| **Solicitudes** | Total de solicitudes de financiamiento o compra y cuántas están en estatus *Pendiente*. | Mide el volumen de expedientes ingresados a mesa de crédito o bancos. |
| **Enganche** | Monto acumulado de enganches efectivamente **recibidos** en caja en el periodo. | **Diferencia claramente el enganche estimado del enganche cobrado**. Solo los pagos reales suman a este KPI. |
| **Ventas** | Número de unidades vendidas y monto total facturado en **pesos mexicanos (MXN)**. | Al registrar una venta, el vehículo pasa automáticamente a *Vendido* y los importes se consolidan aquí. |

*Cada tarjeta de KPI es interactiva: al hacer clic, redirige automáticamente a la vista correspondiente.*

### Filtros y Gráficas
- Filtros de fecha: **Hoy**, **Esta semana**, **Este mes** y **Rango personalizado**.
- **Gráfica de Ventas por Periodo**: Gráfica vectorial SVG con curva de ingresos acumulados en MXN y tooltips interactivos con cantidad de unidades y fecha.
- **Gráfica de Seguimiento Comercial (Embudo)**: Mide el embudo `Invitados → Pruebas de manejo → Solicitudes → Ventas` con cálculo porcentual de conversión.
- Listas de próximas pruebas de manejo y actividades operativas.
- Botones de acción rápida: *Registrar invitado*, *Programar prueba*, *Crear solicitud*, *Registrar venta*.

---

## 4. Vista Guardias y Actividades

### A. Calendario de Guardias
- Conmutador entre **Vista Mensual** y **Vista Semanal**.
- Píldoras con iniciales/avatares del asesor, color institucional distintivo, horario y nombre.
- Resaltado visual del día actual con distintivo circular naranja y etiqueta *Hoy*.
- Tarjeta flotante (*popover*) al posar el cursor con: responsable, fecha, horario, celular, correo, área y observaciones.
- Clic en fecha para crear guardia y clic en guardia existente para consultar/editar.

### B. Tarjetas de Actividades (Efecto 3D Flip)
- Cuadrícula con iconos representativos: **Seguridad** (escudo), **Limpieza** (escoba), **Apertura** (llave), **Cierre** (candado), **Revisión de vehículos** (auto con herramienta), **Recepción de clientes** (saludo/persona) y **Gestión / Auditoría** (portapapeles).
- Frente: Icono, nombre, estatus (*Pendiente*, *En proceso*, *Completada*), horario y fecha.
- Reverso: Gira en 3D para revelar descripción, observaciones en itálica, selector rápido de estatus y botón de edición.

---

## 5. Vista Clientes

- **Tabla Principal**: Columnas requeridas: `NOMBRE DE CLIENTE`, `CELULAR`, `CORREO`, `¿VISITA UNA MARCA EN ESPECÍFICO?`, `COMENTARIOS` y `ACCIONES`.
- **Buscador en tiempo real** por nombre, teléfono o correo.
- **Detección y aviso de duplicados en tiempo real**: Advierte si ya existe un cliente con ese celular o correo.
- **Ficha 360 del Cliente**:
  - Datos de contacto y preferencias de marca.
  - Línea de tiempo de visitas (permite registrar visitas sin duplicar ficha).
  - Historial de pruebas de manejo, solicitudes de crédito, enganches cobrados y compras realizadas.
  - Acciones comerciales directas sin abandonar la vista.

---

## 6. Vista Inventario

- Conmutador entre **Tarjetas (Grid)** y **Tabla detallada**.
- Por defecto muestra **Disponibles**, con filtros para *Apartados*, *Vendidos* y *Todos*.
- Información completa: fotos, ID inventario (`OUT-2024-XXX`), marca, modelo, versión, año, color, km, transmisión, combustible, precio en MXN, enganche estimado en MXN y observaciones.
- Filtros por marca, modelo, transmisión, rango de precio y ordenamiento.
- Ficha 360 del auto con galería fotográfica, especificaciones completas, prospectos vinculados y acciones para *Apartar* y *Vender*.

---

## 7. Instrucciones para Ejecutar

### Opción A: Visualización Inmediata en Navegador (Sin dependencias)
1. Abre la carpeta `C:\Users\mktpsf\Desktop\Outlet Autocorp\`.
2. Puedes abrir cualquiera de los 4 diseños en tu navegador:
   - **Diseño 1 (Clásico)**: Haz doble clic en [**`index.html`**](file:///c:/Users/mktpsf/Desktop/Outlet%20Autocorp/index.html).
   - **Diseño 2 (Executive Studio)**: Haz doble clic en [**`diseno2/index.html`**](file:///c:/Users/mktpsf/Desktop/Outlet%20Autocorp/diseno2/index.html).
   - **Diseño 3 (Titanium Glass Studio)**: Haz doble clic en [**`diseno3/index.html`**](file:///c:/Users/mktpsf/Desktop/Outlet%20Autocorp/diseno3/index.html).
   - **Diseño 4 (Carbon VIP con Modo Día/Noche)**: Haz doble clic en [**`diseno4/index.html`**](file:///c:/Users/mktpsf/Desktop/Outlet%20Autocorp/diseno4/index.html).
3. Utiliza la barra superior de cada pantalla para alternar al instante entre cualquier diseño.

### Opción B: Proyecto Next.js 14+ (App Router con React)
El proyecto cuenta con la estructura modular completa en `src/`:
- **Contexto y Estado Global**: `src/context/StoreContext.jsx` con persistencia en `localStorage`.
- **Vistas y Páginas**: `src/app/page.jsx` (Dashboard), `src/app/guardias/page.jsx`, `src/app/clientes/page.jsx`, `src/app/inventario/page.jsx`.
- **Componentes Modulares**: `src/components/general/`, `src/components/guardias/`, `src/components/clientes/`, `src/components/inventario/`, `src/components/layout/`, `src/components/ui/`.
- **Utilidades & Semilla de Datos**: `src/lib/utils.js` (formato MXN, fechas, cálculo de periodos) y `src/lib/seedData.js`.

Para ejecutar en entorno Node.js:
```bash
npm install
npm run dev
```
La aplicación iniciará en `http://localhost:3000`.
