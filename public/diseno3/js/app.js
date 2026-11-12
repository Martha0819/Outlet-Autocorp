/**
 * @fileoverview Controlador para Diseño 3: Titanium Glass Studio
 * Outlet Autocorp Mini CRM
 */
(function() {
'use strict';

const STORAGE_KEY = 'outlet_autocorp_data_v1';

// --- Formato de Moneda MXN y Fechas ---
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
  car: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
  dollarSign: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/></svg>`
};

function getIcon(name) { return icons[name] || icons.dashboard; }

// --- Toast Manager ---
function notify(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = 'toast toast-success animate-slide-in';
  t.style.background = '#ffffff';
  t.style.color = '#251f1d';
  t.style.borderLeft = '4px solid #ff8901';
  t.style.boxShadow = '0 8px 24px rgba(37,31,29,0.12)';
  t.innerHTML = `<span class="font-bold">${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// --- Store Titanium Glass ---
class StoreGlass {
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
          id: 'veh-1', inventoryId: 'OUT-2024-001', brand: 'Nissan', model: 'Versa', version: 'Exclusive CVT',
          year: 2023, color: 'Plata Metálico', mileage: 28500, transmission: 'Automática', fuel: 'Gasolina',
          price: 329000, estimatedDownPayment: 65800, status: 'disponible',
          images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'],
          observations: 'Único dueño, factura original de agencia.', dateAdded: today, interestedClientIds: ['cli-1']
        },
        {
          id: 'veh-2', inventoryId: 'OUT-2024-002', brand: 'Mazda', model: 'Mazda 3', version: 'i Grand Touring Sedán',
          year: 2022, color: 'Rojo Soul Red', mileage: 34200, transmission: 'Automática', fuel: 'Gasolina',
          price: 398000, estimatedDownPayment: 79600, status: 'disponible',
          images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'],
          observations: 'Quemacocos, sonido Bose, head-up display.', dateAdded: today, interestedClientIds: ['cli-2']
        },
        {
          id: 'veh-3', inventoryId: 'OUT-2024-003', brand: 'Volkswagen', model: 'Jetta', version: 'R-Line 1.4 TSI',
          year: 2021, color: 'Blanco Puro', mileage: 45000, transmission: 'Automática Tiptronic', fuel: 'Gasolina',
          price: 375000, estimatedDownPayment: 75000, status: 'apartado',
          images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'],
          observations: 'Apartado con enganche en caja de $35,000 MXN.', dateAdded: today, interestedClientIds: ['cli-3']
        },
        {
          id: 'veh-4', inventoryId: 'OUT-2024-004', brand: 'Toyota', model: 'RAV4', version: 'XLE Hybrid AWD',
          year: 2023, color: 'Gris Grafito', mileage: 19800, transmission: 'Automática E-CVT', fuel: 'Híbrido',
          price: 589000, estimatedDownPayment: 117800, status: 'disponible',
          images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'],
          observations: 'Garantía de planta vigente hasta 2026.', dateAdded: today, interestedClientIds: ['cli-4']
        },
        {
          id: 'veh-5', inventoryId: 'OUT-2024-005', brand: 'Ford', model: 'Bronco Sport', version: 'Big Bend 4x4',
          year: 2022, color: 'Azul Glaciar', mileage: 31000, transmission: 'Automática', fuel: 'Gasolina',
          price: 549000, estimatedDownPayment: 109800, status: 'disponible',
          images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'],
          observations: 'Tracción 4x4, paquete co-pilot 360.', dateAdded: today, interestedClientIds: ['cli-5']
        },
        {
          id: 'veh-6', inventoryId: 'OUT-2024-006', brand: 'BMW', model: 'Serie 3', version: '330i M Sport',
          year: 2021, color: 'Negro Zafiro', mileage: 38000, transmission: 'Automática Deportiva', fuel: 'Gasolina',
          price: 685000, estimatedDownPayment: 137000, status: 'vendido',
          images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'],
          observations: 'Vendido a Roberto Martínez Gómez por $685,000 MXN.', dateAdded: today, interestedClientIds: ['cli-6']
        }
      ],
      clients: [
        {
          id: 'cli-1', name: 'Alejandro Peña Ruiz', phone: '55 4123 8901', email: 'alejandro.pena@gmail.com',
          hasBrandPreference: 'si', preferredBrand: 'Nissan', comments: 'Interesado en sedán familiar automático.',
          dateRegistered: today, visits: [{ date: today, notes: 'Visita física al lote.' }],
          interestedVehicleIds: ['veh-1'], intention: 'hot'
        },
        {
          id: 'cli-2', name: 'Sofía Reyes Delgado', phone: '55 8765 4321', email: 'sofia.reyes@outlook.com',
          hasBrandPreference: 'si', preferredBrand: 'Mazda', comments: 'Buscando Mazda 3 para uso ejecutivo.',
          dateRegistered: today, visits: [{ date: today, notes: 'Prueba de manejo realizada.' }],
          interestedVehicleIds: ['veh-2'], intention: 'hot'
        },
        {
          id: 'cli-3', name: 'Juan Carlos Mendoza', phone: '55 1928 3746', email: 'jcmendoza@empresa.com',
          hasBrandPreference: 'si', preferredBrand: 'Volkswagen', comments: 'Apartó Jetta R-Line con $35,000 MXN.',
          dateRegistered: today, visits: [{ date: today, notes: 'Firma de solicitud de crédito.' }],
          interestedVehicleIds: ['veh-3'], intention: 'medium'
        },
        {
          id: 'cli-4', name: 'Valeria Domínguez', phone: '55 6789 0123', email: 'valeria.dom@gmail.com',
          hasBrandPreference: 'si', preferredBrand: 'Toyota', comments: 'Interesada en SUV híbrida.',
          dateRegistered: today, visits: [{ date: today, notes: 'Cotización solicitada.' }],
          interestedVehicleIds: ['veh-4'], intention: 'medium'
        },
        {
          id: 'cli-5', name: 'Mariana Silva Torres', phone: '55 2345 6789', email: 'mariana.silva@yahoo.com',
          hasBrandPreference: 'no', preferredBrand: '', comments: 'Buscando SUV 4x4 sin preferencia de marca.',
          dateRegistered: today, visits: [{ date: today, notes: 'Primera visita al showroom.' }],
          interestedVehicleIds: ['veh-5'], intention: 'cold'
        }
      ],
      shifts: [
        { id: 'sh-1', date: today, startTime: '09:00', endTime: '18:00', responsible: 'Carlos Morales', area: 'Showroom Principal', phone: '55 1234 5678', email: 'carlos.m@outletautocorp.mx', observations: 'Apertura y guardias de piso.' },
        { id: 'sh-2', date: today, startTime: '10:00', endTime: '19:00', responsible: 'Fernanda Ortiz', area: 'Pruebas de Manejo', phone: '55 8765 4321', email: 'fernanda.o@outletautocorp.mx', observations: 'Coordinación de dinamismos.' },
        { id: 'sh-3', date: today, startTime: '12:00', endTime: '20:00', responsible: 'Ricardo Salgado', area: 'Cierre y Auditoría', phone: '55 9876 5432', email: 'ricardo.s@outletautocorp.mx', observations: 'Entrega de valores a caja.' }
      ],
      activities: [
        { id: 'act-1', title: 'Revisión técnica de unidades en lote', iconType: 'revision', status: 'completada', date: today, time: '08:30', responsible: 'Carlos Morales', description: 'Chequeo de niveles, batería e interiores.', observations: 'Lote al 100% verificado.' },
        { id: 'act-2', title: 'Atención y recepción de prospectos', iconType: 'recepcion', status: 'en_proceso', date: today, time: '10:00', responsible: 'Fernanda Ortiz', description: 'Registro de nuevos invitados y canalización con asesores.', observations: 'Tráfico fluido en showroom.' },
        { id: 'act-3', title: 'Protocolo de cierre y resguardo vehicular', iconType: 'cierre', status: 'pendiente', date: today, time: '19:30', responsible: 'Ricardo Salgado', description: 'Bloqueo perimetral y aseguramiento de llaves.', observations: 'Activación de alarma central.' }
      ],
      testDrives: [
        { id: 'td-1', clientId: 'cli-2', vehicleId: 'veh-2', date: today, time: '11:30', responsible: 'Carlos Morales', status: 'Realizada', route: 'Ruta Periférico Sur', notes: 'Cliente encantada con el manejo.' },
        { id: 'td-2', clientId: 'cli-4', vehicleId: 'veh-4', date: today, time: '16:00', responsible: 'Fernanda Ortiz', status: 'Programada', route: 'Ruta Ciudad Universitaria', notes: 'Prueba de aceleración modo híbrido.' }
      ],
      requests: [
        { id: 'req-1', clientId: 'cli-3', vehicleId: 'veh-3', date: today, type: 'Financiamiento Banorte', amount: 375000, termMonths: 48, status: 'Pendiente', notes: 'En proceso de validación de comprobantes.' },
        { id: 'req-2', clientId: 'cli-1', vehicleId: 'veh-1', date: today, type: 'Crédito Directo', amount: 329000, termMonths: 36, status: 'Aprobada', notes: 'Pre-aprobado por buró crediticio.' }
      ],
      downPayments: [
        { id: 'dp-1', clientId: 'cli-3', vehicleId: 'veh-3', amount: 35000, date: today, method: 'Transferencia SPEI', reference: 'SPEI-992384', notes: 'Apartado firme de Volkswagen Jetta.' }
      ],
      sales: [
        { id: 'sale-1', clientId: 'cli-6', vehicleId: 'veh-6', finalAmount: 685000, paymentType: 'Contado', date: today, advisor: 'Carlos Morales', notes: 'BMW 330i entregado con tanque lleno.' }
      ]
    };
  }
}
const store = new StoreGlass();

// --- Aplicación Principal: Titanium Glass Studio ---
class AppGlass {
  constructor() {
    this.currentView = 'general';
    this.period = 'month';
    this.invFilter = 'disponible';
    this.clientSearch = '';
    this.clientBrand = 'all';

    this.init();
  }

  init() {
    this.bindNav();
    this.render(this.currentView);

    const liveDate = document.getElementById('glass-live-date');
    if (liveDate) liveDate.textContent = formatDate(getTodayISO(), 'long');

    const resetBtn = document.getElementById('btn-glass-reset');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('¿Restablecer datos de demostración a valores de fábrica?')) {
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
        }
      };
    }
  }

  bindNav() {
    document.querySelectorAll('.glass-nav-btn').forEach(btn => {
      btn.onclick = () => {
        const v = btn.getAttribute('data-view');
        document.querySelectorAll('.glass-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.render(v);
      };
    });
  }

  render(view) {
    this.currentView = view;
    const container = document.getElementById('glass-view-container');
    const heroTitle = document.getElementById('glass-hero-title');
    if (!container) return;

    const titles = {
      general: 'Vista General — Dashboard Holográfico',
      guardias: 'Cronograma & Actividades en Cristal 3D',
      clientes: 'Directorio CRM de Prospectos',
      inventario: 'Inventario Showroom en Cristal'
    };
    if (heroTitle) heroTitle.textContent = titles[view] || 'Outlet Autocorp Titanium Glass';

    if (view === 'general') this.renderDashboard(container);
    if (view === 'guardias') this.renderGuardias(container);
    if (view === 'clientes') this.renderClientes(container);
    if (view === 'inventario') this.renderInventario(container);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- DASHBOARD HOLOGRÁFICO ---
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
    const reservedVehs = vehicles.filter(v => v.status === 'apartado');
    const totalSales = sales.reduce((s, x) => s + Number(x.finalAmount || 0), 0);
    const totalDown = downPayments.reduce((s, x) => s + Number(x.amount || 0), 0);
    const completedTD = testDrives.filter(td => td.status === 'Realizada').length;

    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Barra de Filtros y 4 Accesos Rápidos -->
        <div class="d-flex justify-between align-center mb-4 flex-wrap gap-2">
          <div class="d-flex gap-2">
            <button class="btn-glass btn-glass-sm ${this.period === 'today' ? 'btn-glass-primary' : ''}" data-p="today">Hoy</button>
            <button class="btn-glass btn-glass-sm ${this.period === 'week' ? 'btn-glass-primary' : ''}" data-p="week">Esta semana</button>
            <button class="btn-glass btn-glass-sm ${this.period === 'month' ? 'btn-glass-primary' : ''}" data-p="month">Este mes</button>
          </div>

          <div class="d-flex gap-2 flex-wrap">
            <button class="btn-glass btn-glass-primary btn-glass-sm" id="btn-quick-guest-g">+ Registrar Invitado</button>
            <button class="btn-glass btn-glass-sm" id="btn-quick-td-g">Programar Prueba</button>
            <button class="btn-glass btn-glass-sm" id="btn-quick-req-g">Crear Solicitud</button>
            <button class="btn-glass btn-glass-sm" id="btn-quick-sale-g">Registrar Venta</button>
          </div>
        </div>

        <!-- 6 Tarjetas de la Matriz Holográfica Titanium Glass -->
        <div class="hologram-matrix-grid">
          <!-- 01: Facturación Cerrada -->
          <div class="hologram-kpi-card" data-nav="inventario">
            <div class="holo-header">
              <span class="holo-code">№ 01 · FACTURACIÓN EN CAJA</span>
              <span class="badge-glass-orange font-bold">+100% vs ant.</span>
            </div>
            <div class="holo-val text-orange">${formatCurrency(totalSales)}</div>
            <div class="holo-sub">${sales.length} unidades cerradas · 86% de meta mensual</div>
            <div class="holo-progress-bar">
              <div class="holo-progress-fill" style="width: ${Math.min((totalSales / 4000000) * 100, 100)}%;"></div>
            </div>
          </div>

          <!-- 02: Ocupación de Patio / Inventario -->
          <div class="hologram-kpi-card" data-nav="inventario">
            <div class="holo-header">
              <span class="holo-code">№ 02 · LOT OCCUPANCY / PATIO</span>
              <span class="badge-glass-green">Lote Activo</span>
            </div>
            <div class="holo-val">${formatNumber(availVehs.length)} <span style="font-size: 15px; color: #6b6360;">disponibles</span></div>
            <div class="holo-sub">${reservedVehs.length} apartados · ${vehicles.length} total inventario</div>
            <div class="holo-progress-bar">
              <div class="holo-progress-fill" style="width: ${(availVehs.length / (vehicles.length || 1)) * 100}%; background: linear-gradient(90deg, #10b981 0%, #059669 100%);"></div>
            </div>
          </div>

          <!-- 03: Pruebas de Manejo -->
          <div class="hologram-kpi-card" data-nav="guardias">
            <div class="holo-header">
              <span class="holo-code">№ 03 · PRUEBAS DE MANEJO</span>
              <span class="badge-glass-orange font-bold">${completedTD}/${testDrives.length}</span>
            </div>
            <div class="holo-val">${formatNumber(testDrives.length)} <span style="font-size: 15px; color: #6b6360;">dinámicas</span></div>
            <div class="holo-sub">${completedTD} realizadas · ${testDrives.length - completedTD} en agenda</div>
            <div class="holo-progress-bar">
              <div class="holo-progress-fill" style="width: ${testDrives.length > 0 ? (completedTD / testDrives.length) * 100 : 0}%; background: #0284c7;"></div>
            </div>
          </div>

          <!-- 04: Afluencia de Invitados -->
          <div class="hologram-kpi-card" data-nav="clientes">
            <div class="holo-header">
              <span class="holo-code">№ 04 · AFLUENCIA PEATONAL</span>
              <span class="badge-glass-orange font-bold">+100% vs ant.</span>
            </div>
            <div class="holo-val">${formatNumber(invitados)} <span style="font-size: 15px; color: #6b6360;">prospectos</span></div>
            <div class="holo-sub">Visitas físicas a piso de venta registradas</div>
            <div class="holo-progress-bar">
              <div class="holo-progress-fill" style="width: 78%; background: #251f1d;"></div>
            </div>
          </div>

          <!-- 05: Expedientes de Financiamiento -->
          <div class="hologram-kpi-card" data-nav="clientes">
            <div class="holo-header">
              <span class="holo-code">№ 05 · SOLICITUDES DE CRÉDITO</span>
              <span class="badge-glass-orange font-bold">${requests.filter(r => r.status === 'Pendiente').length} pendientes</span>
            </div>
            <div class="holo-val">${formatNumber(requests.length)} <span style="font-size: 15px; color: #6b6360;">expedientes</span></div>
            <div class="holo-sub">En validación bancaria con Banorte y BBVA</div>
            <div class="holo-progress-bar">
              <div class="holo-progress-fill" style="width: 65%; background: #f59e0b;"></div>
            </div>
          </div>

          <!-- 06: Bóveda de Enganches -->
          <div class="hologram-kpi-card" data-nav="inventario">
            <div class="holo-header">
              <span class="holo-code">№ 06 · BÓVEDA DE ENGANCHES</span>
              <span class="badge-glass-green">Validado en Caja</span>
            </div>
            <div class="holo-val text-orange">${formatCurrency(totalDown)}</div>
            <div class="holo-sub">${downPayments.length} depósitos en firme recibidos</div>
            <div class="holo-progress-bar">
              <div class="holo-progress-fill" style="width: 82%; background: linear-gradient(90deg, #ff8901 0%, #16a34a 100%);"></div>
            </div>
          </div>
        </div>

        <!-- Gráficas Glassmorphism -->
        <div class="charts-glass-grid">
          <div class="card-glass">
            <div class="d-flex justify-between align-center mb-3">
              <h3 style="font-size: 17px; font-weight: 800; color: #251f1d;">Evolución de Facturación (MXN)</h3>
              <span class="badge-glass-orange font-bold">${formatCurrency(totalSales)}</span>
            </div>
            <div id="glass-sales-chart" style="width: 100%; height: 220px;"></div>
          </div>

          <div class="card-glass">
            <h3 style="font-size: 17px; font-weight: 800; color: #251f1d; margin-bottom: 16px;">Embudo de Conversión de Piso</h3>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <div>
                <div class="d-flex justify-between mb-1" style="font-size: 13px;">
                  <strong style="color: #251f1d;">1. Invitados en Sala</strong>
                  <span class="font-bold">${invitados}</span>
                </div>
                <div style="height: 8px; background: #e5e8ec; border-radius: 4px; overflow: hidden;">
                  <div style="width: 100%; height: 100%; background: #251f1d;"></div>
                </div>
              </div>

              <div>
                <div class="d-flex justify-between mb-1" style="font-size: 13px;">
                  <strong style="color: #251f1d;">2. Pruebas de Manejo</strong>
                  <span class="font-bold text-orange">${testDrives.length} (${invitados > 0 ? Math.round((testDrives.length / invitados) * 100) : 0}%)</span>
                </div>
                <div style="height: 8px; background: #e5e8ec; border-radius: 4px; overflow: hidden;">
                  <div style="width: ${invitados > 0 ? Math.min((testDrives.length / invitados) * 100, 100) : 15}%; height: 100%; background: #0284c7;"></div>
                </div>
              </div>

              <div>
                <div class="d-flex justify-between mb-1" style="font-size: 13px;">
                  <strong style="color: #251f1d;">3. Solicitudes de Compra</strong>
                  <span class="font-bold" style="color: #d97706;">${requests.length}</span>
                </div>
                <div style="height: 8px; background: #e5e8ec; border-radius: 4px; overflow: hidden;">
                  <div style="width: ${invitados > 0 ? Math.min((requests.length / invitados) * 100, 100) : 10}%; height: 100%; background: #f59e0b;"></div>
                </div>
              </div>

              <div>
                <div class="d-flex justify-between mb-1" style="font-size: 13px;">
                  <strong style="color: #251f1d;">4. Ventas Concretadas</strong>
                  <span class="font-bold text-orange">${sales.length} (${invitados > 0 ? Math.round((sales.length / invitados) * 100) : 0}% conv.)</span>
                </div>
                <div style="height: 8px; background: #e5e8ec; border-radius: 4px; overflow: hidden;">
                  <div style="width: ${invitados > 0 ? Math.min((sales.length / invitados) * 100, 100) : 10}%; height: 100%; background: #ff8901;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render de Gráfica SVG Spline de Ventas
    this.renderSalesSpline('glass-sales-chart', sales.length > 0 ? sales : store.getSales().slice(0, 5));

    // Listeners de periodo
    container.querySelectorAll('button[data-p]').forEach(b => {
      b.onclick = () => {
        this.period = b.getAttribute('data-p');
        this.renderDashboard(container);
      };
    });

    // Clic en KPIs para navegar
    container.querySelectorAll('.hologram-kpi-card').forEach(card => {
      card.onclick = () => {
        const nav = card.getAttribute('data-nav');
        if (nav) document.querySelector(`.glass-nav-btn[data-view="${nav}"]`).click();
      };
    });

    // Acciones Rápidas
    const btnGuest = container.querySelector('#btn-quick-guest-g');
    if (btnGuest) {
      btnGuest.onclick = () => {
        const name = prompt('Nombre completo del nuevo invitado:');
        if (name) {
          const phone = prompt('Celular a 10 dígitos:', '55');
          store.data.clients.unshift({
            id: generateId('cli'),
            name,
            phone: phone || '5500000000',
            email: '',
            hasBrandPreference: 'no',
            preferredBrand: '',
            comments: 'Registrado desde botón rápido de Titanium Glass.',
            dateRegistered: getTodayISO(),
            visits: [{ date: getTodayISO(), notes: 'Visita en showroom.' }],
            interestedVehicleIds: []
          });
          store.save();
          notify(`Invitado ${name} registrado con éxito.`);
          this.renderDashboard(container);
        }
      };
    }

    const btnTD = container.querySelector('#btn-quick-td-g');
    if (btnTD) btnTD.onclick = () => document.querySelector(`.glass-nav-btn[data-view="guardias"]`).click();

    const btnReq = container.querySelector('#btn-quick-req-g');
    if (btnReq) btnReq.onclick = () => document.querySelector(`.glass-nav-btn[data-view="clientes"]`).click();

    const btnSale = container.querySelector('#btn-quick-sale-g');
    if (btnSale) btnSale.onclick = () => document.querySelector(`.glass-nav-btn[data-view="inventario"]`).click();
  }

  renderSalesSpline(containerId, list) {
    const el = document.getElementById(containerId);
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
          <linearGradient id="glassWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff8901" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#ff8901" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <line x1="${pad.left}" y1="${pad.top + chartH}" x2="${w - pad.right}" y2="${pad.top + chartH}" stroke="#dbe0e6" stroke-width="1"/>
        <line x1="${pad.left}" y1="${pad.top + chartH/2}" x2="${w - pad.right}" y2="${pad.top + chartH/2}" stroke="#dbe0e6" stroke-dasharray="3,3" stroke-width="1"/>
        <polygon points="${area}" fill="url(#glassWaveGrad)" />
        <polyline points="${pts}" fill="none" stroke="#ff8901" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        ${list.map((s, idx) => {
          const x = pad.left + (chartW / Math.max(list.length - 1, 1)) * idx;
          const y = pad.top + chartH - (Number(s.finalAmount || 0) / max) * chartH;
          return `
            <circle cx="${x}" cy="${y}" r="5" fill="#ff8901" stroke="#ffffff" stroke-width="2.5" />
            <text x="${x}" y="${h - 8}" text-anchor="middle" font-size="11" fill="#6b6360" font-weight="600">${formatDate(s.date, 'short')}</text>
          `;
        }).join('')}
      </svg>
    `;
  }

  // --- GUARDIAS Y ACTIVIDADES GLASS ---
  renderGuardias(container) {
    const shifts = store.getShifts();
    const activities = store.getActivities();

    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Pestañas internas -->
        <div class="d-flex justify-between align-center mb-4 flex-wrap gap-2">
          <div class="glass-nav-dock">
            <button class="glass-nav-btn active" id="btn-tab-timeline-g">Línea de Tiempo Operativa</button>
            <button class="glass-nav-btn" id="btn-tab-flip-g">Tarjetas de Actividades (3D Glass Flip)</button>
          </div>
          <button class="btn-glass btn-glass-primary btn-glass-sm" id="btn-add-shift-g">+ Programar Guardia</button>
        </div>

        <!-- SECCIÓN 1: TIMELINE OPERATIVA -->
        <div id="subtab-timeline-content-g">
          <div class="card-glass">
            <h3 style="font-size: 18px; font-weight: 800; color: #251f1d; margin-bottom: 20px;">Roles de Turno del Día</h3>
            <div class="timeline-track-v3">
              ${shifts.map(s => `
                <div class="timeline-entry-v3">
                  <div class="d-flex justify-between align-center flex-wrap gap-2">
                    <div>
                      <strong style="font-size: 15px; color: #251f1d;">${s.responsible}</strong>
                      <div style="font-size: 12px; color: #6b6360; margin-top: 2px;">
                        <span>${formatDate(s.date, 'long')}</span> · <span class="input-italic">${s.area || 'Guardia Central'}</span>
                      </div>
                      ${s.observations ? `<div class="input-italic mt-1" style="font-size: 11px; color: #ff8901;">"${s.observations}"</div>` : ''}
                    </div>
                    <div style="text-align: right;">
                      <span class="badge-glass-orange font-bold">${s.startTime} — ${s.endTime}</span>
                      <div style="font-size: 11px; color: #6b6360; margin-top: 4px;">${s.phone ? `Cel: ${s.phone}` : 'Confirmado'}</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: 3D GLASS FLIP CARDS PARA ACTIVIDADES -->
        <div id="subtab-flip-content-g" style="display: none;">
          <div class="glass-flip-grid">
            ${activities.map(act => `
              <div class="glass-flip-wrapper" data-act-id="${act.id}">
                <div class="glass-flip-inner">
                  <!-- Frente -->
                  <div class="glass-flip-face">
                    <div class="d-flex justify-between align-center">
                      <span class="badge-glass-orange font-bold">${act.time || '09:00'}</span>
                      <span class="badge-glass-${act.status === 'completada' ? 'green' : 'orange'}">${act.status.toUpperCase()}</span>
                    </div>
                    <div style="margin: 14px 0;">
                      <h4 style="font-size: 16px; font-weight: 800; color: #251f1d;">${act.title}</h4>
                      <div style="font-size: 12px; color: #6b6360; margin-top: 4px;">Responsable: <strong style="color: #251f1d;">${act.responsible}</strong></div>
                    </div>
                    <div class="d-flex justify-between align-center" style="border-top: 1px solid var(--border-subtle); padding-top: 10px; font-size: 11px;">
                      <span style="color: #6b6360;">${formatDate(act.date, 'short')}</span>
                      <span class="font-bold text-orange">Girar ↻</span>
                    </div>
                  </div>

                  <!-- Reverso -->
                  <div class="glass-flip-face glass-flip-back">
                    <div>
                      <span style="font-size: 10px; font-weight: 800; color: #ff8901; text-transform: uppercase;">Detalle Asignado</span>
                      <h4 style="font-size: 15px; font-weight: 800; color: #251f1d; margin-top: 2px;">${act.responsible}</h4>
                      <p style="font-size: 12px; color: #4a4441; margin-top: 6px;">${act.description || 'Sin notas.'}</p>
                      ${act.observations ? `<p class="input-italic" style="font-size: 11px; color: #ff8901; margin-top: 4px;">"${act.observations}"</p>` : ''}
                    </div>
                    <div class="d-flex justify-between align-center" style="border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                      <button class="btn-glass btn-glass-sm btn-g-toggle-status" data-act-id="${act.id}">
                        ${act.status === 'completada' ? 'Reabrir' : 'Completar'}
                      </button>
                      <span style="font-size: 11px; color: #ff8901; font-weight: 700;">Volver ↺</span>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Conmutador de subpestañas
    const btnTimeline = container.querySelector('#btn-tab-timeline-g');
    const btnFlip = container.querySelector('#btn-tab-flip-g');
    const timelineSec = container.querySelector('#subtab-timeline-content-g');
    const flipSec = container.querySelector('#subtab-flip-content-g');

    btnTimeline.onclick = () => {
      btnTimeline.classList.add('active');
      btnFlip.classList.remove('active');
      timelineSec.style.display = 'block';
      flipSec.style.display = 'none';
    };

    btnFlip.onclick = () => {
      btnFlip.classList.add('active');
      btnTimeline.classList.remove('active');
      timelineSec.style.display = 'none';
      flipSec.style.display = 'block';
    };

    // Giro táctil y toggle de estatus
    container.querySelectorAll('.glass-flip-wrapper').forEach(w => {
      w.onclick = (e) => {
        if (e.target.closest('button')) return;
        w.querySelector('.glass-flip-inner').classList.toggle('is-flipped');
      };
    });

    container.querySelectorAll('.btn-g-toggle-status').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-act-id');
        const act = store.getActivities().find(a => a.id === id);
        if (act) {
          act.status = act.status === 'completada' ? 'pendiente' : 'completada';
          store.save();
          notify(`Estatus actualizado a ${act.status}.`);
          this.renderGuardias(container);
          btnFlip.click();
        }
      };
    });

    // Agregar Guardia
    const btnAddShift = container.querySelector('#btn-add-shift-g');
    if (btnAddShift) {
      btnAddShift.onclick = () => {
        const resp = prompt('Nombre del responsable de guardia:');
        if (!resp) return;
        const time = prompt('Horario asignado (ej. 09:00 - 18:00):', '09:00 - 18:00') || '09:00 - 18:00';
        const parts = time.split('-');
        store.data.shifts.unshift({
          id: generateId('sh'),
          date: getTodayISO(),
          responsible: resp,
          startTime: (parts[0] || '09:00').trim(),
          endTime: (parts[1] || '18:00').trim(),
          area: 'Guardia Principal',
          phone: '55 1234 5678',
          email: `${resp.toLowerCase().replace(/\s+/g, '.')}@outletautocorp.mx`,
          observations: 'Turno programado.'
        });
        store.save();
        notify(`Guardia para ${resp} guardada exitosamente.`);
        this.renderGuardias(container);
      };
    }
  }

  // --- CLIENTES CRM GLASS: MATRIZ DE PROSPECTOS ---
  renderClientes(container) {
    const allClients = store.getClients();
    let clients = allClients;

    if (this.clientBrand && this.clientBrand !== 'all') {
      clients = clients.filter(c => c.hasBrandPreference === 'si' && (c.preferredBrand || '').toLowerCase() === this.clientBrand.toLowerCase());
    }

    if (this.clientSearch) {
      clients = clients.filter(c => 
        (c.name || '').toLowerCase().includes(this.clientSearch) ||
        (c.phone || '').includes(this.clientSearch) ||
        (c.email || '').toLowerCase().includes(this.clientSearch)
      );
    }

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="d-flex justify-between align-center mb-4 flex-wrap gap-2">
          <div style="flex: 1; max-width: 420px;">
            <input type="text" class="input-search" id="glass-cli-search" placeholder="Buscar por nombre, celular o correo..." value="${this.clientSearch}" style="background: #ffffff; border-color: var(--border-subtle); border-radius: var(--radius-full); padding: 10px 18px; width: 100%;" />
          </div>

          <button class="btn-glass btn-glass-primary btn-glass-sm" id="btn-add-client-g">+ Agregar Cliente</button>
        </div>

        <!-- Matriz de Prospectos CRM Cards -->
        <div class="clients-glass-grid">
          ${clients.map(c => {
            let tempBadge = `<span class="badge-glass-orange">⚡ Evaluación Media</span>`;
            if (c.intention === 'hot' || (c.visits && c.visits.length > 1)) {
              tempBadge = `<span class="badge-glass-orange font-bold" style="background:#fee2e2; color:#dc2626; border-color:#fca5a5;">🔥 Alta Intención</span>`;
            } else if (c.intention === 'cold') {
              tempBadge = `<span class="badge-glass-orange" style="background:#f1f5f9; color:#475569; border-color:#cbd5e1;">❄️ Exploratorio</span>`;
            }

            return `
              <div class="client-glass-card">
                <div>
                  <div class="d-flex justify-between align-center mb-3">
                    ${tempBadge}
                    <span style="font-size: 11px; color: #6b6360;">${(c.visits || []).length} visitas</span>
                  </div>

                  <h3 style="font-size: 18px; font-weight: 800; color: #251f1d;">${c.name}</h3>
                  <div style="font-size: 13px; color: #ff8901; font-weight: 700; margin-top: 2px;">${c.phone}</div>
                  <div style="font-size: 12px; color: #6b6360;">${c.email || 'Sin correo registrado'}</div>

                  <div style="margin-top: 14px; padding: 10px 14px; background: var(--bg-titanium); border-radius: var(--radius-md);">
                    <div style="font-size: 11px; color: #6b6360;">Preferencia: <strong>${c.hasBrandPreference === 'si' && c.preferredBrand ? c.preferredBrand : 'Sin preferencia'}</strong></div>
                    <div class="input-italic" style="font-size: 11px; color: #4a4441; margin-top: 3px;">"${c.comments || 'Sin comentarios adicionales.'}"</div>
                  </div>
                </div>

                <div class="d-flex gap-2 mt-4 pt-3" style="border-top: 1px solid var(--border-subtle);">
                  <button class="btn-glass btn-glass-sm btn-g-call" data-phone="${c.phone}" style="flex: 1; justify-content: center;">Llamar</button>
                  <button class="btn-glass btn-glass-primary btn-glass-sm btn-g-td" data-cli-id="${c.id}" style="flex: 1; justify-content: center;">Agendar Prueba</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Búsqueda
    const searchInput = container.querySelector('#glass-cli-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.clientSearch = e.target.value.toLowerCase().trim();
        this.renderClientes(container);
      };
    }

    // Agregar Cliente
    const btnAddCli = container.querySelector('#btn-add-client-g');
    if (btnAddCli) {
      btnAddCli.onclick = () => {
        const name = prompt('Nombre completo del cliente:');
        if (!name) return;
        const phone = prompt('Celular a 10 dígitos:', '55');
        const email = prompt('Correo electrónico (opcional):', '');
        const brand = prompt('¿Visita una marca en específico? (Dejar vacío si no tiene preferencia):', '');

        store.data.clients.unshift({
          id: generateId('cli'),
          name,
          phone: phone || '5500000000',
          email: email || '',
          hasBrandPreference: brand ? 'si' : 'no',
          preferredBrand: brand || '',
          comments: 'Registrado desde CRM Titanium Glass.',
          dateRegistered: getTodayISO(),
          visits: [{ date: getTodayISO(), notes: 'Visita inicial registrada en el showroom.' }],
          interestedVehicleIds: [],
          intention: 'hot'
        });
        store.save();
        notify(`Cliente ${name} guardado en el CRM.`);
        this.renderClientes(container);
      };
    }

    container.querySelectorAll('.btn-g-call').forEach(b => {
      b.onclick = () => {
        const phone = b.getAttribute('data-phone');
        alert(`Iniciando marcación a ${phone}...`);
      };
    });

    container.querySelectorAll('.btn-g-td').forEach(b => {
      b.onclick = () => {
        document.querySelector(`.glass-nav-btn[data-view="guardias"]`).click();
      };
    });
  }

  // --- INVENTARIO SHOWROOM GLASS ---
  renderInventario(container) {
    const vehs = store.getVehicles().filter(v => this.invFilter === 'all' || v.status === this.invFilter);

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="d-flex justify-between align-center mb-4 flex-wrap gap-2">
          <div class="glass-nav-dock">
            <button class="glass-nav-btn ${this.invFilter === 'disponible' ? 'active' : ''}" data-stat="disponible">Disponibles</button>
            <button class="glass-nav-btn ${this.invFilter === 'apartado' ? 'active' : ''}" data-stat="apartado">Apartados</button>
            <button class="glass-nav-btn ${this.invFilter === 'vendido' ? 'active' : ''}" data-stat="vendido">Vendidos</button>
            <button class="glass-nav-btn ${this.invFilter === 'all' ? 'active' : ''}" data-stat="all">Todos</button>
          </div>
        </div>

        <div class="inv-glass-grid">
          ${vehs.map(v => {
            const img = (v.images && v.images[0]) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
            let badgeClass = 'badge-glass-green';
            if (v.status === 'apartado') badgeClass = 'badge-glass-orange';
            if (v.status === 'vendido') badgeClass = 'badge-glass-orange';

            return `
              <div class="veh-glass-card">
                <div class="veh-glass-media">
                  <img src="${img}" class="veh-glass-img" alt="${v.model}" loading="lazy"/>
                  <span class="${badgeClass}" style="position: absolute; top: 12px; left: 12px; font-size: 11px;">
                    ● ${v.status.toUpperCase()}
                  </span>
                  <span style="position: absolute; bottom: 12px; right: 12px; font-size: 11px; font-family: monospace; background: rgba(37,31,29,0.85); color: #ffffff; padding: 4px 8px; border-radius: 4px;">
                    ${v.inventoryId}
                  </span>
                </div>

                <div class="veh-glass-body">
                  <div>
                    <span style="font-size: 11px; color: #ff8901; font-weight: 800; text-transform: uppercase;">${v.brand} · ${v.year}</span>
                    <h3 style="font-size: 18px; font-weight: 800; color: #251f1d; margin-top: 2px;">${v.model}</h3>
                    <div style="font-size: 12px; color: #6b6360;">${v.version || ''} · Color ${v.color}</div>
                  </div>

                  <!-- Especificaciones en 3 columnas -->
                  <div class="veh-glass-specs">
                    <div class="spec-glass-item"><span>Kilometraje</span><strong>${formatNumber(v.mileage)} km</strong></div>
                    <div class="spec-glass-item"><span>Transmisión</span><strong>${v.transmission}</strong></div>
                    <div class="spec-glass-item"><span>Combustible</span><strong>${v.fuel}</strong></div>
                  </div>

                  <div>
                    <div style="font-size: 11px; color: #6b6360; text-transform: uppercase;">Precio de Contado</div>
                    <div style="font-size: 22px; font-weight: 800; color: #251f1d;">${formatCurrency(v.price)}</div>
                    <div style="font-size: 11px; color: #ff8901; font-weight: 700; margin-top: 2px;">Enganche est.: ${formatCurrency(v.estimatedDownPayment)}</div>
                  </div>

                  <div class="d-flex gap-2 mt-3 pt-3" style="border-top: 1px solid var(--border-subtle);">
                    ${v.status === 'disponible' ? `
                      <button class="btn-glass btn-glass-sm btn-g-apartar" data-id="${v.id}" style="flex: 1; justify-content: center;">Apartar</button>
                      <button class="btn-glass btn-glass-primary btn-glass-sm btn-g-vender" data-id="${v.id}" style="flex: 1; justify-content: center;">Vender</button>
                    ` : ''}
                    ${v.status === 'apartado' ? `
                      <button class="btn-glass btn-glass-primary btn-glass-sm btn-g-vender" data-id="${v.id}" style="flex: 1; justify-content: center;">Concretar Venta</button>
                    ` : ''}
                    ${v.status === 'vendido' ? `
                      <span style="font-size: 12px; font-weight: 800; color: #6b6360; text-align: center; width: 100%; text-transform: uppercase;">Unidad Colocada</span>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Filtros de estatus
    container.querySelectorAll('.glass-nav-btn[data-stat]').forEach(b => {
      b.onclick = () => {
        this.invFilter = b.getAttribute('data-stat');
        this.renderInventario(container);
      };
    });

    // Apartar
    container.querySelectorAll('.btn-g-apartar').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        const v = store.getVehicles().find(x => x.id === id);
        if (!v) return;
        const amountStr = prompt(`Ingresa el enganche recibido para apartar ${v.brand} ${v.model}:`, '25000');
        const amount = Number(amountStr);
        if (amount > 0) {
          v.status = 'apartado';
          store.data.downPayments.unshift({
            id: generateId('dp'),
            clientId: store.getClients()[0] ? store.getClients()[0].id : '',
            vehicleId: v.id,
            amount,
            date: getTodayISO(),
            method: 'Transferencia SPEI',
            reference: 'FOLIO-GLASS-APARTADO',
            notes: 'Apartado registrado desde Titanium Glass Studio.'
          });
          store.save();
          notify(`¡Vehículo apartado! Enganche de ${formatCurrency(amount)} sumado a caja.`);
          this.renderInventario(container);
        }
      };
    });

    // Vender
    container.querySelectorAll('.btn-g-vender').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        const v = store.getVehicles().find(x => x.id === id);
        if (v && confirm(`¿Confirmar venta definitiva de ${v.brand} ${v.model} por ${formatCurrency(v.price)}?`)) {
          v.status = 'vendido';
          store.data.sales.unshift({
            id: generateId('sale'),
            clientId: store.getClients()[0] ? store.getClients()[0].id : '',
            vehicleId: v.id,
            finalAmount: v.price,
            paymentType: 'Contado',
            advisor: 'Carlos Morales',
            date: getTodayISO(),
            notes: 'Venta cerrada desde Titanium Glass Studio.'
          });
          store.save();
          notify(`¡Venta cerrada! Unidad marcada como Vendida y facturación actualizada.`);
          this.renderInventario(container);
        }
      };
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.appGlass = new AppGlass();
});

})();
