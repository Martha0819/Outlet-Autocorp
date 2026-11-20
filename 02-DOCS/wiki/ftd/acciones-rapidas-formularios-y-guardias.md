# FTD: Acciones Rápidas, Formularios Operativos y Guardias Libres

## 1. Intención
Adaptar la interfaz operativa del Outlet para agilizar el flujo de atención al cliente en piso:
1. Renombrar "Crear solicitud" a "Solicitud de crédito" y "Programar prueba" a "Prueba Demo".
2. Integrar botones de acciones rápidas en la tabla de clientes (Venta, Solicitud, Demo, Enganche).
3. Habilitar captura de Asesor y Responsable como texto libre en Guardias y Actividades, agregando correo y teléfono en guardias y suprimiendo el campo de estado en actividades.
4. Agregar el campo de "Número de acompañantes" al registrar/editar clientes.
5. Permitir la apertura directa de formularios desde la barra de herramientas del Dashboard con buscador de cliente por texto.

## 2. Alcance
- **Modelos y Base de Datos**:
  - `guardia`: campos `asesor_nombre`, `asesor_correo`, `asesor_telefono`, `usuario_id` nullable.
  - `actividad`: campo `responsable_nombre`.
  - `cliente`: campo `numero_acompanantes` (entero, por defecto 0).
- **APIs**:
  - `/api/guardias`: soporte para alta y edición con asesor libre, teléfono y correo.
  - `/api/actividades`: soporte para responsable libre y omisión de estatus manual en alta.
  - `/api/clientes`: persistencia y lectura de `numeroAcompanantes`.
- **Componentes**:
  - `DashboardView.jsx`: botones renombrados y conectados a modales con buscador de clientes.
  - `ClientesView.jsx`: acciones rápidas en tabla, campo de acompañantes y textos actualizados en Ficha 360.
  - `GuardiasView.jsx`: modal con inputs de texto libre, correo, teléfono y visualización enriquecida en tarjetas y popovers.
  - `NegocioModal.jsx`: buscador interactivo de cliente por texto y soporte para 'solicitud', 'venta' y 'enganche'.
  - `TestDriveModal.jsx`: buscador interactivo de cliente por texto.

## 3. Checklist de Verificación
- [x] Columnas agregadas a base de datos PostgreSQL y Prisma Client actualizado (`npx prisma generate`).
- [x] APIs `/api/guardias`, `/api/actividades`, `/api/clientes` probadas y guardando datos reales.
- [x] Botones de Dashboard abren modales correspondientes con selector/buscador de cliente.
- [x] Columna ACCIONES en tabla de clientes cuenta con accesos rápidos a Venta, Solicitud, Demo y Enganche.
- [x] Guardias y Actividades admiten texto libre sin restringirse al catálogo de usuarios.
- [x] Acompañantes visible en formulario, tabla y Ficha 360.

## 4. Evidencia
- Servidor dev operativo en `http://localhost:3001`.
- Consultas y persistencia validadas contra PostgreSQL local `outlet_db`.
