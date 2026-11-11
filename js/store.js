/**
 * @fileoverview Motor de Datos Reactivo y Persistente (Store) para Outlet Autocorp Mini CRM
 * 
 * Centraliza el estado de la aplicación implementando el patrón Observer (Pub/Sub).
 * Gestiona el almacenamiento local (localStorage) y garantiza la integridad referencial
 * entre vehículos, clientes, visitas, guardias, pruebas de manejo, solicitudes,
 * enganches efectivamente recibidos y ventas concluidas.
 * 
 * @module store
 */

import { generateId, getTodayISO } from './utils.js';

const STORAGE_KEY = 'outlet_autocorp_data_v1';

/**
 * Genera una fecha ISO relativa a la fecha actual para asegurar que los datos
 * de demostración siempre se ubiquen coherentemente alrededor de "Hoy".
 * 
 * @param {number} [offsetDays=0] - Días de desplazamiento (-30 para pasado, +10 para futuro).
 * @returns {string} Fecha en formato ISO YYYY-MM-DD.
 */
function getRelDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Genera el conjunto inicial de datos ficticios realistas para un outlet automotriz en México.
 * 
 * @returns {Object} Estructura inicial completa del CRM.
 */
export function getInitialData() {
  const today = getTodayISO();

  const vehicles = [
    {
      id: 'veh-1',
      inventoryId: 'OUT-2024-001',
      brand: 'Nissan',
      model: 'Versa',
      version: 'Exclusive CVT',
      year: 2023,
      color: 'Plata Metálico',
      mileage: 28500,
      transmission: 'Automática',
      fuel: 'Gasolina',
      price: 329000,
      estimatedDownPayment: 65800,
      status: 'disponible',
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Único dueño, factura original de agencia, servicios de agencia al corriente, interiores en piel impecables.',
      dateAdded: getRelDate(-40),
      interestedClientIds: ['cli-1', 'cli-4']
    },
    {
      id: 'veh-2',
      inventoryId: 'OUT-2024-002',
      brand: 'Mazda',
      model: 'Mazda 3 Sedán',
      version: 'i Grand Touring',
      year: 2022,
      color: 'Rojo Soul Red',
      mileage: 34200,
      transmission: 'Automática',
      fuel: 'Gasolina',
      price: 398000,
      estimatedDownPayment: 79600,
      status: 'disponible',
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Sonido Bose de 12 bocinas, quemacocos eléctrico, head-up display, llantas con 80% de vida útil.',
      dateAdded: getRelDate(-30),
      interestedClientIds: ['cli-2']
    },
    {
      id: 'veh-3',
      inventoryId: 'OUT-2024-003',
      brand: 'Volkswagen',
      model: 'Jetta',
      version: 'R-Line 1.4 TSI',
      year: 2021,
      color: 'Blanco Puro',
      mileage: 45000,
      transmission: 'Automática Tiptronic',
      fuel: 'Gasolina',
      price: 375000,
      estimatedDownPayment: 75000,
      status: 'apartado',
      images: [
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Apartado por Juan Carlos Mendoza con enganche inicial de $35,000 MXN en espera de aprobación bancaria.',
      dateAdded: getRelDate(-25),
      interestedClientIds: ['cli-3']
    },
    {
      id: 'veh-4',
      inventoryId: 'OUT-2024-004',
      brand: 'Toyota',
      model: 'RAV4',
      version: 'XLE Hybrid AWD',
      year: 2023,
      color: 'Gris Grafito',
      mileage: 19800,
      transmission: 'Automática e-CVT',
      fuel: 'Híbrido',
      price: 565000,
      estimatedDownPayment: 113000,
      status: 'disponible',
      images: [
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Rendimiento sobresaliente de hasta 22 km/l en ciudad, garantía de batería híbrida vigente, cámara 360.',
      dateAdded: getRelDate(-15),
      interestedClientIds: ['cli-5']
    },
    {
      id: 'veh-5',
      inventoryId: 'OUT-2024-005',
      brand: 'Ford',
      model: 'Bronco Sport',
      version: 'Big Bend 4x4',
      year: 2022,
      color: 'Azul Glaciar',
      mileage: 31000,
      transmission: 'Automática',
      fuel: 'Gasolina',
      price: 510000,
      estimatedDownPayment: 102000,
      status: 'disponible',
      images: [
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Modos de manejo G.O.A.T., paquete de remolque, rieles para equipaje, llantas todo terreno semi-nuevas.',
      dateAdded: getRelDate(-12),
      interestedClientIds: []
    },
    {
      id: 'veh-6',
      inventoryId: 'OUT-2024-006',
      brand: 'Honda',
      model: 'CR-V',
      version: 'Turbo Plus',
      year: 2020,
      color: 'Plata Lunar',
      mileage: 52000,
      transmission: 'Automática CVT',
      fuel: 'Gasolina',
      price: 445000,
      estimatedDownPayment: 89000,
      status: 'vendido',
      images: [
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Vendido a María Elena Sánchez el ' + getRelDate(-5) + '. Facturación y entrega completada.',
      dateAdded: getRelDate(-50),
      interestedClientIds: []
    },
    {
      id: 'veh-7',
      inventoryId: 'OUT-2024-007',
      brand: 'Chevrolet',
      model: 'Tracker',
      version: 'Premier 1.2T',
      year: 2023,
      color: 'Negro Ónix',
      mileage: 22400,
      transmission: 'Automática',
      fuel: 'Gasolina',
      price: 389000,
      estimatedDownPayment: 77800,
      status: 'disponible',
      images: [
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Techo panorámico, alerta de colisión frontal, cargador inalámbrico para smartphone.',
      dateAdded: getRelDate(-8),
      interestedClientIds: ['cli-1']
    },
    {
      id: 'veh-8',
      inventoryId: 'OUT-2024-008',
      brand: 'KIA',
      model: 'Seltos',
      version: 'EX Pack 1.6L',
      year: 2021,
      color: 'Blanco Perla',
      mileage: 38900,
      transmission: 'Automática',
      fuel: 'Gasolina',
      price: 345000,
      estimatedDownPayment: 69000,
      status: 'disponible',
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Pantalla táctil de 10.25 pulgadas, iluminación ambiental en bocinas, 6 bolsas de aire.',
      dateAdded: getRelDate(-6),
      interestedClientIds: []
    },
    {
      id: 'veh-9',
      inventoryId: 'OUT-2024-009',
      brand: 'Hyundai',
      model: 'Tucson',
      version: 'Limited Tech',
      year: 2022,
      color: 'Gris Titán',
      mileage: 29100,
      transmission: 'Automática',
      fuel: 'Gasolina',
      price: 495000,
      estimatedDownPayment: 99000,
      status: 'apartado',
      images: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Apartado por Fernando Ortega. Enganche recibido de $50,000 MXN.',
      dateAdded: getRelDate(-18),
      interestedClientIds: ['cli-6']
    },
    {
      id: 'veh-10',
      inventoryId: 'OUT-2024-010',
      brand: 'BMW',
      model: 'Serie 3',
      version: '320i M Sport',
      year: 2020,
      color: 'Azul Portimao',
      mileage: 48000,
      transmission: 'Automática Steptronic',
      fuel: 'Gasolina',
      price: 580000,
      estimatedDownPayment: 116000,
      status: 'vendido',
      images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Vendido a Roberto Garza el ' + getRelDate(-2) + '. Entrega en sala VIP efectuada.',
      dateAdded: getRelDate(-35),
      interestedClientIds: []
    },
    {
      id: 'veh-11',
      inventoryId: 'OUT-2024-011',
      brand: 'Seat',
      model: 'Ibiza',
      version: 'FR 1.0 TSI Turbo',
      year: 2023,
      color: 'Rojo Deseo',
      mileage: 16500,
      transmission: 'Manual 6 vel.',
      fuel: 'Gasolina',
      price: 338000,
      estimatedDownPayment: 67600,
      status: 'disponible',
      images: [
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Cuadro de instrumentos digital cockpit, rines 17 pulgadas bitono, asientos deportivos.',
      dateAdded: getRelDate(-4),
      interestedClientIds: []
    },
    {
      id: 'veh-12',
      inventoryId: 'OUT-2024-012',
      brand: 'Jeep',
      model: 'Compass',
      version: 'Limited 4x2',
      year: 2022,
      color: 'Gris Sting',
      mileage: 33000,
      transmission: 'Automática',
      fuel: 'Gasolina',
      price: 469000,
      estimatedDownPayment: 93800,
      status: 'disponible',
      images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
      ],
      observations: 'Interiores en piel bicolor, sonido Alpine premium, asistente de mantenimiento de carril.',
      dateAdded: getRelDate(-2),
      interestedClientIds: []
    }
  ];

  const clients = [
    {
      id: 'cli-1',
      name: 'Rodrigo Morales Valenzuela',
      phone: '5541928374',
      email: 'rodrigo.morales@gmail.com',
      hasBrandPreference: 'si',
      preferredBrand: 'Nissan',
      comments: 'Busca sedán económico para trayectos diarios de oficina. Muy interesado en el Versa Exclusive.',
      dateRegistered: getRelDate(-14),
      visits: [
        { date: getRelDate(-14), notes: 'Primera visita al showroom, conoció el inventario.' },
        { date: getRelDate(-2), notes: 'Segunda visita, solicitó cotización formal con enganche del 25%.' },
        { date: today, notes: 'Visita para prueba de manejo y entrega de comprobantes de ingreso.' }
      ],
      interestedVehicleIds: ['veh-1', 'veh-7']
    },
    {
      id: 'cli-2',
      name: 'Sofía Daniela Castro',
      phone: '5578291034',
      email: 'sofia.castro@outlook.com',
      hasBrandPreference: 'si',
      preferredBrand: 'Mazda',
      comments: 'Le apasiona el diseño del Mazda 3 Sedán color rojo. Desea dejar su auto anterior a cuenta.',
      dateRegistered: getRelDate(-10),
      visits: [
        { date: getRelDate(-10), notes: 'Asistió acompañada de su esposo a revisar el Mazda 3.' },
        { date: getRelDate(-3), notes: 'Trajo su vehículo anterior para valuación comercial.' }
      ],
      interestedVehicleIds: ['veh-2']
    },
    {
      id: 'cli-3',
      name: 'Juan Carlos Mendoza Ríos',
      phone: '5539201948',
      email: 'jcmendoza.rios@empresa.mx',
      hasBrandPreference: 'si',
      preferredBrand: 'Volkswagen',
      comments: 'Cliente con enganche listo de $75,000. Ya apartó el Jetta R-Line.',
      dateRegistered: getRelDate(-20),
      visits: [
        { date: getRelDate(-20), notes: 'Visita de prospección.' },
        { date: getRelDate(-7), notes: 'Visita para entrega de apartado y firma de solicitud de crédito.' }
      ],
      interestedVehicleIds: ['veh-3']
    },
    {
      id: 'cli-4',
      name: 'Carlos Alberto Peralta',
      phone: '5512093847',
      email: 'cperalta.abogado@notaria.com',
      hasBrandPreference: 'no',
      preferredBrand: '',
      comments: 'Busca SUV familiar o sedán espacioso. No tiene preferencia de marca pero prioriza seguridad.',
      dateRegistered: getRelDate(-4),
      visits: [
        { date: getRelDate(-4), notes: 'Revisó varias opciones en patio con el asesor de guardia.' }
      ],
      interestedVehicleIds: ['veh-1', 'veh-4']
    },
    {
      id: 'cli-5',
      name: 'Ana Patricia Luján',
      phone: '5567382910',
      email: 'patricia.lujan@bioquimica.org',
      hasBrandPreference: 'si',
      preferredBrand: 'Toyota',
      comments: 'Interesada específicamente en tecnologías híbridas para circular diario sin restricciones.',
      dateRegistered: getRelDate(-7),
      visits: [
        { date: getRelDate(-7), notes: 'Probó el sistema multimedia de la RAV4 Hybrid.' },
        { date: today, notes: 'Asistió a programar prueba de manejo en carretera.' }
      ],
      interestedVehicleIds: ['veh-4']
    },
    {
      id: 'cli-6',
      name: 'Fernando Ortega Beltrán',
      phone: '5589012345',
      email: 'fortega@constructora.com',
      hasBrandPreference: 'si',
      preferredBrand: 'Hyundai',
      comments: 'Cliente empresarial. Requiere factura fiscal expedida antes de fin de mes.',
      dateRegistered: getRelDate(-18),
      visits: [
        { date: getRelDate(-18), notes: 'Visita inicial con contador para revisar deducción fiscal.' },
        { date: getRelDate(-6), notes: 'Firma de contrato de apartado.' }
      ],
      interestedVehicleIds: ['veh-9']
    },
    {
      id: 'cli-7',
      name: 'Mariana Zepeda Gómez',
      phone: '5523456789',
      email: 'mariana.zepeda@agencia.com',
      hasBrandPreference: 'no',
      preferredBrand: '',
      comments: 'Primera compra de auto seminuevo. Requiere asesoría financiera detallada.',
      dateRegistered: today,
      visits: [
        { date: today, notes: 'Registro de visita nueva en recepción con Sofía Reyes.' }
      ],
      interestedVehicleIds: ['veh-8', 'veh-11']
    }
  ];

  const advisors = [
    { name: 'Carlos Morales', role: 'Asesor Comercial Senior', phone: '5543219876', email: 'carlos.morales@autocorp.mx', color: '#ff8901' },
    { name: 'Sofía Reyes', role: 'Recepción y Atención a Clientes', phone: '5512348765', email: 'sofia.reyes@autocorp.mx', color: '#251f1d' },
    { name: 'Alejandro Peña', role: 'Especialista en Financiamiento', phone: '5567894321', email: 'alejandro.pena@autocorp.mx', color: '#0284c7' },
    { name: 'Mariana Garza', role: 'Asesora de Ventas', phone: '5598761234', email: 'mariana.garza@autocorp.mx', color: '#16a34a' },
    { name: 'Roberto Méndez', role: 'Gerente de Piso y Valuador', phone: '5587654321', email: 'roberto.mendez@autocorp.mx', color: '#9333ea' }
  ];

  const shifts = [];
  const startDayOffset = -15;
  for (let i = startDayOffset; i <= 15; i++) {
    const shiftDate = getRelDate(i);
    const advIndex1 = Math.abs(i) % advisors.length;
    const advIndex2 = (Math.abs(i) + 2) % advisors.length;

    shifts.push({
      id: `shift-${i}-1`,
      date: shiftDate,
      responsible: advisors[advIndex1].name,
      startTime: '09:00',
      endTime: '15:00',
      phone: advisors[advIndex1].phone,
      email: advisors[advIndex1].email,
      area: 'Recepción y Piso de Ventas',
      observations: 'Responsable de apertura puntual, activación de exhibición y recepción del primer turno.',
      color: advisors[advIndex1].color
    });

    shifts.push({
      id: `shift-${i}-2`,
      date: shiftDate,
      responsible: advisors[advIndex2].name,
      startTime: '14:30',
      endTime: '20:30',
      phone: advisors[advIndex2].phone,
      email: advisors[advIndex2].email,
      area: 'Cierre y Supervisión de Patio',
      observations: 'Responsable de cierre de caja, resguardo de llaves y activación del sistema de alarma.',
      color: advisors[advIndex2].color
    });
  }

  const activities = [
    {
      id: 'act-1',
      title: 'Apertura de instalaciones y encendido de salas',
      iconType: 'apertura',
      description: 'Desarmado de alarma perimetral, apertura de acceso principal, verificación de iluminación y encendido de pantallas del showroom.',
      responsible: 'Carlos Morales',
      date: today,
      time: '08:45',
      status: 'completada',
      observations: 'Apertura sin incidentes. Todas las pantallas de bienvenida funcionando correctamente.'
    },
    {
      id: 'act-2',
      title: 'Revisión técnica de autos en exhibición exterior',
      iconType: 'revision',
      description: 'Inspección visual de presión de neumáticos, limpieza de cristales y nivel de carga de baterías en unidades del patio.',
      responsible: 'Roberto Méndez',
      date: today,
      time: '10:00',
      status: 'en_proceso',
      observations: 'Se detectó batería baja en Jeep Compass OUT-2024-012; ya se colocó cargador lento de apoyo.'
    },
    {
      id: 'act-3',
      title: 'Limpieza y sanitización de áreas comunes',
      iconType: 'limpieza',
      description: 'Limpieza de módulos de atención, aspirado de sala VIP de firmas y desinfección de volantes para pruebas de manejo.',
      responsible: 'Sofía Reyes',
      date: today,
      time: '11:30',
      status: 'pendiente',
      observations: 'Programada antes de las primeras visitas de prueba de manejo del mediodía.'
    },
    {
      id: 'act-4',
      title: 'Recepción y bienvenida a clientes matutinos',
      iconType: 'recepcion',
      description: 'Asignación inmediata de asesores, ofrecimiento de barra de café y registro de datos en el sistema CRM.',
      responsible: 'Sofía Reyes',
      date: today,
      time: '12:00',
      status: 'en_proceso',
      observations: 'Excelente afluencia matutina, 3 invitados registrados hasta ahora.'
    },
    {
      id: 'act-5',
      title: 'Auditoría y control de resguardo de llaves',
      iconType: 'seguridad',
      description: 'Conteo físico de llaves maestras y duplicados en caja fuerte contra el inventario activo disponible.',
      responsible: 'Alejandro Peña',
      date: today,
      time: '17:00',
      status: 'pendiente',
      observations: 'Revisión obligatoria diaria para cumplir con la póliza de seguro del lote.'
    },
    {
      id: 'act-6',
      title: 'Cierre de sucursal, corte de caja y bloqueo de rejas',
      iconType: 'cierre',
      description: 'Arqueo de ingresos por apartado/enganche, apagado de luces, cierre perimetral y activación de monitoreo de seguridad.',
      responsible: 'Roberto Méndez',
      date: today,
      time: '20:15',
      status: 'pendiente',
      observations: 'Verificar doble cerradura en acceso a almacén de placas y expedientes.'
    },
    {
      id: 'act-7',
      title: 'Valuación y peritaje mecánico de seminuevos por recibir',
      iconType: 'revision',
      description: 'Escaneo OBD2 y revisión de hojalatería de 2 vehículos que clientes desean dejar a cuenta.',
      responsible: 'Roberto Méndez',
      date: getRelDate(1),
      time: '11:00',
      status: 'pendiente',
      observations: 'Cita programada con cliente Sofía Castro para valuación de Mazda 2.'
    },
    {
      id: 'act-8',
      title: 'Reunión semanal de estrategia comercial',
      iconType: 'gestion',
      description: 'Revisión de embudo de ventas, seguimiento a prospectos calificados y metas de colocación crediticia.',
      responsible: 'Alejandro Peña',
      date: getRelDate(2),
      time: '09:00',
      status: 'pendiente',
      observations: 'Todos los asesores deben traer su reporte de prospectos actualizado.'
    }
  ];

  const testDrives = [
    {
      id: 'td-1',
      clientId: 'cli-1',
      vehicleId: 'veh-1',
      date: today,
      time: '16:00',
      responsible: 'Carlos Morales',
      status: 'Programada',
      notes: 'Ruta periférica de 15 minutos para comprobar suavidad de transmisión CVT y frenado.'
    },
    {
      id: 'td-2',
      clientId: 'cli-5',
      vehicleId: 'veh-4',
      date: today,
      time: '17:30',
      responsible: 'Mariana Garza',
      status: 'Programada',
      notes: 'Cliente desea probar el modo EV 100% eléctrico en tráfico real.'
    },
    {
      id: 'td-3',
      clientId: 'cli-2',
      vehicleId: 'veh-2',
      date: getRelDate(-3),
      time: '12:00',
      responsible: 'Carlos Morales',
      status: 'Realizada',
      notes: 'Cliente encantada con la respuesta del motor 2.5L y la insonorización de la cabina.'
    },
    {
      id: 'td-4',
      clientId: 'cli-3',
      vehicleId: 'veh-3',
      date: getRelDate(-7),
      time: '15:30',
      responsible: 'Alejandro Peña',
      status: 'Realizada',
      notes: 'Prueba completada satisfactoriamente, detonó el apartado del vehículo.'
    },
    {
      id: 'td-5',
      clientId: 'cli-4',
      vehicleId: 'veh-1',
      date: getRelDate(-4),
      time: '11:00',
      responsible: 'Carlos Morales',
      status: 'Realizada',
      notes: 'Revisión de espacio en cajuela y habitabilidad para sillas de bebé.'
    },
    {
      id: 'td-6',
      clientId: 'cli-6',
      vehicleId: 'veh-9',
      date: getRelDate(-6),
      time: '16:30',
      responsible: 'Mariana Garza',
      status: 'Realizada',
      notes: 'Prueba de aceleración y prueba del sistema de asistencia de frenado autónomo.'
    }
  ];

  const requests = [
    {
      id: 'req-1',
      clientId: 'cli-1',
      vehicleId: 'veh-1',
      type: 'Financiamiento',
      status: 'Pendiente',
      date: getRelDate(-2),
      downPaymentPlanned: 70000,
      notes: 'Solicitud con Banco Santander a 36 meses. Se entregaron comprobantes de nómina.'
    },
    {
      id: 'req-2',
      clientId: 'cli-2',
      vehicleId: 'veh-2',
      type: 'Financiamiento',
      status: 'Pendiente',
      date: getRelDate(-3),
      downPaymentPlanned: 85000,
      notes: 'Trámite a través de financiera de casa (Autocorp Credit). En validación de Buró.'
    },
    {
      id: 'req-3',
      clientId: 'cli-3',
      vehicleId: 'veh-3',
      type: 'Financiamiento',
      status: 'Aprobada',
      date: getRelDate(-7),
      downPaymentPlanned: 75000,
      notes: 'Crédito BBVA pre-autorizado con tasa preferencial del 12.99% anual.'
    },
    {
      id: 'req-4',
      clientId: 'cli-6',
      vehicleId: 'veh-9',
      type: 'Financiamiento',
      status: 'Pendiente',
      date: getRelDate(-5),
      downPaymentPlanned: 100000,
      notes: 'Arrendamiento puro para deducción del 100% como gasto operativo.'
    },
    {
      id: 'req-5',
      clientId: 'cli-5',
      vehicleId: 'veh-4',
      type: 'Contado',
      status: 'Aprobada',
      date: today,
      downPaymentPlanned: 565000,
      notes: 'Compra de contado mediante transferencia bancaria SPEI directa.'
    }
  ];

  const downPayments = [
    {
      id: 'dp-1',
      clientId: 'cli-3',
      vehicleId: 'veh-3',
      amount: 75000,
      date: getRelDate(-7),
      method: 'Transferencia SPEI',
      reference: 'SPEI-BBVA-882910',
      notes: 'Enganche recibido para apartar Volkswagen Jetta R-Line.'
    },
    {
      id: 'dp-2',
      clientId: 'cli-6',
      vehicleId: 'veh-9',
      amount: 50000,
      date: getRelDate(-6),
      method: 'Tarjeta de Crédito',
      reference: 'TPV-AUTH-49201',
      notes: 'Apartado firme para Hyundai Tucson Limited Tech.'
    },
    {
      id: 'dp-3',
      clientId: 'cli-2',
      vehicleId: 'veh-2',
      amount: 40000,
      date: getRelDate(-2),
      method: 'Transferencia SPEI',
      reference: 'SPEI-CITI-102938',
      notes: 'Enganche inicial de reserva para Mazda 3 Sedán.'
    },
    {
      id: 'dp-4',
      clientId: 'cli-1',
      vehicleId: 'veh-1',
      amount: 25000,
      date: today,
      method: 'Efectivo en Caja',
      reference: 'REC-CAJA-0041',
      notes: 'Apartado de intención mientras concluye trámite bancario.'
    }
  ];

  const sales = [
    {
      id: 'sale-1',
      clientId: 'cli-6',
      vehicleId: 'veh-6',
      date: getRelDate(-5),
      finalAmount: 445000,
      paymentType: 'Financiamiento Banorte',
      advisor: 'Carlos Morales',
      notes: 'Entrega en sala comercial con kit de bienvenida y póliza de seguro extendida.'
    },
    {
      id: 'sale-2',
      clientId: 'cli-3',
      vehicleId: 'veh-10',
      date: getRelDate(-2),
      finalAmount: 580000,
      paymentType: 'Transferencia SPEI Contado',
      advisor: 'Mariana Garza',
      notes: 'Venta de BMW Serie 3. Cliente satisfecho con peritaje de 150 puntos.'
    }
  ];

  const pastMonthSales = [
    {
      id: 'sale-past-1',
      clientId: 'cli-4',
      vehicleId: 'veh-past-1',
      date: getRelDate(-35),
      finalAmount: 380000,
      paymentType: 'Financiamiento',
      advisor: 'Carlos Morales',
      notes: 'Venta cerrada en periodo anterior.'
    }
  ];

  const pastMonthDownPayments = [
    {
      id: 'dp-past-1',
      clientId: 'cli-4',
      vehicleId: 'veh-past-1',
      amount: 60000,
      date: getRelDate(-38),
      method: 'Transferencia SPEI',
      reference: 'SPEI-HIST-99',
      notes: 'Enganche periodo anterior.'
    }
  ];

  return {
    vehicles,
    clients,
    advisors,
    shifts,
    activities,
    testDrives,
    requests,
    downPayments: [...pastMonthDownPayments, ...downPayments],
    sales: [...pastMonthSales, ...sales],
    meta: {
      outletName: 'Outlet Autocorp',
      version: '1.0.0',
      isDemoMode: true
    }
  };
}

/**
 * Clase controladora del almacén reactivo (Store).
 */
class Store {
  constructor() {
    /** @type {Function[]} */
    this.subscribers = [];
    this.load();
  }

  /**
   * Carga el estado desde localStorage o genera el estado inicial.
   */
  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.data = JSON.parse(saved);
      } else {
        this.data = getInitialData();
        this.save();
      }
    } catch (e) {
      console.warn('Error al cargar datos desde localStorage, usando datos de prueba:', e);
      this.data = getInitialData();
    }
  }

  /**
   * Persiste el estado actual en localStorage y notifica a todos los suscriptores.
   */
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error al guardar datos en localStorage:', e);
    }
    this.notify();
  }

  /**
   * Restablece el lote de autos, clientes, guardias y ventas a sus valores de demostración originales.
   * @returns {boolean}
   */
  resetDemoData() {
    this.data = getInitialData();
    this.save();
    return true;
  }

  /**
   * Suscribe una función para recibir actualizaciones cuando cambie el estado.
   * @param {Function} callback - Función que recibe el nuevo estado.
   * @returns {Function} Función para cancelar la suscripción.
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notifica a todos los suscriptores activos.
   */
  notify() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.data);
      } catch (e) {
        console.error('Error en suscriptor del store:', e);
      }
    });
  }

  // ==========================================
  // MÉTODOS DE VEHÍCULOS
  // ==========================================
  getVehicles() {
    return this.data.vehicles || [];
  }

  getVehicleById(id) {
    return this.getVehicles().find(v => v.id === id);
  }

  addVehicle(vehicleData) {
    const newVehicle = {
      id: generateId('veh'),
      dateAdded: getTodayISO(),
      status: 'disponible',
      interestedClientIds: [],
      ...vehicleData
    };
    this.data.vehicles.unshift(newVehicle);
    this.save();
    return newVehicle;
  }

  updateVehicle(id, updates) {
    const index = this.data.vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      this.data.vehicles[index] = { ...this.data.vehicles[index], ...updates };
      this.save();
      return this.data.vehicles[index];
    }
    return null;
  }

  deleteVehicle(id) {
    const index = this.data.vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      const removed = this.data.vehicles.splice(index, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }

  // ==========================================
  // MÉTODOS DE CLIENTES
  // ==========================================
  getClients() {
    return this.data.clients || [];
  }

  getClientById(id) {
    return this.getClients().find(c => c.id === id);
  }

  /**
   * Verifica si ya existe un cliente con el mismo número telefónico o correo electrónico.
   * 
   * @param {string} phone - Teléfono a contrastar.
   * @param {string} email - Correo a contrastar.
   * @param {string|null} [excludeId=null] - ID de cliente a excluir (en caso de edición).
   * @returns {Object|undefined} Cliente coincidente o undefined.
   */
  checkDuplicateClient(phone, email, excludeId = null) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanEmail = (email || '').trim().toLowerCase();

    return this.getClients().find(c => {
      if (excludeId && c.id === excludeId) return false;
      const cPhone = (c.phone || '').replace(/\D/g, '');
      const cEmail = (c.email || '').trim().toLowerCase();

      const phoneMatch = cleanPhone && cPhone && cleanPhone === cPhone;
      const emailMatch = cleanEmail && cEmail && cleanEmail === cEmail;
      return phoneMatch || emailMatch;
    });
  }

  addClient(clientData) {
    const today = getTodayISO();
    const newClient = {
      id: generateId('cli'),
      dateRegistered: today,
      visits: [{ date: today, notes: 'Registro inicial de visita.' }],
      interestedVehicleIds: [],
      ...clientData
    };
    this.data.clients.unshift(newClient);
    this.save();
    return newClient;
  }

  updateClient(id, updates) {
    const index = this.data.clients.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.clients[index] = { ...this.data.clients[index], ...updates };
      this.save();
      return this.data.clients[index];
    }
    return null;
  }

  deleteClient(id) {
    const index = this.data.clients.findIndex(c => c.id === id);
    if (index !== -1) {
      const removed = this.data.clients.splice(index, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }

  /**
   * Registra una visita subsecuente a un cliente existente sin duplicar su ficha,
   * permitiendo alimentar el KPI de Invitados del periodo correspondiente.
   * 
   * @param {string} clientId - ID del cliente.
   * @param {string} [notes='Nueva visita registrada en showroom.'] - Observaciones de la visita.
   * @returns {Object|null} Objeto de la visita registrada.
   */
  registerClientVisit(clientId, notes = 'Nueva visita registrada en showroom.') {
    const client = this.getClientById(clientId);
    if (client) {
      if (!client.visits) client.visits = [];
      const newVisit = { date: getTodayISO(), notes };
      client.visits.unshift(newVisit);
      this.save();
      return newVisit;
    }
    return null;
  }

  linkVehicleToClient(clientId, vehicleId) {
    const client = this.getClientById(clientId);
    const vehicle = this.getVehicleById(vehicleId);

    if (client && vehicle) {
      if (!client.interestedVehicleIds) client.interestedVehicleIds = [];
      if (!client.interestedVehicleIds.includes(vehicleId)) {
        client.interestedVehicleIds.push(vehicleId);
      }

      if (!vehicle.interestedClientIds) vehicle.interestedClientIds = [];
      if (!vehicle.interestedClientIds.includes(clientId)) {
        vehicle.interestedClientIds.push(clientId);
      }

      this.save();
      return true;
    }
    return false;
  }

  // ==========================================
  // MÉTODOS DE GUARDIAS
  // ==========================================
  getShifts() {
    return this.data.shifts || [];
  }

  addShift(shiftData) {
    const newShift = {
      id: generateId('shift'),
      color: '#ff8901',
      ...shiftData
    };
    this.data.shifts.push(newShift);
    this.save();
    return newShift;
  }

  updateShift(id, updates) {
    const index = this.data.shifts.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.shifts[index] = { ...this.data.shifts[index], ...updates };
      this.save();
      return this.data.shifts[index];
    }
    return null;
  }

  deleteShift(id) {
    const index = this.data.shifts.findIndex(s => s.id === id);
    if (index !== -1) {
      const removed = this.data.shifts.splice(index, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }

  // ==========================================
  // MÉTODOS DE ACTIVIDADES
  // ==========================================
  getActivities() {
    return this.data.activities || [];
  }

  addActivity(activityData) {
    const newActivity = {
      id: generateId('act'),
      status: 'pendiente',
      ...activityData
    };
    this.data.activities.unshift(newActivity);
    this.save();
    return newActivity;
  }

  updateActivity(id, updates) {
    const index = this.data.activities.findIndex(a => a.id === id);
    if (index !== -1) {
      this.data.activities[index] = { ...this.data.activities[index], ...updates };
      this.save();
      return this.data.activities[index];
    }
    return null;
  }

  deleteActivity(id) {
    const index = this.data.activities.findIndex(a => a.id === id);
    if (index !== -1) {
      const removed = this.data.activities.splice(index, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }

  // ==========================================
  // MÉTODOS DE PRUEBAS DE MANEJO
  // ==========================================
  getTestDrives() {
    return this.data.testDrives || [];
  }

  addTestDrive(tdData) {
    const newTd = {
      id: generateId('td'),
      status: 'Programada',
      ...tdData
    };
    this.data.testDrives.unshift(newTd);

    if (tdData.clientId && tdData.vehicleId) {
      this.linkVehicleToClient(tdData.clientId, tdData.vehicleId);
    }

    this.save();
    return newTd;
  }

  updateTestDrive(id, updates) {
    const index = this.data.testDrives.findIndex(td => td.id === id);
    if (index !== -1) {
      this.data.testDrives[index] = { ...this.data.testDrives[index], ...updates };
      this.save();
      return this.data.testDrives[index];
    }
    return null;
  }

  // ==========================================
  // MÉTODOS DE SOLICITUDES
  // ==========================================
  getRequests() {
    return this.data.requests || [];
  }

  addRequest(reqData) {
    const newReq = {
      id: generateId('req'),
      date: getTodayISO(),
      status: 'Pendiente',
      ...reqData
    };
    this.data.requests.unshift(newReq);

    if (reqData.clientId && reqData.vehicleId) {
      this.linkVehicleToClient(reqData.clientId, reqData.vehicleId);
    }

    this.save();
    return newReq;
  }

  updateRequest(id, updates) {
    const index = this.data.requests.findIndex(r => r.id === id);
    if (index !== -1) {
      this.data.requests[index] = { ...this.data.requests[index], ...updates };
      this.save();
      return this.data.requests[index];
    }
    return null;
  }

  // ==========================================
  // MÉTODOS DE ENGANCHES RECIBIDOS EN CAJA
  // ==========================================
  getDownPayments() {
    return this.data.downPayments || [];
  }

  /**
   * Registra un pago de enganche efectivamente cobrado en caja.
   * Cambia automáticamente el estado del vehículo a 'apartado' si estaba disponible.
   * 
   * @param {Object} dpData - Datos del pago de enganche.
   * @returns {Object} Registro creado.
   */
  addDownPayment(dpData) {
    const newDp = {
      id: generateId('dp'),
      date: getTodayISO(),
      ...dpData
    };
    this.data.downPayments.unshift(newDp);

    if (dpData.vehicleId) {
      const veh = this.getVehicleById(dpData.vehicleId);
      if (veh && veh.status === 'disponible') {
        this.updateVehicle(dpData.vehicleId, { status: 'apartado' });
      }
    }

    this.save();
    return newDp;
  }

  // ==========================================
  // MÉTODOS DE VENTAS
  // ==========================================
  getSales() {
    return this.data.sales || [];
  }

  /**
   * Registra una venta comercial cerrada.
   * Valida que la unidad no esté vendida previamente y actualiza el vehículo a 'vendido'.
   * 
   * @param {Object} saleData - Datos de la venta.
   * @throws {Error} Si el vehículo ya fue vendido.
   * @returns {Object} Venta registrada.
   */
  addSale(saleData) {
    const veh = this.getVehicleById(saleData.vehicleId);
    if (veh && veh.status === 'vendido') {
      throw new Error('El vehículo ya fue vendido previamente.');
    }

    const newSale = {
      id: generateId('sale'),
      date: getTodayISO(),
      ...saleData
    };

    this.data.sales.unshift(newSale);

    if (saleData.vehicleId) {
      this.updateVehicle(saleData.vehicleId, {
        status: 'vendido',
        observations: `${veh ? veh.observations + ' | ' : ''}Vendido el ${newSale.date}. Monto final: $${newSale.finalAmount.toLocaleString('es-MX')} MXN.`
      });
    }

    this.save();
    return newSale;
  }
}

export const store = new Store();
