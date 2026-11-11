/**
 * @fileoverview Controlador para Diseño 4: Carbon VIP Lounge & Performance Studio
 * Outlet Autocorp Mini CRM
 */
(function() {
'use strict';

const STORAGE_KEY = 'outlet_autocorp_data_v1';

// --- Formateadores Compartidos ---
function formatCurrency(amount, withCode = true) {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  return withCode ? `${formatted} MXN` : formatted;
}

function formatNumber(number) {
  if (number === undefined || number === null || isNaN(number)) return '0';
  return new Intl.NumberFormat('es-MX').format(number);
}

function formatDate(dateStr, format = 'short') {
  if (!dateStr) return '';
  const date = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(date.getTime())) return dateStr;
  if (format === 'short') {
    return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }
  if (format === 'long') {
    return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }
  return date.toLocaleDateString('es-MX');
}

function getTodayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

function generateId(prefix = 'ID') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function isDateInPeriod(dateStr, period) {
  if (!dateStr) return false;
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'today') {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() === today.getTime();
  }
  if (period === 'week') {
    const dayOfWeek = today.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diffToMonday);
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);
    return d >= startOfWeek && d <= endOfWeek;
  }
  if (period === 'month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  return true;
}

// --- SVG Icons ---
const icons = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  dollarSign: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  car: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`
};

function getIcon(name) {
  return icons[name] || icons.dashboard;
}

// --- Toast ---
function notify(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast toast-success animate-slide-in';
  t.style.background = '#201b1a';
  t.style.borderLeft = '4px solid #ff8901';
  t.style.boxShadow = '0 0 16px rgba(255, 137, 1, 0.4)';
  t.innerHTML = `<span class="font-bold text-orange">${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// --- Store Seguro con Semilla Autónoma ---
class StoreVIP {
  constructor() {
    this.load();
  }
  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.data = JSON.parse(saved);
        if (!this.data || !Array.isArray(this.data.vehicles) || this.data.vehicles.length === 0) {
          this.data = this.getDefaultData();
          this.save();
        }
      } else {
        this.data = this.getDefaultData();
        this.save();
      }
    } catch(e) {
      this.data = this.getDefaultData();
    }
  }
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch(e) {}
  }
  getVehicles() { return (this.data && this.data.vehicles) || []; }
  getClients() { return (this.data && this.data.clients) || []; }
  getShifts() { return (this.data && this.data.shifts) || []; }
  getActivities() { return (this.data && this.data.activities) || []; }
  getTestDrives() { return (this.data && this.data.testDrives) || []; }
  getRequests() { return (this.data && this.data.requests) || []; }
  getDownPayments() { return (this.data && this.data.downPayments) || []; }
  getSales() { return (this.data && this.data.sales) || []; }

  getDefaultData() {
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
          observations: 'Único dueño, factura original de agencia.',
          dateAdded: today,
          interestedClientIds: ['cli-1']
        },
        {
          id: 'veh-2',
          inventoryId: 'OUT-2024-002',
          brand: 'Mazda',
          model: 'Mazda 3',
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
          observations: 'Sonido Bose de 12 bocinas, quemacocos.',
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
          transmission: 'Automática',
          fuel: 'Gasolina',
          price: 375000,
          estimatedDownPayment: 75000,
          status: 'apartado',
          images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'],
          observations: 'Apartado con enganche recibido de $50,000 MXN.',
          dateAdded: today,
          interestedClientIds: ['cli-3']
        },
        {
          id: 'veh-4',
          inventoryId: 'OUT-2024-004',
          brand: 'BMW',
          model: 'Serie 3',
          version: '330i M Sport',
          year: 2021,
          color: 'Gris Mineral',
          mileage: 38000,
          transmission: 'Automática',
          fuel: 'Gasolina',
          price: 685000,
          estimatedDownPayment: 137000,
          status: 'disponible',
          images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'],
          observations: 'Paquete M Sport, rines 19".',
          dateAdded: today,
          interestedClientIds: ['cli-4']
        },
        {
          id: 'veh-5',
          inventoryId: 'OUT-2024-005',
          brand: 'Toyota',
          model: 'RAV4',
          version: 'Limited Hybrid',
          year: 2022,
          color: 'Azul Cósmico',
          mileage: 31000,
          transmission: 'Automática e-CVT',
          fuel: 'Híbrido',
          price: 549000,
          estimatedDownPayment: 109800,
          status: 'disponible',
          images: ['https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=800&q=80'],
          observations: 'Rendimiento 22 km/l, AWD.',
          dateAdded: today,
          interestedClientIds: []
        },
        {
          id: 'veh-6',
          inventoryId: 'OUT-2024-006',
          brand: 'Audi',
          model: 'A4',
          version: 'S-Line 40 TFSI',
          year: 2020,
          color: 'Negro Brillante',
          mileage: 52000,
          transmission: 'S tronic 7 vel',
          fuel: 'Gasolina',
          price: 525000,
          estimatedDownPayment: 105000,
          status: 'vendido',
          images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80'],
          observations: 'Unidad vendida garantizada.',
          dateAdded: today,
          interestedClientIds: []
        }
      ],
      clients: [
        {
          id: 'cli-1',
          name: 'Alejandro Morales Rivera',
          phone: '55 4192 8374',
          email: 'a.morales@gmail.com',
          hasBrandPreference: 'si',
          preferredBrand: 'Nissan',
          comments: 'Busca sedán económico.',
          dateRegistered: today,
          visits: [{ date: today, notes: 'Visita presencial showroom.' }],
          interestedVehicleIds: ['veh-1']
        },
        {
          id: 'cli-2',
          name: 'Sofía Valenzuela Garza',
          phone: '81 1928 3746',
          email: 'sofia.valenzuela@outlook.com',
          hasBrandPreference: 'si',
          preferredBrand: 'Mazda',
          comments: 'Interesada en Mazda 3.',
          dateRegistered: today,
          visits: [{ date: today, notes: 'Prueba de manejo realizada.' }],
          interestedVehicleIds: ['veh-2']
        },
        {
          id: 'cli-3',
          name: 'Ricardo Mendoza Lozano',
          phone: '33 8271 9405',
          email: 'ricardo.mendoza@corporativo.com',
          hasBrandPreference: 'si',
          preferredBrand: 'Volkswagen',
          comments: 'Dejó apartado firme en caja de $50,000.',
          dateRegistered: today,
          visits: [{ date: today, notes: 'Pago de apartado en caja.' }],
          interestedVehicleIds: ['veh-3']
        },
        {
          id: 'cli-4',
          name: 'Mariana Domínguez Ortiz',
          phone: '55 7382 9104',
          email: 'mariana.dominguez@innova.mx',
          hasBrandPreference: 'si',
          preferredBrand: 'BMW',
          comments: 'Cliente VIP interesada en Serie 3.',
          dateRegistered: today,
          visits: [{ date: today, notes: 'Visita showroom.' }],
          interestedVehicleIds: ['veh-4']
        },
        {
          id: 'cli-5',
          name: 'Carlos Fuentes Treviño',
          phone: '55 1234 5678',
          email: 'carlos.fuentes@empresa.com',
          hasBrandPreference: 'no',
          preferredBrand: '',
          comments: 'Sin preferencia, busca SUV.',
          dateRegistered: today,
          visits: [{ date: today, notes: 'Visita general.' }],
          interestedVehicleIds: ['veh-5']
        }
      ],
      shifts: [
        {
          id: 'sh-1',
          date: today,
          responsible: 'Carlos Morales',
          startTime: '09:00',
          endTime: '18:00',
          area: 'Guardia Principal',
          phone: '55 4192 8374',
          email: 'carlos.morales@outletautocorp.mx',
          observations: 'Turno de apertura.'
        },
        {
          id: 'sh-2',
          date: today,
          responsible: 'Ana Laura Gómez',
          startTime: '10:00',
          endTime: '19:00',
          area: 'Piso de Ventas',
          phone: '55 8392 0182',
          email: 'ana.gomez@outletautocorp.mx',
          observations: 'Turno de pruebas.'
        },
        {
          id: 'sh-3',
          date: today,
          responsible: 'Miguel Ángel Torres',
          startTime: '11:00',
          endTime: '20:00',
          area: 'Cierre y Seguridad',
          phone: '55 9283 7461',
          email: 'miguel.torres@outletautocorp.mx',
          observations: 'Turno de cierre.'
        }
      ],
      activities: [
        {
          id: 'act-1',
          title: 'Apertura de Showroom y Llaves',
          responsible: 'Carlos Morales',
          date: today,
          time: '08:30',
          status: 'completada',
          iconType: 'apertura',
          description: 'Desbloqueo de accesos, encendido de iluminación.',
          observations: 'En orden.'
        },
        {
          id: 'act-2',
          title: 'Inspección de 150 Puntos en Patio',
          responsible: 'Ana Laura Gómez',
          date: today,
          time: '09:30',
          status: 'completada',
          iconType: 'revision',
          description: 'Revisión de presión de llantas y estética.',
          observations: 'Completado.'
        },
        {
          id: 'act-3',
          title: 'Recepción y Atención de Invitados',
          responsible: 'Carlos Morales',
          date: today,
          time: '11:00',
          status: 'en_proceso',
          iconType: 'recepcion',
          description: 'Registro de visitantes y canalización.',
          observations: 'En curso.'
        },
        {
          id: 'act-4',
          title: 'Limpieza y Detallado de Autos',
          responsible: 'Equipo de Operaciones',
          date: today,
          time: '13:00',
          status: 'en_proceso',
          iconType: 'limpieza',
          description: 'Lavado en seco y aspirado de unidades.',
          observations: 'En turno.'
        },
        {
          id: 'act-5',
          title: 'Rondín de Seguridad y Monitoreo',
          responsible: 'Miguel Ángel Torres',
          date: today,
          time: '16:00',
          status: 'pendiente',
          iconType: 'seguridad',
          description: 'Supervisión de cámaras perimetrales.',
          observations: 'Programada.'
        },
        {
          id: 'act-6',
          title: 'Cierre Nocturno y Arqueo de Caja',
          responsible: 'Miguel Ángel Torres',
          date: today,
          time: '20:00',
          status: 'pendiente',
          iconType: 'cierre',
          description: 'Cierre de cortinas y alarma perimetral.',
          observations: 'Al fin de turno.'
        }
      ],
      testDrives: [
        {
          id: 'td-1',
          clientId: 'cli-2',
          vehicleId: 'veh-2',
          date: today,
          time: '11:30',
          responsible: 'Ana Laura Gómez',
          status: 'Realizada'
        },
        {
          id: 'td-2',
          clientId: 'cli-4',
          vehicleId: 'veh-4',
          date: today,
          time: '16:00',
          responsible: 'Carlos Morales',
          status: 'Programada'
        }
      ],
      requests: [
        {
          id: 'req-1',
          clientId: 'cli-2',
          vehicleId: 'veh-2',
          date: today,
          type: 'Financiamiento Scotiabank',
          status: 'Pendiente',
          amount: 280000
        },
        {
          id: 'req-2',
          clientId: 'cli-1',
          vehicleId: 'veh-1',
          date: today,
          type: 'Crédito Tradicional Banorte',
          status: 'Pendiente',
          amount: 240000
        }
      ],
      downPayments: [
        {
          id: 'dp-1',
          clientId: 'cli-3',
          vehicleId: 'veh-3',
          date: today,
          amount: 50000,
          concept: 'Apartado de Jetta R-Line 2021',
          receivedBy: 'Caja Showroom'
        }
      ],
      sales: [
        {
          id: 'sale-1',
          clientId: 'cli-5',
          vehicleId: 'veh-6',
          date: today,
          finalAmount: 525000,
          paymentType: 'Contado Transferencia SPEI',
          advisor: 'Ana Laura Gómez'
        }
      ]
    };
  }
}
const store = new StoreVIP();

// --- App VIP ---
class AppVIP {
  constructor() {
    this.currentView = 'general';
    this.period = 'month';
    this.invFilter = 'disponible';
    this.clientSearch = '';

    this.init();
  }

  init() {
    this.initTheme();
    this.bindNav();
    this.render(this.currentView);

    const liveDate = document.getElementById('vip-live-date');
    if (liveDate) liveDate.textContent = formatDate(getTodayISO(), 'long');

    const resetBtn = document.getElementById('btn-vip-reset');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('¿Restablecer datos de demostración a valores de fábrica?')) {
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
        }
      };
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem('outlet_autocorp_vip_theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
    this.updateThemeButton();

    const toggleBtn = document.getElementById('btn-theme-toggle');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        document.body.classList.toggle('theme-light');
        const isLight = document.body.classList.contains('theme-light');
        localStorage.setItem('outlet_autocorp_vip_theme', isLight ? 'light' : 'dark');
        this.updateThemeButton();
      };
    }
  }

  updateThemeButton() {
    const isLight = document.body.classList.contains('theme-light');
    const iconEl = document.getElementById('theme-icon');
    const textEl = document.getElementById('theme-text');
    if (iconEl && textEl) {
      iconEl.textContent = isLight ? '🌙' : '☀️';
      textEl.textContent = isLight ? 'Modo Noche' : 'Modo Día';
    }
  }

  bindNav() {
    document.querySelectorAll('.vip-nav-btn').forEach(btn => {
      btn.onclick = () => {
        const v = btn.getAttribute('data-view');
        document.querySelectorAll('.vip-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.render(v);
      };
    });
  }

  render(view) {
    this.currentView = view;
    const container = document.getElementById('vip-view-container');
    const heroTitle = document.getElementById('vip-hero-title');
    if (!container) return;

    const titles = {
      general: 'Cockpit de Rendimiento Comercial',
      guardias: 'Centro de Guardias y Operaciones Showroom',
      clientes: 'Expedientes VIP de Clientes',
      inventario: 'Inventario de Alto Desempeño'
    };
    if (heroTitle) heroTitle.textContent = titles[view] || 'Outlet Autocorp VIP';

    if (view === 'general') this.renderDashboard(container);
    if (view === 'guardias') this.renderGuardias(container);
    if (view === 'clientes') this.renderClientes(container);
    if (view === 'inventario') this.renderInventario(container);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- DASHBOARD VIP ---
  renderDashboard(container) {
    const vehicles = store.getVehicles();
    const clients = store.getClients();
    const testDrives = store.getTestDrives().filter(td => isDateInPeriod(td.date, this.period));
    const requests = store.getRequests().filter(r => isDateInPeriod(r.date, this.period));
    const downPayments = store.getDownPayments().filter(dp => isDateInPeriod(dp.date, this.period));
    const sales = store.getSales().filter(s => isDateInPeriod(s.date, this.period));

    let invitados = 0;
    clients.forEach(c => {
      (c.visits || []).forEach(v => {
        if (isDateInPeriod(v.date, this.period)) invitados++;
      });
    });

    const availVehs = vehicles.filter(v => v.status === 'disponible');
    const totalSales = sales.reduce((s, x) => s + Number(x.finalAmount || 0), 0);
    const totalDown = downPayments.reduce((s, x) => s + Number(x.amount || 0), 0);

    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Toolbar VIP -->
        <div class="d-flex justify-between align-center mb-4 flex-wrap gap-2">
          <div class="d-flex gap-2">
            <button class="btn-vip btn-vip-sm ${this.period === 'today' ? 'btn-vip-primary' : 'btn-vip-outline'}" data-p="today">Hoy</button>
            <button class="btn-vip btn-vip-sm ${this.period === 'week' ? 'btn-vip-primary' : 'btn-vip-outline'}" data-p="week">Esta semana</button>
            <button class="btn-vip btn-vip-sm ${this.period === 'month' ? 'btn-vip-primary' : 'btn-vip-outline'}" data-p="month">Este mes</button>
          </div>

          <div class="d-flex gap-2">
            <button class="btn-vip btn-vip-primary btn-vip-sm" id="vip-quick-guest">+ Registrar Invitado</button>
            <button class="btn-vip btn-vip-outline btn-vip-sm" id="vip-quick-sale">Registrar Venta</button>
          </div>
        </div>

        <!-- 6 Instrumentos Cockpit HUD & Medidores de Telemetría VIP -->
        <div class="hud-cluster-grid">
          <!-- 1. Ventas: Tacómetro RPM Dial SVG -->
          <div class="hud-instrument-card" data-nav="inventario">
            <div class="hud-instrument-header">
              <span class="hud-instrument-title">TACHOMETER / FACTURACIÓN</span>
              <span class="badge-vip badge-vip-orange">86% RPM</span>
            </div>
            <div class="hud-instrument-body">
              <div>
                <div class="hud-instrument-val">${formatCurrency(totalSales)}</div>
                <div class="hud-instrument-sub">${sales.length} AUTOS COLOCADOS</div>
              </div>
              <div class="hud-dial-svg">
                <svg viewBox="0 0 100 80">
                  <path d="M 15 65 A 38 38 0 1 1 85 65" fill="none" stroke="#2a221f" stroke-width="7" stroke-linecap="round" />
                  <path d="M 15 65 A 38 38 0 1 1 85 65" fill="none" stroke="#ff8901" stroke-width="7" stroke-dasharray="160" stroke-dashoffset="${Math.max(0, 160 - (Math.min(totalSales / 4000000, 1) * 160))}" stroke-linecap="round" />
                  <circle cx="50" cy="45" r="4" fill="#ffffff" />
                  <line x1="50" y1="45" x2="76" y2="24" stroke="#ff8901" stroke-width="3" stroke-linecap="round" />
                </svg>
                <div class="hud-center-text" style="bottom: 2px;">MXN</div>
              </div>
            </div>
          </div>

          <!-- 2. Inventario: Barra de Combustible / Lote HUD -->
          <div class="hud-instrument-card" data-nav="inventario">
            <div class="hud-instrument-header">
              <span class="hud-instrument-title">CAPACIDAD / LOTE EN SALA</span>
              <span class="badge-vip badge-vip-green">ONLINE</span>
            </div>
            <div class="hud-instrument-body">
              <div>
                <div class="hud-instrument-val text-orange">${availVehs.length} <span style="font-size:14px;color:#a39b97;">DISP.</span></div>
                <div class="hud-instrument-sub">DE ${vehicles.length} AUTOS EN EXHIBICIÓN</div>
              </div>
              <div class="hud-dial-svg">
                <div style="display: flex; gap: 4px; align-items: flex-end; height: 50px;">
                  <div style="width: 10px; height: 20px; background: #10b981; border-radius: 2px; box-shadow: 0 0 8px #10b981;"></div>
                  <div style="width: 10px; height: 28px; background: #10b981; border-radius: 2px; box-shadow: 0 0 8px #10b981;"></div>
                  <div style="width: 10px; height: 36px; background: #10b981; border-radius: 2px; box-shadow: 0 0 8px #10b981;"></div>
                  <div style="width: 10px; height: 44px; background: #10b981; border-radius: 2px; box-shadow: 0 0 8px #10b981;"></div>
                  <div style="width: 10px; height: 50px; background: #ff8901; border-radius: 2px; box-shadow: 0 0 8px #ff8901;"></div>
                </div>
                <div class="hud-center-text" style="bottom: -8px; font-size: 10px;">STOCK</div>
              </div>
            </div>
          </div>

          <!-- 3. Pruebas Dinámicas: Sport Chrono Dial SVG -->
          <div class="hud-instrument-card" data-nav="guardias">
            <div class="hud-instrument-header">
              <span class="hud-instrument-title">SPORT CHRONO / TEST DRIVE</span>
              <span class="badge-vip badge-vip-orange">PISTA</span>
            </div>
            <div class="hud-instrument-body">
              <div>
                <div class="hud-instrument-val">${testDrives.length}</div>
                <div class="hud-instrument-sub">PRUEBAS EN CIRCUITO</div>
              </div>
              <div class="hud-dial-svg">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#2a221f" stroke-width="4" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#ff8901" stroke-width="4" stroke-dasharray="200" stroke-dashoffset="${200 - ((testDrives.length / 15) * 200)}" stroke-linecap="round" transform="rotate(-90 40 40)" />
                  <circle cx="40" cy="40" r="3" fill="#ff8901" />
                  <line x1="40" y1="40" x2="56" y2="28" stroke="#ff8901" stroke-width="2" stroke-linecap="round" />
                </svg>
                <div class="hud-center-text" style="color: #ffffff;">CHRONO</div>
              </div>
            </div>
          </div>

          <!-- 4. Invitados: Radar / Sonar Target HUD SVG -->
          <div class="hud-instrument-card" data-nav="clientes">
            <div class="hud-instrument-header">
              <span class="hud-instrument-title">RADAR / PROSPECCIÓN SALA</span>
              <span class="badge-vip badge-vip-green">SCANNING</span>
            </div>
            <div class="hud-instrument-body">
              <div>
                <div class="hud-instrument-val">${invitados}</div>
                <div class="hud-instrument-sub">VISITANTES DETECTADOS</div>
              </div>
              <div class="hud-dial-svg">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#2a221f" stroke-width="2" />
                  <circle cx="40" cy="40" r="20" fill="none" stroke="#ff8901" stroke-width="1.5" stroke-opacity="0.4" />
                  <circle cx="40" cy="40" r="8" fill="none" stroke="#ff8901" stroke-width="1.5" />
                  <line x1="8" y1="40" x2="72" y2="40" stroke="#ff8901" stroke-width="1" stroke-opacity="0.5" />
                  <line x1="40" y1="8" x2="40" y2="72" stroke="#ff8901" stroke-width="1" stroke-opacity="0.5" />
                  <circle cx="55" cy="28" r="4" fill="#ff8901" />
                </svg>
                <div class="hud-center-text" style="bottom: -8px; font-size: 10px;">ACTIVE</div>
              </div>
            </div>
          </div>

          <!-- 5. Solicitudes: Presión Turbo Boost HUD -->
          <div class="hud-instrument-card" data-nav="clientes">
            <div class="hud-instrument-header">
              <span class="hud-instrument-title">BOOST / CRÉDITO Y COMPRA</span>
              <span class="badge-vip badge-vip-amber">ANALYSIS</span>
            </div>
            <div class="hud-instrument-body">
              <div>
                <div class="hud-instrument-val">${requests.length}</div>
                <div class="hud-instrument-sub">EXPEDIENTES ACTIVOS</div>
              </div>
              <div class="hud-dial-svg">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#2a221f" stroke-width="6" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" stroke-width="6" stroke-dasharray="188.4" stroke-dashoffset="${188.4 - ((requests.length / 10) * 188.4)}" stroke-linecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div class="hud-center-text" style="color: #f59e0b;">PSI</div>
              </div>
            </div>
          </div>

          <!-- 6. Enganches en Caja: Bóveda Digital Telemetría -->
          <div class="hud-instrument-card" data-nav="inventario">
            <div class="hud-instrument-header">
              <span class="hud-instrument-title">VAULT / ENGANCHE EN CAJA</span>
              <span class="badge-vip badge-vip-green">SECURE</span>
            </div>
            <div class="hud-instrument-body">
              <div>
                <div class="hud-instrument-val text-orange">${formatCurrency(totalDown)}</div>
                <div class="hud-instrument-sub">APARTADOS FIRMES EN CAJA</div>
              </div>
              <div class="hud-dial-svg">
                <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 137, 1, 0.15); border: 1px solid #ff8901; color: #ff8901; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(255, 137, 1, 0.3);">
                  ${getIcon('dollarSign')}
                </div>
                <div class="hud-center-text" style="bottom: -8px; font-size: 10px;">LOCKED</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráficas VIP -->
        <div class="charts-vip-grid">
          <div class="card-vip">
            <div class="card-vip-header">
              <h3 class="card-vip-title">Facturación Acumulada (MXN)</h3>
              <span class="badge-vip badge-vip-orange font-bold">${formatCurrency(totalSales)}</span>
            </div>
            <div class="card-vip-body">
              <div id="vip-sales-svg" style="height: 220px; width: 100%;"></div>
            </div>
          </div>

          <div class="card-vip">
            <div class="card-vip-header">
              <h3 class="card-vip-title">Pipeline de Conversión VIP</h3>
            </div>
            <div class="card-vip-body">
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <div>
                  <div class="d-flex justify-between mb-1" style="font-size: 12px;">
                    <span>1. Prospección e Invitados</span>
                    <strong>${invitados}</strong>
                  </div>
                  <div style="height: 8px; background: #2a2321; border-radius: 4px; overflow: hidden;">
                    <div style="width: 100%; height: 100%; background: #ffffff;"></div>
                  </div>
                </div>

                <div>
                  <div class="d-flex justify-between mb-1" style="font-size: 12px;">
                    <span>2. Pruebas de Manejo</span>
                    <strong class="text-orange">${testDrives.length} (${invitados > 0 ? Math.round((testDrives.length/invitados)*100) : 0}%)</strong>
                  </div>
                  <div style="height: 8px; background: #2a2321; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${invitados > 0 ? Math.min((testDrives.length/invitados)*100, 100) : 12}%; height: 100%; background: #0284c7;"></div>
                  </div>
                </div>

                <div>
                  <div class="d-flex justify-between mb-1" style="font-size: 12px;">
                    <span>3. Solicitudes de Financiamiento</span>
                    <strong style="color: #f59e0b;">${requests.length}</strong>
                  </div>
                  <div style="height: 8px; background: #2a2321; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${invitados > 0 ? Math.min((requests.length/invitados)*100, 100) : 10}%; height: 100%; background: #f59e0b;"></div>
                  </div>
                </div>

                <div>
                  <div class="d-flex justify-between mb-1" style="font-size: 12px;">
                    <span>4. Cierre y Entrega</span>
                    <strong class="text-orange">${sales.length} (${invitados > 0 ? Math.round((sales.length/invitados)*100) : 0}% conv.)</strong>
                  </div>
                  <div style="height: 8px; background: #2a2321; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${invitados > 0 ? Math.min((sales.length/invitados)*100, 100) : 10}%; height: 100%; background: #ff8901; box-shadow: 0 0 10px #ff8901;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderNeonSVG('vip-sales-svg', sales.length > 0 ? sales : store.getSales().slice(0, 5));

    container.querySelectorAll('button[data-p]').forEach(b => {
      b.onclick = () => {
        this.period = b.getAttribute('data-p');
        this.renderDashboard(container);
      };
    });

    container.querySelectorAll('.hud-instrument-card').forEach(c => {
      c.onclick = () => {
        const nav = c.getAttribute('data-nav');
        if (nav) document.querySelector(`.vip-nav-btn[data-view="${nav}"]`).click();
      };
    });

    const qGuest = container.querySelector('#vip-quick-guest');
    if (qGuest) {
      qGuest.onclick = () => {
        const name = prompt('Nombre completo del nuevo cliente VIP:', '');
        if (name) {
          const phone = prompt('Celular (10 dígitos):', '55');
          store.data.clients.unshift({
            id: generateId('cli'),
            name,
            phone: phone || '5500000000',
            email: '',
            hasBrandPreference: 'no',
            preferredBrand: '',
            comments: 'Registro VIP.',
            dateRegistered: getTodayISO(),
            visits: [{ date: getTodayISO(), notes: 'Visita VIP en showroom.' }],
            interestedVehicleIds: []
          });
          store.save();
          notify(`Cliente VIP ${name} registrado.`);
          this.renderDashboard(container);
        }
      };
    }

    const qSale = container.querySelector('#vip-quick-sale');
    if (qSale) {
      qSale.onclick = () => document.querySelector(`.vip-nav-btn[data-view="inventario"]`).click();
    }
  }

  renderNeonSVG(id, list) {
    const el = document.getElementById(id);
    if (!el) return;
    const max = Math.max(...list.map(s => Number(s.finalAmount || 0)), 500000);
    const w = el.clientWidth || 500;
    const h = 200;
    const pad = { top: 20, right: 30, bottom: 30, left: 50 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const pts = list.map((s, idx) => {
      const x = pad.left + (chartW / Math.max(list.length - 1, 1)) * idx;
      const y = pad.top + chartH - (Number(s.finalAmount || 0) / max) * chartH;
      return `${x},${y}`;
    }).join(' ');

    const area = `${pad.left},${pad.top + chartH} ${pts} ${pad.left + chartW},${pad.top + chartH}`;

    el.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="vipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff8901" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#ff8901" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points="${area}" fill="url(#vipGrad)" />
        <polyline points="${pts}" fill="none" stroke="#ff8901" stroke-width="3" stroke-linecap="round" filter="drop-shadow(0 0 6px rgba(255,137,1,0.6))"/>
        ${list.map((s, idx) => {
          const x = pad.left + (chartW / Math.max(list.length - 1, 1)) * idx;
          const y = pad.top + chartH - (Number(s.finalAmount || 0) / max) * chartH;
          return `
            <circle cx="${x}" cy="${y}" r="5" fill="#ff8901" stroke="#161312" stroke-width="2"/>
            <text x="${x}" y="${h - 8}" text-anchor="middle" font-size="10" fill="#a39b97">${formatDate(s.date, 'short')}</text>
          `;
        }).join('')}
      </svg>
    `;
  }

  // --- GUARDIAS VIP ---
  renderGuardias(container) {
    const shifts = store.getShifts();
    const activities = store.getActivities();

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="card-vip mb-4">
          <div class="card-vip-header">
            <h3 class="card-vip-title">Roles de Guardia en Turno</h3>
            <span class="badge-vip badge-vip-orange">Operaciones Activas</span>
          </div>
          <div class="card-vip-body p-0">
            <div>
              ${shifts.slice(0, 8).map(s => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; border-bottom: 1px solid #332a28;">
                  <div>
                    <strong style="color: #ffffff; font-size: 15px;">${s.responsible}</strong>
                    <div style="font-size: 12px; color: #a39b97;">${formatDate(s.date, 'long')} · ${s.area}</div>
                  </div>
                  <span class="badge-vip badge-vip-orange">${s.startTime} - ${s.endTime}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <h3 class="font-bold mb-3" style="font-size: 20px; color: #ffffff;">Tarjetas Tácticas de Actividades (3D Flip)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
          ${activities.map(act => `
            <div class="vip-flip-wrapper" data-act-id="${act.id}">
              <div class="vip-flip-inner">
                <!-- Frente -->
                <div class="vip-flip-face">
                  <div class="d-flex justify-between align-center">
                    <span class="text-orange font-bold" style="font-size: 11px; text-transform: uppercase;">● ${act.iconType}</span>
                    <span class="badge-vip ${act.status === 'completada' ? 'badge-vip-green' : 'badge-vip-amber'}">${act.status.toUpperCase()}</span>
                  </div>
                  <h4 style="font-size: 16px; color: #ffffff; margin-top: 10px;">${act.title}</h4>
                  <div style="font-size: 12px; color: #a39b97; margin-top: 4px;">Responsable: <strong style="color: #fff;">${act.responsible}</strong></div>
                  <div class="d-flex justify-between align-center mt-3 pt-3" style="border-top: 1px solid #332a28; font-size: 11px;">
                    <span class="text-muted">${act.time} · ${formatDate(act.date, 'short')}</span>
                    <span class="text-orange font-bold">Girar ↻</span>
                  </div>
                </div>

                <!-- Reverso -->
                <div class="vip-flip-face vip-flip-back">
                  <div>
                    <span style="font-size: 9px; font-weight: 800; color: #ff8901; text-transform: uppercase;">Instrucciones Especiales</span>
                    <h5 style="font-size: 14px; color: #ffffff; margin-top: 4px;">${act.responsible}</h5>
                    <p style="font-size: 11px; color: #a39b97; margin-top: 6px;">${act.description || 'Sin notas.'}</p>
                    ${act.observations ? `<p class="input-italic" style="font-size: 10px; color: #ff8901; margin-top: 4px;">"${act.observations}"</p>` : ''}
                  </div>
                  <div class="d-flex justify-between align-center mt-3 pt-3" style="border-top: 1px solid #332a28;">
                    <button class="btn-vip btn-vip-primary btn-vip-sm btn-vip-toggle-status" data-act-id="${act.id}" style="padding: 4px 10px; font-size: 11px;">
                      ${act.status === 'completada' ? 'Reabrir' : 'Completar'}
                    </button>
                    <span style="font-size: 10px; color: #a39b97;">Volver ↺</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Giro táctil y toggle de estatus
    container.querySelectorAll('.vip-flip-wrapper').forEach(w => {
      w.onclick = (e) => {
        if (e.target.closest('button')) return;
        w.querySelector('.vip-flip-inner').classList.toggle('is-flipped');
      };
    });

    container.querySelectorAll('.btn-vip-toggle-status').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-act-id');
        const act = store.getActivities().find(a => a.id === id);
        if (act) {
          act.status = act.status === 'completada' ? 'pendiente' : 'completada';
          store.save();
          notify(`Estatus actualizado a ${act.status}.`);
          this.renderGuardias(container);
        }
      };
    });
  }

  // --- CLIENTES VIP: BLACK BOOK STREAM ---
  renderClientes(container) {
    const clients = store.getClients();

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="d-flex justify-between align-center mb-4 flex-wrap gap-2">
          <div style="flex: 1; max-width: 400px;">
            <input type="text" class="input-search" id="vip-cli-search" placeholder="Buscar en Black Book VIP..." style="background: #201b19; border-color: #382c28; color: #fff;" />
          </div>
          <button class="btn-vip btn-vip-primary btn-vip-sm" id="btn-vip-add-cli">+ Agregar Cliente VIP</button>
        </div>

        <!-- Black Book Stream de Clientes VIP -->
        <div class="d-flex flex-column gap-3">
          ${clients.map((c, i) => {
            const visitCount = (c.visits || []).length;
            let tierTag = '<span class="vip-tier-badge">✨ Prospecto</span>';
            if (visitCount >= 2) tierTag = '<span class="vip-tier-badge" style="background: rgba(255,137,1,0.2); color: #ff8901; border-color: #ff8901;">💎 Platinum VIP</span>';
            else if (visitCount === 1) tierTag = '<span class="vip-tier-badge" style="background: rgba(16,185,129,0.15); color: #10b981; border-color: #10b981;">⭐ Alta Prioridad</span>';

            return `
              <div class="vip-client-card">
                <div class="d-flex align-center gap-3">
                  <div style="width: 48px; height: 48px; border-radius: 12px; background: #161211; border: 1px solid #ff8901; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; color: #ff8901; box-shadow: 0 0 12px rgba(255,137,1,0.25);">
                    ${c.name.charAt(0)}
                  </div>
                  <div>
                    <div class="d-flex align-center gap-2">
                      <strong style="font-size: 16px; color: #ffffff;">${c.name}</strong>
                      ${tierTag}
                    </div>
                    <div class="d-flex gap-3 align-center mt-1" style="font-size: 12px; color: #a39b97;">
                      <span>📞 ${c.phone}</span>
                      <span>✉️ ${c.email || 'Sin correo'}</span>
                      <span>📅 ${visitCount} visitas registradas</span>
                    </div>
                  </div>
                </div>

                <div class="d-flex align-center gap-3 flex-wrap">
                  <div>
                    ${c.hasBrandPreference === 'si' && c.preferredBrand 
                      ? `<span class="badge-vip badge-vip-orange">Interés: ${c.preferredBrand}</span>` 
                      : '<span class="badge-vip" style="background: #2a2220; color: #a39b97;">Sin preferencia</span>'}
                  </div>
                  <div class="d-flex gap-2">
                    <button class="btn-vip btn-vip-outline btn-vip-sm btn-v-visit" data-id="${c.id}" title="Registrar visita rápida">+ Visita</button>
                    <a href="tel:${c.phone}" class="btn-vip btn-vip-sm" style="background: #2a2220; color: #fff;">Llamar</a>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-v-visit').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        const c = store.getClients().find(x => x.id === id);
        if (c) {
          c.visits.unshift({ date: getTodayISO(), notes: 'Visita VIP registrada en piso.' });
          store.save();
          notify(`Visita VIP registrada para ${c.name}. KPI Invitados actualizado.`);
          this.renderClientes(container);
        }
      };
    });

    const addBtn = container.querySelector('#btn-vip-add-cli');
    if (addBtn) {
      addBtn.onclick = () => {
        const name = prompt('Nombre completo del cliente VIP:');
        if (!name) return;
        const phone = prompt('Celular (10 dígitos):', '55');
        store.data.clients.unshift({
          id: generateId('cli'),
          name,
          phone: phone || '5500000000',
          email: '',
          hasBrandPreference: 'no',
          preferredBrand: '',
          comments: 'Alta VIP.',
          dateRegistered: getTodayISO(),
          visits: [{ date: getTodayISO(), notes: 'Alta inicial.' }],
          interestedVehicleIds: []
        });
        store.save();
        notify(`Cliente VIP ${name} guardado con éxito.`);
        this.renderClientes(container);
      };
    }
  }

  // --- INVENTARIO VIP: SUPERCAR SHOWROOM PODS ---
  renderInventario(container) {
    const vehs = store.getVehicles().filter(v => this.invFilter === 'all' || v.status === this.invFilter);

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="d-flex justify-between align-center mb-4 flex-wrap gap-2">
          <div class="d-flex gap-2">
            <button class="btn-vip btn-vip-sm ${this.invFilter === 'disponible' ? 'btn-vip-primary' : 'btn-vip-outline'}" data-stat="disponible">Disponibles</button>
            <button class="btn-vip btn-vip-sm ${this.invFilter === 'apartado' ? 'btn-vip-primary' : 'btn-vip-outline'}" data-stat="apartado">Apartados</button>
            <button class="btn-vip btn-vip-sm ${this.invFilter === 'vendido' ? 'btn-vip-primary' : 'btn-vip-outline'}" data-stat="vendido">Vendidos</button>
            <button class="btn-vip btn-vip-sm ${this.invFilter === 'all' ? 'btn-vip-primary' : 'btn-vip-outline'}" data-stat="all">Todos</button>
          </div>
        </div>

        <div class="inv-vip-grid">
          ${vehs.map(v => {
            const img = (v.images && v.images[0]) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
            let badgeStyle = 'background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid #10b981;';
            if (v.status === 'apartado') badgeStyle = 'background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid #f59e0b;';
            if (v.status === 'vendido') badgeStyle = 'background: rgba(107,114,128,0.2); color: #9ca3af; border: 1px solid #6b7280;';

            return `
              <div class="supercar-pod-card">
                <div class="supercar-pod-media">
                  <img src="${img}" class="supercar-pod-img" alt="${v.model}" loading="lazy"/>
                  <span style="position: absolute; top: 12px; left: 12px; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; ${badgeStyle}">
                    ● ${v.status.toUpperCase()}
                  </span>
                  <span style="position: absolute; bottom: 12px; right: 12px; font-size: 10px; font-family: monospace; background: rgba(0,0,0,0.85); color: #ff8901; padding: 3px 8px; border-radius: 4px; border: 1px solid #382c28;">
                    ${v.inventoryId}
                  </span>
                </div>

                <div class="supercar-pod-body">
                  <div>
                    <span style="font-size: 11px; color: #ff8901; font-weight: 700; text-transform: uppercase;">${v.brand} · ${v.year}</span>
                    <h3 style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 2px;">${v.model}</h3>
                    <div style="font-size: 12px; color: #a39b97;">${v.version || ''} · Color ${v.color}</div>
                  </div>

                  <!-- Telemetría HUD Specs -->
                  <div class="supercar-hud-specs">
                    <div class="supercar-spec-item"><span>Kilometraje</span><strong>${formatNumber(v.mileage)} km</strong></div>
                    <div class="supercar-spec-item"><span>Transmisión</span><strong>${v.transmission}</strong></div>
                    <div class="supercar-spec-item"><span>Combustible</span><strong>${v.fuel}</strong></div>
                  </div>

                  <div>
                    <div style="font-size: 11px; color: #a39b97; text-transform: uppercase;">Precio VIP Contado</div>
                    <div style="font-size: 22px; font-weight: 800; color: #ff8901; text-shadow: 0 0 10px rgba(255,137,1,0.3);">${formatCurrency(v.price)}</div>
                    <div style="font-size: 11px; color: #a39b97; margin-top: 2px;">Enganche est.: <strong style="color: #ffffff;">${formatCurrency(v.estimatedDownPayment)}</strong></div>
                  </div>

                  <div class="d-flex gap-2 mt-3 pt-3" style="border-top: 1px solid #2a2220;">
                    ${v.status === 'disponible' ? `
                      <button class="btn-vip btn-vip-primary btn-vip-sm btn-vip-vender" data-id="${v.id}" style="flex: 1;">Registrar Venta</button>
                    ` : ''}
                    ${v.status === 'apartado' ? `
                      <button class="btn-vip btn-vip-primary btn-vip-sm btn-vip-vender" data-id="${v.id}" style="flex: 1;">Concretar Venta</button>
                    ` : ''}
                    ${v.status === 'vendido' ? `<span class="badge-vip" style="background:#2a2220; color:#a39b97; width: 100%; text-align: center; justify-content: center;">Unidad Vendida</span>` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-vip[data-stat]').forEach(b => {
      b.onclick = () => {
        this.invFilter = b.getAttribute('data-stat');
        this.renderInventario(container);
      };
    });

    container.querySelectorAll('.btn-vip-vender').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        const v = store.getVehicles().find(x => x.id === id);
        if (v) {
          const cli = store.getClients()[0];
          v.status = 'vendido';
          store.data.sales.unshift({
            id: generateId('sale'),
            clientId: (cli || {}).id,
            vehicleId: v.id,
            date: getTodayISO(),
            finalAmount: v.price,
            paymentType: 'Contado'
          });
          store.save();
          notify(`¡Venta cerrada! ${v.brand} ${v.model} marcado como VENDIDO.`);
          this.renderInventario(container);
        }
      };
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.appVIP = new AppVIP();
});

})();
