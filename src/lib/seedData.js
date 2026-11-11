/**
 * @fileoverview Semilla inicial de datos para Outlet Autocorp CRM
 */
import { getTodayISO } from './utils';

export function getInitialSeedData() {
  const today = getTodayISO();

  return {
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
        observations: 'Único dueño, factura original de agencia, servicios al corriente.',
        dateAdded: today,
        interestedClientIds: ['cli-1']
      },
      {
        id: 'veh-2',
        inventoryId: 'OUT-2024-002',
        brand: 'Mazda',
        model: 'Mazda 3',
        version: 'i Grand Touring Sedán',
        year: 2022,
        color: 'Rojo Soul Red',
        mileage: 34200,
        transmission: 'Automática',
        fuel: 'Gasolina',
        price: 398000,
        estimatedDownPayment: 79600,
        status: 'disponible',
        images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'],
        observations: 'Quemacocos eléctrico, audio Bose de 12 bocinas, head-up display.',
        dateAdded: today,
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
        images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'],
        observations: 'Apartado por Juan Carlos Mendoza con $35,000 MXN en espera de aprobación bancaria.',
        dateAdded: today,
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
        transmission: 'Automática E-CVT',
        fuel: 'Híbrido',
        price: 589000,
        estimatedDownPayment: 117800,
        status: 'disponible',
        images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'],
        observations: 'Rendimiento de hasta 22 km/l, tracción inteligente electrónica AWD.',
        dateAdded: today,
        interestedClientIds: ['cli-4']
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
        price: 549000,
        estimatedDownPayment: 109800,
        status: 'disponible',
        images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'],
        observations: 'Selector de terrenos G.O.A.T., paquete de asistencia Co-Pilot360.',
        dateAdded: today,
        interestedClientIds: ['cli-5']
      },
      {
        id: 'veh-6',
        inventoryId: 'OUT-2024-006',
        brand: 'BMW',
        model: 'Serie 3',
        version: '330i M Sport',
        year: 2021,
        color: 'Negro Zafiro',
        mileage: 38000,
        transmission: 'Automática Deportiva',
        fuel: 'Gasolina',
        price: 685000,
        estimatedDownPayment: 137000,
        status: 'vendido',
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'],
        observations: 'Vendido a Roberto Martínez Gómez por $685,000 MXN.',
        dateAdded: today,
        interestedClientIds: ['cli-6']
      }
    ],

    clients: [
      {
        id: 'cli-1',
        name: 'Alejandro Peña Ruiz',
        phone: '55 4123 8901',
        email: 'alejandro.pena@gmail.com',
        hasBrandPreference: 'si',
        preferredBrand: 'Nissan',
        comments: 'Busca sedán automático seminuevo para uso diario y viajes cortos.',
        dateRegistered: today,
        visits: [{ date: today, notes: 'Primera visita al showroom.' }],
        interestedVehicleIds: ['veh-1'],
        intention: 'hot'
      },
      {
        id: 'cli-2',
        name: 'Sofía Reyes Delgado',
        phone: '55 8765 4321',
        email: 'sofia.reyes@outlook.com',
        hasBrandPreference: 'si',
        preferredBrand: 'Mazda',
        comments: 'Interesada en Mazda 3 para uso ejecutivo. Prefiere color rojo.',
        dateRegistered: today,
        visits: [{ date: today, notes: 'Visita física y prueba de manejo.' }],
        interestedVehicleIds: ['veh-2'],
        intention: 'hot'
      },
      {
        id: 'cli-3',
        name: 'Juan Carlos Mendoza',
        phone: '55 1928 3746',
        email: 'jcmendoza@empresa.com',
        hasBrandPreference: 'si',
        preferredBrand: 'Volkswagen',
        comments: 'Apartó Jetta R-Line con $35,000 MXN en espera de aprobación bancaria.',
        dateRegistered: today,
        visits: [{ date: today, notes: 'Firma de solicitud de crédito.' }],
        interestedVehicleIds: ['veh-3'],
        intention: 'medium'
      },
      {
        id: 'cli-4',
        name: 'Valeria Domínguez',
        phone: '55 6789 0123',
        email: 'valeria.dom@gmail.com',
        hasBrandPreference: 'si',
        preferredBrand: 'Toyota',
        comments: 'Interesada en SUV híbrida con bajo consumo de gasolina.',
        dateRegistered: today,
        visits: [{ date: today, notes: 'Cotización solicitada.' }],
        interestedVehicleIds: ['veh-4'],
        intention: 'medium'
      },
      {
        id: 'cli-5',
        name: 'Mariana Silva Torres',
        phone: '55 2345 6789',
        email: 'mariana.silva@yahoo.com',
        hasBrandPreference: 'no',
        preferredBrand: '',
        comments: 'Busca camioneta familiar SUV sin preferencia de marca.',
        dateRegistered: today,
        visits: [{ date: today, notes: 'Primera visita en piso de ventas.' }],
        interestedVehicleIds: ['veh-5'],
        intention: 'cold'
      }
    ],

    shifts: [
      {
        id: 'sh-1',
        date: today,
        startTime: '09:00',
        endTime: '18:00',
        responsible: 'Carlos Morales',
        area: 'Showroom Principal',
        phone: '55 1234 5678',
        email: 'carlos.m@outletautocorp.mx',
        observations: 'Apertura de instalaciones y guardias de piso.'
      },
      {
        id: 'sh-2',
        date: today,
        startTime: '10:00',
        endTime: '19:00',
        responsible: 'Fernanda Ortiz',
        area: 'Pruebas de Manejo',
        phone: '55 8765 4321',
        email: 'fernanda.o@outletautocorp.mx',
        observations: 'Coordinación de dinamismos en ruta.'
      },
      {
        id: 'sh-3',
        date: today,
        startTime: '12:00',
        endTime: '20:00',
        responsible: 'Ricardo Salgado',
        area: 'Cierre y Auditoría',
        phone: '55 9876 5432',
        email: 'ricardo.s@outletautocorp.mx',
        observations: 'Entrega de valores a caja y arqueo diario.'
      }
    ],

    activities: [
      {
        id: 'act-1',
        title: 'Revisión técnica de unidades en lote',
        iconType: 'revision',
        status: 'completada',
        date: today,
        time: '08:30',
        responsible: 'Carlos Morales',
        description: 'Chequeo de niveles de fluidos, presión de neumáticos y limpieza.',
        observations: 'Lote al 100% verificado.'
      },
      {
        id: 'act-2',
        title: 'Atención y recepción de prospectos',
        iconType: 'recepcion',
        status: 'en_proceso',
        date: today,
        time: '10:00',
        responsible: 'Fernanda Ortiz',
        description: 'Registro de nuevos invitados y canalización con asesores.',
        observations: 'Tráfico fluido en showroom.'
      },
      {
        id: 'act-3',
        title: 'Protocolo de cierre y resguardo vehicular',
        iconType: 'cierre',
        status: 'pendiente',
        date: today,
        time: '19:30',
        responsible: 'Ricardo Salgado',
        description: 'Bloqueo perimetral y aseguramiento de llaves en caja fuerte.',
        observations: 'Activación de alarma perimetral.'
      }
    ],

    testDrives: [
      {
        id: 'td-1',
        clientId: 'cli-2',
        vehicleId: 'veh-2',
        date: today,
        time: '11:30',
        responsible: 'Carlos Morales',
        status: 'Realizada',
        route: 'Ruta Periférico Sur',
        notes: 'Cliente encantada con el desempeño del motor Skyactiv.'
      },
      {
        id: 'td-2',
        clientId: 'cli-4',
        vehicleId: 'veh-4',
        date: today,
        time: '16:00',
        responsible: 'Fernanda Ortiz',
        status: 'Programada',
        route: 'Ruta Ciudad Universitaria',
        notes: 'Prueba de aceleración en modo híbrido.'
      }
    ],

    requests: [
      {
        id: 'req-1',
        clientId: 'cli-3',
        vehicleId: 'veh-3',
        date: today,
        type: 'Financiamiento Banorte',
        amount: 375000,
        termMonths: 48,
        status: 'Pendiente',
        notes: 'En proceso de validación de recibos de nómina.'
      },
      {
        id: 'req-2',
        clientId: 'cli-1',
        vehicleId: 'veh-1',
        date: today,
        type: 'Crédito Directo',
        amount: 329000,
        termMonths: 36,
        status: 'Aprobada',
        notes: 'Pre-aprobado con tasa preferencial.'
      }
    ],

    downPayments: [
      {
        id: 'dp-1',
        clientId: 'cli-3',
        vehicleId: 'veh-3',
        amount: 35000,
        date: today,
        method: 'Transferencia SPEI',
        reference: 'SPEI-992384',
        notes: 'Apartado firme de Volkswagen Jetta R-Line.'
      }
    ],

    sales: [
      {
        id: 'sale-1',
        clientId: 'cli-6',
        vehicleId: 'veh-6',
        finalAmount: 685000,
        paymentType: 'Contado',
        date: today,
        advisor: 'Carlos Morales',
        notes: 'BMW 330i entregado con tanque lleno y póliza de garantía.'
      }
    ]
  };
}
