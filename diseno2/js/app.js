// Outlet Autocorp — Diseño 2: Executive Showroom Studio Controller
// Comparte la misma base de datos reactiva en LocalStorage (outlet_autocorp_data_v1)
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
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  if (format === 'long') {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  return date.toLocaleDateString('es-MX');
}

function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validatePhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
}

function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

function validateEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function generateId(prefix = 'ID') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

function isDateInPeriod(dateStr, period, customStart = null, customEnd = null) {
  if (!dateStr) return false;
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d.getTime())) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'today') {
    const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return itemDay.getTime() === today.getTime();
  }

  if (period === 'week') {
    const dayOfWeek = today.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return d >= startOfWeek && d <= endOfWeek;
  }

  if (period === 'month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  if (period === 'custom' && customStart && customEnd) {
    const start = new Date(customStart + 'T00:00:00');
    const end = new Date(customEnd + 'T23:59:59');
    return d >= start && d <= end;
  }

  return true;
}

function isDateInPreviousPeriod(dateStr, period) {
  if (!dateStr) return false;
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d.getTime())) return false;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'today') {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return itemDay.getTime() === yesterday.getTime();
  }

  if (period === 'week') {
    const dayOfWeek = today.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - diffToMonday);

    const startOfPrevWeek = new Date(startOfCurrentWeek);
    startOfPrevWeek.setDate(startOfCurrentWeek.getDate() - 7);
    startOfPrevWeek.setHours(0, 0, 0, 0);

    const endOfPrevWeek = new Date(startOfCurrentWeek);
    endOfPrevWeek.setMilliseconds(-1);

    return d >= startOfPrevWeek && d <= endOfPrevWeek;
  }

  if (period === 'month') {
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getFullYear() === prevMonthDate.getFullYear() && d.getMonth() === prevMonthDate.getMonth();
  }

  return false;
}

// --- Iconos SVG ---
const icons = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  car: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
  testDrive: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/><circle cx="12" cy="12" r="2"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
  dollarSign: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  bookmark: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
  grid: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
  list: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
  apertura: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.5 8.5 4.5 4.5a2 2 0 0 1 0 2.83l-1.17 1.17a2 2 0 0 1-2.83 0L14 15"/><path d="m18 11 2 2"/><path d="m15 14 2 2"/><circle cx="7.5" cy="7.5" r="4.5"/></svg>`,
  seguridad: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  limpieza: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 5-7 7"/><path d="m14 10 2 2"/><path d="M11.5 12.5 4 20h4l7.5-7.5"/></svg>`,
  cierre: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  revision: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
  recepcion: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2-2"/><path d="m18 10 1.5-1.5a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L14 6"/><path d="M2 13a4 4 0 0 0 4 4h4"/></svg>`,
  gestion: `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>`
};

function getIcon(name) {
  return icons[name] || icons.dashboard;
}

// --- Toast Notification Manager ---
class ToastV2 {
  show(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;
    toast.innerHTML = `
      <div class="toast-message font-bold">${msg}</div>
      <button class="toast-close" style="background:none;border:none;color:#fff;cursor:pointer;">${getIcon('close')}</button>
    `;
    toast.querySelector('.toast-close').onclick = () => toast.remove();
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }
  success(m) { this.show(m, 'success'); }
  error(m) { this.show(m, 'error'); }
  warning(m) { this.show(m, 'warning'); }
}
const toast = new ToastV2();

// --- Store Manager Compartido con Semilla Segura ---
class StoreV2 {
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
      console.error(e);
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
          observations: 'Único dueño, factura original, servicios de agencia.',
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
          observations: 'Sonido Bose de 12 bocinas, quemacocos, head-up display.',
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
          observations: 'Paquete M Sport, frenos deportivos, rines 19".',
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
          observations: 'Rendimiento de 22 km/l, tracción integral AWD.',
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
          observations: 'Unidad vendida con garantía de 1 año.',
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
          comments: 'Busca sedán económico para trayectos diarios a Santa Fe.',
          dateRegistered: today,
          visits: [{ date: today, notes: 'Visita presencial a sala de exhibición.' }, { date: today, notes: 'Revisión técnica de Versa 2023.' }],
          interestedVehicleIds: ['veh-1']
        },
        {
          id: 'cli-2',
          name: 'Sofía Valenzuela Garza',
          phone: '81 1928 3746',
          email: 'sofia.valenzuela@outlook.com',
          hasBrandPreference: 'si',
          preferredBrand: 'Mazda',
          comments: 'Interesada en Mazda 3. Solicitó simulación de crédito con 30% de enganche.',
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
          comments: 'Dejó apartado firme de $50,000 en caja por el Jetta R-Line.',
          dateRegistered: today,
          visits: [{ date: today, notes: 'Apartado y pago en caja.' }],
          interestedVehicleIds: ['veh-3']
        },
        {
          id: 'cli-4',
          name: 'Mariana Domínguez Ortiz',
          phone: '55 7382 9104',
          email: 'mariana.dominguez@innova.mx',
          hasBrandPreference: 'si',
          preferredBrand: 'BMW',
          comments: 'Cliente VIP interesada en autos premium de alto desempeño.',
          dateRegistered: today,
          visits: [{ date: today, notes: 'Visita showroom con su asesor.' }],
          interestedVehicleIds: ['veh-4']
        },
        {
          id: 'cli-5',
          name: 'Carlos Fuentes Treviño',
          phone: '55 1234 5678',
          email: 'carlos.fuentes@empresa.com',
          hasBrandPreference: 'no',
          preferredBrand: '',
          comments: 'Sin preferencia de marca, busca SUV familiar con buen rendimiento.',
          dateRegistered: today,
          visits: [{ date: today, notes: 'Visita general para ver SUVs.' }],
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
          area: 'Guardia Principal y Recepción',
          phone: '55 4192 8374',
          email: 'carlos.morales@outletautocorp.mx',
          observations: 'Responsable de apertura y bitácora del piso de venta.'
        },
        {
          id: 'sh-2',
          date: today,
          responsible: 'Ana Laura Gómez',
          startTime: '10:00',
          endTime: '19:00',
          area: 'Piso de Ventas y Pruebas',
          phone: '55 8392 0182',
          email: 'ana.gomez@outletautocorp.mx',
          observations: 'Atención a citas de prueba de manejo agendadas.'
        },
        {
          id: 'sh-3',
          date: today,
          responsible: 'Miguel Ángel Torres',
          startTime: '11:00',
          endTime: '20:00',
          area: 'Cierre y Seguridad de Patio',
          phone: '55 9283 7461',
          email: 'miguel.torres@outletautocorp.mx',
          observations: 'Inventario nocturno y candados de acceso.'
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
          description: 'Desbloqueo de accesos, encendido de iluminación, entrega de llaves maestras en caseta.',
          observations: 'Todo en orden sin novedades.'
        },
        {
          id: 'act-2',
          title: 'Inspección de 150 Puntos en Patio',
          responsible: 'Ana Laura Gómez',
          date: today,
          time: '09:30',
          status: 'completada',
          iconType: 'revision',
          description: 'Revisión de presión de llantas, niveles de aceite y estética de unidades en primera fila.',
          observations: 'Se completó la revisión en 15 vehículos.'
        },
        {
          id: 'act-3',
          title: 'Recepción y Atención de Invitados',
          responsible: 'Carlos Morales',
          date: today,
          time: '11:00',
          status: 'en_proceso',
          iconType: 'recepcion',
          description: 'Registro de visitantes en módulo de bienvenida y canalización con asesores comerciales.',
          observations: 'Afluencia moderada en la mañana.'
        },
        {
          id: 'act-4',
          title: 'Limpieza y Detallado de Autos',
          responsible: 'Equipo de Operaciones',
          date: today,
          time: '13:00',
          status: 'en_proceso',
          iconType: 'limpieza',
          description: 'Lavado en seco y aspirado de unidades para pruebas de manejo de la tarde.',
          observations: 'En turno con 4 unidades.'
        },
        {
          id: 'act-5',
          title: 'Rondín de Seguridad y Monitoreo',
          responsible: 'Miguel Ángel Torres',
          date: today,
          time: '16:00',
          status: 'pendiente',
          iconType: 'seguridad',
          description: 'Supervisión de cámaras perimetrales, puertas de servicio y control vehicular.',
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
          description: 'Cierre de cortinas, activación de alarma perimetral y entrega de bitácora firmada.',
          observations: 'Pendiente al fin de turno.'
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
const store = new StoreV2();

// --- Aplicación Principal Diseño 2 ---
class AppV2 {
  constructor() {
    this.currentView = 'general';
    this.currentPeriod = 'month';
    this.invFilterStatus = 'disponible';
    this.invDisplayMode = 'cards';
    this.invSearch = '';
    this.clientSearch = '';
    this.clientBrand = 'all';
    this.calendarView = 'month';
    this.currentCalDate = new Date();
    this.activityFilter = 'all';

    this.init();
  }

  init() {
    this.bindHeaderNav();
    this.renderView('general');
    
    // Live date en el banner
    const liveDateEl = document.getElementById('hero-live-date');
    if (liveDateEl) {
      liveDateEl.textContent = formatDate(getTodayISO(), 'long');
    }

    // Reset demo
    const resetBtn = document.getElementById('btn-reset-demo-v2');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('¿Restablecer datos de demostración a sus valores iniciales?')) {
          localStorage.removeItem(STORAGE_KEY);
          window.location.reload();
        }
      };
    }
  }

  bindHeaderNav() {
    const dockButtons = document.querySelectorAll('.exec-nav-item');
    const drawer = document.getElementById('mobile-drawer-v2');
    const toggleMobile = document.getElementById('btn-toggle-mobile-v2');

    dockButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        dockButtons.forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`.exec-nav-item[data-view="${view}"]`).forEach(b => b.classList.add('active'));
        if (drawer) drawer.classList.remove('open');
        this.renderView(view);
      });
    });

    if (toggleMobile && drawer) {
      toggleMobile.onclick = () => drawer.classList.toggle('open');
    }
  }

  renderView(viewName) {
    this.currentView = viewName;
    const container = document.getElementById('view-container-v2');
    const titleEl = document.getElementById('hero-view-title');
    if (!container) return;

    const titles = {
      general: 'Vista General — Dashboard Ejecutivo',
      guardias: 'Guardias & Actividades del Showroom',
      clientes: 'Directorio Inteligente de Clientes',
      inventario: 'Inventario de Vehículos Seminuevos'
    };
    if (titleEl) titleEl.textContent = titles[viewName] || 'Outlet Autocorp';

    if (viewName === 'general') this.renderDashboard(container);
    if (viewName === 'guardias') this.renderGuardias(container);
    if (viewName === 'clientes') this.renderClientes(container);
    if (viewName === 'inventario') this.renderInventario(container);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // VISTA 1: DASHBOARD V2 — EXECUTIVE COCKPIT
  // ==========================================
  renderDashboard(container) {
    const vehicles = store.getVehicles();
    const clients = store.getClients();
    const testDrives = store.getTestDrives();
    const requests = store.getRequests();
    const downPayments = store.getDownPayments();
    const sales = store.getSales();

    // Cálculos de periodos
    let invitadosCount = 0;
    let prevInvitados = 0;
    clients.forEach(c => {
      (c.visits || []).forEach(v => {
        if (isDateInPeriod(v.date, this.currentPeriod)) invitadosCount++;
        if (isDateInPreviousPeriod(v.date, this.currentPeriod)) prevInvitados++;
      });
    });

    const availableVehs = vehicles.filter(v => v.status === 'disponible');
    const reservedVehs = vehicles.filter(v => v.status === 'apartado');

    const periodTD = testDrives.filter(td => isDateInPeriod(td.date, this.currentPeriod));
    const completedTD = periodTD.filter(td => td.status === 'Realizada').length;
    const scheduledTD = periodTD.filter(td => td.status === 'Programada').length;
    const prevTDCount = testDrives.filter(td => isDateInPreviousPeriod(td.date, this.currentPeriod)).length;

    const periodReq = requests.filter(r => isDateInPeriod(r.date, this.currentPeriod));
    const pendingReq = periodReq.filter(r => r.status === 'Pendiente').length;
    const prevReqCount = requests.filter(r => isDateInPreviousPeriod(r.date, this.currentPeriod)).length;

    const periodDP = downPayments.filter(dp => isDateInPeriod(dp.date, this.currentPeriod));
    const totalDPAmount = periodDP.reduce((s, dp) => s + Number(dp.amount || 0), 0);
    const prevDPAmount = downPayments.filter(dp => isDateInPreviousPeriod(dp.date, this.currentPeriod))
      .reduce((s, dp) => s + Number(dp.amount || 0), 0);

    const periodSales = sales.filter(s => isDateInPeriod(s.date, this.currentPeriod));
    const totalSalesAmount = periodSales.reduce((s, x) => s + Number(x.finalAmount || 0), 0);
    const prevSalesAmount = sales.filter(s => isDateInPreviousPeriod(s.date, this.currentPeriod))
      .reduce((s, x) => s + Number(x.finalAmount || 0), 0);

    // Delta helpers
    const getDeltaBadge = (current, prev) => {
      if (prev === 0) return `<span class="kpi-compare positive">${getIcon('trendingUp')} +100% vs ant.</span>`;
      const diff = current - prev;
      const pct = Math.round((diff / prev) * 100);
      const isPos = pct >= 0;
      return `<span class="kpi-compare ${isPos ? 'positive' : 'negative'}">${isPos ? '+' : ''}${pct}% vs ant.</span>`;
    };

    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Barra de herramientas: Filtros y 4 Accesos Rápidos -->
        <div class="toolbar-v2">
          <div class="period-pills-v2">
            <button class="period-pill-btn ${this.currentPeriod === 'today' ? 'active' : ''}" data-p="today">Hoy</button>
            <button class="period-pill-btn ${this.currentPeriod === 'week' ? 'active' : ''}" data-p="week">Esta semana</button>
            <button class="period-pill-btn ${this.currentPeriod === 'month' ? 'active' : ''}" data-p="month">Este mes</button>
          </div>

          <div class="d-flex gap-2 flex-wrap">
            <button class="btn-v2 btn-v2-primary" id="btn-quick-guest-v2">${getIcon('plus')} <span>Registrar invitado</span></button>
            <button class="btn-v2 btn-v2-outline" id="btn-quick-td-v2">${getIcon('testDrive')} <span>Programar prueba</span></button>
            <button class="btn-v2 btn-v2-outline" id="btn-quick-req-v2">${getIcon('fileText')} <span>Crear solicitud</span></button>
            <button class="btn-v2 btn-v2-dark" id="btn-quick-sale-v2">${getIcon('dollarSign')} <span>Registrar venta</span></button>
          </div>
        </div>

        <!-- 6 Medidores Radiales y Telemetría Ejecutiva V2 -->
        <div class="kpis-gauges-grid-v2">
          <!-- 1. Ventas: Velocímetro SVG con Aguja de Meta -->
          <div class="exec-gauge-card" data-nav="inventario">
            <div class="exec-gauge-header">
              <span class="exec-gauge-title">01 · Facturación Cerrada</span>
              ${getDeltaBadge(totalSalesAmount, prevSalesAmount)}
            </div>
            <div class="exec-gauge-body">
              <div>
                <div class="exec-gauge-val">${formatCurrency(totalSalesAmount)}</div>
                <div class="exec-gauge-sub">${periodSales.length} autos colocados · 86% meta</div>
              </div>
              <div class="exec-gauge-svg-wrap">
                <svg viewBox="0 0 100 65">
                  <path d="M 15 55 A 35 35 0 0 1 85 55" fill="none" stroke="#e5e5e5" stroke-width="8" stroke-linecap="round" />
                  <path d="M 15 55 A 35 35 0 0 1 85 55" fill="none" stroke="#ff8901" stroke-width="8" stroke-dasharray="110" stroke-dashoffset="${Math.max(0, 110 - (Math.min(totalSalesAmount / 4000000, 1) * 110))}" stroke-linecap="round" />
                  <circle cx="50" cy="55" r="4" fill="#251f1d" />
                  <line x1="50" y1="55" x2="72" y2="30" stroke="#251f1d" stroke-width="2.5" stroke-linecap="round" />
                </svg>
                <div class="gauge-center-text" style="bottom: 2px;">MXN</div>
              </div>
            </div>
          </div>

          <!-- 2. Inventario: Anillo Donut SVG Disponibles vs Apartados -->
          <div class="exec-gauge-card" data-nav="inventario">
            <div class="exec-gauge-header">
              <span class="exec-gauge-title">02 · Lote & Disponibilidad</span>
              <span class="badge-v2 badge-v2-green">En Tiempo Real</span>
            </div>
            <div class="exec-gauge-body">
              <div>
                <div class="exec-gauge-val">${formatNumber(availableVehs.length)} <span style="font-size:14px;color:#6e6764;">disp.</span></div>
                <div class="exec-gauge-sub">${reservedVehs.length} apartados · ${vehicles.length} totales</div>
              </div>
              <div class="exec-gauge-svg-wrap">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#f3f4f6" stroke-width="8" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" stroke-width="8" stroke-dasharray="188.4" stroke-dashoffset="${188.4 - ((reservedVehs.length / (vehicles.length || 1)) * 188.4)}" stroke-linecap="round" transform="rotate(-90 40 40)" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#10b981" stroke-width="8" stroke-dasharray="188.4" stroke-dashoffset="${188.4 - ((availableVehs.length / (vehicles.length || 1)) * 188.4)}" stroke-linecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div class="gauge-center-text" style="color: #10b981;">${Math.round((availableVehs.length / (vehicles.length || 1)) * 100)}%</div>
              </div>
            </div>
          </div>

          <!-- 3. Pruebas de Manejo: Medidor Radial de Cumplimiento -->
          <div class="exec-gauge-card" data-nav="guardias">
            <div class="exec-gauge-header">
              <span class="exec-gauge-title">03 · Pruebas de Manejo</span>
              ${getDeltaBadge(periodTD.length, prevTDCount)}
            </div>
            <div class="exec-gauge-body">
              <div>
                <div class="exec-gauge-val">${formatNumber(periodTD.length)}</div>
                <div class="exec-gauge-sub">${completedTD} realizadas · ${scheduledTD} pendientes</div>
              </div>
              <div class="exec-gauge-svg-wrap">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#e0f2fe" stroke-width="8" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#0284c7" stroke-width="8" stroke-dasharray="188.4" stroke-dashoffset="${188.4 - ((completedTD / (periodTD.length || 1)) * 188.4)}" stroke-linecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div class="gauge-center-text" style="color: #0284c7;">${completedTD}/${periodTD.length}</div>
              </div>
            </div>
          </div>

          <!-- 4. Invitados: Histograma de Afluencia de Visitas -->
          <div class="exec-gauge-card" data-nav="clientes">
            <div class="exec-gauge-header">
              <span class="exec-gauge-title">04 · Afluencia de Invitados</span>
              ${getDeltaBadge(invitadosCount, prevInvitados)}
            </div>
            <div class="exec-gauge-body">
              <div>
                <div class="exec-gauge-val">${formatNumber(invitadosCount)}</div>
                <div class="exec-gauge-sub">Visitas físicas a sala de ventas</div>
              </div>
              <div class="exec-gauge-svg-wrap">
                <svg viewBox="0 0 80 60">
                  <rect x="5" y="35" width="8" height="25" rx="3" fill="#251f1d" />
                  <rect x="18" y="20" width="8" height="40" rx="3" fill="#251f1d" />
                  <rect x="31" y="28" width="8" height="32" rx="3" fill="#251f1d" />
                  <rect x="44" y="12" width="8" height="48" rx="3" fill="#ff8901" />
                  <rect x="57" y="18" width="8" height="42" rx="3" fill="#ff8901" />
                  <rect x="70" y="25" width="8" height="35" rx="3" fill="#251f1d" />
                </svg>
                <div class="gauge-center-text" style="bottom: -8px; font-size: 10px; color: #ff8901;">HOY</div>
              </div>
            </div>
          </div>

          <!-- 5. Solicitudes: Embudo de Expedientes -->
          <div class="exec-gauge-card" data-nav="clientes">
            <div class="exec-gauge-header">
              <span class="exec-gauge-title">05 · Expedientes de Crédito</span>
              ${getDeltaBadge(periodReq.length, prevReqCount)}
            </div>
            <div class="exec-gauge-body">
              <div>
                <div class="exec-gauge-val">${formatNumber(periodReq.length)}</div>
                <div class="exec-gauge-sub">${pendingReq} en análisis crediticio</div>
              </div>
              <div class="exec-gauge-svg-wrap">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#fef3c7" stroke-width="8" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#d97706" stroke-width="8" stroke-dasharray="188.4" stroke-dashoffset="${188.4 - ((pendingReq / (periodReq.length || 1)) * 188.4)}" stroke-linecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div class="gauge-center-text" style="color: #d97706;">${pendingReq} pen.</div>
              </div>
            </div>
          </div>

          <!-- 6. Enganche Recibido: Bóveda de Caja Validada -->
          <div class="exec-gauge-card" data-nav="inventario">
            <div class="exec-gauge-header">
              <span class="exec-gauge-title">06 · Enganches en Caja</span>
              ${getDeltaBadge(totalDPAmount, prevDPAmount)}
            </div>
            <div class="exec-gauge-body">
              <div>
                <div class="exec-gauge-val text-orange">${formatCurrency(totalDPAmount)}</div>
                <div class="exec-gauge-sub">${periodDP.length} cobros confirmados en caja</div>
              </div>
              <div class="exec-gauge-svg-wrap">
                <div style="width: 50px; height: 50px; border-radius: 12px; background: #dcfce7; color: #16a34a; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);">
                  ${getIcon('dollarSign')}
                </div>
                <div class="gauge-center-text" style="bottom: -8px; font-size: 10px; color: #16a34a; font-weight: 700;">ACTIVO</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de Gráficas V2 -->
        <div class="charts-grid-v2">
          <!-- Gráfica SVG de Ventas -->
          <div class="card-v2">
            <div class="card-v2-header">
              <div>
                <h3 class="card-v2-title">Facturación por Periodo</h3>
                <p class="card-v2-sub">Ingresos acumulados en MXN y unidades colocadas</p>
              </div>
              <span class="badge-v2 badge-v2-orange font-bold">${formatCurrency(totalSalesAmount)}</span>
            </div>
            <div class="card-v2-body">
              <div id="v2-sales-svg-chart" style="width: 100%; height: 220px;">
                <!-- SVG inyectado -->
              </div>
            </div>
          </div>

          <!-- Embudo Comercial V2 -->
          <div class="card-v2">
            <div class="card-v2-header">
              <div>
                <h3 class="card-v2-title">Embudo de Conversión Comercial</h3>
                <p class="card-v2-sub">Eficiencia del flujo de clientes en el outlet</p>
              </div>
            </div>
            <div class="card-v2-body">
              <div style="display: flex; flex-direction: column; gap: 14px;">
                <div>
                  <div class="d-flex justify-between mb-1">
                    <span class="font-bold">1. Invitados / Visitas</span>
                    <strong>${invitadosCount}</strong>
                  </div>
                  <div style="height: 12px; background: #e5e5e5; border-radius: 6px; overflow: hidden;">
                    <div style="width: 100%; height: 100%; background: #251f1d; border-radius: 6px;"></div>
                  </div>
                </div>

                <div>
                  <div class="d-flex justify-between mb-1">
                    <span class="font-bold">2. Pruebas de Manejo Realizadas</span>
                    <strong class="text-orange">${periodTD.length} (${invitadosCount > 0 ? Math.round((periodTD.length / invitadosCount) * 100) : 0}%)</strong>
                  </div>
                  <div style="height: 12px; background: #e5e5e5; border-radius: 6px; overflow: hidden;">
                    <div style="width: ${invitadosCount > 0 ? Math.min((periodTD.length / invitadosCount) * 100, 100) : 12}%; height: 100%; background: #0284c7; border-radius: 6px;"></div>
                  </div>
                </div>

                <div>
                  <div class="d-flex justify-between mb-1">
                    <span class="font-bold">3. Solicitudes de Financiamiento</span>
                    <strong style="color: #d97706;">${periodReq.length}</strong>
                  </div>
                  <div style="height: 12px; background: #e5e5e5; border-radius: 6px; overflow: hidden;">
                    <div style="width: ${invitadosCount > 0 ? Math.min((periodReq.length / invitadosCount) * 100, 100) : 10}%; height: 100%; background: #f59e0b; border-radius: 6px;"></div>
                  </div>
                </div>

                <div>
                  <div class="d-flex justify-between mb-1">
                    <span class="font-bold">4. Ventas Concretadas</span>
                    <strong class="text-success">${periodSales.length} (${invitadosCount > 0 ? Math.round((periodSales.length / invitadosCount) * 100) : 0}% conv.)</strong>
                  </div>
                  <div style="height: 12px; background: #e5e5e5; border-radius: 6px; overflow: hidden;">
                    <div style="width: ${invitadosCount > 0 ? Math.min((periodSales.length / invitadosCount) * 100, 100) : 10}%; height: 100%; background: #ff8901; border-radius: 6px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Próximos Eventos: Pruebas y Actividades -->
        <div class="charts-grid-v2">
          <!-- Pruebas de manejo próximas -->
          <div class="card-v2">
            <div class="card-v2-header">
              <h3 class="card-v2-title">Pruebas de Manejo Próximas</h3>
              <button class="btn-link" id="v2-link-td">Ir a guardias</button>
            </div>
            <div class="card-v2-body p-0">
              <div class="upcoming-list">
                ${testDrives.slice(0, 4).map(td => {
                  const client = clients.find(c => c.id === td.clientId) || { name: 'Cliente registrado' };
                  const vehicle = vehicles.find(v => v.id === td.vehicleId) || { brand: 'Auto', model: 'Catálogo', year: '' };
                  const isDone = td.status === 'Realizada';
                  return `
                    <div class="upcoming-item">
                      <div class="upcoming-time-col">
                        <span class="upcoming-time">${td.time || '12:00'}</span>
                        <span class="upcoming-date">${formatDate(td.date, 'short')}</span>
                      </div>
                      <div class="upcoming-main-col">
                        <strong class="upcoming-title">${vehicle.brand} ${vehicle.model} ${vehicle.year}</strong>
                        <div class="upcoming-subtitle">Cliente: ${client.name} · Asesor: ${td.responsible || 'De guardia'}</div>
                      </div>
                      <span class="badge-v2 ${isDone ? 'badge-v2-green' : 'badge-v2-orange'}">${td.status}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Actividades operativas del día -->
          <div class="card-v2">
            <div class="card-v2-header">
              <h3 class="card-v2-title">Actividades del Showroom</h3>
              <button class="btn-link" id="v2-link-act">Ver tarjetas</button>
            </div>
            <div class="card-v2-body p-0">
              <div class="upcoming-list">
                ${store.getActivities().slice(0, 4).map(act => `
                  <div class="upcoming-item">
                    <div class="upcoming-time-col">
                      <span class="upcoming-time">${act.time || '09:00'}</span>
                      <span class="upcoming-date">${formatDate(act.date, 'short')}</span>
                    </div>
                    <div class="upcoming-main-col">
                      <strong class="upcoming-title">${act.title}</strong>
                      <div class="upcoming-subtitle">Responsable: ${act.responsible}</div>
                    </div>
                    <span class="badge-v2 ${act.status === 'completada' ? 'badge-v2-green' : (act.status === 'en_proceso' ? 'badge-v2-amber' : 'badge-v2-dark')}">
                      ${act.status}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render de gráfica SVG interactiva
    this.renderSalesSVG('v2-sales-svg-chart', periodSales.length > 0 ? periodSales : sales.slice(0, 5));

    // Filtros de periodo
    container.querySelectorAll('.period-pill-btn').forEach(btn => {
      btn.onclick = () => {
        this.currentPeriod = btn.getAttribute('data-p');
        this.renderDashboard(container);
      };
    });

    // Clic en Medidores Ejecutivos para navegar
    container.querySelectorAll('.exec-gauge-card').forEach(card => {
      card.onclick = () => {
        const nav = card.getAttribute('data-nav');
        if (nav) {
          document.querySelectorAll(`.exec-nav-item[data-view="${nav}"]`).forEach(b => b.click());
        }
      };
    });

    // Enlaces de navegación
    const linkTd = container.querySelector('#v2-link-td');
    if (linkTd) linkTd.onclick = () => document.querySelector(`.exec-nav-item[data-view="guardias"]`).click();
    const linkAct = container.querySelector('#v2-link-act');
    if (linkAct) linkAct.onclick = () => document.querySelector(`.exec-nav-item[data-view="guardias"]`).click();

    // 4 Accesos rápidos con diálogo interactivo
    container.querySelector('#btn-quick-guest-v2').onclick = () => {
      const name = prompt('Nombre completo del nuevo invitado / prospecto:', '');
      if (name) {
        const phone = prompt('Número celular a 10 dígitos:', '55');
        store.data.clients.unshift({
          id: generateId('cli'),
          name,
          phone: phone || '5500000000',
          email: '',
          hasBrandPreference: 'no',
          preferredBrand: '',
          comments: 'Registrado desde botón rápido de Diseño 2.',
          dateRegistered: getTodayISO(),
          visits: [{ date: getTodayISO(), notes: 'Visita inicial registrada en el showroom.' }],
          interestedVehicleIds: []
        });
        store.save();
        toast.success(`¡Invitado ${name} registrado! KPI de Invitados actualizado.`);
        this.renderDashboard(container);
      }
    };

    container.querySelector('#btn-quick-td-v2').onclick = () => {
      document.querySelector(`.exec-nav-item[data-view="guardias"]`).click();
    };

    container.querySelector('#btn-quick-req-v2').onclick = () => {
      document.querySelector(`.exec-nav-item[data-view="clientes"]`).click();
    };

    container.querySelector('#btn-quick-sale-v2').onclick = () => {
      document.querySelector(`.exec-nav-item[data-view="inventario"]`).click();
    };
  }

  // Renderizador SVG de Ventas con área y gradiente
  renderSalesSVG(containerId, salesList) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!salesList || salesList.length === 0) {
      el.innerHTML = '<div style="color:#6e6764;text-align:center;padding:40px;">Sin ventas en el periodo.</div>';
      return;
    }

    const maxVal = Math.max(...salesList.map(s => Number(s.finalAmount || 0)), 500000);
    const width = el.clientWidth || 500;
    const height = 200;
    const pad = { top: 20, right: 30, bottom: 35, left: 60 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;

    const points = salesList.map((s, idx) => {
      const x = pad.left + (w / Math.max(salesList.length - 1, 1)) * idx;
      const y = pad.top + h - (Number(s.finalAmount || 0) / maxVal) * h;
      return `${x},${y}`;
    }).join(' ');

    const area = `${pad.left},${pad.top + h} ${points} ${pad.left + w},${pad.top + h}`;

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="v2SalesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff8901" stop-opacity="0.38" />
            <stop offset="100%" stop-color="#ff8901" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <line x1="${pad.left}" y1="${pad.top + h}" x2="${width - pad.right}" y2="${pad.top + h}" stroke="#e8e6e5" stroke-width="1"/>
        <line x1="${pad.left}" y1="${pad.top + h/2}" x2="${width - pad.right}" y2="${pad.top + h/2}" stroke="#e8e6e5" stroke-dasharray="3,3" stroke-width="1"/>
        <polygon points="${area}" fill="url(#v2SalesGrad)" />
        <polyline points="${points}" fill="none" stroke="#ff8901" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${salesList.map((s, idx) => {
          const x = pad.left + (w / Math.max(salesList.length - 1, 1)) * idx;
          const y = pad.top + h - (Number(s.finalAmount || 0) / maxVal) * h;
          return `
            <circle cx="${x}" cy="${y}" r="5" fill="#ff8901" stroke="#ffffff" stroke-width="2" />
            <text x="${x}" y="${height - 10}" text-anchor="middle" font-size="11" fill="#6e6764" font-family="Montserrat, sans-serif">
              ${formatDate(s.date, 'short')}
            </text>
          `;
        }).join('')}
      </svg>
    `;
  }

  // ==========================================
  // VISTA 2: GUARDIAS Y ACTIVIDADES V2
  // ==========================================
  renderGuardias(container) {
    const shifts = store.getShifts();
    const activities = store.getActivities();
    const todayStr = getTodayISO();

    const renderFlipCardV2 = (act) => `
      <div class="flip-wrapper-v2" data-act-id="${act.id}" style="width: 100%; height: 250px; display: block; flex-shrink: 0; min-width: 0;">
        <div class="flip-inner-v2" style="width: 100%; height: 100%;">
          <!-- Frente -->
          <div class="flip-face-v2 flip-front-v2" style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; padding: 18px 20px;">
            <div class="d-flex justify-between align-center" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div class="act-icon-v2" style="width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">${getIcon(act.iconType || 'gestion')}</div>
              <span class="badge-v2 ${act.status === 'completada' ? 'badge-v2-green' : (act.status === 'en_proceso' ? 'badge-v2-amber' : 'badge-v2-dark')}" style="font-size: 10px;">
                ${act.status}
              </span>
            </div>
            <h4 class="act-title-v2" style="font-size: 14px; margin-top: 10px; word-break: break-word; white-space: normal; line-height: 1.4;">${act.title}</h4>
            <div style="font-size: 12px; color: #6e6764; margin-top: 6px;">Resp: <strong>${act.responsible}</strong></div>
            <div class="d-flex justify-between align-center" style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #6e6764; border-top: 1px solid #eae7e5; padding-top: 8px; margin-top: auto; width: 100%;">
              <span>${act.time || '09:00'} · ${formatDate(act.date, 'short')}</span>
              <span class="font-bold text-orange">Girar ↻</span>
            </div>
          </div>
          <!-- Reverso -->
          <div class="flip-face-v2 flip-back-v2" style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; padding: 18px 20px;">
            <div>
              <span style="font-size: 9px; font-weight: 800; color: #ff8901; text-transform: uppercase;">Detalle de Asignación</span>
              <h5 style="font-size: 13px; font-weight: 800; color: #251f1d;">${act.responsible}</h5>
              <p style="font-size: 11px; margin-top: 6px; color: #251f1d;">${act.description || 'Sin notas.'}</p>
              ${act.observations ? `<p class="input-italic" style="font-size: 10px; color: #6e6764; margin-top: 4px;">"${act.observations}"</p>` : ''}
            </div>
            <div class="d-flex justify-between align-center" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eae7e5; padding-top: 8px; margin-top: auto; width: 100%;">
              <button class="btn-v2 btn-v2-outline btn-v2-sm btn-toggle-act-status" data-act-id="${act.id}" style="padding: 4px 8px; font-size: 11px;">
                ${act.status === 'completada' ? 'Pendiente' : 'Completar'}
              </button>
              <span style="font-size: 10px; color: #ff8901; font-weight: 700;">Volver ↺</span>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Subpestañas V2 -->
        <div class="toolbar-v2">
          <div class="period-pills-v2">
            <button class="period-pill-btn active" id="btn-tab-cal-v2">Calendario de Guardias</button>
            <button class="period-pill-btn" id="btn-tab-act-v2">Tarjetas de Actividades (3D Flip)</button>
          </div>
          <button class="btn-v2 btn-v2-primary" id="btn-new-act-v2">${getIcon('plus')} Agregar</button>
        </div>

        <!-- SECCIÓN CALENDARIO -->
        <div id="subtab-cal-content-v2">
          <div class="card-v2 p-4">
            <div class="d-flex justify-between align-center mb-4">
              <h3 class="card-v2-title">Roles de Guardia del Mes</h3>
              <div class="d-flex gap-2">
                <button class="btn-v2 btn-v2-outline btn-v2-sm" id="cal-v2-today">Ir a Hoy</button>
              </div>
            </div>

            <div class="calendar-v2-container">
              <div class="cal-v2-header-grid">
                <div class="cal-v2-header-cell">Lunes</div>
                <div class="cal-v2-header-cell">Martes</div>
                <div class="cal-v2-header-cell">Miércoles</div>
                <div class="cal-v2-header-cell">Jueves</div>
                <div class="cal-v2-header-cell">Viernes</div>
                <div class="cal-v2-header-cell">Sábado</div>
                <div class="cal-v2-header-cell">Domingo</div>
              </div>
              <div class="cal-v2-body-grid" id="cal-v2-grid-body">
                <!-- Días inyectados -->
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN ACTIVIDADES: KANBAN BOARD EJECUTIVO CON 3D FLIP -->
        <div id="subtab-act-content-v2" style="display: none;">
          <div class="exec-kanban-board">
            <!-- Columna 1: Pendientes -->
            <div class="kanban-col" style="min-width: 0; width: 100%;">
              <div class="kanban-col-header">
                <span class="kanban-col-title" style="color: #6e6764;">📌 Pendientes</span>
                <span class="badge-v2 badge-v2-dark">${activities.filter(a => a.status === 'pendiente').length}</span>
              </div>
              <div class="kanban-cards-stack" style="display: flex !important; flex-direction: column !important; gap: 16px; width: 100%;">
                ${activities.filter(a => a.status === 'pendiente').map(act => renderFlipCardV2(act)).join('')}
              </div>
            </div>

            <!-- Columna 2: En Proceso -->
            <div class="kanban-col" style="background-color: #fffdf8; border-color: rgba(245, 158, 11, 0.3); min-width: 0; width: 100%;">
              <div class="kanban-col-header" style="border-bottom-color: rgba(245, 158, 11, 0.4);">
                <span class="kanban-col-title" style="color: #d97706;">⚙️ En Proceso</span>
                <span class="badge-v2 badge-v2-amber">${activities.filter(a => a.status === 'en_proceso').length}</span>
              </div>
              <div class="kanban-cards-stack" style="display: flex !important; flex-direction: column !important; gap: 16px; width: 100%;">
                ${activities.filter(a => a.status === 'en_proceso').map(act => renderFlipCardV2(act)).join('')}
              </div>
            </div>

            <!-- Columna 3: Completadas -->
            <div class="kanban-col" style="background-color: #f7fdfa; border-color: rgba(16, 185, 129, 0.3); min-width: 0; width: 100%;">
              <div class="kanban-col-header" style="border-bottom-color: rgba(16, 185, 129, 0.4);">
                <span class="kanban-col-title" style="color: #10b981;">✅ Completadas</span>
                <span class="badge-v2 badge-v2-green">${activities.filter(a => a.status === 'completada').length}</span>
              </div>
              <div class="kanban-cards-stack" style="display: flex !important; flex-direction: column !important; gap: 16px; width: 100%;">
                ${activities.filter(a => a.status === 'completada').map(act => renderFlipCardV2(act)).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Conmutador de subpestañas
    const btnTabCal = container.querySelector('#btn-tab-cal-v2');
    const btnTabAct = container.querySelector('#btn-tab-act-v2');
    const calContent = container.querySelector('#subtab-cal-content-v2');
    const actContent = container.querySelector('#subtab-act-content-v2');

    btnTabCal.onclick = () => {
      btnTabCal.classList.add('active');
      btnTabAct.classList.remove('active');
      calContent.style.display = 'block';
      actContent.style.display = 'none';
    };

    btnTabAct.onclick = () => {
      btnTabAct.classList.add('active');
      btnTabCal.classList.remove('active');
      calContent.style.display = 'none';
      actContent.style.display = 'block';
    };

    // Render calendario
    this.renderCalDays(container);

    // Giro táctil y cambio de estatus en actividades
    container.querySelectorAll('.flip-wrapper-v2').forEach(wrap => {
      wrap.onclick = (e) => {
        if (e.target.closest('button')) return;
        wrap.querySelector('.flip-inner-v2').classList.toggle('is-flipped');
      };
    });

    container.querySelectorAll('.btn-toggle-act-status').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-act-id');
        const act = store.getActivities().find(a => a.id === id);
        if (act) {
          act.status = act.status === 'completada' ? 'pendiente' : 'completada';
          store.save();
          toast.success(`Estatus actualizado a ${act.status}`);
          this.renderGuardias(container);
          btnTabAct.click();
        }
      };
    });
  }

  renderCalDays(container) {
    const gridBody = container.querySelector('#cal-v2-grid-body');
    if (!gridBody) return;

    const shifts = store.getShifts();
    const todayStr = getTodayISO();
    const year = this.currentCalDate.getFullYear();
    const month = this.currentCalDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    let html = '';
    for (let i = 0; i < startOffset; i++) {
      html += `<div class="cal-v2-day" style="background: #fafafa;"></div>`;
    }

    for (let d = 1; d <= totalDays; d++) {
      const monthPad = String(month + 1).padStart(2, '0');
      const dayPad = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthPad}-${dayPad}`;
      const isToday = dateStr === todayStr;

      const dayShifts = shifts.filter(s => s.date === dateStr);

      html += `
        <div class="cal-v2-day ${isToday ? 'is-today' : ''}">
          <div class="d-flex justify-between align-center mb-1">
            <span style="font-weight: 800; font-size: 12px; ${isToday ? 'color: #ff8901;' : ''}">${d}</span>
            ${isToday ? '<span class="badge-v2 badge-v2-orange" style="font-size: 9px; padding: 2px 6px;">Hoy</span>' : ''}
          </div>
          ${dayShifts.map(s => `
            <div class="shift-chip-v2" title="${s.responsible}: ${s.startTime} - ${s.endTime}">
              <strong style="color: #251f1d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.responsible}</strong>
            </div>
          `).join('')}
        </div>
      `;
    }

    gridBody.innerHTML = html;
  }

  // ==========================================
  // VISTA 3: CLIENTES V2 — MASTER-DETAIL SPLIT CRM
  // ==========================================
  renderClientes(container) {
    const allClients = store.getClients();
    let clients = allClients;

    if (this.clientSearch) {
      clients = clients.filter(c => 
        (c.name || '').toLowerCase().includes(this.clientSearch) ||
        (c.phone || '').includes(this.clientSearch) ||
        (c.email || '').toLowerCase().includes(this.clientSearch)
      );
    }

    if (!this.selectedClientId && clients.length > 0) {
      this.selectedClientId = clients[0].id;
    }

    const selectedClient = allClients.find(c => c.id === this.selectedClientId) || clients[0] || null;

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="toolbar-v2">
          <div class="toolbar-search-box" style="flex: 1; max-width: 420px;">
            <input type="text" id="client-search-v2" class="input-search" placeholder="Buscar por nombre, celular o correo..." value="${this.clientSearch}" />
          </div>

          <div class="d-flex gap-2">
            <button class="btn-v2 btn-v2-primary" id="btn-add-client-v2">${getIcon('plus')} Agregar cliente</button>
          </div>
        </div>

        <!-- Master-Detail Split Layout -->
        <div class="exec-split-layout">
          <!-- Columna Izquierda: Master List -->
          <div class="exec-master-pane">
            <div class="exec-master-header d-flex justify-between align-center">
              <strong style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #251f1d;">Directorio (${clients.length})</strong>
              <span class="badge-v2 badge-v2-orange" style="font-size: 10px;">CRM Activo</span>
            </div>
            <div class="exec-master-list">
              ${clients.map(c => {
                const isSelected = selectedClient && selectedClient.id === c.id;
                return `
                  <div class="exec-client-row ${isSelected ? 'is-selected' : ''}" data-client-id="${c.id}">
                    <div class="d-flex align-center gap-3">
                      <div class="client-avatar-v2" style="width: 36px; height: 36px; font-size: 13px;">${c.name.charAt(0)}</div>
                      <div>
                        <strong style="font-size: 13px; color: #251f1d; display: block;">${c.name}</strong>
                        <span style="font-size: 11px; color: #6e6764;">${formatPhone(c.phone)}</span>
                      </div>
                    </div>
                    <div style="text-align: right;">
                      ${c.hasBrandPreference === 'si' && c.preferredBrand 
                        ? `<span class="badge-v2 badge-v2-orange" style="font-size: 9px; padding: 2px 7px;">${c.preferredBrand}</span>`
                        : `<span class="badge-v2 badge-v2-dark" style="font-size: 9px; padding: 2px 7px;">Sin pref.</span>`
                      }
                      <div style="font-size: 10px; color: #a39c99; margin-top: 3px;">${(c.visits || []).length} visitas</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Columna Derecha: Ficha 360 en Vivo -->
          <div class="exec-detail-pane">
            ${selectedClient ? `
              <div>
                <!-- Encabezado del Cliente -->
                <div class="d-flex justify-between align-start flex-wrap gap-3 pb-3" style="border-bottom: 2px solid #eae7e5;">
                  <div class="d-flex align-center gap-3">
                    <div class="client-avatar-v2" style="width: 56px; height: 56px; font-size: 20px;">${selectedClient.name.charAt(0)}</div>
                    <div>
                      <h2 style="font-size: 20px; font-weight: 800; color: #251f1d;">${selectedClient.name}</h2>
                      <div class="d-flex gap-3 align-center mt-1" style="font-size: 12px; color: #6e6764;">
                        <span>📞 ${formatPhone(selectedClient.phone)}</span>
                        <span>✉️ ${selectedClient.email || 'Sin correo registrado'}</span>
                        <span>📅 Alta: ${formatDate(selectedClient.dateRegistered, 'short')}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span class="badge-v2 ${selectedClient.hasBrandPreference === 'si' ? 'badge-v2-orange' : 'badge-v2-dark'}" style="font-size: 12px; padding: 6px 14px;">
                      ${selectedClient.hasBrandPreference === 'si' ? `Interés: ${selectedClient.preferredBrand}` : 'Sin marca en específico'}
                    </span>
                  </div>
                </div>

                <!-- Botones de Acción Directa -->
                <div class="d-flex gap-2 flex-wrap my-3">
                  <button class="btn-v2 btn-v2-primary btn-v2-sm" id="btn-detail-add-visit" data-id="${selectedClient.id}">+ Registrar Visita (KPI)</button>
                  <button class="btn-v2 btn-v2-outline btn-v2-sm" id="btn-detail-test-drive" data-id="${selectedClient.id}">🚗 Programar Prueba</button>
                  <button class="btn-v2 btn-v2-outline btn-v2-sm" id="btn-detail-request" data-id="${selectedClient.id}">📄 Crear Solicitud</button>
                  <button class="btn-v2 btn-v2-dark btn-v2-sm" id="btn-detail-sale" data-id="${selectedClient.id}">💰 Registrar Venta</button>
                </div>

                <!-- Notas y Comentarios -->
                <div style="background: #fffcf8; border-left: 3px solid #ff8901; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px;">
                  <span style="font-size: 10px; font-weight: 800; color: #ff8901; text-transform: uppercase;">Observaciones del Asesor</span>
                  <p class="input-italic" style="font-size: 13px; color: #251f1d; margin-top: 4px;">"${selectedClient.comments || 'Sin comentarios registrados aún.'}"</p>
                </div>

                <!-- Historial de Visitas y Seguimiento -->
                <div class="mt-3">
                  <h4 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #251f1d; margin-bottom: 12px;">
                    Historial de Visitas Registradas (${(selectedClient.visits || []).length})
                  </h4>
                  <div style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                    ${(selectedClient.visits || []).map(v => `
                      <div style="padding: 10px 14px; background: #faf9f8; border-radius: 8px; border: 1px solid #eae7e5; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <strong style="font-size: 12px; color: #251f1d;">${formatDate(v.date, 'long')}</strong>
                          <div style="font-size: 12px; color: #6e6764; margin-top: 2px;">${v.notes || 'Visita al piso de venta.'}</div>
                        </div>
                        <span class="badge-v2 badge-v2-green" style="font-size: 10px;">Validada</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            ` : `
              <div class="text-center p-5 text-muted">Selecciona un cliente de la lista para ver su expediente 360.</div>
            `}
          </div>
        </div>
      </div>
    `;

    // Interacción Master-Detail
    container.querySelectorAll('.exec-client-row').forEach(row => {
      row.onclick = () => {
        this.selectedClientId = row.getAttribute('data-client-id');
        this.renderClientes(container);
      };
    });

    // Registrar visita rápida
    const btnVisit = container.querySelector('#btn-detail-add-visit');
    if (btnVisit) {
      btnVisit.onclick = () => {
        const id = btnVisit.getAttribute('data-id');
        const note = prompt('Motivo u observaciones de la visita del cliente:', 'Recorrido por inventario.');
        if (note !== null) {
          const client = store.getClients().find(c => c.id === id);
          if (client) {
            client.visits.unshift({ date: getTodayISO(), notes: note });
            store.save();
            toast.success(`Visita registrada para ${client.name}. KPI Invitados actualizado.`);
            this.renderClientes(container);
          }
        }
      };
    }

    // Acciones directas
    const btnTD = container.querySelector('#btn-detail-test-drive');
    if (btnTD) {
      btnTD.onclick = () => {
        const vehs = store.getVehicles().filter(v => v.status === 'disponible');
        if (vehs.length === 0) { alert('No hay autos disponibles para prueba.'); return; }
        const vehChoice = prompt(`Selecciona vehículo para la prueba:\n${vehs.map((v, i) => `${i+1}. ${v.brand} ${v.model} (${v.year})`).join('\n')}`, '1');
        const idx = parseInt(vehChoice) - 1;
        if (vehs[idx]) {
          const time = prompt('Horario de la prueba (HH:MM):', '12:00') || '12:00';
          store.data.testDrives.unshift({
            id: generateId('td'),
            clientId: selectedClient.id,
            vehicleId: vehs[idx].id,
            date: getTodayISO(),
            time,
            responsible: 'Asesor en Turno',
            status: 'Programada'
          });
          store.save();
          toast.success(`Prueba de manejo agendada para ${selectedClient.name} en ${vehs[idx].model}.`);
          this.renderClientes(container);
        }
      };
    }

    const btnReq = container.querySelector('#btn-detail-request');
    if (btnReq) {
      btnReq.onclick = () => {
        const amount = prompt('Monto solicitado o enganche propuesto (MXN):', '80000');
        if (amount) {
          store.data.requests.unshift({
            id: generateId('req'),
            clientId: selectedClient.id,
            vehicleId: (store.getVehicles()[0] || {}).id,
            date: getTodayISO(),
            type: 'Financiamiento tradicional',
            status: 'Pendiente',
            amount: Number(amount)
          });
          store.save();
          toast.success('Solicitud de compra generada.');
          this.renderClientes(container);
        }
      };
    }

    const btnSale = container.querySelector('#btn-detail-sale');
    if (btnSale) {
      btnSale.onclick = () => {
        const vehs = store.getVehicles().filter(v => v.status === 'disponible' || v.status === 'apartado');
        if (vehs.length === 0) { alert('No hay autos disponibles para venta.'); return; }
        const vehChoice = prompt(`Selecciona vehículo a vender:\n${vehs.map((v, i) => `${i+1}. ${v.brand} ${v.model} - ${formatCurrency(v.price)}`).join('\n')}`, '1');
        const idx = parseInt(vehChoice) - 1;
        if (vehs[idx]) {
          const targetVeh = vehs[idx];
          const finalAmt = prompt(`Precio final pactado (MXN):`, targetVeh.price) || targetVeh.price;
          targetVeh.status = 'vendido';
          store.data.sales.unshift({
            id: generateId('sale'),
            clientId: selectedClient.id,
            vehicleId: targetVeh.id,
            date: getTodayISO(),
            finalAmount: Number(finalAmt),
            paymentType: 'Contado'
          });
          store.save();
          toast.success(`¡Venta cerrada! ${targetVeh.brand} ${targetVeh.model} marcado como VENDIDO.`);
          this.renderClientes(container);
        }
      };
    }

    // Buscador
    const searchInput = container.querySelector('#client-search-v2');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.clientSearch = e.target.value.toLowerCase().trim();
        this.renderClientes(container);
      };
    }

    // Agregar nuevo cliente
    const addBtn = container.querySelector('#btn-add-client-v2');
    if (addBtn) {
      addBtn.onclick = () => {
        const name = prompt('Nombre completo del cliente:', '');
        if (!name) return;
        const phone = prompt('Número celular a 10 dígitos:', '');
        if (!validatePhone(phone)) {
          alert('El celular debe tener 10 dígitos numéricos.');
          return;
        }
        const brandPref = prompt('¿Tiene alguna marca en específico? (Ej. BMW, Audi, o dejar en blanco):', '');
        const newClient = {
          id: generateId('cli'),
          name,
          phone,
          email: '',
          hasBrandPreference: brandPref ? 'si' : 'no',
          preferredBrand: brandPref || '',
          comments: 'Alta de cliente desde CRM Ejecutivo.',
          dateRegistered: getTodayISO(),
          visits: [{ date: getTodayISO(), notes: 'Primera visita al showroom.' }],
          interestedVehicleIds: []
        };
        store.data.clients.unshift(newClient);
        this.selectedClientId = newClient.id;
        store.save();
        toast.success(`Cliente ${name} creado con éxito.`);
        this.renderClientes(container);
      };
    }
  }

  // ==========================================
  // VISTA 4: INVENTARIO V2
  // ==========================================
  renderInventario(container) {
    const allVehs = store.getVehicles();
    let vehs = allVehs;

    if (this.invFilterStatus !== 'all') {
      vehs = vehs.filter(v => v.status === this.invFilterStatus);
    }

    if (this.invSearch) {
      vehs = vehs.filter(v => 
        (v.brand || '').toLowerCase().includes(this.invSearch) ||
        (v.model || '').toLowerCase().includes(this.invSearch) ||
        (v.inventoryId || '').toLowerCase().includes(this.invSearch)
      );
    }

    container.innerHTML = `
      <div class="animate-fade-in">
        <div class="toolbar-v2">
          <!-- Filtro de Estatus -->
          <div class="period-pills-v2">
            <button class="period-pill-btn ${this.invFilterStatus === 'disponible' ? 'active' : ''}" data-status="disponible">Disponibles</button>
            <button class="period-pill-btn ${this.invFilterStatus === 'apartado' ? 'active' : ''}" data-status="apartado">Apartados</button>
            <button class="period-pill-btn ${this.invFilterStatus === 'vendido' ? 'active' : ''}" data-status="vendido">Vendidos</button>
            <button class="period-pill-btn ${this.invFilterStatus === 'all' ? 'active' : ''}" data-status="all">Todos</button>
          </div>

          <!-- Buscador y Conmutador de vista -->
          <div class="d-flex align-center gap-2">
            <div class="toolbar-search-box" style="width: 260px;">
              <input type="text" id="inv-search-v2" class="input-search" placeholder="Buscar vehículo..." value="${this.invSearch}" />
            </div>

            <div class="period-pills-v2">
              <button class="period-pill-btn ${this.invDisplayMode === 'cards' ? 'active' : ''}" id="btn-mode-cards-v2">${getIcon('grid')}</button>
              <button class="period-pill-btn ${this.invDisplayMode === 'table' ? 'active' : ''}" id="btn-mode-table-v2">${getIcon('list')}</button>
            </div>
          </div>
        </div>

        <!-- Cuadrícula de Tarjetas Horizontales Showroom Widescreen V2 -->
        ${this.invDisplayMode === 'cards' ? `
          <div class="veh-horizontal-stack" style="display: flex !important; flex-direction: column !important; gap: 24px; width: 100%;">
            ${vehs.map(v => {
              const img = (v.images && v.images[0]) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
              let badgeClass = 'badge-v2-green';
              if (v.status === 'apartado') badgeClass = 'badge-v2-amber';
              if (v.status === 'vendido') badgeClass = 'badge-v2-dark';

              return `
                <div class="veh-card-horizontal" style="display: grid; grid-template-columns: 320px 1fr; width: 100%; box-sizing: border-box;">
                  <div class="veh-h-media" style="width: 100%; height: 100%; min-height: 220px; position: relative; overflow: hidden;">
                    <img src="${img}" alt="${v.model}" class="veh-h-img" loading="lazy" />
                    <span class="badge-v2 ${badgeClass}" style="position: absolute; top: 12px; left: 12px; font-size: 10px;">${v.status.toUpperCase()}</span>
                    <span style="position: absolute; bottom: 12px; left: 12px; background: rgba(37,31,29,0.85); color: #fff; padding: 4px 9px; border-radius: 4px; font-size: 11px; font-weight: 700;">${v.inventoryId}</span>
                  </div>

                  <div class="veh-h-content" style="padding: 24px; width: 100%; box-sizing: border-box;">
                    <div class="d-flex justify-between align-start flex-wrap gap-2">
                      <div>
                        <h3 style="font-size: 18px; font-weight: 800; color: #251f1d;">${v.brand} ${v.model}</h3>
                        <div style="font-size: 13px; color: #6e6764; margin-top: 2px;">${v.version || ''} · Color ${v.color}</div>
                      </div>
                      <div style="text-align: right;">
                        <span style="font-size: 11px; color: #6e6764; text-transform: uppercase;">Precio de Contado</span>
                        <div style="font-size: 20px; font-weight: 800; color: #251f1d;">${formatCurrency(v.price)}</div>
                        <div style="font-size: 11px; color: #ff8901; font-weight: 700;">Enganche est.: ${formatCurrency(v.estimatedDownPayment)}</div>
                      </div>
                    </div>

                    <!-- Especificaciones técnicas en grilla -->
                    <div class="veh-h-grid-specs">
                      <div class="spec-h-item"><span>Año</span><strong>${v.year}</strong></div>
                      <div class="spec-h-item"><span>Kilometraje</span><strong>${formatNumber(v.mileage)} km</strong></div>
                      <div class="spec-h-item"><span>Transmisión</span><strong>${v.transmission}</strong></div>
                      <div class="spec-h-item"><span>Combustible</span><strong>${v.fuel}</strong></div>
                    </div>

                    <!-- Acciones directas -->
                    <div class="d-flex justify-between align-center pt-2 flex-wrap gap-2" style="border-top: 1px solid #eae7e5;">
                      <span class="input-italic" style="font-size: 11px; color: #6e6764;">"${v.observations || 'Unidad certificada con garantía de 1 año en tren motriz.'}"</span>
                      <div class="d-flex gap-2">
                        ${v.status === 'disponible' ? `
                          <button class="btn-v2 btn-v2-outline btn-v2-sm btn-v2-apartar" data-veh-id="${v.id}">Apartar con Enganche</button>
                          <button class="btn-v2 btn-v2-primary btn-v2-sm btn-v2-vender" data-veh-id="${v.id}">Registrar Venta</button>
                        ` : ''}
                        ${v.status === 'apartado' ? `
                          <button class="btn-v2 btn-v2-primary btn-v2-sm btn-v2-vender" data-veh-id="${v.id}">Concretar Venta</button>
                        ` : ''}
                        ${v.status === 'vendido' ? `<span class="badge-v2 badge-v2-dark" style="font-size: 12px; padding: 6px 14px;">Vendido</span>` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- Vista Tabla V2 -->
          <div class="card-v2" style="overflow: hidden;">
            <div class="table-responsive">
              <table class="smart-table-v2">
                <thead>
                  <tr>
                    <th>VEHÍCULO</th>
                    <th>AÑO & KM</th>
                    <th>TRANSMISIÓN</th>
                    <th>PRECIO DE VENTA</th>
                    <th>ENGANCHE ESTIMADO</th>
                    <th>ESTADO</th>
                    <th style="text-align: right;">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  ${vehs.map(v => `
                    <tr>
                      <td>
                        <strong>${v.brand} ${v.model}</strong>
                        <div style="font-size: 11px; color: #6e6764;">${v.inventoryId} · ${v.version}</div>
                      </td>
                      <td><strong>${v.year}</strong> · ${formatNumber(v.mileage)} km</td>
                      <td>${v.transmission}</td>
                      <td><strong style="font-size: 14px;">${formatCurrency(v.price)}</strong></td>
                      <td><strong class="text-orange">${formatCurrency(v.estimatedDownPayment)}</strong></td>
                      <td><span class="badge-v2 ${v.status === 'disponible' ? 'badge-v2-green' : (v.status === 'apartado' ? 'badge-v2-amber' : 'badge-v2-dark')}">${v.status}</span></td>
                      <td style="text-align: right;">
                        ${v.status === 'disponible' ? `
                          <button class="btn-v2 btn-v2-primary btn-v2-sm btn-v2-vender" data-veh-id="${v.id}">Vender</button>
                        ` : ''}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `}
      </div>
    `;

    // Filtros de estatus
    container.querySelectorAll('.period-pill-btn[data-status]').forEach(btn => {
      btn.onclick = () => {
        this.invFilterStatus = btn.getAttribute('data-status');
        this.renderInventario(container);
      };
    });

    // Conmutador modo
    const btnCards = container.querySelector('#btn-mode-cards-v2');
    const btnTable = container.querySelector('#btn-mode-table-v2');
    if (btnCards && btnTable) {
      btnCards.onclick = () => { this.invDisplayMode = 'cards'; this.renderInventario(container); };
      btnTable.onclick = () => { this.invDisplayMode = 'table'; this.renderInventario(container); };
    }

    // Buscador
    const search = container.querySelector('#inv-search-v2');
    if (search) {
      search.oninput = (e) => {
        this.invSearch = e.target.value.toLowerCase().trim();
        this.renderInventario(container);
      };
    }

    // Apartar vehículo
    container.querySelectorAll('.btn-v2-apartar').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-veh-id');
        const veh = store.getVehicles().find(v => v.id === id);
        if (!veh) return;

        const amountStr = prompt(`Ingresa el enganche recibido en caja para apartar ${veh.brand} ${veh.model}:`, '25000');
        const amount = Number(amountStr);
        if (amount > 0) {
          veh.status = 'apartado';
          store.data.downPayments.unshift({
            id: generateId('dp'),
            clientId: store.getClients()[0] ? store.getClients()[0].id : '',
            vehicleId: veh.id,
            amount,
            date: getTodayISO(),
            method: 'Transferencia SPEI',
            reference: 'FOLIO-V2-APARTADO',
            notes: 'Apartado registrado desde Diseño 2.'
          });
          store.save();
          toast.success(`Vehículo apartado y enganche de ${formatCurrency(amount)} sumado a KPIs.`);
          this.renderInventario(container);
        }
      };
    });

    // Vender vehículo
    container.querySelectorAll('.btn-v2-vender').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-veh-id');
        const veh = store.getVehicles().find(v => v.id === id);
        if (!veh) return;

        if (confirm(`¿Confirmar venta definitiva de ${veh.brand} ${veh.model} por ${formatCurrency(veh.price)}?`)) {
          veh.status = 'vendido';
          store.data.sales.unshift({
            id: generateId('sale'),
            clientId: store.getClients()[0] ? store.getClients()[0].id : '',
            vehicleId: veh.id,
            finalAmount: veh.price,
            paymentType: 'Financiamiento Banorte',
            advisor: 'Carlos Morales',
            date: getTodayISO(),
            notes: 'Venta registrada desde Diseño 2.'
          });
          store.save();
          toast.success(`¡Venta cerrada! Unidad marcada como Vendida y KPI de Ventas actualizado.`);
          this.renderInventario(container);
        }
      };
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.appV2 = new AppV2();
});

})();
