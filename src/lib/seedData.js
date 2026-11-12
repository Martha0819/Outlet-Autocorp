/**
 * @fileoverview Semilla inicial de datos para Outlet Autocorp CRM
 * Replicando al 100% la plantilla oficial Diseño 1 (index.html) y capturas institucionales.
 */

export function getInitialSeedData() {
  return {
    // =========================================================================
    // CATÁLOGO DE VEHÍCULOS (12 UNIDADES: 8 DISPONIBLES, 2 APARTADOS, 2 VENDIDOS)
    // =========================================================================
    vehicles: [
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
        images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'],
        observations: 'Único dueño, factura original de agencia, servicios de agencia al corriente, interiores en piel impecables.',
        dateAdded: '2026-10-02',
        interestedClientIds: ['cli-5', 'cli-2']
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
        images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'],
        observations: 'Sonido Bose de 12 bocinas, quemacocos eléctrico, head-up display, llantas con 80% de vida útil.',
        dateAdded: '2026-10-12',
        interestedClientIds: ['cli-4']
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
        images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'],
        observations: 'Apartado por Juan Carlos Mendoza con enganche inicial de $35,000 MXN en espera de aprobación bancaria.',
        dateAdded: '2026-10-17',
        interestedClientIds: ['cli-7']
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
        images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'],
        observations: 'Rendimiento sobresaliente de hasta 22 km/l en ciudad, garantía de batería híbrida vigente, cámara 360.',
        dateAdded: '2026-10-27',
        interestedClientIds: ['cli-3']
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
        images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80'],
        observations: 'Modos de manejo G.O.A.T., paquete de remolque, rieles para equipaje, llantas todo terreno semi-nuevas.',
        dateAdded: '2026-10-30',
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
        images: ['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80'],
        observations: 'Vendido a María Elena Sánchez el 2026-11-06. Facturación y entrega completada.',
        dateAdded: '2026-09-22',
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
        images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80'],
        observations: 'Techo panorámico, alerta de colisión frontal, cargador inalámbrico para smartphone.',
        dateAdded: '2026-11-03',
        interestedClientIds: ['cli-5']
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
        images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'],
        observations: 'Pantalla táctil de 10.25 pulgadas, iluminación ambiental en bocinas, 6 bolsas de aire.',
        dateAdded: '2026-11-05',
        interestedClientIds: ['cli-1']
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
        images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'],
        observations: 'Apartado por Fernando Ortega. Enganche recibido de $50,000 MXN.',
        dateAdded: '2026-10-24',
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
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'],
        observations: 'Vendido a Roberto Garza el 2026-11-09. Entrega en sala VIP efectuada.',
        dateAdded: '2026-10-07',
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
        images: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'],
        observations: 'Cuadro de instrumentos digital cockpit, rines 17 pulgadas bitono, asientos deportivos.',
        dateAdded: '2026-11-07',
        interestedClientIds: ['cli-1']
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
        images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'],
        observations: 'Interiores en piel bicolor, sonido Alpine premium, asistente de mantenimiento de carril.',
        dateAdded: '2026-11-09',
        interestedClientIds: []
      }
    ],

    // =========================================================================
    // DIRECTOS DE CLIENTES (RÉPLICA EXACTA DE LA IMAGEN 4 Y PLANTILLA INDEX)
    // 13 VISITAS EN EL PERIODO ACTUAL, 3 EN EL ANTERIOR (+333% VS ANTERIOR)
    // =========================================================================
    clients: [
      {
        id: 'cli-1',
        name: 'Mariana Zepeda Gómez',
        phone: '55 2345 6789',
        email: 'mariana.zepeda@agencia.com',
        hasBrandPreference: 'no',
        preferredBrand: '',
        comments: 'Primera compra de auto seminuevo. Requiere asesoría financiera detallada.',
        dateRegistered: '2026-11-11',
        createdAt: '2026-11-11T10:00:00.000Z',
        interestedVehicleIds: ['veh-8', 'veh-11'],
        visits: [
          { date: '2026-11-11', notes: 'Registro de visita nueva en recepción con Sofía Reyes.' }
        ]
      },
      {
        id: 'cli-2',
        name: 'Carlos Alberto Peralta',
        phone: '55 1209 3847',
        email: 'cperalta.abogado@notaria.com',
        hasBrandPreference: 'no',
        preferredBrand: '',
        comments: 'Busca SUV familiar o sedán espacioso. No tiene preferencia de marca pero prioriza seguridad.',
        dateRegistered: '2026-11-07',
        createdAt: '2026-11-07T11:30:00.000Z',
        interestedVehicleIds: ['veh-1', 'veh-4'],
        visits: [
          { date: '2026-11-07', notes: 'Revisó varias opciones en patio con el asesor de guardia.' }
        ]
      },
      {
        id: 'cli-3',
        name: 'Ana Patricia Luján',
        phone: '55 6738 2010',
        email: 'patricia.lujan@bioquimica.org',
        hasBrandPreference: 'si',
        preferredBrand: 'Toyota',
        comments: 'Interesada específicamente en tecnologías híbridas para circular diario sin restricciones.',
        dateRegistered: '2026-11-04',
        createdAt: '2026-11-04T12:00:00.000Z',
        interestedVehicleIds: ['veh-4'],
        visits: [
          { date: '2026-11-04', notes: 'Probó el sistema multimedia de la RAV4 Hybrid.' },
          { date: '2026-11-11', notes: 'Asistió a programar prueba de manejo en carretera.' }
        ]
      },
      {
        id: 'cli-4',
        name: 'Sofía Daniela Castro',
        phone: '55 7829 1034',
        email: 'sofia.castro@outlook.com',
        hasBrandPreference: 'si',
        preferredBrand: 'Mazda',
        comments: 'Le apasiona el diseño del Mazda 3 Sedán color rojo. Desea dejar su auto anterior a cuenta.',
        dateRegistered: '2026-11-01',
        createdAt: '2026-11-01T14:15:00.000Z',
        interestedVehicleIds: ['veh-2'],
        visits: [
          { date: '2026-11-01', notes: 'Asistió acompañada de su esposo a revisar el Mazda 3.' },
          { date: '2026-11-03', notes: 'Inspección de interiores y audio Bose.' },
          { date: '2026-11-08', notes: 'Trajo su vehículo anterior para valuación comercial.' }
        ]
      },
      {
        id: 'cli-5',
        name: 'Rodrigo Morales Valenzuela',
        phone: '55 4192 8374',
        email: 'rodrigo.morales@gmail.com',
        hasBrandPreference: 'si',
        preferredBrand: 'Nissan',
        comments: 'Busca sedán económico para trayectos diarios de oficina. Muy interesado en el Versa Exclusive.',
        dateRegistered: '2026-10-28',
        createdAt: '2026-10-28T16:00:00.000Z',
        interestedVehicleIds: ['veh-1', 'veh-7'],
        visits: [
          { date: '2026-10-28', notes: 'Primera visita al showroom, conoció el inventario.' },
          { date: '2026-11-02', notes: 'Segunda visita, solicitó cotización formal con enganche del 25%.' },
          { date: '2026-11-05', notes: 'Comparativa de planes de crédito.' },
          { date: '2026-11-09', notes: 'Revisión de documentación.' },
          { date: '2026-11-11', notes: 'Visita para prueba de manejo y entrega de comprobantes de ingreso.' }
        ]
      },
      {
        id: 'cli-6',
        name: 'Fernando Ortega Beltrán',
        phone: '55 8901 2345',
        email: 'fortega@constructora.com',
        hasBrandPreference: 'si',
        preferredBrand: 'Hyundai',
        comments: 'Cliente empresarial. Requiere factura fiscal expedida antes de fin de mes.',
        dateRegistered: '2026-10-24',
        createdAt: '2026-10-24T09:30:00.000Z',
        interestedVehicleIds: ['veh-9'],
        visits: [
          { date: '2026-10-24', notes: 'Visita inicial con contador para revisar deducción fiscal.' },
          { date: '2026-11-05', notes: 'Firma de contrato de apartado.' }
        ]
      },
      {
        id: 'cli-7',
        name: 'Juan Carlos Mendoza Ríos',
        phone: '55 3920 1948',
        email: 'jcmendoza.rios@empresa.mx',
        hasBrandPreference: 'si',
        preferredBrand: 'Volkswagen',
        comments: 'Cliente con enganche listo de $75,000. Ya apartó el Jetta R-Line.',
        dateRegistered: '2026-10-22',
        createdAt: '2026-10-22T17:45:00.000Z',
        interestedVehicleIds: ['veh-3'],
        visits: [
          { date: '2026-10-22', notes: 'Visita de prospección.' },
          { date: '2026-11-04', notes: 'Visita para entrega de apartado y firma de solicitud de crédito.' }
        ]
      }
    ],

    // =========================================================================
    // GUARDIAS DE NOVIEMBRE 2026 (RÉPLICA EXACTA DE LA IMAGEN 1)
    // =========================================================================
    shifts: [
      { id: 'sh-1-1', date: '2026-11-01', startTime: '09:00', endTime: '15:00', responsible: 'Carlos Morales', area: 'Recepción y Piso de Ventas', phone: '5543219876', email: 'carlos.morales@autocorp.mx', observations: 'Guardia de apertura dominical.' },
      { id: 'sh-1-2', date: '2026-11-01', startTime: '14:30', endTime: '20:30', responsible: 'Alejandro Peña', area: 'Piso de Ventas', phone: '5567894321', email: 'alejandro.pena@autocorp.mx', observations: 'Cierre de piso.' },
      { id: 'sh-2-1', date: '2026-11-02', startTime: '09:00', endTime: '15:00', responsible: 'Roberto Méndez', area: 'Showroom Principal', phone: '5587654321', email: 'roberto.mendez@autocorp.mx', observations: 'Revisión matutina de sala.' },
      { id: 'sh-2-2', date: '2026-11-02', startTime: '14:30', endTime: '20:30', responsible: 'Sofía Reyes', area: 'Atención a Clientes', phone: '5512348765', email: 'sofia.reyes@autocorp.mx', observations: 'Turno vespertino.' },
      { id: 'sh-3-1', date: '2026-11-03', startTime: '09:00', endTime: '15:00', responsible: 'Mariana Garza', area: 'Piso de Ventas', phone: '5598761234', email: 'mariana.garza@autocorp.mx', observations: 'Atención a prospectos matutinos.' },
      { id: 'sh-3-2', date: '2026-11-03', startTime: '14:30', endTime: '20:30', responsible: 'Carlos Morales', area: 'Pruebas de Manejo', phone: '5543219876', email: 'carlos.morales@autocorp.mx', observations: 'Guardia vespertina.' },
      { id: 'sh-4-1', date: '2026-11-04', startTime: '09:00', endTime: '15:00', responsible: 'Alejandro Peña', area: 'Showroom Principal', phone: '5567894321', email: 'alejandro.pena@autocorp.mx', observations: 'Turno matutino.' },
      { id: 'sh-4-2', date: '2026-11-04', startTime: '14:30', endTime: '20:30', responsible: 'Roberto Méndez', area: 'Piso de Ventas', phone: '5587654321', email: 'roberto.mendez@autocorp.mx', observations: 'Atención vespertina.' },
      { id: 'sh-5-1', date: '2026-11-05', startTime: '09:00', endTime: '15:00', responsible: 'Sofía Reyes', area: 'Recepción y Piso de Ventas', phone: '5512348765', email: 'sofia.reyes@autocorp.mx', observations: 'Responsable de apertura puntual, activación de exhibición y recepción del primer turno.' },
      { id: 'sh-5-2', date: '2026-11-05', startTime: '14:30', endTime: '20:30', responsible: 'Mariana Garza', area: 'Piso de Ventas', phone: '5598761234', email: 'mariana.garza@autocorp.mx', observations: 'Cierre de turno.' },
      { id: 'sh-8-1', date: '2026-11-08', startTime: '09:00', endTime: '15:00', responsible: 'Mariana Garza', area: 'Piso de Ventas', phone: '5598761234', email: 'mariana.garza@autocorp.mx', observations: 'Guardia matutina.' },
      { id: 'sh-8-2', date: '2026-11-08', startTime: '14:30', endTime: '20:30', responsible: 'Carlos Morales', area: 'Piso de Ventas', phone: '5543219876', email: 'carlos.morales@autocorp.mx', observations: 'Guardia vespertina.' },
      { id: 'sh-9-1', date: '2026-11-09', startTime: '09:00', endTime: '15:00', responsible: 'Alejandro Peña', area: 'Showroom Principal', phone: '5567894321', email: 'alejandro.pena@autocorp.mx', observations: 'Apertura de semana.' },
      { id: 'sh-9-2', date: '2026-11-09', startTime: '14:30', endTime: '20:30', responsible: 'Roberto Méndez', area: 'Piso de Ventas', phone: '5587654321', email: 'roberto.mendez@autocorp.mx', observations: 'Guardia vespertina.' },
      { id: 'sh-10-1', date: '2026-11-10', startTime: '09:00', endTime: '15:00', responsible: 'Sofía Reyes', area: 'Atención a Clientes', phone: '5512348765', email: 'sofia.reyes@autocorp.mx', observations: 'Turno matutino.' },
      { id: 'sh-10-2', date: '2026-11-10', startTime: '14:30', endTime: '20:30', responsible: 'Mariana Garza', area: 'Piso de Ventas', phone: '5598761234', email: 'mariana.garza@autocorp.mx', observations: 'Turno vespertino.' },
      { id: 'sh-11-1', date: '2026-11-11', startTime: '09:00', endTime: '15:00', responsible: 'Carlos Morales', area: 'Showroom Principal', phone: '5543219876', email: 'carlos.morales@autocorp.mx', observations: 'Guardia activa en turno de apertura.' },
      { id: 'sh-11-2', date: '2026-11-11', startTime: '14:30', endTime: '20:30', responsible: 'Alejandro Peña', area: 'Piso de Ventas', phone: '5567894321', email: 'alejandro.pena@autocorp.mx', observations: 'Guardia activa en turno vespertino.' },
      { id: 'sh-12-1', date: '2026-11-12', startTime: '09:00', endTime: '15:00', responsible: 'Sofía Reyes', area: 'Piso de Ventas', phone: '5512348765', email: 'sofia.reyes@autocorp.mx', observations: 'Turno matutino.' },
      { id: 'sh-12-2', date: '2026-11-12', startTime: '14:30', endTime: '20:30', responsible: 'Mariana Garza', area: 'Showroom Principal', phone: '5598761234', email: 'mariana.garza@autocorp.mx', observations: 'Turno vespertino.' },
      { id: 'sh-15-1', date: '2026-11-15', startTime: '09:00', endTime: '15:00', responsible: 'Roberto Méndez', area: 'Piso de Ventas', phone: '5587654321', email: 'roberto.mendez@autocorp.mx', observations: 'Guardia matutina.' },
      { id: 'sh-15-2', date: '2026-11-15', startTime: '14:30', endTime: '20:30', responsible: 'Sofía Reyes', area: 'Piso de Ventas', phone: '5512348765', email: 'sofia.reyes@autocorp.mx', observations: 'Guardia vespertina.' },
      { id: 'sh-16-1', date: '2026-11-16', startTime: '09:00', endTime: '15:00', responsible: 'Carlos Morales', area: 'Showroom Principal', phone: '5543219876', email: 'carlos.morales@autocorp.mx', observations: 'Guardia matutina.' },
      { id: 'sh-16-2', date: '2026-11-16', startTime: '14:30', endTime: '20:30', responsible: 'Alejandro Peña', area: 'Piso de Ventas', phone: '5567894321', email: 'alejandro.pena@autocorp.mx', observations: 'Guardia vespertina.' },
      { id: 'sh-17-1', date: '2026-11-17', startTime: '09:00', endTime: '15:00', responsible: 'Sofía Reyes', area: 'Piso de Ventas', phone: '5512348765', email: 'sofia.reyes@autocorp.mx', observations: 'Guardia matutina.' },
      { id: 'sh-17-2', date: '2026-11-17', startTime: '14:30', endTime: '20:30', responsible: 'Mariana Garza', area: 'Showroom Principal', phone: '5598761234', email: 'mariana.garza@autocorp.mx', observations: 'Guardia vespertina.' },
      { id: 'sh-18-1', date: '2026-11-18', startTime: '09:00', endTime: '15:00', responsible: 'Alejandro Peña', area: 'Piso de Ventas', phone: '5567894321', email: 'alejandro.pena@autocorp.mx', observations: 'Guardia matutina.' },
      { id: 'sh-18-2', date: '2026-11-18', startTime: '14:30', endTime: '20:30', responsible: 'Roberto Méndez', area: 'Piso de Ventas', phone: '5587654321', email: 'roberto.mendez@autocorp.mx', observations: 'Guardia vespertina.' },
      { id: 'sh-19-1', date: '2026-11-19', startTime: '09:00', endTime: '15:00', responsible: 'Mariana Garza', area: 'Piso de Ventas', phone: '5598761234', email: 'mariana.garza@autocorp.mx', observations: 'Guardia matutina.' },
      { id: 'sh-19-2', date: '2026-11-19', startTime: '14:30', endTime: '20:30', responsible: 'Carlos Morales', area: 'Showroom Principal', phone: '5543219876', email: 'carlos.morales@autocorp.mx', observations: 'Guardia vespertina.' },
      { id: 'sh-22-1', date: '2026-11-22', startTime: '09:00', endTime: '15:00', responsible: 'Sofía Reyes', area: 'Piso de Ventas', phone: '5512348765', email: 'sofia.reyes@autocorp.mx', observations: 'Guardia dominical.' },
      { id: 'sh-22-2', date: '2026-11-22', startTime: '14:30', endTime: '20:30', responsible: 'Mariana Garza', area: 'Piso de Ventas', phone: '5598761234', email: 'mariana.garza@autocorp.mx', observations: 'Guardia dominical vespertina.' },
      { id: 'sh-23-1', date: '2026-11-23', startTime: '09:00', endTime: '15:00', responsible: 'Alejandro Peña', area: 'Showroom Principal', phone: '5567894321', email: 'alejandro.pena@autocorp.mx', observations: 'Guardia matutina.' },
      { id: 'sh-23-2', date: '2026-11-23', startTime: '14:30', endTime: '20:30', responsible: 'Roberto Méndez', area: 'Piso de Ventas', phone: '5587654321', email: 'roberto.mendez@autocorp.mx', observations: 'Guardia vespertina.' },
      { id: 'sh-24-1', date: '2026-11-24', startTime: '09:00', endTime: '15:00', responsible: 'Mariana Garza', area: 'Piso de Ventas', phone: '5598761234', email: 'mariana.garza@autocorp.mx', observations: 'Guardia matutina.' },
      { id: 'sh-24-2', date: '2026-11-24', startTime: '14:30', endTime: '20:30', responsible: 'Carlos Morales', area: 'Showroom Principal', phone: '5543219876', email: 'carlos.morales@autocorp.mx', observations: 'Guardia vespertina.' },
      { id: 'sh-25-1', date: '2026-11-25', startTime: '09:00', endTime: '15:00', responsible: 'Roberto Méndez', area: 'Piso de Ventas', phone: '5587654321', email: 'roberto.mendez@autocorp.mx', observations: 'Guardia matutina.' },
      { id: 'sh-25-2', date: '2026-11-25', startTime: '14:30', endTime: '20:30', responsible: 'Sofía Reyes', area: 'Piso de Ventas', phone: '5512348765', email: 'sofia.reyes@autocorp.mx', observations: 'Guardia vespertina.' },
      { id: 'sh-26-1', date: '2026-11-26', startTime: '09:00', endTime: '15:00', responsible: 'Carlos Morales', area: 'Showroom Principal', phone: '5543219876', email: 'carlos.morales@autocorp.mx', observations: 'Guardia matutina.' },
      { id: 'sh-26-2', date: '2026-11-26', startTime: '14:30', endTime: '20:30', responsible: 'Alejandro Peña', area: 'Piso de Ventas', phone: '5567894321', email: 'alejandro.pena@autocorp.mx', observations: 'Guardia vespertina.' }
    ],

    // =========================================================================
    // 8 ACTIVIDADES OPERATIVAS EN REJILLA 4x2 CON VOLTEO 3D (RÉPLICA IMAGEN 2)
    // =========================================================================
    activities: [
      {
        id: 'act-1',
        title: 'Apertura de instalaciones y encendido de salas',
        iconType: 'apertura',
        status: 'completada',
        date: '2026-11-11',
        time: '08:45',
        responsible: 'Carlos Morales',
        description: 'Desarmado de alarma perimetral, apertura de acceso principal, verificación de iluminación y encendido de pantallas del showroom.',
        observations: 'Apertura sin incidentes. Todas las pantallas de bienvenida funcionando correctamente.'
      },
      {
        id: 'act-2',
        title: 'Revisión técnica de autos en exhibición exterior',
        iconType: 'revision',
        status: 'en_proceso',
        date: '2026-11-11',
        time: '10:00',
        responsible: 'Roberto Méndez',
        description: 'Inspección visual de presión de neumáticos, limpieza de cristales y nivel de carga de baterías en unidades del patio.',
        observations: 'Se detectó batería baja en Jeep Compass OUT-2024-012; ya se colocó cargador lento de apoyo.'
      },
      {
        id: 'act-3',
        title: 'Limpieza y sanitización de áreas comunes',
        iconType: 'limpieza',
        status: 'pendiente',
        date: '2026-11-11',
        time: '11:30',
        responsible: 'Sofía Reyes',
        description: 'Limpieza de módulos de atención, aspirado de sala VIP de firmas y desinfección de volantes para pruebas de manejo.',
        observations: 'Programada antes de las primeras visitas de prueba de manejo del mediodía.'
      },
      {
        id: 'act-4',
        title: 'Recepción y bienvenida a clientes matutinos',
        iconType: 'recepcion',
        status: 'en_proceso',
        date: '2026-11-11',
        time: '12:00',
        responsible: 'Sofía Reyes',
        description: 'Asignación inmediata de asesores, ofrecimiento de barra de café y registro de datos en el sistema CRM.',
        observations: 'Excelente afluencia matutina, 3 invitados registrados hasta ahora.'
      },
      {
        id: 'act-5',
        title: 'Auditoría y control de resguardo de llaves',
        iconType: 'seguridad',
        status: 'pendiente',
        date: '2026-11-11',
        time: '17:00',
        responsible: 'Alejandro Peña',
        description: 'Conteo físico de llaves maestras y duplicados en caja fuerte contra el inventario activo disponible.',
        observations: 'Revisión obligatoria diaria para cumplir con la póliza de seguro del lote.'
      },
      {
        id: 'act-6',
        title: 'Cierre de sucursal, corte de caja y bloqueo de rejas',
        iconType: 'cierre',
        status: 'pendiente',
        date: '2026-11-11',
        time: '20:15',
        responsible: 'Roberto Méndez',
        description: 'Arqueo de ingresos por apartado/enganche, apagado de luces, cierre perimetral y activación de monitoreo de seguridad.',
        observations: 'Verificar doble cerradura en acceso a almacén de placas y expedientes.'
      },
      {
        id: 'act-7',
        title: 'Valuación y peritaje mecánico de seminuevos por recibir',
        iconType: 'revision',
        status: 'pendiente',
        date: '2026-11-12',
        time: '11:00',
        responsible: 'Roberto Méndez',
        description: 'Escaneo OBD2 y revisión de hojalatería de 2 vehículos que clientes desean dejar a cuenta.',
        observations: 'Cita programada con cliente Sofía Castro para valuación de Mazda 2.'
      },
      {
        id: 'act-8',
        title: 'Reunión semanal de estrategia comercial',
        iconType: 'gestion',
        status: 'pendiente',
        date: '2026-11-13',
        time: '09:00',
        responsible: 'Alejandro Peña',
        description: 'Revisión de embudo de ventas, seguimiento a prospectos calificados y metas de colocación crediticia.',
        observations: 'Todos los asesores deben traer su reporte de prospectos actualizado.'
      }
    ],

    // =========================================================================
    // PRUEBAS DE MANEJO (6 EN PERIODO: 4 REALIZADAS, 2 PROGRAMADAS; +100% VS ANTERIOR)
    // =========================================================================
    testDrives: [
      {
        id: 'td-1',
        clientId: 'cli-5',
        vehicleId: 'veh-1',
        date: '2026-11-11',
        time: '16:00',
        responsible: 'Carlos Morales',
        status: 'Programada',
        notes: 'Ruta periférica de 15 minutos para comprobar suavidad de transmisión CVT y frenado.'
      },
      {
        id: 'td-2',
        clientId: 'cli-3',
        vehicleId: 'veh-4',
        date: '2026-11-11',
        time: '17:30',
        responsible: 'Mariana Garza',
        status: 'Programada',
        notes: 'Cliente desea probar el modo EV 100% eléctrico en tráfico real.'
      },
      {
        id: 'td-3',
        clientId: 'cli-4',
        vehicleId: 'veh-2',
        date: '2026-11-08',
        time: '12:00',
        responsible: 'Carlos Morales',
        status: 'Realizada',
        notes: 'Cliente encantada con la respuesta del motor 2.5L y la insonorización de la cabina.'
      },
      {
        id: 'td-4',
        clientId: 'cli-7',
        vehicleId: 'veh-3',
        date: '2026-11-04',
        time: '15:30',
        responsible: 'Alejandro Peña',
        status: 'Realizada',
        notes: 'Prueba completada satisfactoriamente, detonó el apartado del vehículo.'
      },
      {
        id: 'td-5',
        clientId: 'cli-2',
        vehicleId: 'veh-1',
        date: '2026-11-07',
        time: '11:00',
        responsible: 'Carlos Morales',
        status: 'Realizada',
        notes: 'Revisión de espacio en cajuela y habitabilidad para sillas de bebé.'
      },
      {
        id: 'td-6',
        clientId: 'cli-6',
        vehicleId: 'veh-9',
        date: '2026-11-05',
        time: '16:30',
        responsible: 'Mariana Garza',
        status: 'Realizada',
        notes: 'Prueba de aceleración y prueba del sistema de asistencia de frenado autónomo.'
      }
    ],

    // =========================================================================
    // SOLICITUDES (5 EN PERIODO: 3 PENDIENTES, 2 APROBADAS; +100% VS ANTERIOR)
    // =========================================================================
    requests: [
      {
        id: 'req-1',
        clientId: 'cli-5',
        vehicleId: 'veh-1',
        type: 'Financiamiento',
        status: 'Pendiente',
        date: '2026-11-09',
        downPaymentPlanned: 70000,
        notes: 'Solicitud con Banco Santander a 36 meses. Se entregaron comprobantes de nómina.'
      },
      {
        id: 'req-2',
        clientId: 'cli-4',
        vehicleId: 'veh-2',
        type: 'Financiamiento',
        status: 'Pendiente',
        date: '2026-11-08',
        downPaymentPlanned: 85000,
        notes: 'Trámite a través de financiera de casa (Autocorp Credit). En validación de Buró.'
      },
      {
        id: 'req-3',
        clientId: 'cli-7',
        vehicleId: 'veh-3',
        type: 'Financiamiento',
        status: 'Aprobada',
        date: '2026-11-04',
        downPaymentPlanned: 75000,
        notes: 'Crédito BBVA pre-autorizado con tasa preferencial del 12.99% anual.'
      },
      {
        id: 'req-4',
        clientId: 'cli-6',
        vehicleId: 'veh-9',
        type: 'Financiamiento',
        status: 'Pendiente',
        date: '2026-11-06',
        downPaymentPlanned: 100000,
        notes: 'Arrendamiento puro para deducción del 100% como gasto operativo.'
      },
      {
        id: 'req-5',
        clientId: 'cli-3',
        vehicleId: 'veh-4',
        type: 'Contado',
        status: 'Aprobada',
        date: '2026-11-11',
        downPaymentPlanned: 565000,
        notes: 'Compra de contado mediante transferencia bancaria SPEI directa.'
      }
    ],

    // =========================================================================
    // ENGANCHES RECIBIDOS EN CAJA (4 EN PERIODO: $190,000 MXN; +217% VS ANTERIOR)
    // =========================================================================
    downPayments: [
      {
        id: 'dp-1',
        clientId: 'cli-7',
        vehicleId: 'veh-3',
        amount: 75000,
        date: '2026-11-04',
        method: 'Transferencia SPEI',
        reference: 'SPEI-BBVA-882910',
        notes: 'Enganche recibido para apartar Volkswagen Jetta R-Line.'
      },
      {
        id: 'dp-2',
        clientId: 'cli-6',
        vehicleId: 'veh-9',
        amount: 50000,
        date: '2026-11-05',
        method: 'Tarjeta de Crédito',
        reference: 'TPV-AUTH-49201',
        notes: 'Apartado firme para Hyundai Tucson Limited Tech.'
      },
      {
        id: 'dp-3',
        clientId: 'cli-4',
        vehicleId: 'veh-2',
        amount: 40000,
        date: '2026-11-09',
        method: 'Transferencia SPEI',
        reference: 'SPEI-CITI-102938',
        notes: 'Enganche inicial de reserva para Mazda 3 Sedán.'
      },
      {
        id: 'dp-4',
        clientId: 'cli-5',
        vehicleId: 'veh-1',
        amount: 25000,
        date: '2026-11-11',
        method: 'Efectivo en Caja',
        reference: 'REC-CAJA-0041',
        notes: 'Apartado de intención mientras concluye trámite bancario.'
      }
    ],

    // =========================================================================
    // VENTAS CONFIRMADAS (2 EN NOVIEMBRE 2026: $1,025,000 MXN)
    // =========================================================================
    sales: [
      {
        id: 'sale-1',
        clientId: 'cli-6',
        vehicleId: 'veh-6',
        date: '2026-11-06',
        finalAmount: 445000,
        amount: 445000,
        paymentType: 'Financiamiento Banorte',
        advisor: 'Carlos Morales',
        notes: 'Entrega en sala comercial con kit de bienvenida y póliza de seguro extendida.'
      },
      {
        id: 'sale-2',
        clientId: 'cli-7',
        vehicleId: 'veh-10',
        date: '2026-11-09',
        finalAmount: 580000,
        amount: 580000,
        paymentType: 'Transferencia SPEI Contado',
        advisor: 'Mariana Garza',
        notes: 'Venta de BMW Serie 3. Cliente satisfecho con peritaje de 150 puntos.'
      }
    ],

    // =========================================================================
    // ASESORES COMERCIALES OFICIALES
    // =========================================================================
    advisors: [
      { name: 'Carlos Morales', role: 'Asesor Comercial Senior', phone: '5543219876', email: 'carlos.morales@autocorp.mx', color: '#ff8901' },
      { name: 'Sofía Reyes', role: 'Recepción y Atención a Clientes', phone: '5512348765', email: 'sofia.reyes@autocorp.mx', color: '#251f1d' },
      { name: 'Alejandro Peña', role: 'Especialista en Financiamiento', phone: '5567894321', email: 'alejandro.pena@autocorp.mx', color: '#0284c7' },
      { name: 'Mariana Garza', role: 'Asesora de Ventas', phone: '5598761234', email: 'mariana.garza@autocorp.mx', color: '#16a34a' },
      { name: 'Roberto Méndez', role: 'Gerente de Piso y Valuador', phone: '5587654321', email: 'roberto.mendez@autocorp.mx', color: '#9333ea' }
    ]
  };
}
