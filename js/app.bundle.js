(function() {
'use strict';

// --- File: js\utils.js ---
/**
 * @fileoverview Módulo de Utilidades para Outlet Autocorp Mini CRM
 * Contiene funciones puras para formateo monetario (MXN), manipulación de fechas en español,
 * validación de números de teléfono, correos electrónicos y algoritmos de filtrado por periodo.
 * 
 * @module utils
 */

/**
 * Formatea un valor numérico a divisa en Pesos Mexicanos (MXN).
 * 
 * @param {number|string} amount - Monto numérico a formatear.
 * @param {boolean} [withCode=true] - Si es true, añade el sufijo ' MXN' al resultado.
 * @returns {string} Cadena formateada (ej. "$329,000 MXN" o "$329,000").
 * 
 * @example
 * formatCurrency(329000); // "$329,000 MXN"
 * formatCurrency(329000, false); // "$329,000"
 */
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

/**
 * Formatea un número con separadores de miles para el estándar mexicano.
 * 
 * @param {number|string} number - Número a formatear.
 * @returns {string} Cadena numérica con comas (ej. "28,500").
 */
function formatNumber(number) {
  if (number === undefined || number === null || isNaN(number)) return '0';
  return new Intl.NumberFormat('es-MX').format(number);
}

/**
 * Convierte una fecha ISO (YYYY-MM-DD o ISO string) a texto legible en español.
 * 
 * @param {string} dateStr - Cadena de fecha en formato ISO.
 * @param {'short'|'long'|'time'|'datetime'} [format='short'] - Variante de formato deseada.
 * @returns {string} Fecha formateada en español.
 * 
 * @example
 * formatDate('2026-11-11', 'short'); // "11 nov. 2026"
 * formatDate('2026-11-11', 'long'); // "miércoles, 11 de noviembre de 2026"
 */
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

  if (format === 'time') {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  if (format === 'datetime') {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }

  return date.toLocaleDateString('es-MX');
}

/**
 * Obtiene la fecha actual del sistema en formato ISO YYYY-MM-DD.
 * 
 * @returns {string} Fecha en formato 'YYYY-MM-DD'.
 */
function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Valida si una cadena de teléfono corresponde al formato estándar mexicano de 10 dígitos.
 * 
 * @param {string} phone - Teléfono a validar.
 * @returns {boolean} True si contiene exactamente 10 dígitos numéricos.
 */
function validatePhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  return cleaned.length === 10 && /^\d+$/.test(cleaned);
}

/**
 * Aplica formato telefónico mexicano legible (espaciado 2-4-4).
 * 
 * @param {string} phone - Teléfono a formatear.
 * @returns {string} Teléfono formateado (ej. "55 4192 8374").
 */
function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Valida si una dirección de correo electrónico cumple con el formato estándar RFC.
 * 
 * @param {string} email - Correo a validar.
 * @returns {boolean} True si es sintácticamente válido.
 */
function validateEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Genera un identificador único seguro basado en timestamp y número aleatorio.
 * 
 * @param {string} [prefix='ID'] - Prefijo identificador de la entidad (ej. 'veh', 'cli', 'shift').
 * @returns {string} Identificador único en mayúsculas (ej. "VEH-L2KJ98-A7F2").
 */
function generateId(prefix = 'ID') {
  return `${prefix.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

/**
 * Evalúa si una fecha dada pertenece al periodo de tiempo seleccionado.
 * 
 * @param {string} dateStr - Fecha ISO a evaluar.
 * @param {'today'|'week'|'month'|'custom'} period - Tipo de periodo.
 * @param {string} [customStart=null] - Fecha inicio requerida si period === 'custom'.
 * @param {string} [customEnd=null] - Fecha fin requerida si period === 'custom'.
 * @returns {boolean} True si la fecha está comprendida dentro del periodo.
 */
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
    // Semana actual (lunes a domingo)
    const dayOfWeek = today.getDay(); // 0 domingo, 1 lunes...
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

/**
 * Evalúa si una fecha dada pertenece al periodo anterior equivalente (para cálculos comparativos de KPI).
 * - Si el periodo actual es 'today', compara contra el día de ayer.
 * - Si el periodo actual es 'week', compara contra la semana anterior.
 * - Si el periodo actual es 'month', compara contra el mes anterior.
 * 
 * @param {string} dateStr - Fecha ISO a evaluar.
 * @param {'today'|'week'|'month'} period - Tipo de periodo.
 * @returns {boolean} True si la fecha cae en el periodo anterior.
 */
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

// --- File: js\components\icons.js ---
// Iconos SVG para Outlet Autocorp Mini CRM
const icons = {
  dashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  car: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
  testDrive: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/><circle cx="12" cy="12" r="2"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  dollarSign: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>`,
  trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  trendingDown: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  filter: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  edit: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
  phone: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  alertCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  grid: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
  list: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
  refresh: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
  userCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
  bookmark: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
  flip: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>`,
  menu: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,

  // Iconos representativos de actividades solicitados en la especificación
  seguridad: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  limpieza: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 5-7 7"/><path d="m14 10 2 2"/><path d="M11.5 12.5 4 20h4l7.5-7.5"/><path d="m15 9 1-1"/><path d="m2 2 20 20"/></svg>`,
  apertura: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15.5 8.5 4.5 4.5a2 2 0 0 1 0 2.83l-1.17 1.17a2 2 0 0 1-2.83 0L14 15"/><path d="m18 11 2 2"/><path d="m15 14 2 2"/><circle cx="7.5" cy="7.5" r="4.5"/></svg>`,
  cierre: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  revision: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="m14 4 3 3-4 4-3-3z"/><path d="m12 6-1.5-1.5"/></svg>`,
  recepcion: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.3-4.3a1 1 0 0 0 0-1.4l-2-2"/><path d="m18 10 1.5-1.5a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L14 6"/><path d="M2 13a4 4 0 0 0 4 4h4"/><path d="M9 13a2 2 0 0 1 2-2h3"/></svg>`,
  gestion: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="m9 14 2 2 4-4"/></svg>`
};

function getIcon(name, customClass = '') {
  const svg = icons[name] || icons.dashboard;
  if (customClass) {
    return svg.replace('<svg ', `<svg class="${customClass}" `);
  }
  return svg;
}

// --- File: js\components\toast.js ---
// Sistema de Notificaciones Toast y Modales de Confirmación

class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;
    
    let iconSvg = getIcon('alertCircle');
    if (type === 'success') iconSvg = getIcon('checkCircle');
    if (type === 'error') iconSvg = getIcon('alertCircle');
    if (type === 'warning') iconSvg = getIcon('alertCircle');

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Cerrar notificación">${getIcon('close')}</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
  }

  dismiss(toast) {
    toast.classList.add('animate-fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }

  success(msg) { this.show(msg, 'success'); }
  error(msg) { this.show(msg, 'error', 4500); }
  warning(msg) { this.show(msg, 'warning', 4000); }
  info(msg) { this.show(msg, 'info'); }
}

const toast = new ToastManager();

// Modal de confirmación accesible y estilizado
function confirmDialog({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDestructive = false }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.id = 'confirm-dialog-backdrop';

    const modal = document.createElement('div');
    modal.className = 'modal-box modal-confirm animate-scale-up';
    modal.setAttribute('role', 'alertdialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title ${isDestructive ? 'text-danger' : ''}">${title}</h3>
        <button class="modal-close-btn" aria-label="Cerrar">${getIcon('close')}</button>
      </div>
      <div class="modal-body">
        <p class="modal-desc">${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="confirm-cancel-btn">${cancelText}</button>
        <button class="btn ${isDestructive ? 'btn-danger' : 'btn-primary'}" id="confirm-ok-btn">${confirmText}</button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const close = (result) => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => {
        backdrop.remove();
        resolve(result);
      }, 180);
    };

    modal.querySelector('.modal-close-btn').onclick = () => close(false);
    modal.querySelector('#confirm-cancel-btn').onclick = () => close(false);
    modal.querySelector('#confirm-ok-btn').onclick = () => close(true);
    backdrop.onclick = (e) => {
      if (e.target === backdrop) close(false);
    };

    // Soporte para tecla Esc
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', escHandler);
        close(false);
      }
    };
    window.addEventListener('keydown', escHandler);
  });
}

// --- File: js\components\charts.js ---
// Gráficas vectoriales interactivas para el Dashboard

/**
 * Renderiza la gráfica de ventas en SVG
 * Muestra el volumen monetario ($ MXN) y las unidades vendidas
 */
function renderSalesChart(containerId, salesData) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!salesData || salesData.length === 0) {
    container.innerHTML = `
      <div class="chart-empty-state">
        <p>No hay ventas registradas en el periodo seleccionado.</p>
      </div>
    `;
    return;
  }

  // Agrupar ventas por etiqueta (ej. día o semana o periodo)
  const sorted = [...salesData].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Agrupar por fecha
  const groups = {};
  sorted.forEach(s => {
    const key = s.date;
    if (!groups[key]) {
      groups[key] = { date: key, amount: 0, count: 0 };
    }
    groups[key].amount += Number(s.finalAmount || 0);
    groups[key].count += 1;
  });

  const dataPoints = Object.values(groups);
  const maxAmount = Math.max(...dataPoints.map(d => d.amount), 500000);

  const width = container.clientWidth || 540;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 45, left: 75 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Escalas
  const getX = (index) => padding.left + (chartW / Math.max(dataPoints.length - 1, 1)) * index;
  const getY = (val) => padding.top + chartH - (val / maxAmount) * chartH;

  // Puntos de la línea
  const points = dataPoints.map((d, i) => `${getX(i)},${getY(d.amount)}`).join(' ');
  const areaPoints = `${padding.left},${padding.top + chartH} ${points} ${getX(dataPoints.length - 1)},${padding.top + chartH}`;

  // Líneas de referencia horizontales (Grid)
  let gridLines = '';
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const val = (maxAmount / steps) * i;
    const y = getY(val);
    gridLines += `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e8e6e5" stroke-dasharray="3,3" stroke-width="1" />
      <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="#6b6360" font-family="Montserrat, Gotham, sans-serif">
        $${(val / 1000).toFixed(0)}k
      </text>
    `;
  }

  // Etiquetas del eje X
  let xLabels = '';
  dataPoints.forEach((d, i) => {
    const x = getX(i);
    const dateObj = new Date(d.date + 'T00:00:00');
    const label = `${dateObj.getDate()} ${dateObj.toLocaleDateString('es-MX', { month: 'short' })}`;
    xLabels += `
      <text x="${x}" y="${height - 12}" text-anchor="middle" font-size="11" fill="#251f1d" font-family="Montserrat, Gotham, sans-serif">
        ${label}
      </text>
      <circle cx="${x}" cy="${getY(d.amount)}" r="5" fill="#ff8901" stroke="#ffffff" stroke-width="2" class="chart-point" data-amount="${d.amount}" data-count="${d.count}" data-date="${label}"/>
    `;
  });

  container.innerHTML = `
    <div class="chart-wrapper" style="position: relative; width: 100%; height: ${height}px;">
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff8901" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#ff8901" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        ${gridLines}
        ${dataPoints.length > 1 ? `<polygon points="${areaPoints}" fill="url(#salesGrad)" />` : ''}
        ${dataPoints.length > 1 ? `<polyline points="${points}" fill="none" stroke="#ff8901" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />` : ''}
        ${xLabels}
      </svg>
      <div class="chart-tooltip" id="sales-chart-tooltip" style="display: none;"></div>
    </div>
  `;

  // Interacción de tooltips
  const tooltip = container.querySelector('#sales-chart-tooltip');
  const circles = container.querySelectorAll('.chart-point');

  circles.forEach(circle => {
    circle.addEventListener('mouseenter', (e) => {
      const amount = Number(circle.getAttribute('data-amount'));
      const count = circle.getAttribute('data-count');
      const date = circle.getAttribute('data-date');
      const cx = parseFloat(circle.getAttribute('cx'));
      const cy = parseFloat(circle.getAttribute('cy'));

      tooltip.innerHTML = `
        <div class="tooltip-title">${date}</div>
        <div class="tooltip-val"><strong>${formatCurrency(amount)}</strong></div>
        <div class="tooltip-sub">${count} unidad(es) vendida(s)</div>
      `;
      tooltip.style.left = `${cx}px`;
      tooltip.style.top = `${cy - 50}px`;
      tooltip.style.display = 'block';
    });

    circle.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });
}

/**
 * Renderiza la gráfica de embudo y seguimiento comercial
 * Invitados -> Pruebas de manejo -> Solicitudes -> Ventas
 */
function renderFunnelChart(containerId, stats) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const steps = [
    { name: 'Invitados / Visitas', value: stats.invitados || 0, color: '#251f1d' },
    { name: 'Pruebas de manejo', value: stats.pruebasManejo || 0, color: '#0284c7' },
    { name: 'Solicitudes creadas', value: stats.solicitudes || 0, color: '#f59e0b' },
    { name: 'Ventas cerradas', value: stats.ventas || 0, color: '#ff8901' }
  ];

  const maxVal = Math.max(...steps.map(s => s.value), 1);

  let html = `
    <div class="funnel-container">
      <div class="funnel-bars">
  `;

  steps.forEach((step, idx) => {
    const percentOfMax = Math.max(Math.round((step.value / maxVal) * 100), 4);
    const prevVal = idx > 0 ? steps[idx - 1].value : null;
    const conversionRate = prevVal && prevVal > 0 
      ? Math.round((step.value / prevVal) * 100) 
      : (idx === 0 ? 100 : 0);

    html += `
      <div class="funnel-row">
        <div class="funnel-meta">
          <span class="funnel-step-name">${step.name}</span>
          <span class="funnel-step-val">${formatNumber(step.value)}</span>
        </div>
        <div class="funnel-bar-track">
          <div class="funnel-bar-fill" style="width: ${percentOfMax}%; background-color: ${step.color};"></div>
        </div>
        <div class="funnel-conversion">
          ${idx === 0 
            ? '<span class="conversion-pill">Inicio</span>' 
            : `<span class="conversion-pill font-bold">${conversionRate}% conv.</span>`
          }
        </div>
      </div>
    `;
  });

  html += `
      </div>
      <div class="funnel-summary">
        <div class="funnel-stat-box">
          <div class="stat-number">${stats.invitados > 0 ? Math.round((stats.ventas / stats.invitados) * 100) : 0}%</div>
          <div class="stat-label">Conversión Global (Visita a Venta)</div>
        </div>
        <div class="funnel-stat-box">
          <div class="stat-number">${stats.pruebasManejo > 0 ? Math.round((stats.ventas / stats.pruebasManejo) * 100) : 0}%</div>
          <div class="stat-label">Efectividad de Pruebas de Manejo</div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// --- File: js\store.js ---
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
function getInitialData() {
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

const store = new Store();

// --- File: js\components\modals.js ---
// Gestor de Modales Comerciales Conectados (Invitados, Pruebas de Manejo, Solicitudes, Ventas)

class ModalManager {
  constructor(app) {
    this.app = app;
  }

  // ==========================================
  // MODAL: REGISTRAR INVITADO / VISITA
  // ==========================================
  openAddGuestModal() {
    const clients = store.getClients();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Registrar Invitado / Visita</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="guest-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label class="form-label required">Tipo de registro</label>
              <div class="d-flex gap-4">
                <label class="radio-label">
                  <input type="radio" name="guest_type" value="new" checked />
                  <span>Nuevo prospecto / visitante</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="guest_type" value="existing" />
                  <span>Cliente ya registrado (nueva visita)</span>
                </label>
              </div>
            </div>

            <!-- Sección: Cliente Existente -->
            <div class="form-group full-width" id="existing-client-group" style="display: none;">
              <label for="existing-client-select" class="form-label required">Selecciona el cliente</label>
              <select id="existing-client-select" class="input-select">
                ${clients.map(c => `
                  <option value="${c.id}">${c.name} — ${c.phone}</option>
                `).join('')}
              </select>
            </div>

            <!-- Sección: Nuevo Cliente -->
            <div id="new-client-fields" class="form-grid full-width" style="margin: 0; padding: 0;">
              <!-- Alerta de posible duplicado -->
              <div id="guest-dupe-warning" class="alert-box alert-warning full-width" style="display: none;">
                <div class="alert-icon">${getIcon('alertCircle')}</div>
                <div class="alert-content">
                  <strong class="text-sm">Aviso de duplicado:</strong>
                  <p id="guest-dupe-text" class="text-xs"></p>
                </div>
              </div>

              <div class="form-group full-width">
                <label for="guest-name" class="form-label required">Nombre completo del invitado</label>
                <input type="text" id="guest-name" class="input-text" placeholder="Ej. Mariana López" required />
              </div>

              <div class="form-group half-width">
                <label for="guest-phone" class="form-label required">Celular (10 dígitos)</label>
                <input type="tel" id="guest-phone" class="input-text" placeholder="Ej. 5512345678" required />
              </div>

              <div class="form-group half-width">
                <label for="guest-email" class="form-label">Correo electrónico</label>
                <input type="email" id="guest-email" class="input-text" placeholder="correo@ejemplo.com" />
              </div>

              <div class="form-group half-width">
                <label for="guest-has-brand" class="form-label required">¿Busca marca específica?</label>
                <select id="guest-has-brand" class="input-select">
                  <option value="no">Sin preferencia</option>
                  <option value="si">Sí, marca en específico</option>
                </select>
              </div>

              <div class="form-group half-width" id="guest-brand-group" style="display: none;">
                <label for="guest-brand" class="form-label">Marca de interés</label>
                <select id="guest-brand" class="input-select">
                  <option value="Nissan">Nissan</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Ford">Ford</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="KIA">KIA</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="BMW">BMW</option>
                </select>
              </div>
            </div>

            <!-- Notas de la visita de hoy -->
            <div class="form-group full-width">
              <label for="guest-notes" class="form-label required">Motivo / Notas de la visita de hoy</label>
              <input type="text" id="guest-notes" class="input-text input-italic" value="Visita inicial al showroom para conocer inventario." required />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">Registrar Visita</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);
    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;

    const radios = backdrop.querySelectorAll('input[name="guest_type"]');
    const existingGroup = backdrop.querySelector('#existing-client-group');
    const newFields = backdrop.querySelector('#new-client-fields');
    const guestHasBrand = backdrop.querySelector('#guest-has-brand');
    const guestBrandGroup = backdrop.querySelector('#guest-brand-group');
    const phoneInput = backdrop.querySelector('#guest-phone');
    const emailInput = backdrop.querySelector('#guest-email');
    const dupeWarning = backdrop.querySelector('#guest-dupe-warning');
    const dupeText = backdrop.querySelector('#guest-dupe-text');

    radios.forEach(r => {
      r.addEventListener('change', () => {
        if (r.value === 'existing') {
          existingGroup.style.display = 'block';
          newFields.style.display = 'none';
          backdrop.querySelector('#guest-name').removeAttribute('required');
          backdrop.querySelector('#guest-phone').removeAttribute('required');
        } else {
          existingGroup.style.display = 'none';
          newFields.style.display = 'grid';
          backdrop.querySelector('#guest-name').setAttribute('required', 'true');
          backdrop.querySelector('#guest-phone').setAttribute('required', 'true');
        }
      });
    });

    guestHasBrand.addEventListener('change', () => {
      guestBrandGroup.style.display = guestHasBrand.value === 'si' ? 'block' : 'none';
    });

    const checkGuestDupes = () => {
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const duplicate = store.checkDuplicateClient(phone, email);
      if (duplicate) {
        dupeWarning.style.display = 'flex';
        dupeText.textContent = `Coincide con "${duplicate.name}" (${duplicate.phone}). Te sugerimos cambiar a 'Cliente ya registrado' para no duplicar su ficha.`;
      } else {
        dupeWarning.style.display = 'none';
      }
    };

    phoneInput.addEventListener('input', checkGuestDupes);
    emailInput.addEventListener('input', checkGuestDupes);

    const form = backdrop.querySelector('#guest-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const type = form.querySelector('input[name="guest_type"]:checked').value;
      const notes = form.querySelector('#guest-notes').value.trim();

      if (type === 'existing') {
        const clientId = form.querySelector('#existing-client-select').value;
        store.registerClientVisit(clientId, notes || 'Visita registrada.');
        toast.success('Visita registrada con éxito. Se actualizó el KPI de Invitados.');
      } else {
        const name = form.querySelector('#guest-name').value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();
        const hasBrand = guestHasBrand.value;
        const brand = hasBrand === 'si' ? form.querySelector('#guest-brand').value : '';

        if (!validatePhone(phone)) {
          toast.error('El número de celular debe ser de 10 dígitos.');
          return;
        }

        if (email && !validateEmail(email)) {
          toast.error('El formato de correo no es válido.');
          return;
        }

        store.addClient({
          name,
          phone,
          email,
          hasBrandPreference: hasBrand,
          preferredBrand: brand,
          comments: notes
        });
        toast.success(`Nuevo prospecto ${name} registrado y visita contabilizada en KPIs.`);
      }

      close();
      this.app.refreshCurrentView();
    };
  }

  // ==========================================
  // MODAL: PROGRAMAR PRUEBA DE MANEJO
  // ==========================================
  openAddTestDriveModal(defaultClientId = null, defaultVehicleId = null, onComplete = null) {
    const clients = store.getClients();
    const vehicles = store.getVehicles();
    const advisors = store.data.advisors || [];

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Programar Prueba de Manejo</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="td-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label for="td-client" class="form-label required">Cliente</label>
              <select id="td-client" class="input-select" required>
                ${clients.map(c => `
                  <option value="${c.id}" ${defaultClientId === c.id ? 'selected' : ''}>${c.name} (${c.phone})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group full-width">
              <label for="td-vehicle" class="form-label required">Vehículo a evaluar</label>
              <select id="td-vehicle" class="input-select" required>
                ${vehicles.map(v => `
                  <option value="${v.id}" ${defaultVehicleId === v.id ? 'selected' : ''}>
                    ${v.brand} ${v.model} ${v.year} — ${formatCurrency(v.price)} [${v.status}]
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="td-date" class="form-label required">Fecha</label>
              <input type="date" id="td-date" class="input-text" value="${getTodayISO()}" required />
            </div>

            <div class="form-group half-width">
              <label for="td-time" class="form-label required">Horario</label>
              <input type="time" id="td-time" class="input-text" value="16:00" required />
            </div>

            <div class="form-group half-width">
              <label for="td-advisor" class="form-label required">Asesor de guardia / responsable</label>
              <select id="td-advisor" class="input-select" required>
                ${advisors.map(a => `<option value="${a.name}">${a.name} (${a.role})</option>`).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="td-status" class="form-label required">Estado</label>
              <select id="td-status" class="input-select" required>
                <option value="Programada" selected>Programada</option>
                <option value="Realizada">Realizada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="td-notes" class="form-label">Ruta u observaciones previas</label>
              <textarea id="td-notes" class="input-textarea input-italic" rows="2" placeholder="Ruta urbana de 20 minutos, verificar licencia vigente..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">Agendar Prueba de Manejo</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);
    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;

    backdrop.querySelector('#td-form').onsubmit = (e) => {
      e.preventDefault();
      const form = backdrop.querySelector('#td-form');
      const payload = {
        clientId: form.querySelector('#td-client').value,
        vehicleId: form.querySelector('#td-vehicle').value,
        date: form.querySelector('#td-date').value,
        time: form.querySelector('#td-time').value,
        responsible: form.querySelector('#td-advisor').value,
        status: form.querySelector('#td-status').value,
        notes: form.querySelector('#td-notes').value.trim()
      };

      store.addTestDrive(payload);
      toast.success('Prueba de manejo programada y vinculada exitosamente');
      close();
      if (onComplete) onComplete();
      this.app.refreshCurrentView();
    };
  }

  // ==========================================
  // MODAL: CREAR SOLICITUD DE COMPRA / CRÉDITO
  // ==========================================
  openAddRequestModal(defaultClientId = null, defaultVehicleId = null, onComplete = null) {
    const clients = store.getClients();
    const vehicles = store.getVehicles();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Crear Solicitud de Compra / Financiamiento</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="req-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label for="req-client" class="form-label required">Cliente solicitante</label>
              <select id="req-client" class="input-select" required>
                ${clients.map(c => `
                  <option value="${c.id}" ${defaultClientId === c.id ? 'selected' : ''}>${c.name} (${c.phone})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group full-width">
              <label for="req-vehicle" class="form-label required">Vehículo solicitado</label>
              <select id="req-vehicle" class="input-select" required>
                ${vehicles.map(v => `
                  <option value="${v.id}" ${defaultVehicleId === v.id ? 'selected' : ''}>
                    ${v.brand} ${v.model} ${v.year} — ${formatCurrency(v.price)} [${v.status}]
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="req-type" class="form-label required">Modalidad</label>
              <select id="req-type" class="input-select" required>
                <option value="Financiamiento" selected>Financiamiento bancario / casa</option>
                <option value="Contado">Contado directo</option>
                <option value="Arrendamiento">Arrendamiento puro (Leasing)</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="req-down" class="form-label required">Enganche planeado ($ MXN)</label>
              <input type="number" id="req-down" class="input-text font-bold text-orange" min="0" step="1000" value="80000" required />
            </div>

            <div class="form-group half-width">
              <label for="req-date" class="form-label required">Fecha de solicitud</label>
              <input type="date" id="req-date" class="input-text" value="${getTodayISO()}" required />
            </div>

            <div class="form-group half-width">
              <label for="req-status" class="form-label required">Estado de la solicitud</label>
              <select id="req-status" class="input-select" required>
                <option value="Pendiente" selected>Pendiente de análisis</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="req-notes" class="form-label">Institución bancaria y notas</label>
              <textarea id="req-notes" class="input-textarea input-italic" rows="2" placeholder="Banco Santander, plazo a 48 meses, entrega de comprobantes fiscales..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">Registrar Solicitud</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);
    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;

    backdrop.querySelector('#req-form').onsubmit = (e) => {
      e.preventDefault();
      const form = backdrop.querySelector('#req-form');
      const payload = {
        clientId: form.querySelector('#req-client').value,
        vehicleId: form.querySelector('#req-vehicle').value,
        type: form.querySelector('#req-type').value,
        downPaymentPlanned: Number(form.querySelector('#req-down').value),
        date: form.querySelector('#req-date').value,
        status: form.querySelector('#req-status').value,
        notes: form.querySelector('#req-notes').value.trim()
      };

      store.addRequest(payload);
      toast.success('Solicitud registrada con éxito. Se actualizó el KPI de Solicitudes.');
      close();
      if (onComplete) onComplete();
      this.app.refreshCurrentView();
    };
  }

  // ==========================================
  // MODAL: REGISTRAR VENTA DEFINITIVA
  // ==========================================
  openAddSaleModal(defaultClientId = null, defaultVehicleId = null, onComplete = null) {
    const clients = store.getClients();
    // Excluir vehículos ya vendidos
    const availableVehicles = store.getVehicles().filter(v => v.status !== 'vendido');
    const advisors = store.data.advisors || [];

    if (availableVehicles.length === 0) {
      toast.warning('No hay vehículos disponibles o apartados para vender en este momento.');
      return;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box modal-lg animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Registrar Venta de Vehículo</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="sale-form">
          <div class="modal-body form-grid">
            <div class="alert-box alert-info full-width">
              <div class="alert-icon">${getIcon('dollarSign')}</div>
              <div class="alert-content">
                <strong>Confirmación de Cierre Comercial:</strong>
                <p class="text-xs">Al registrar la venta, el vehículo pasará automáticamente a estado <strong>Vendido</strong> y se actualizarán los KPIs de Ventas e Inventario.</p>
              </div>
            </div>

            <div class="form-group half-width">
              <label for="sale-client" class="form-label required">Cliente comprador</label>
              <select id="sale-client" class="input-select" required>
                ${clients.map(c => `
                  <option value="${c.id}" ${defaultClientId === c.id ? 'selected' : ''}>${c.name} (${c.phone})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="sale-vehicle" class="form-label required">Vehículo vendido</label>
              <select id="sale-vehicle" class="input-select" required>
                ${availableVehicles.map(v => `
                  <option value="${v.id}" data-price="${v.price}" ${defaultVehicleId === v.id ? 'selected' : ''}>
                    ${v.brand} ${v.model} ${v.year} — ${formatCurrency(v.price)} (${v.status})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="sale-amount" class="form-label required">Monto final de venta ($ MXN)</label>
              <input type="number" id="sale-amount" class="input-text font-bold" min="1000" step="1000" required />
            </div>

            <div class="form-group half-width">
              <label for="sale-paytype" class="form-label required">Forma de pago</label>
              <select id="sale-paytype" class="input-select" required>
                <option value="Financiamiento Banorte">Financiamiento Banorte</option>
                <option value="Financiamiento Santander">Financiamiento Santander</option>
                <option value="Financiamiento BBVA">Financiamiento BBVA</option>
                <option value="Transferencia SPEI Contado">Transferencia SPEI Contado</option>
                <option value="Crédito de Casa Autocorp">Crédito de Casa Autocorp</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="sale-advisor" class="form-label required">Asesor comercial que cerró la venta</label>
              <select id="sale-advisor" class="input-select" required>
                ${advisors.map(a => `<option value="${a.name}">${a.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="sale-date" class="form-label required">Fecha de factura / venta</label>
              <input type="date" id="sale-date" class="input-text" value="${getTodayISO()}" required />
            </div>

            <div class="form-group full-width">
              <label for="sale-notes" class="form-label">Observaciones y entrega</label>
              <textarea id="sale-notes" class="input-textarea input-italic" rows="2" placeholder="Garantía de 1 año, entrega programada en sala VIP, kit de seguridad incluido..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-dark">Confirmar Venta y Facturación</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);
    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;

    const vehSelect = backdrop.querySelector('#sale-vehicle');
    const amountInput = backdrop.querySelector('#sale-amount');

    const updatePrice = () => {
      const selectedOption = vehSelect.options[vehSelect.selectedIndex];
      if (selectedOption) {
        amountInput.value = selectedOption.getAttribute('data-price') || 350000;
      }
    };
    vehSelect.addEventListener('change', updatePrice);
    updatePrice();

    backdrop.querySelector('#sale-form').onsubmit = (e) => {
      e.preventDefault();
      const form = backdrop.querySelector('#sale-form');
      const vehicleId = vehSelect.value;
      const finalAmount = Number(amountInput.value);

      try {
        store.addSale({
          clientId: form.querySelector('#sale-client').value,
          vehicleId,
          finalAmount,
          paymentType: form.querySelector('#sale-paytype').value,
          advisor: form.querySelector('#sale-advisor').value,
          date: form.querySelector('#sale-date').value,
          notes: form.querySelector('#sale-notes').value.trim()
        });

        toast.success(`¡Venta cerrada con éxito por ${formatCurrency(finalAmount)}! Vehículo marcado como Vendido.`);
        close();
        if (onComplete) onComplete();
        this.app.refreshCurrentView();
      } catch (err) {
        toast.error(err.message || 'Error al procesar la venta.');
      }
    };
  }
}

// --- File: js\views\dashboard.js ---
// Vista General — Dashboard

class DashboardView {
  constructor(app) {
    this.app = app;
    this.currentPeriod = 'month'; // 'today', 'week', 'month', 'custom'
    this.customStart = '';
    this.customEnd = '';
  }

  render(container) {
    container.innerHTML = `
      <div class="dashboard-view animate-fade-in">
        <!-- Barra de herramientas: Filtros de fecha y Accesos rápidos -->
        <div class="dashboard-toolbar">
          <div class="period-filter-group">
            <span class="filter-label">Periodo:</span>
            <div class="period-buttons">
              <button class="btn-period ${this.currentPeriod === 'today' ? 'active' : ''}" data-period="today">Hoy</button>
              <button class="btn-period ${this.currentPeriod === 'week' ? 'active' : ''}" data-period="week">Esta semana</button>
              <button class="btn-period ${this.currentPeriod === 'month' ? 'active' : ''}" data-period="month">Este mes</button>
              <button class="btn-period ${this.currentPeriod === 'custom' ? 'active' : ''}" data-period="custom">Personalizado</button>
            </div>
            <div class="custom-date-range ${this.currentPeriod === 'custom' ? 'show' : ''}" id="custom-date-controls">
              <input type="date" id="dash-date-start" value="${this.customStart}" class="input-date" />
              <span>a</span>
              <input type="date" id="dash-date-end" value="${this.customEnd}" class="input-date" />
              <button class="btn btn-sm btn-outline" id="btn-apply-custom-date">Aplicar</button>
            </div>
          </div>

          <div class="quick-actions-group">
            <button class="btn btn-primary" id="btn-quick-guest">
              ${getIcon('plus')} <span>Registrar invitado</span>
            </button>
            <button class="btn btn-outline" id="btn-quick-testdrive">
              ${getIcon('testDrive')} <span>Programar prueba</span>
            </button>
            <button class="btn btn-outline" id="btn-quick-request">
              ${getIcon('fileText')} <span>Crear solicitud</span>
            </button>
            <button class="btn btn-dark" id="btn-quick-sale">
              ${getIcon('dollarSign')} <span>Registrar venta</span>
            </button>
          </div>
        </div>

        <!-- 6 Tarjetas de KPIs -->
        <div class="kpi-grid" id="kpi-cards-container">
          <!-- Inyectado dinámicamente -->
        </div>

        <!-- Sección de Gráficas -->
        <div class="dashboard-charts-grid">
          <div class="card chart-card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Ventas por Periodo</h3>
                <p class="card-subtitle">Evolución de ventas confirmadas en MXN y volumen de unidades</p>
              </div>
              <span class="badge badge-primary" id="sales-chart-total-badge">$0 MXN</span>
            </div>
            <div class="card-body">
              <div id="dashboard-sales-chart"></div>
            </div>
          </div>

          <div class="card chart-card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Seguimiento Comercial</h3>
                <p class="card-subtitle">Embudo de conversión: Invitados → Pruebas → Solicitudes → Ventas</p>
              </div>
            </div>
            <div class="card-body">
              <div id="dashboard-funnel-chart"></div>
            </div>
          </div>
        </div>

        <!-- Próximas Actividades y Pruebas de Manejo -->
        <div class="dashboard-upcoming-grid">
          <!-- Pruebas de manejo próximas -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Pruebas de Manejo Próximas</h3>
                <p class="card-subtitle">Citas agendadas para evaluación de vehículos</p>
              </div>
              <button class="btn-link" id="link-all-testdrives">Ver todas</button>
            </div>
            <div class="card-body p-0">
              <div class="upcoming-list" id="upcoming-testdrives-list">
                <!-- Inyectado -->
              </div>
            </div>
          </div>

          <!-- Actividades operativas del día -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Actividades Operativas</h3>
                <p class="card-subtitle">Responsabilidades y tareas de la sucursal</p>
              </div>
              <button class="btn-link" id="link-all-activities">Ir a actividades</button>
            </div>
            <div class="card-body p-0">
              <div class="upcoming-list" id="upcoming-activities-list">
                <!-- Inyectado -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.update();
  }

  bindEvents(container) {
    // Filtros de fecha
    const periodButtons = container.querySelectorAll('.btn-period');
    const customControls = container.querySelector('#custom-date-controls');

    periodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        periodButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const period = btn.getAttribute('data-period');
        this.currentPeriod = period;

        if (period === 'custom') {
          customControls.classList.add('show');
        } else {
          customControls.classList.remove('show');
          this.update();
        }
      });
    });

    const applyCustomBtn = container.querySelector('#btn-apply-custom-date');
    if (applyCustomBtn) {
      applyCustomBtn.addEventListener('click', () => {
        this.customStart = container.querySelector('#dash-date-start').value;
        this.customEnd = container.querySelector('#dash-date-end').value;
        this.update();
      });
    }

    // Accesos rápidos
    container.querySelector('#btn-quick-guest').addEventListener('click', () => this.app.modals.openAddGuestModal());
    container.querySelector('#btn-quick-testdrive').addEventListener('click', () => this.app.modals.openAddTestDriveModal());
    container.querySelector('#btn-quick-request').addEventListener('click', () => this.app.modals.openAddRequestModal());
    container.querySelector('#btn-quick-sale').addEventListener('click', () => this.app.modals.openAddSaleModal());

    // Enlaces de navegación
    container.querySelector('#link-all-testdrives').addEventListener('click', () => this.app.navigate('guardias', 'actividades'));
    container.querySelector('#link-all-activities').addEventListener('click', () => this.app.navigate('guardias', 'actividades'));
  }

  update() {
    this.renderKPIs();
    this.renderCharts();
    this.renderUpcoming();
  }

  // Cálculo y renderizado de los 6 KPIs
  renderKPIs() {
    const kpiContainer = document.getElementById('kpi-cards-container');
    if (!kpiContainer) return;

    const vehicles = store.getVehicles();
    const clients = store.getClients();
    const testDrives = store.getTestDrives();
    const requests = store.getRequests();
    const downPayments = store.getDownPayments();
    const sales = store.getSales();

    // 1. Invitados en el periodo (visitas registradas en periodo actual vs anterior)
    let invitadosCount = 0;
    let prevInvitadosCount = 0;
    clients.forEach(c => {
      (c.visits || []).forEach(v => {
        if (isDateInPeriod(v.date, this.currentPeriod, this.customStart, this.customEnd)) {
          invitadosCount++;
        }
        if (isDateInPreviousPeriod(v.date, this.currentPeriod)) {
          prevInvitadosCount++;
        }
      });
    });

    // 2. Inventario disponible (refleja disponibilidad ACTUAL estricta)
    const availableVehicles = vehicles.filter(v => v.status === 'disponible');
    const reservedVehicles = vehicles.filter(v => v.status === 'apartado');
    const totalVehicles = vehicles.length;

    // 3. Pruebas de manejo en el periodo
    const periodTestDrives = testDrives.filter(td => isDateInPeriod(td.date, this.currentPeriod, this.customStart, this.customEnd));
    const completedTestDrives = periodTestDrives.filter(td => td.status === 'Realizada').length;
    const scheduledTestDrives = periodTestDrives.filter(td => td.status === 'Programada').length;
    const prevTestDrivesCount = testDrives.filter(td => isDateInPreviousPeriod(td.date, this.currentPeriod)).length;

    // 4. Solicitudes en el periodo
    const periodRequests = requests.filter(r => isDateInPeriod(r.date, this.currentPeriod, this.customStart, this.customEnd));
    const pendingRequests = periodRequests.filter(r => r.status === 'Pendiente').length;
    const prevRequestsCount = requests.filter(r => isDateInPreviousPeriod(r.date, this.currentPeriod)).length;

    // 5. Enganche acumulado RECIBIDO en el periodo (importes efectivamente cobrados)
    const periodDownPayments = downPayments.filter(dp => isDateInPeriod(dp.date, this.currentPeriod, this.customStart, this.customEnd));
    const totalDownPaymentAmount = periodDownPayments.reduce((sum, dp) => sum + Number(dp.amount || 0), 0);
    const prevDownPayments = downPayments.filter(dp => isDateInPreviousPeriod(dp.date, this.currentPeriod));
    const prevDownPaymentAmount = prevDownPayments.reduce((sum, dp) => sum + Number(dp.amount || 0), 0);

    // 6. Ventas en el periodo
    const periodSales = sales.filter(s => isDateInPeriod(s.date, this.currentPeriod, this.customStart, this.customEnd));
    const totalSalesCount = periodSales.length;
    const totalSalesAmount = periodSales.reduce((sum, s) => sum + Number(s.finalAmount || 0), 0);
    const prevSales = sales.filter(s => isDateInPreviousPeriod(s.date, this.currentPeriod));
    const prevSalesAmount = prevSales.reduce((sum, s) => sum + Number(s.finalAmount || 0), 0);

    // Función de comparación
    const getComparisonBadge = (current, prev, isCurrency = false) => {
      if (prev === 0) {
        if (current > 0) return `<span class="kpi-compare positive">${getIcon('trendingUp')} +100% vs anterior</span>`;
        return `<span class="kpi-compare neutral">Sin datos previos</span>`;
      }
      const diff = current - prev;
      const pct = Math.round((diff / prev) * 100);
      const isPositive = pct >= 0;
      return `
        <span class="kpi-compare ${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? getIcon('trendingUp') : getIcon('trendingDown')}
          ${isPositive ? '+' : ''}${pct}% vs anterior
        </span>
      `;
    };

    kpiContainer.innerHTML = `
      <!-- KPI 1: Invitados -->
      <div class="kpi-card card" data-view="clientes" tabindex="0" role="button" aria-label="Ver detalle de Invitados">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-orange">${getIcon('users')}</div>
          ${getComparisonBadge(invitadosCount, prevInvitadosCount)}
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Invitados</span>
          <h2 class="kpi-value">${formatNumber(invitadosCount)}</h2>
          <span class="kpi-subtext">Visitas registradas en el periodo</span>
        </div>
      </div>

      <!-- KPI 2: Inventario -->
      <div class="kpi-card card" data-view="inventario" tabindex="0" role="button" aria-label="Ver detalle de Inventario">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-dark">${getIcon('car')}</div>
          <span class="kpi-badge-live">En tiempo real</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Inventario</span>
          <h2 class="kpi-value">${formatNumber(availableVehicles.length)} <span class="kpi-unit">disponibles</span></h2>
          <span class="kpi-subtext">${reservedVehicles.length} apartados · ${totalVehicles} totales</span>
        </div>
      </div>

      <!-- KPI 3: Pruebas de manejo -->
      <div class="kpi-card card" data-view="guardias" data-tab="actividades" tabindex="0" role="button" aria-label="Ver detalle de Pruebas de manejo">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-blue">${getIcon('testDrive')}</div>
          ${getComparisonBadge(periodTestDrives.length, prevTestDrivesCount)}
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Pruebas de manejo</span>
          <h2 class="kpi-value">${formatNumber(periodTestDrives.length)}</h2>
          <span class="kpi-subtext">${completedTestDrives} realizadas · ${scheduledTestDrives} programadas</span>
        </div>
      </div>

      <!-- KPI 4: Solicitudes -->
      <div class="kpi-card card" data-view="clientes" tabindex="0" role="button" aria-label="Ver detalle de Solicitudes">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-amber">${getIcon('fileText')}</div>
          ${getComparisonBadge(periodRequests.length, prevRequestsCount)}
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Solicitudes</span>
          <h2 class="kpi-value">${formatNumber(periodRequests.length)}</h2>
          <span class="kpi-subtext">${pendingRequests} pendientes de aprobación</span>
        </div>
      </div>

      <!-- KPI 5: Enganche Recibido -->
      <div class="kpi-card card" data-view="inventario" tabindex="0" role="button" aria-label="Ver detalle de Enganches">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-green">${getIcon('dollarSign')}</div>
          ${getComparisonBadge(totalDownPaymentAmount, prevDownPaymentAmount, true)}
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Enganche</span>
          <h2 class="kpi-value">${formatCurrency(totalDownPaymentAmount)}</h2>
          <span class="kpi-subtext">${periodDownPayments.length} enganches recibidos en caja</span>
        </div>
      </div>

      <!-- KPI 6: Ventas -->
      <div class="kpi-card card" data-view="inventario" tabindex="0" role="button" aria-label="Ver detalle de Ventas">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-orange-dark">${getIcon('tag')}</div>
          ${getComparisonBadge(totalSalesAmount, prevSalesAmount, true)}
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Ventas</span>
          <h2 class="kpi-value">${formatCurrency(totalSalesAmount)}</h2>
          <span class="kpi-subtext">${totalSalesCount} vehículos vendidos en el periodo</span>
        </div>
      </div>
    `;

    // Click en tarjetas de KPI para navegar al detalle
    kpiContainer.querySelectorAll('.kpi-card').forEach(card => {
      const handleAction = () => {
        const view = card.getAttribute('data-view');
        const tab = card.getAttribute('data-tab');
        if (view) {
          this.app.navigate(view, tab);
        }
      };

      card.addEventListener('click', handleAction);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAction();
        }
      });
    });

    // Guardar referencia a stats para funnel
    this.currentStats = {
      invitados: invitadosCount,
      pruebasManejo: periodTestDrives.length,
      solicitudes: periodRequests.length,
      ventas: totalSalesCount,
      totalSalesAmount
    };
  }

  renderCharts() {
    const sales = store.getSales();
    const periodSales = sales.filter(s => isDateInPeriod(s.date, this.currentPeriod, this.customStart, this.customEnd));

    const totalBadge = document.getElementById('sales-chart-total-badge');
    if (totalBadge && this.currentStats) {
      totalBadge.textContent = formatCurrency(this.currentStats.totalSalesAmount);
    }

    renderSalesChart('dashboard-sales-chart', periodSales.length > 0 ? periodSales : sales.slice(0, 6));
    if (this.currentStats) {
      renderFunnelChart('dashboard-funnel-chart', this.currentStats);
    }
  }

  renderUpcoming() {
    // 1. Pruebas de manejo próximas
    const tdContainer = document.getElementById('upcoming-testdrives-list');
    if (tdContainer) {
      const testDrives = store.getTestDrives();
      const clients = store.getClients();
      const vehicles = store.getVehicles();

      const upcoming = testDrives
        .filter(td => td.status === 'Programada' || td.status === 'Realizada')
        .slice(0, 4);

      if (upcoming.length === 0) {
        tdContainer.innerHTML = `<div class="empty-list-msg">No hay pruebas de manejo programadas próximamente.</div>`;
      } else {
        tdContainer.innerHTML = upcoming.map(td => {
          const client = clients.find(c => c.id === td.clientId) || { name: 'Cliente registrado' };
          const vehicle = vehicles.find(v => v.id === td.vehicleId) || { brand: 'Auto', model: 'En catálogo', year: '' };
          const isDone = td.status === 'Realizada';

          return `
            <div class="upcoming-item">
              <div class="upcoming-time-col">
                <span class="upcoming-time">${td.time || '12:00'}</span>
                <span class="upcoming-date">${formatDate(td.date, 'short')}</span>
              </div>
              <div class="upcoming-main-col">
                <h4 class="upcoming-title">${vehicle.brand} ${vehicle.model} ${vehicle.year}</h4>
                <p class="upcoming-subtitle">Cliente: <strong>${client.name}</strong> · Asesor: ${td.responsible || 'De guardia'}</p>
              </div>
              <div class="upcoming-status-col">
                <span class="badge ${isDone ? 'badge-success' : 'badge-primary'}">${td.status}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 2. Actividades próximas del día
    const actContainer = document.getElementById('upcoming-activities-list');
    if (actContainer) {
      const activities = store.getActivities().slice(0, 4);
      if (activities.length === 0) {
        actContainer.innerHTML = `<div class="empty-list-msg">No hay actividades registradas para hoy.</div>`;
      } else {
        actContainer.innerHTML = activities.map(act => {
          let badgeClass = 'badge-warning';
          let statusText = 'Pendiente';
          if (act.status === 'en_proceso') {
            badgeClass = 'badge-info';
            statusText = 'En proceso';
          } else if (act.status === 'completada') {
            badgeClass = 'badge-success';
            statusText = 'Completada';
          }

          return `
            <div class="upcoming-item">
              <div class="upcoming-time-col">
                <span class="upcoming-time">${act.time || '09:00'}</span>
                <span class="upcoming-date">${formatDate(act.date, 'short')}</span>
              </div>
              <div class="upcoming-main-col">
                <h4 class="upcoming-title">${act.title}</h4>
                <p class="upcoming-subtitle">Responsable: <strong>${act.responsible}</strong></p>
              </div>
              <div class="upcoming-status-col">
                <span class="badge ${badgeClass}">${statusText}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }
}

// --- File: js\views\guardias.js ---
// Vista Guardias y Actividades

class GuardiasView {
  constructor(app) {
    this.app = app;
    this.activeTab = 'guardias'; // 'guardias' | 'actividades'
    this.calendarView = 'month'; // 'month' | 'week'
    this.currentDate = new Date();
    this.filterResponsible = 'all';
    this.activityFilterStatus = 'all';
  }

  setTab(tab) {
    if (tab === 'actividades' || tab === 'guardias') {
      this.activeTab = tab;
    }
  }

  render(container) {
    container.innerHTML = `
      <div class="guardias-view animate-fade-in">
        <!-- Pestañas principales -->
        <div class="section-tabs-header">
          <div class="section-tabs">
            <button class="section-tab-btn ${this.activeTab === 'guardias' ? 'active' : ''}" id="tab-btn-guardias">
              ${getIcon('calendar')} <span>Calendario de Guardias</span>
            </button>
            <button class="section-tab-btn ${this.activeTab === 'actividades' ? 'active' : ''}" id="tab-btn-actividades">
              ${getIcon('flip')} <span>Tarjetas de Actividades</span>
            </button>
          </div>

          <div class="tab-action-area">
            <button class="btn btn-primary" id="btn-tab-action">
              ${getIcon('plus')} <span id="btn-tab-action-text">${this.activeTab === 'guardias' ? 'Nueva guardia' : 'Agregar actividad'}</span>
            </button>
          </div>
        </div>

        <!-- Contenedor del contenido según pestaña activa -->
        <div id="guardias-tab-content" class="tab-content-wrapper">
          <!-- Renderizado dinámicamente -->
        </div>

        <!-- Popover / Tooltip flotante para hover en guardias -->
        <div id="shift-popover-card" class="shift-popover card" style="display: none;"></div>
      </div>
    `;

    this.bindGlobalEvents(container);
    this.renderCurrentTab();
  }

  bindGlobalEvents(container) {
    const tabGuardias = container.querySelector('#tab-btn-guardias');
    const tabActividades = container.querySelector('#tab-btn-actividades');
    const btnAction = container.querySelector('#btn-tab-action');
    const btnActionText = container.querySelector('#btn-tab-action-text');

    tabGuardias.addEventListener('click', () => {
      this.activeTab = 'guardias';
      tabGuardias.classList.add('active');
      tabActividades.classList.remove('active');
      btnActionText.textContent = 'Nueva guardia';
      this.renderCurrentTab();
    });

    tabActividades.addEventListener('click', () => {
      this.activeTab = 'actividades';
      tabActividades.classList.add('active');
      tabGuardias.classList.remove('active');
      btnActionText.textContent = 'Agregar actividad';
      this.renderCurrentTab();
    });

    btnAction.addEventListener('click', () => {
      if (this.activeTab === 'guardias') {
        this.openShiftModal();
      } else {
        this.openActivityModal();
      }
    });
  }

  renderCurrentTab() {
    const wrapper = document.getElementById('guardias-tab-content');
    if (!wrapper) return;

    if (this.activeTab === 'guardias') {
      this.renderGuardiasSection(wrapper);
    } else {
      this.renderActividadesSection(wrapper);
    }
  }

  // ==========================================
  // SECCIÓN A: CALENDARIO DE GUARDIAS
  // ==========================================
  renderGuardiasSection(container) {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthName = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(this.currentDate);

    // Obtener lista única de responsables para el filtro
    const shifts = store.getShifts();
    const allResponsibles = [...new Set(shifts.map(s => s.responsible))].filter(Boolean);

    container.innerHTML = `
      <div class="calendar-section card">
        <!-- Barra de navegación del calendario -->
        <div class="calendar-toolbar">
          <div class="calendar-nav-left">
            <button class="btn btn-outline btn-sm" id="cal-prev-btn" aria-label="Mes anterior">${getIcon('chevronLeft')}</button>
            <button class="btn btn-outline btn-sm font-bold" id="cal-today-btn">Hoy</button>
            <button class="btn btn-outline btn-sm" id="cal-next-btn" aria-label="Mes siguiente">${getIcon('chevronRight')}</button>
            <h3 class="calendar-month-title">${monthName.toUpperCase()}</h3>
          </div>

          <div class="calendar-controls-right">
            <!-- Selector de vista: Mensual o Semanal -->
            <div class="view-switch-group">
              <button class="btn-switch ${this.calendarView === 'month' ? 'active' : ''}" id="switch-month-view">Mes</button>
              <button class="btn-switch ${this.calendarView === 'week' ? 'active' : ''}" id="switch-week-view">Semana</button>
            </div>

            <!-- Filtro por responsable -->
            <div class="calendar-filter">
              <label for="filter-shift-resp" class="sr-only">Filtrar por responsable</label>
              <select id="filter-shift-resp" class="input-select select-sm">
                <option value="all">Todos los responsables</option>
                ${allResponsibles.map(r => `<option value="${r}" ${this.filterResponsible === r ? 'selected' : ''}>${r}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Rejilla del calendario -->
        <div class="calendar-grid-container" id="calendar-grid-container">
          <!-- Calendario mensual o semanal inyectado -->
        </div>

        <!-- Pie explicativo de uso del calendario -->
        <div class="calendar-footer-hint">
          <span>${getIcon('clock')} Pasa el cursor o toca una guardia para ver detalles completos. Haz clic en un día para programar una nueva guardia.</span>
        </div>
      </div>
    `;

    this.bindCalendarEvents(container);
    this.renderCalendarGrid();
  }

  bindCalendarEvents(container) {
    const prevBtn = container.querySelector('#cal-prev-btn');
    const nextBtn = container.querySelector('#cal-next-btn');
    const todayBtn = container.querySelector('#cal-today-btn');
    const switchMonth = container.querySelector('#switch-month-view');
    const switchWeek = container.querySelector('#switch-week-view');
    const filterResp = container.querySelector('#filter-shift-resp');

    prevBtn.addEventListener('click', () => {
      if (this.calendarView === 'month') {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      } else {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
      }
      this.renderCurrentTab();
    });

    nextBtn.addEventListener('click', () => {
      if (this.calendarView === 'month') {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      } else {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
      }
      this.renderCurrentTab();
    });

    todayBtn.addEventListener('click', () => {
      this.currentDate = new Date();
      this.renderCurrentTab();
    });

    switchMonth.addEventListener('click', () => {
      this.calendarView = 'month';
      this.renderCurrentTab();
    });

    switchWeek.addEventListener('click', () => {
      this.calendarView = 'week';
      this.renderCurrentTab();
    });

    filterResp.addEventListener('change', (e) => {
      this.filterResponsible = e.target.value;
      this.renderCalendarGrid();
    });
  }

  renderCalendarGrid() {
    const gridContainer = document.getElementById('calendar-grid-container');
    if (!gridContainer) return;

    if (this.calendarView === 'month') {
      this.renderMonthCalendar(gridContainer);
    } else {
      this.renderWeekCalendar(gridContainer);
    }
  }

  renderMonthCalendar(container) {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Ajuste de inicio de semana a Lunes (0: Dom -> 6, 1: Lun -> 0)
    let startDayOfWeek = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const todayStr = getTodayISO();
    const shifts = store.getShifts();

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    let html = `
      <div class="calendar-month-table">
        <div class="calendar-header-row">
          ${daysOfWeek.map(d => `<div class="calendar-header-cell">${d}</div>`).join('')}
        </div>
        <div class="calendar-body-grid">
    `;

    // Celdas vacías del mes anterior
    for (let i = 0; i < startDayOfWeek; i++) {
      html += `<div class="calendar-day-cell empty-cell"></div>`;
    }

    // Celdas de los días del mes
    for (let day = 1; day <= totalDays; day++) {
      const monthPadded = String(month + 1).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      const cellDateStr = `${year}-${monthPadded}-${dayPadded}`;
      const isToday = cellDateStr === todayStr;

      // Filtrar guardias correspondientes a este día
      let dayShifts = shifts.filter(s => s.date === cellDateStr);
      if (this.filterResponsible !== 'all') {
        dayShifts = dayShifts.filter(s => s.responsible === this.filterResponsible);
      }

      html += `
        <div class="calendar-day-cell ${isToday ? 'is-today' : ''}" data-date="${cellDateStr}" tabindex="0" role="button" aria-label="Día ${day}">
          <div class="day-number-row">
            <span class="day-number ${isToday ? 'today-pill' : ''}">${day}</span>
            ${isToday ? '<span class="today-tag">Hoy</span>' : ''}
          </div>
          <div class="day-shifts-list">
            ${dayShifts.map(s => {
              const initials = s.responsible.split(' ').map(n => n[0]).slice(0, 2).join('');
              return `
                <div class="shift-pill" data-shift-id="${s.id}" tabindex="0" role="button" style="border-left-color: ${s.color || '#ff8901'};">
                  <span class="shift-avatar" style="background-color: ${s.color || '#ff8901'}">${initials}</span>
                  <div class="shift-info">
                    <span class="shift-time">${s.startTime} - ${s.endTime}</span>
                    <span class="shift-name">${s.responsible}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.bindDayAndShiftInteractions(container);
  }

  renderWeekCalendar(container) {
    const today = new Date(this.currentDate);
    const dayOfWeek = (today.getDay() + 6) % 7; // Lunes = 0
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);

    const shifts = store.getShifts();
    const todayStr = getTodayISO();
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let dayShifts = shifts.filter(s => s.date === dateStr);
      if (this.filterResponsible !== 'all') {
        dayShifts = dayShifts.filter(s => s.responsible === this.filterResponsible);
      }

      days.push({
        name: new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(d),
        dateStr,
        dayNum: d.getDate(),
        isToday: dateStr === todayStr,
        shifts: dayShifts
      });
    }

    let html = `
      <div class="calendar-week-container">
    `;

    days.forEach(d => {
      html += `
        <div class="calendar-week-col ${d.isToday ? 'is-today' : ''}" data-date="${d.dateStr}" tabindex="0">
          <div class="week-col-header">
            <span class="week-day-name">${d.name}</span>
            <span class="week-day-number ${d.isToday ? 'today-pill' : ''}">${d.dayNum}</span>
          </div>
          <div class="week-col-body day-shifts-list">
            ${d.shifts.map(s => {
              const initials = s.responsible.split(' ').map(n => n[0]).slice(0, 2).join('');
              return `
                <div class="shift-pill shift-pill-week" data-shift-id="${s.id}" tabindex="0" role="button" style="border-left-color: ${s.color || '#ff8901'};">
                  <div class="shift-pill-header">
                    <span class="shift-avatar" style="background-color: ${s.color || '#ff8901'}">${initials}</span>
                    <span class="shift-time">${s.startTime} - ${s.endTime}</span>
                  </div>
                  <strong class="shift-name">${s.responsible}</strong>
                  <span class="shift-area-text">${s.area || 'Piso de venta'}</span>
                </div>
              `;
            }).join('')}
            ${d.shifts.length === 0 ? '<div class="no-shifts-hint">Sin guardias</div>' : ''}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
    this.bindDayAndShiftInteractions(container);
  }

  // Interacción con las guardias (hover, click, teclado)
  bindDayAndShiftInteractions(container) {
    const popover = document.getElementById('shift-popover-card');

    // Click en celda de día para crear guardia
    const dayCells = container.querySelectorAll('.calendar-day-cell, .calendar-week-col');
    dayCells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        // Si se hizo click directamente en una guardia, no abrir crear guardia
        if (e.target.closest('.shift-pill')) return;
        const date = cell.getAttribute('data-date');
        if (date) {
          this.openShiftModal(null, date);
        }
      });
    });

    // Interacciones con cada píldora de guardia
    const shiftPills = container.querySelectorAll('.shift-pill');
    shiftPills.forEach(pill => {
      const shiftId = pill.getAttribute('data-shift-id');
      const shift = store.getShifts().find(s => s.id === shiftId);
      if (!shift) return;

      // Hover para mostrar popover con datos completos
      pill.addEventListener('mouseenter', (e) => {
        this.showShiftPopover(e, shift, popover);
      });

      pill.addEventListener('mouseleave', () => {
        popover.style.display = 'none';
      });

      // Click para consultar / editar
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        popover.style.display = 'none';
        this.openShiftModal(shift);
      });

      // Accesibilidad teclado
      pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          this.openShiftModal(shift);
        }
      });
    });
  }

  showShiftPopover(e, shift, popover) {
    popover.innerHTML = `
      <div class="popover-header" style="border-top: 3px solid ${shift.color || '#ff8901'}">
        <h4 class="popover-title">${shift.responsible}</h4>
        <span class="badge badge-primary">${shift.area || 'Guardia'}</span>
      </div>
      <div class="popover-body">
        <div class="popover-detail">
          <span class="popover-icon">${getIcon('calendar')}</span>
          <span>${formatDate(shift.date, 'long')}</span>
        </div>
        <div class="popover-detail">
          <span class="popover-icon">${getIcon('clock')}</span>
          <span><strong>${shift.startTime} - ${shift.endTime}</strong></span>
        </div>
        <div class="popover-detail">
          <span class="popover-icon">${getIcon('phone')}</span>
          <span>${shift.phone || 'No registrado'}</span>
        </div>
        <div class="popover-detail">
          <span class="popover-icon">${getIcon('mail')}</span>
          <span>${shift.email || 'No registrado'}</span>
        </div>
        ${shift.observations ? `
          <div class="popover-obs">
            <em>"${shift.observations}"</em>
          </div>
        ` : ''}
      </div>
      <div class="popover-footer">
        <small>Haz clic para editar guardia</small>
      </div>
    `;

    popover.style.display = 'block';
    const rect = e.target.getBoundingClientRect();
    const popoverWidth = 280;

    let left = rect.right + 10;
    if (left + popoverWidth > window.innerWidth) {
      left = rect.left - popoverWidth - 10;
    }
    let top = rect.top - 20;
    if (top + 250 > window.innerHeight) {
      top = window.innerHeight - 260;
    }

    popover.style.left = `${Math.max(left, 10)}px`;
    popover.style.top = `${Math.max(top, 10)}px`;
  }

  // Modal para crear o editar guardia
  openShiftModal(shift = null, defaultDate = null) {
    const isEdit = !!shift;
    const dateVal = shift ? shift.date : (defaultDate || getTodayISO());

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Editar Guardia' : 'Programar Nueva Guardia'}</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="shift-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label for="shift-date" class="form-label required">Fecha de guardia</label>
              <input type="date" id="shift-date" class="input-text" value="${dateVal}" required />
            </div>

            <div class="form-group full-width">
              <label for="shift-responsible" class="form-label required">Responsable</label>
              <input type="text" id="shift-responsible" class="input-text" value="${shift ? shift.responsible : ''}" placeholder="Ej. Carlos Morales" required />
            </div>

            <div class="form-group half-width">
              <label for="shift-start" class="form-label required">Horario de inicio</label>
              <input type="time" id="shift-start" class="input-text" value="${shift ? shift.startTime : '09:00'}" required />
            </div>

            <div class="form-group half-width">
              <label for="shift-end" class="form-label required">Horario de fin</label>
              <input type="time" id="shift-end" class="input-text" value="${shift ? shift.endTime : '15:00'}" required />
            </div>

            <div class="form-group half-width">
              <label for="shift-phone" class="form-label">Celular de contacto</label>
              <input type="tel" id="shift-phone" class="input-text" value="${shift ? (shift.phone || '') : ''}" placeholder="10 dígitos" />
            </div>

            <div class="form-group half-width">
              <label for="shift-email" class="form-label">Correo electrónico</label>
              <input type="email" id="shift-email" class="input-text" value="${shift ? (shift.email || '') : ''}" placeholder="correo@autocorp.mx" />
            </div>

            <div class="form-group full-width">
              <label for="shift-area" class="form-label">Área o función asignada</label>
              <select id="shift-area" class="input-select">
                <option value="Recepción y Piso de Ventas" ${shift && shift.area === 'Recepción y Piso de Ventas' ? 'selected' : ''}>Recepción y Piso de Ventas</option>
                <option value="Cierre y Supervisión de Patio" ${shift && shift.area === 'Cierre y Supervisión de Patio' ? 'selected' : ''}>Cierre y Supervisión de Patio</option>
                <option value="Valuación y Entregas VIP" ${shift && shift.area === 'Valuación y Entregas VIP' ? 'selected' : ''}>Valuación y Entregas VIP</option>
                <option value="Mesa de Control y Crédito" ${shift && shift.area === 'Mesa de Control y Crédito' ? 'selected' : ''}>Mesa de Control y Crédito</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="shift-obs" class="form-label">Observaciones</label>
              <textarea id="shift-obs" class="input-textarea input-italic" rows="3" placeholder="Instrucciones especiales o notas de la guardia">${shift ? (shift.observations || '') : ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            ${isEdit ? `<button type="button" class="btn btn-danger btn-sm" id="btn-delete-shift">${getIcon('trash')} Eliminar</button>` : '<div></div>'}
            <div class="footer-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Crear Guardia'}</button>
            </div>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;

    if (isEdit) {
      backdrop.querySelector('#btn-delete-shift').onclick = async () => {
        const confirmed = await confirmDialog({
          title: '¿Eliminar guardia?',
          message: `¿Estás seguro de que deseas eliminar la guardia de ${shift.responsible} del día ${formatDate(shift.date)}?`,
          confirmText: 'Sí, eliminar',
          isDestructive: true
        });

        if (confirmed) {
          store.deleteShift(shift.id);
          toast.success('Guardia eliminada correctamente');
          close();
          this.renderCalendarGrid();
        }
      };
    }

    const form = backdrop.querySelector('#shift-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const payload = {
        date: form.querySelector('#shift-date').value,
        responsible: form.querySelector('#shift-responsible').value.trim(),
        startTime: form.querySelector('#shift-start').value,
        endTime: form.querySelector('#shift-end').value,
        phone: form.querySelector('#shift-phone').value.trim(),
        email: form.querySelector('#shift-email').value.trim(),
        area: form.querySelector('#shift-area').value,
        observations: form.querySelector('#shift-obs').value.trim()
      };

      if (!payload.date || !payload.responsible) {
        toast.error('Por favor completa la fecha y el responsable.');
        return;
      }

      if (isEdit) {
        store.updateShift(shift.id, payload);
        toast.success('Guardia actualizada exitosamente');
      } else {
        store.addShift(payload);
        toast.success('Guardia programada exitosamente');
      }

      close();
      this.renderCalendarGrid();
    };
  }

  // ==========================================
  // SECCIÓN B: TARJETAS DE ACTIVIDADES (3D FLIP)
  // ==========================================
  renderActividadesSection(container) {
    const activities = store.getActivities();

    let filteredActivities = activities;
    if (this.activityFilterStatus !== 'all') {
      filteredActivities = activities.filter(a => a.status === this.activityFilterStatus);
    }

    container.innerHTML = `
      <div class="activities-section card">
        <div class="activities-toolbar">
          <div class="toolbar-info">
            <h3 class="activities-heading">Actividades Operativas de la Sucursal</h3>
            <p class="activities-sub">Acerca el puntero o toca una tarjeta para girarla y consultar su reverso con detalles y acciones.</p>
          </div>

          <div class="activities-filter-group">
            <label for="filter-act-status" class="sr-only">Filtrar por estado</label>
            <select id="filter-act-status" class="input-select select-sm">
              <option value="all" ${this.activityFilterStatus === 'all' ? 'selected' : ''}>Todos los estados</option>
              <option value="pendiente" ${this.activityFilterStatus === 'pendiente' ? 'selected' : ''}>Pendientes</option>
              <option value="en_proceso" ${this.activityFilterStatus === 'en_proceso' ? 'selected' : ''}>En proceso</option>
              <option value="completada" ${this.activityFilterStatus === 'completada' ? 'selected' : ''}>Completadas</option>
            </select>
          </div>
        </div>

        <!-- Cuadrícula de tarjetas con efecto de giro 3D -->
        <div class="activities-grid" id="activities-cards-grid">
          ${filteredActivities.map(act => this.renderFlipCard(act)).join('')}
        </div>

        ${filteredActivities.length === 0 ? `
          <div class="empty-state-box">
            <p>No se encontraron actividades con el estado seleccionado.</p>
            <button class="btn btn-outline btn-sm" id="btn-reset-act-filter">Ver todas las actividades</button>
          </div>
        ` : ''}
      </div>
    `;

    this.bindActivityCardsEvents(container);
  }

  renderFlipCard(act) {
    let statusClass = 'badge-warning';
    let statusLabel = 'Pendiente';
    let statusIcon = getIcon('clock');

    if (act.status === 'en_proceso') {
      statusClass = 'badge-info';
      statusLabel = 'En proceso';
      statusIcon = getIcon('refresh');
    } else if (act.status === 'completada') {
      statusClass = 'badge-success';
      statusLabel = 'Completada';
      statusIcon = getIcon('checkCircle');
    }

    const iconSvg = getIcon(act.iconType || 'gestion');

    return `
      <div class="flip-card-wrapper" data-act-id="${act.id}" tabindex="0" role="region" aria-label="Actividad: ${act.title}">
        <div class="flip-card-inner">
          <!-- FRENTE DE LA TARJETA -->
          <div class="flip-card-face flip-card-front">
            <div class="front-header">
              <div class="activity-icon-container">
                ${iconSvg}
              </div>
              <span class="badge ${statusClass}">
                ${statusIcon} <span>${statusLabel}</span>
              </span>
            </div>

            <div class="front-body">
              <h4 class="activity-title">${act.title}</h4>
            </div>

            <div class="front-footer">
              <div class="activity-schedule">
                <span class="icon-sm">${getIcon('clock')}</span>
                <span>${act.time || '09:00'} · ${formatDate(act.date, 'short')}</span>
              </div>
              <button class="btn-flip-hint" aria-label="Girar tarjeta">
                ${getIcon('flip')}
              </button>
            </div>
          </div>

          <!-- REVERSO DE LA TARJETA -->
          <div class="flip-card-face flip-card-back">
            <div class="back-header">
              <span class="back-responsable-label">Responsable</span>
              <h4 class="back-responsable-name">${act.responsible}</h4>
            </div>

            <div class="back-body">
              <p class="back-description">${act.description || 'Sin descripción detallada.'}</p>
              
              <div class="back-meta-item">
                <span class="meta-label">Fecha y horario:</span>
                <span class="meta-val">${formatDate(act.date, 'short')} a las ${act.time || '09:00'}</span>
              </div>

              ${act.observations ? `
                <div class="back-obs-box">
                  <span class="meta-label">Observaciones:</span>
                  <p class="back-obs-text input-italic">${act.observations}</p>
                </div>
              ` : ''}
            </div>

            <div class="back-footer">
              <!-- Selector rápido de estado -->
              <div class="status-quick-switch">
                <select class="select-act-status input-select select-xs" data-act-id="${act.id}">
                  <option value="pendiente" ${act.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                  <option value="en_proceso" ${act.status === 'en_proceso' ? 'selected' : ''}>En proceso</option>
                  <option value="completada" ${act.status === 'completada' ? 'selected' : ''}>Completada</option>
                </select>
              </div>

              <div class="back-actions">
                <button class="btn-icon-xs btn-edit-activity" data-act-id="${act.id}" title="Editar actividad">${getIcon('edit')}</button>
                <button class="btn-icon-xs btn-return-front" title="Volver al frente">${getIcon('arrowRight')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindActivityCardsEvents(container) {
    const filterSelect = container.querySelector('#filter-act-status');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.activityFilterStatus = e.target.value;
        this.renderActividadesSection(container);
      });
    }

    const resetFilterBtn = container.querySelector('#btn-reset-act-filter');
    if (resetFilterBtn) {
      resetFilterBtn.addEventListener('click', () => {
        this.activityFilterStatus = 'all';
        this.renderActividadesSection(container);
      });
    }

    const cards = container.querySelectorAll('.flip-card-wrapper');
    cards.forEach(card => {
      const actId = card.getAttribute('data-act-id');
      const inner = card.querySelector('.flip-card-inner');
      const flipBtn = card.querySelector('.btn-flip-hint');
      const returnBtn = card.querySelector('.btn-return-front');
      const statusSelect = card.querySelector('.select-act-status');
      const editBtn = card.querySelector('.btn-edit-activity');

      // Giro en mobile o clic en botón
      const toggleFlip = (force) => {
        if (typeof force === 'boolean') {
          inner.classList.toggle('is-flipped', force);
        } else {
          inner.classList.toggle('is-flipped');
        }
      };

      if (flipBtn) {
        flipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFlip(true);
        });
      }

      if (returnBtn) {
        returnBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFlip(false);
        });
      }

      // En dispositivos táctiles, tocar la tarjeta hace flip
      card.addEventListener('click', (e) => {
        if (e.target.closest('select') || e.target.closest('button')) return;
        toggleFlip();
      });

      // Accesibilidad con teclado (Enter o Espacio)
      card.addEventListener('keydown', (e) => {
        if (e.target.closest('select') || e.target.closest('button')) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFlip();
        }
      });

      // Cambio rápido de estado desde el reverso
      if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
          e.stopPropagation();
          const newStatus = e.target.value;
          store.updateActivity(actId, { status: newStatus });
          toast.success(`Estado actualizado a: ${newStatus}`);
          this.renderActividadesSection(container);
        });
      }

      // Botón editar
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const act = store.getActivities().find(a => a.id === actId);
          if (act) {
            this.openActivityModal(act);
          }
        });
      }
    });
  }

  // Modal para agregar o editar actividad
  openActivityModal(act = null) {
    const isEdit = !!act;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Editar Actividad' : 'Nueva Actividad Operativa'}</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="activity-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label for="act-title" class="form-label required">Nombre de la actividad</label>
              <input type="text" id="act-title" class="input-text" value="${act ? act.title : ''}" placeholder="Ej. Revisión técnica de autos en patio" required />
            </div>

            <div class="form-group half-width">
              <label for="act-icon" class="form-label required">Icono representativo</label>
              <select id="act-icon" class="input-select" required>
                <option value="apertura" ${act && act.iconType === 'apertura' ? 'selected' : ''}>Apertura (Llave)</option>
                <option value="seguridad" ${act && act.iconType === 'seguridad' ? 'selected' : ''}>Seguridad (Escudo)</option>
                <option value="limpieza" ${act && act.iconType === 'limpieza' ? 'selected' : ''}>Limpieza (Escoba)</option>
                <option value="cierre" ${act && act.iconType === 'cierre' ? 'selected' : ''}>Cierre (Candado)</option>
                <option value="revision" ${act && act.iconType === 'revision' ? 'selected' : ''}>Revisión de autos (Herramienta)</option>
                <option value="recepcion" ${act && act.iconType === 'recepcion' ? 'selected' : ''}>Recepción (Saludo / Clientes)</option>
                <option value="gestion" ${act && act.iconType === 'gestion' ? 'selected' : ''}>Gestión y Auditoría</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="act-status" class="form-label required">Estado actual</label>
              <select id="act-status" class="input-select" required>
                <option value="pendiente" ${act && act.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="en_proceso" ${act && act.status === 'en_proceso' ? 'selected' : ''}>En proceso</option>
                <option value="completada" ${act && act.status === 'completada' ? 'selected' : ''}>Completada</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="act-responsible" class="form-label required">Responsable</label>
              <input type="text" id="act-responsible" class="input-text" value="${act ? act.responsible : ''}" placeholder="Ej. Carlos Morales" required />
            </div>

            <div class="form-group half-width">
              <label for="act-date" class="form-label required">Fecha asignada</label>
              <input type="date" id="act-date" class="input-text" value="${act ? act.date : getTodayISO()}" required />
            </div>

            <div class="form-group half-width">
              <label for="act-time" class="form-label required">Horario</label>
              <input type="time" id="act-time" class="input-text" value="${act ? act.time : '10:00'}" required />
            </div>

            <div class="form-group full-width">
              <label for="act-desc" class="form-label">Descripción</label>
              <textarea id="act-desc" class="input-textarea" rows="2" placeholder="Detalle de lo que involucra la actividad">${act ? (act.description || '') : ''}</textarea>
            </div>

            <div class="form-group full-width">
              <label for="act-obs" class="form-label">Observaciones</label>
              <textarea id="act-obs" class="input-textarea input-italic" rows="2" placeholder="Notas adicionales o seguimiento">${act ? (act.observations || '') : ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            ${isEdit ? `<button type="button" class="btn btn-danger btn-sm" id="btn-delete-act">${getIcon('trash')} Eliminar</button>` : '<div></div>'}
            <div class="footer-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Agregar Actividad'}</button>
            </div>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;

    if (isEdit) {
      backdrop.querySelector('#btn-delete-act').onclick = async () => {
        const confirmed = await confirmDialog({
          title: '¿Eliminar actividad?',
          message: `¿Estás seguro de que deseas eliminar la actividad "${act.title}"?`,
          confirmText: 'Sí, eliminar',
          isDestructive: true
        });

        if (confirmed) {
          store.deleteActivity(act.id);
          toast.success('Actividad eliminada correctamente');
          close();
          const wrapper = document.getElementById('guardias-tab-content');
          if (wrapper) this.renderActividadesSection(wrapper);
        }
      };
    }

    const form = backdrop.querySelector('#activity-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const payload = {
        title: form.querySelector('#act-title').value.trim(),
        iconType: form.querySelector('#act-icon').value,
        status: form.querySelector('#act-status').value,
        responsible: form.querySelector('#act-responsible').value.trim(),
        date: form.querySelector('#act-date').value,
        time: form.querySelector('#act-time').value,
        description: form.querySelector('#act-desc').value.trim(),
        observations: form.querySelector('#act-obs').value.trim()
      };

      if (!payload.title || !payload.responsible) {
        toast.error('Por favor completa el nombre de la actividad y el responsable.');
        return;
      }

      if (isEdit) {
        store.updateActivity(act.id, payload);
        toast.success('Actividad actualizada exitosamente');
      } else {
        store.addActivity(payload);
        toast.success('Actividad agregada exitosamente');
      }

      close();
      const wrapper = document.getElementById('guardias-tab-content');
      if (wrapper) this.renderActividadesSection(wrapper);
    };
  }
}

// --- File: js\views\clientes.js ---
// Vista Clientes — Directorio, Búsqueda, Duplicados y Ficha 360

class ClientesView {
  constructor(app) {
    this.app = app;
    this.searchQuery = '';
    this.brandFilter = 'all';
    this.sortBy = 'date_desc'; // 'name_asc', 'name_desc', 'date_desc', 'date_asc'
    this.currentPage = 1;
    this.pageSize = 8;
  }

  render(container) {
    container.innerHTML = `
      <div class="clientes-view animate-fade-in">
        <!-- Barra de herramientas: Búsqueda, Filtros y Botón de Alta -->
        <div class="table-toolbar card">
          <div class="toolbar-search-box">
            <span class="search-icon">${getIcon('search')}</span>
            <input 
              type="text" 
              id="client-search-input" 
              class="input-search" 
              placeholder="Buscar por nombre, celular o correo..." 
              value="${this.searchQuery}"
            />
            ${this.searchQuery ? `<button class="btn-clear-search" id="btn-clear-client-search">${getIcon('close')}</button>` : ''}
          </div>

          <div class="toolbar-filters">
            <!-- Filtro por marca de interés -->
            <div class="filter-item">
              <label for="client-filter-brand" class="sr-only">Marca de interés</label>
              <select id="client-filter-brand" class="input-select select-sm">
                <option value="all" ${this.brandFilter === 'all' ? 'selected' : ''}>Todas las marcas</option>
                <option value="no_pref" ${this.brandFilter === 'no_pref' ? 'selected' : ''}>Sin preferencia</option>
                <option value="Nissan" ${this.brandFilter === 'Nissan' ? 'selected' : ''}>Nissan</option>
                <option value="Mazda" ${this.brandFilter === 'Mazda' ? 'selected' : ''}>Mazda</option>
                <option value="Volkswagen" ${this.brandFilter === 'Volkswagen' ? 'selected' : ''}>Volkswagen</option>
                <option value="Toyota" ${this.brandFilter === 'Toyota' ? 'selected' : ''}>Toyota</option>
                <option value="Ford" ${this.brandFilter === 'Ford' ? 'selected' : ''}>Ford</option>
                <option value="Chevrolet" ${this.brandFilter === 'Chevrolet' ? 'selected' : ''}>Chevrolet</option>
                <option value="KIA" ${this.brandFilter === 'KIA' ? 'selected' : ''}>KIA</option>
                <option value="Hyundai" ${this.brandFilter === 'Hyundai' ? 'selected' : ''}>Hyundai</option>
                <option value="BMW" ${this.brandFilter === 'BMW' ? 'selected' : ''}>BMW</option>
              </select>
            </div>

            <!-- Ordenamiento -->
            <div class="filter-item">
              <label for="client-sort-by" class="sr-only">Ordenar</label>
              <select id="client-sort-by" class="input-select select-sm">
                <option value="date_desc" ${this.sortBy === 'date_desc' ? 'selected' : ''}>Más recientes primero</option>
                <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>Nombre (A - Z)</option>
                <option value="name_desc" ${this.sortBy === 'name_desc' ? 'selected' : ''}>Nombre (Z - A)</option>
              </select>
            </div>

            <!-- Botón principal de agregar cliente -->
            <button class="btn btn-primary" id="btn-add-client">
              ${getIcon('plus')} <span>Agregar cliente</span>
            </button>
          </div>
        </div>

        <!-- Tabla principal de clientes -->
        <div class="table-container card">
          <div class="table-responsive">
            <table class="data-table" id="clients-table">
              <thead>
                <tr>
                  <th>NOMBRE DE CLIENTE</th>
                  <th>CELULAR</th>
                  <th>CORREO</th>
                  <th>¿VISITA UNA MARCA EN ESPECÍFICO?</th>
                  <th>COMENTARIOS</th>
                  <th class="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody id="clients-tbody">
                <!-- Inyectado dinámicamente -->
              </tbody>
            </table>
          </div>

          <!-- Paginación y contador -->
          <div class="table-pagination-footer" id="clients-pagination">
            <!-- Inyectado -->
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.renderClientsTable();
  }

  bindEvents(container) {
    const searchInput = container.querySelector('#client-search-input');
    const brandFilter = container.querySelector('#client-filter-brand');
    const sortBy = container.querySelector('#client-sort-by');
    const addBtn = container.querySelector('#btn-add-client');
    const clearSearch = container.querySelector('#btn-clear-client-search');

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.currentPage = 1;
      this.renderClientsTable();
    });

    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        this.searchQuery = '';
        searchInput.value = '';
        this.currentPage = 1;
        this.renderClientsTable();
      });
    }

    brandFilter.addEventListener('change', (e) => {
      this.brandFilter = e.target.value;
      this.currentPage = 1;
      this.renderClientsTable();
    });

    sortBy.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.renderClientsTable();
    });

    addBtn.addEventListener('click', () => {
      this.openClientModal();
    });
  }

  getFilteredClients() {
    let clients = store.getClients();

    // Filtro por búsqueda
    if (this.searchQuery) {
      clients = clients.filter(c => {
        const name = (c.name || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        return name.includes(this.searchQuery) || phone.includes(this.searchQuery) || email.includes(this.searchQuery);
      });
    }

    // Filtro por marca
    if (this.brandFilter !== 'all') {
      if (this.brandFilter === 'no_pref') {
        clients = clients.filter(c => c.hasBrandPreference === 'no' || !c.preferredBrand);
      } else {
        clients = clients.filter(c => c.hasBrandPreference === 'si' && c.preferredBrand === this.brandFilter);
      }
    }

    // Ordenamiento
    clients.sort((a, b) => {
      if (this.sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (this.sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (this.sortBy === 'date_asc') return new Date(a.dateRegistered || 0) - new Date(b.dateRegistered || 0);
      return new Date(b.dateRegistered || 0) - new Date(a.dateRegistered || 0);
    });

    return clients;
  }

  renderClientsTable() {
    const tbody = document.getElementById('clients-tbody');
    const paginationContainer = document.getElementById('clients-pagination');
    if (!tbody) return;

    const allFiltered = this.getFilteredClients();
    const totalItems = allFiltered.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;

    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginated = allFiltered.slice(startIndex, startIndex + this.pageSize);

    if (paginated.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="table-empty-td">
            <div class="empty-state-box">
              <p>No se encontraron clientes que coincidan con la búsqueda o filtros aplicados.</p>
              <button class="btn btn-outline btn-sm" id="btn-reset-client-search">Restablecer filtros</button>
            </div>
          </td>
        </tr>
      `;

      const resetBtn = tbody.querySelector('#btn-reset-client-search');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.brandFilter = 'all';
          this.render(document.getElementById('view-container'));
        });
      }

      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    tbody.innerHTML = paginated.map(c => {
      const brandBadge = c.hasBrandPreference === 'si' && c.preferredBrand
        ? `<span class="badge badge-primary font-bold">Sí — ${c.preferredBrand}</span>`
        : `<span class="badge badge-neutral">No — Sin preferencia</span>`;

      return `
        <tr class="table-client-row" data-client-id="${c.id}">
          <td class="font-bold">
            <div class="client-cell-name">
              <span class="client-avatar-circle">${c.name.charAt(0)}</span>
              <div>
                <a href="javascript:void(0)" class="client-name-link" data-client-id="${c.id}">${c.name}</a>
                <div class="client-meta-sub">Alta: ${formatDate(c.dateRegistered, 'short')} · ${(c.visits || []).length} visitas</div>
              </div>
            </div>
          </td>
          <td>
            <a href="tel:${c.phone}" class="link-neutral">${formatPhone(c.phone)}</a>
          </td>
          <td>
            <a href="mailto:${c.email}" class="link-neutral">${c.email || '—'}</a>
          </td>
          <td>
            ${brandBadge}
          </td>
          <td class="comments-cell">
            <span class="text-italic text-muted">${c.comments || 'Sin comentarios adicionales.'}</span>
          </td>
          <td class="text-right">
            <div class="table-actions-group">
              <button class="btn-action-icon btn-view-profile" data-client-id="${c.id}" title="Consultar ficha completa">
                ${getIcon('eye')}
              </button>
              <button class="btn-action-icon btn-edit-client" data-client-id="${c.id}" title="Editar cliente">
                ${getIcon('edit')}
              </button>
              <button class="btn-action-icon btn-delete-client text-danger" data-client-id="${c.id}" title="Eliminar cliente">
                ${getIcon('trash')}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Paginación
    if (paginationContainer) {
      paginationContainer.innerHTML = `
        <div class="pagination-info">
          Mostrando <strong>${startIndex + 1}</strong> - <strong>${Math.min(startIndex + this.pageSize, totalItems)}</strong> de <strong>${totalItems}</strong> clientes
        </div>
        <div class="pagination-controls">
          <button class="btn btn-outline btn-sm" id="btn-page-prev" ${this.currentPage === 1 ? 'disabled' : ''}>
            ${getIcon('chevronLeft')} Anterior
          </button>
          <span class="page-indicator">Página ${this.currentPage} de ${totalPages}</span>
          <button class="btn btn-outline btn-sm" id="btn-page-next" ${this.currentPage >= totalPages ? 'disabled' : ''}>
            Siguiente ${getIcon('chevronRight')}
          </button>
        </div>
      `;

      const prevBtn = paginationContainer.querySelector('#btn-page-prev');
      const nextBtn = paginationContainer.querySelector('#btn-page-next');
      if (prevBtn) prevBtn.onclick = () => { this.currentPage--; this.renderClientsTable(); };
      if (nextBtn) nextBtn.onclick = () => { this.currentPage++; this.renderClientsTable(); };
    }

    this.bindTableActions(tbody);
  }

  bindTableActions(tbody) {
    // Ficha del cliente
    tbody.querySelectorAll('.client-name-link, .btn-view-profile').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const clientId = el.getAttribute('data-client-id');
        this.openClientProfileModal(clientId);
      });
    });

    // Editar cliente
    tbody.querySelectorAll('.btn-edit-client').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const clientId = el.getAttribute('data-client-id');
        const client = store.getClientById(clientId);
        if (client) this.openClientModal(client);
      });
    });

    // Eliminar cliente
    tbody.querySelectorAll('.btn-delete-client').forEach(el => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        const clientId = el.getAttribute('data-client-id');
        const client = store.getClientById(clientId);
        if (!client) return;

        const confirmed = await confirmDialog({
          title: '¿Eliminar cliente?',
          message: `¿Estás seguro de que deseas eliminar a "${client.name}"? Se perderá su historial de visitas y solicitudes.`,
          confirmText: 'Sí, eliminar',
          isDestructive: true
        });

        if (confirmed) {
          store.deleteClient(clientId);
          toast.success('Cliente eliminado con éxito');
          this.renderClientsTable();
        }
      });
    });
  }

  // ==========================================
  // MODAL: ALTA Y EDICIÓN DE CLIENTE (CON AVISO DE DUPLICADOS)
  // ==========================================
  openClientModal(client = null) {
    const isEdit = !!client;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="client-form">
          <div class="modal-body form-grid">
            <!-- Alerta de duplicado en vivo -->
            <div id="duplicate-warning" class="alert-box alert-warning full-width" style="display: none;">
              <div class="alert-icon">${getIcon('alertCircle')}</div>
              <div class="alert-content">
                <strong>Atención: Posible registro duplicado</strong>
                <p id="duplicate-warning-text" class="text-sm">Ya existe un cliente con este celular o correo.</p>
              </div>
            </div>

            <div class="form-group full-width">
              <label for="client-name" class="form-label required">Nombre completo</label>
              <input type="text" id="client-name" class="input-text" value="${client ? client.name : ''}" placeholder="Ej. Rodrigo Morales Valenzuela" required />
            </div>

            <div class="form-group half-width">
              <label for="client-phone" class="form-label required">Celular (10 dígitos)</label>
              <input type="tel" id="client-phone" class="input-text" value="${client ? client.phone : ''}" placeholder="Ej. 5541928374" required />
              <span class="form-hint">Teléfono móvil a 10 dígitos sin espacios</span>
            </div>

            <div class="form-group half-width">
              <label for="client-email" class="form-label">Correo electrónico</label>
              <input type="email" id="client-email" class="input-text" value="${client ? (client.email || '') : ''}" placeholder="cliente@correo.com" />
              <span class="form-hint">Opcional para cotizaciones y solicitudes</span>
            </div>

            <div class="form-group half-width">
              <label for="client-has-brand" class="form-label required">¿Visita una marca en específico?</label>
              <select id="client-has-brand" class="input-select" required>
                <option value="no" ${client && client.hasBrandPreference === 'no' ? 'selected' : ''}>No — Sin preferencia</option>
                <option value="si" ${!client || client.hasBrandPreference === 'si' ? 'selected' : ''}>Sí — Marca específica</option>
              </select>
            </div>

            <div class="form-group half-width" id="preferred-brand-group">
              <label for="client-pref-brand" class="form-label">Marca de interés</label>
              <select id="client-pref-brand" class="input-select">
                <option value="Nissan" ${client && client.preferredBrand === 'Nissan' ? 'selected' : ''}>Nissan</option>
                <option value="Mazda" ${client && client.preferredBrand === 'Mazda' ? 'selected' : ''}>Mazda</option>
                <option value="Volkswagen" ${client && client.preferredBrand === 'Volkswagen' ? 'selected' : ''}>Volkswagen</option>
                <option value="Toyota" ${client && client.preferredBrand === 'Toyota' ? 'selected' : ''}>Toyota</option>
                <option value="Ford" ${client && client.preferredBrand === 'Ford' ? 'selected' : ''}>Ford</option>
                <option value="Chevrolet" ${client && client.preferredBrand === 'Chevrolet' ? 'selected' : ''}>Chevrolet</option>
                <option value="KIA" ${client && client.preferredBrand === 'KIA' ? 'selected' : ''}>KIA</option>
                <option value="Hyundai" ${client && client.preferredBrand === 'Hyundai' ? 'selected' : ''}>Hyundai</option>
                <option value="BMW" ${client && client.preferredBrand === 'BMW' ? 'selected' : ''}>BMW</option>
                <option value="Honda" ${client && client.preferredBrand === 'Honda' ? 'selected' : ''}>Honda</option>
                <option value="Seat" ${client && client.preferredBrand === 'Seat' ? 'selected' : ''}>Seat</option>
                <option value="Jeep" ${client && client.preferredBrand === 'Jeep' ? 'selected' : ''}>Jeep</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="client-comments" class="form-label">Comentarios u observaciones</label>
              <textarea id="client-comments" class="input-textarea input-italic" rows="3" placeholder="Presupuesto aproximado, necesidades familiares, enganche disponible...">${client ? (client.comments || '') : ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Registrar Cliente'}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;

    const hasBrandSelect = backdrop.querySelector('#client-has-brand');
    const brandGroup = backdrop.querySelector('#preferred-brand-group');
    const phoneInput = backdrop.querySelector('#client-phone');
    const emailInput = backdrop.querySelector('#client-email');
    const dupWarning = backdrop.querySelector('#duplicate-warning');
    const dupWarningText = backdrop.querySelector('#duplicate-warning-text');

    const updateBrandVisibility = () => {
      brandGroup.style.display = hasBrandSelect.value === 'si' ? 'block' : 'none';
    };
    hasBrandSelect.addEventListener('change', updateBrandVisibility);
    updateBrandVisibility();

    // Verificación de duplicados en tiempo real
    const checkDupes = () => {
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const duplicate = store.checkDuplicateClient(phone, email, client ? client.id : null);

      if (duplicate) {
        dupWarning.style.display = 'flex';
        dupWarningText.textContent = `Ya existe un cliente registrado con estos datos: "${duplicate.name}" (${formatPhone(duplicate.phone)}). Si es una nueva visita, se recomienda registrar la visita desde su ficha.`;
      } else {
        dupWarning.style.display = 'none';
      }
    };

    phoneInput.addEventListener('input', checkDupes);
    emailInput.addEventListener('input', checkDupes);

    const form = backdrop.querySelector('#client-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const name = form.querySelector('#client-name').value.trim();
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const hasBrand = hasBrandSelect.value;
      const prefBrand = hasBrand === 'si' ? form.querySelector('#client-pref-brand').value : '';
      const comments = form.querySelector('#client-comments').value.trim();

      if (!name) {
        toast.error('El nombre del cliente es obligatorio.');
        return;
      }

      if (!validatePhone(phone)) {
        toast.error('El celular debe contener exactamente 10 dígitos numéricos.');
        return;
      }

      if (email && !validateEmail(email)) {
        toast.error('El formato del correo electrónico no es válido.');
        return;
      }

      const payload = {
        name,
        phone,
        email,
        hasBrandPreference: hasBrand,
        preferredBrand: prefBrand,
        comments
      };

      if (isEdit) {
        store.updateClient(client.id, payload);
        toast.success('Cliente actualizado correctamente');
      } else {
        store.addClient(payload);
        toast.success('Cliente registrado y primera visita agregada al CRM');
      }

      close();
      this.renderClientsTable();
    };
  }

  // ==========================================
  // FICHA DEL CLIENTE (360 PROFILE)
  // ==========================================
  openClientProfileModal(clientId) {
    const client = store.getClientById(clientId);
    if (!client) return;

    const allVehicles = store.getVehicles();
    const testDrives = store.getTestDrives().filter(td => td.clientId === clientId);
    const requests = store.getRequests().filter(r => r.clientId === clientId);
    const downPayments = store.getDownPayments().filter(dp => dp.clientId === clientId);
    const sales = store.getSales().filter(s => s.clientId === clientId);

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.id = 'client-profile-modal-backdrop';

    backdrop.innerHTML = `
      <div class="modal-box modal-xl animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="profile-header-title">
            <span class="client-avatar-circle lg">${client.name.charAt(0)}</span>
            <div>
              <h3 class="modal-title">${client.name}</h3>
              <p class="modal-sub">Cliente registrado el ${formatDate(client.dateRegistered, 'long')}</p>
            </div>
          </div>
          <button class="modal-close-btn" id="profile-close">${getIcon('close')}</button>
        </div>

        <div class="modal-body profile-body">
          <!-- Barra rápida de acciones de la ficha (sin cambiar de vista) -->
          <div class="profile-quick-actions">
            <button class="btn btn-primary btn-sm" id="btn-profile-new-visit">
              ${getIcon('plus')} <span>Registrar visita hoy</span>
            </button>
            <button class="btn btn-outline btn-sm" id="btn-profile-add-note">
              ${getIcon('edit')} <span>Agregar nota</span>
            </button>
            <button class="btn btn-outline btn-sm" id="btn-profile-link-veh">
              ${getIcon('car')} <span>Vincular vehículo</span>
            </button>
            <button class="btn btn-outline btn-sm" id="btn-profile-testdrive">
              ${getIcon('testDrive')} <span>Programar prueba</span>
            </button>
            <button class="btn btn-outline btn-sm" id="btn-profile-request">
              ${getIcon('fileText')} <span>Crear solicitud</span>
            </button>
            <button class="btn btn-dark btn-sm" id="btn-profile-sale">
              ${getIcon('dollarSign')} <span>Registrar venta</span>
            </button>
          </div>

          <!-- Dos columnas: Información general y Pestañas de seguimiento -->
          <div class="profile-layout-grid">
            <!-- Columna lateral: Datos de contacto y preferencias -->
            <div class="profile-side-card card">
              <h4 class="profile-section-title">Información de Contacto</h4>
              <div class="profile-info-list">
                <div class="info-item">
                  <span class="info-label">Celular:</span>
                  <a href="tel:${client.phone}" class="info-val font-bold">${formatPhone(client.phone)}</a>
                </div>
                <div class="info-item">
                  <span class="info-label">Correo:</span>
                  <span class="info-val">${client.email || 'No registrado'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Marca de interés:</span>
                  <span class="info-val">
                    ${client.hasBrandPreference === 'si' && client.preferredBrand
                      ? `<span class="badge badge-primary">${client.preferredBrand}</span>`
                      : '<span class="badge badge-neutral">Sin preferencia</span>'
                    }
                  </span>
                </div>
              </div>

              <h4 class="profile-section-title mt-4">Comentarios y Observaciones</h4>
              <p class="profile-comments-box input-italic">${client.comments || 'Sin comentarios registrados.'}</p>

              <h4 class="profile-section-title mt-4">Vehículos de Interés</h4>
              <div class="interested-vehicles-list" id="profile-interested-vehicles">
                ${(client.interestedVehicleIds || []).map(vId => {
                  const veh = allVehicles.find(v => v.id === vId);
                  if (!veh) return '';
                  return `
                    <div class="interested-veh-pill">
                      <span>${veh.brand} ${veh.model} ${veh.year} (${formatCurrency(veh.price)})</span>
                      <span class="badge badge-sm ${veh.status === 'disponible' ? 'badge-success' : 'badge-neutral'}">${veh.status}</span>
                    </div>
                  `;
                }).join('') || '<p class="text-sm text-muted">Aún no hay vehículos vinculados.</p>'}
              </div>
            </div>

            <!-- Columna principal: Historial comercial, pruebas, solicitudes, enganches, compras -->
            <div class="profile-main-content">
              <!-- Historial de Visitas -->
              <div class="card p-3 mb-3">
                <div class="d-flex justify-between align-center mb-2">
                  <h4 class="profile-section-title">${getIcon('users')} Historial de Visitas (${(client.visits || []).length})</h4>
                </div>
                <div class="profile-timeline">
                  ${(client.visits || []).map(v => `
                    <div class="timeline-entry">
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <span class="timeline-date font-bold">${formatDate(v.date, 'long')}</span>
                        <p class="timeline-notes">${v.notes}</p>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Pruebas de manejo -->
              <div class="card p-3 mb-3">
                <h4 class="profile-section-title mb-2">${getIcon('testDrive')} Pruebas de Manejo (${testDrives.length})</h4>
                ${testDrives.length === 0 ? '<p class="text-sm text-muted">No tiene pruebas de manejo agendadas.</p>' : `
                  <div class="profile-subtable">
                    ${testDrives.map(td => {
                      const veh = allVehicles.find(v => v.id === td.vehicleId) || { brand: 'Auto', model: '' };
                      return `
                        <div class="subtable-row">
                          <div>
                            <strong>${veh.brand} ${veh.model}</strong> · ${formatDate(td.date, 'short')} ${td.time}
                            <div class="text-sm text-muted">Asesor: ${td.responsible || 'De guardia'} · ${td.notes || ''}</div>
                          </div>
                          <span class="badge ${td.status === 'Realizada' ? 'badge-success' : 'badge-primary'}">${td.status}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>

              <!-- Solicitudes de compra/financiamiento -->
              <div class="card p-3 mb-3">
                <h4 class="profile-section-title mb-2">${getIcon('fileText')} Solicitudes de Crédito / Compra (${requests.length})</h4>
                ${requests.length === 0 ? '<p class="text-sm text-muted">Sin solicitudes de financiamiento registradas.</p>' : `
                  <div class="profile-subtable">
                    ${requests.map(r => {
                      const veh = allVehicles.find(v => v.id === r.vehicleId) || { brand: 'Auto', model: '' };
                      return `
                        <div class="subtable-row">
                          <div>
                            <strong>${r.type} — ${veh.brand} ${veh.model}</strong> (${formatDate(r.date, 'short')})
                            <div class="text-sm text-muted">Enganche planeado: ${formatCurrency(r.downPaymentPlanned)} · ${r.notes || ''}</div>
                          </div>
                          <span class="badge ${r.status === 'Aprobada' ? 'badge-success' : 'badge-warning'}">${r.status}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>

              <!-- Enganches Recibidos -->
              <div class="card p-3 mb-3">
                <h4 class="profile-section-title mb-2">${getIcon('dollarSign')} Enganches Recibidos en Caja (${downPayments.length})</h4>
                ${downPayments.length === 0 ? '<p class="text-sm text-muted">No se han registrado pagos de enganche para este cliente.</p>' : `
                  <div class="profile-subtable">
                    ${downPayments.map(dp => {
                      const veh = allVehicles.find(v => v.id === dp.vehicleId) || { brand: 'Vehículo', model: '' };
                      return `
                        <div class="subtable-row">
                          <div>
                            <strong class="text-success">${formatCurrency(dp.amount)}</strong> · ${veh.brand} ${veh.model}
                            <div class="text-sm text-muted">Método: ${dp.method || 'Efectivo'} · Ref: ${dp.reference || '—'} · Fecha: ${formatDate(dp.date, 'short')}</div>
                          </div>
                          <span class="badge badge-success">Recibido</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>

              <!-- Compras Realizadas -->
              <div class="card p-3">
                <h4 class="profile-section-title mb-2">${getIcon('tag')} Compras Realizadas (${sales.length})</h4>
                ${sales.length === 0 ? '<p class="text-sm text-muted">Aún no ha concretado compras en el outlet.</p>' : `
                  <div class="profile-subtable">
                    ${sales.map(s => {
                      const veh = allVehicles.find(v => v.id === s.vehicleId) || { brand: 'Vehículo', model: '' };
                      return `
                        <div class="subtable-row">
                          <div>
                            <strong>${veh.brand} ${veh.model}</strong> — Monto final: <span class="font-bold text-orange">${formatCurrency(s.finalAmount)}</span>
                            <div class="text-sm text-muted">Fecha: ${formatDate(s.date, 'short')} · Tipo: ${s.paymentType} · Asesor: ${s.advisor}</div>
                          </div>
                          <span class="badge badge-dark">Vendido</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="profile-close-btn">Cerrar ficha</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#profile-close').onclick = close;
    backdrop.querySelector('#profile-close-btn').onclick = close;

    // Acción: Registrar nueva visita (sin duplicar ficha)
    backdrop.querySelector('#btn-profile-new-visit').onclick = () => {
      const notes = prompt('Ingresa el motivo u observaciones de la visita de hoy:', 'Visita al showroom para revisión de inventario.');
      if (notes !== null) {
        store.registerClientVisit(client.id, notes || 'Visita registrada.');
        toast.success('Nueva visita registrada con éxito (KPI Invitados actualizado)');
        close();
        this.openClientProfileModal(client.id);
      }
    };

    // Acción: Agregar nota
    backdrop.querySelector('#btn-profile-add-note').onclick = () => {
      const note = prompt('Escribe una nota o seguimiento para el cliente:', '');
      if (note) {
        const updatedComments = `${client.comments ? client.comments + '\n' : ''}[${formatDate(getTodayISO(), 'short')}]: ${note}`;
        store.updateClient(client.id, { comments: updatedComments });
        toast.success('Nota agregada al expediente');
        close();
        this.openClientProfileModal(client.id);
      }
    };

    // Acción: Vincular vehículo
    backdrop.querySelector('#btn-profile-link-veh').onclick = () => {
      this.openLinkVehicleModal(client, () => {
        close();
        this.openClientProfileModal(client.id);
      });
    };

    // Acción: Programar prueba de manejo
    backdrop.querySelector('#btn-profile-testdrive').onclick = () => {
      this.app.modals.openAddTestDriveModal(client.id, null, () => {
        close();
        this.openClientProfileModal(client.id);
      });
    };

    // Acción: Crear solicitud
    backdrop.querySelector('#btn-profile-request').onclick = () => {
      this.app.modals.openAddRequestModal(client.id, null, () => {
        close();
        this.openClientProfileModal(client.id);
      });
    };

    // Acción: Registrar venta
    backdrop.querySelector('#btn-profile-sale').onclick = () => {
      this.app.modals.openAddSaleModal(client.id, null, () => {
        close();
        this.openClientProfileModal(client.id);
      });
    };
  }

  // Modal para vincular vehículo a cliente
  openLinkVehicleModal(client, onDone) {
    const vehicles = store.getVehicles().filter(v => v.status === 'disponible');

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box modal-sm animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Vincular Vehículo de Interés</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <div class="modal-body">
          <p class="text-sm mb-3">Selecciona un vehículo del inventario disponible para vincularlo a <strong>${client.name}</strong>:</p>
          <div class="form-group">
            <select id="link-veh-select" class="input-select">
              ${vehicles.map(v => `
                <option value="${v.id}">${v.brand} ${v.model} ${v.year} — ${formatCurrency(v.price)}</option>
              `).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="btn-cancel">Cancelar</button>
          <button class="btn btn-primary" id="btn-save-link">Vincular</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    const close = () => { backdrop.remove(); };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;
    backdrop.querySelector('#btn-save-link').onclick = () => {
      const selectedId = backdrop.querySelector('#link-veh-select').value;
      if (selectedId) {
        store.linkVehicleToClient(client.id, selectedId);
        toast.success('Vehículo vinculado con éxito');
        close();
        if (onDone) onDone();
      }
    };
  }
}

// --- File: js\views\inventario.js ---
// Vista Inventario — Tarjetas, Tabla, Filtros y Ficha 360 del Vehículo

class InventarioView {
  constructor(app) {
    this.app = app;
    this.displayMode = 'cards'; // 'cards' | 'table'
    this.statusFilter = 'disponible'; // Default: disponibles según requerimiento
    this.searchQuery = '';
    this.brandFilter = 'all';
    this.yearFilter = 'all';
    this.transmissionFilter = 'all';
    this.priceRange = 'all';
    this.sortBy = 'recent'; // 'price_asc', 'price_desc', 'year_desc', 'recent'
  }

  render(container) {
    container.innerHTML = `
      <div class="inventario-view animate-fade-in">
        <!-- Barra de herramientas superior: Búsqueda, Filtros y Conmutador de vista -->
        <div class="inventory-toolbar card">
          <div class="toolbar-top-row">
            <!-- Buscador -->
            <div class="toolbar-search-box">
              <span class="search-icon">${getIcon('search')}</span>
              <input 
                type="text" 
                id="inv-search-input" 
                class="input-search" 
                placeholder="Buscar por marca, modelo o ID de inventario..." 
                value="${this.searchQuery}"
              />
              ${this.searchQuery ? `<button class="btn-clear-search" id="btn-clear-inv-search">${getIcon('close')}</button>` : ''}
            </div>

            <!-- Botones a la derecha: Conmutador de vista y Agregar auto -->
            <div class="toolbar-actions-right">
              <div class="view-mode-toggle">
                <button class="btn-toggle-view ${this.displayMode === 'cards' ? 'active' : ''}" id="btn-view-cards" title="Vista en tarjetas">
                  ${getIcon('grid')} <span>Tarjetas</span>
                </button>
                <button class="btn-toggle-view ${this.displayMode === 'table' ? 'active' : ''}" id="btn-view-table" title="Vista en tabla">
                  ${getIcon('list')} <span>Tabla</span>
                </button>
              </div>

              <button class="btn btn-primary" id="btn-add-vehicle">
                ${getIcon('plus')} <span>Agregar vehículo</span>
              </button>
            </div>
          </div>

          <!-- Filtros de Estado (Pestañas rápidas) y Filtros avanzados -->
          <div class="toolbar-filters-row">
            <!-- Pestañas de estado -->
            <div class="status-tabs-group">
              <button class="status-tab ${this.statusFilter === 'disponible' ? 'active' : ''}" data-status="disponible">
                Disponibles
              </button>
              <button class="status-tab ${this.statusFilter === 'apartado' ? 'active' : ''}" data-status="apartado">
                Apartados
              </button>
              <button class="status-tab ${this.statusFilter === 'vendido' ? 'active' : ''}" data-status="vendido">
                Vendidos
              </button>
              <button class="status-tab ${this.statusFilter === 'all' ? 'active' : ''}" data-status="all">
                Todos los estados
              </button>
            </div>

            <!-- Filtros desplegables -->
            <div class="filter-dropdowns-group">
              <!-- Filtro Marca -->
              <select id="inv-filter-brand" class="input-select select-sm">
                <option value="all">Marca: Todas</option>
                <option value="Nissan" ${this.brandFilter === 'Nissan' ? 'selected' : ''}>Nissan</option>
                <option value="Mazda" ${this.brandFilter === 'Mazda' ? 'selected' : ''}>Mazda</option>
                <option value="Volkswagen" ${this.brandFilter === 'Volkswagen' ? 'selected' : ''}>Volkswagen</option>
                <option value="Toyota" ${this.brandFilter === 'Toyota' ? 'selected' : ''}>Toyota</option>
                <option value="Ford" ${this.brandFilter === 'Ford' ? 'selected' : ''}>Ford</option>
                <option value="Chevrolet" ${this.brandFilter === 'Chevrolet' ? 'selected' : ''}>Chevrolet</option>
                <option value="KIA" ${this.brandFilter === 'KIA' ? 'selected' : ''}>KIA</option>
                <option value="Hyundai" ${this.brandFilter === 'Hyundai' ? 'selected' : ''}>Hyundai</option>
                <option value="BMW" ${this.brandFilter === 'BMW' ? 'selected' : ''}>BMW</option>
                <option value="Honda" ${this.brandFilter === 'Honda' ? 'selected' : ''}>Honda</option>
                <option value="Seat" ${this.brandFilter === 'Seat' ? 'selected' : ''}>Seat</option>
                <option value="Jeep" ${this.brandFilter === 'Jeep' ? 'selected' : ''}>Jeep</option>
              </select>

              <!-- Filtro Transmisión -->
              <select id="inv-filter-trans" class="input-select select-sm">
                <option value="all">Transmisión: Todas</option>
                <option value="Automática" ${this.transmissionFilter === 'Automática' ? 'selected' : ''}>Automática</option>
                <option value="Manual" ${this.transmissionFilter === 'Manual' ? 'selected' : ''}>Manual</option>
              </select>

              <!-- Filtro Rango de Precio -->
              <select id="inv-filter-price" class="input-select select-sm">
                <option value="all">Precio: Todos</option>
                <option value="under_400k" ${this.priceRange === 'under_400k' ? 'selected' : ''}>Menos de $400,000</option>
                <option value="400k_500k" ${this.priceRange === '400k_500k' ? 'selected' : ''}>$400,000 - $500,000</option>
                <option value="over_500k" ${this.priceRange === 'over_500k' ? 'selected' : ''}>Más de $500,000</option>
              </select>

              <!-- Ordenamiento -->
              <select id="inv-sort-by" class="input-select select-sm">
                <option value="recent" ${this.sortBy === 'recent' ? 'selected' : ''}>Fecha de registro</option>
                <option value="price_asc" ${this.sortBy === 'price_asc' ? 'selected' : ''}>Precio (Menor a Mayor)</option>
                <option value="price_desc" ${this.sortBy === 'price_desc' ? 'selected' : ''}>Precio (Mayor a Menor)</option>
                <option value="year_desc" ${this.sortBy === 'year_desc' ? 'selected' : ''}>Año (Más reciente)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Contenedor del inventario (Tarjetas o Tabla) -->
        <div id="inventory-content-container" class="inventory-display-area">
          <!-- Inyectado dinámicamente -->
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.renderInventory();
  }

  bindEvents(container) {
    const searchInput = container.querySelector('#inv-search-input');
    const clearSearch = container.querySelector('#btn-clear-inv-search');
    const btnCards = container.querySelector('#btn-view-cards');
    const btnTable = container.querySelector('#btn-view-table');
    const statusTabs = container.querySelectorAll('.status-tab');
    const filterBrand = container.querySelector('#inv-filter-brand');
    const filterTrans = container.querySelector('#inv-filter-trans');
    const filterPrice = container.querySelector('#inv-filter-price');
    const sortBy = container.querySelector('#inv-sort-by');
    const addBtn = container.querySelector('#btn-add-vehicle');

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.renderInventory();
    });

    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        this.searchQuery = '';
        searchInput.value = '';
        this.renderInventory();
      });
    }

    btnCards.addEventListener('click', () => {
      this.displayMode = 'cards';
      btnCards.classList.add('active');
      btnTable.classList.remove('active');
      this.renderInventory();
    });

    btnTable.addEventListener('click', () => {
      this.displayMode = 'table';
      btnTable.classList.add('active');
      btnCards.classList.remove('active');
      this.renderInventory();
    });

    statusTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        statusTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.statusFilter = tab.getAttribute('data-status');
        this.renderInventory();
      });
    });

    filterBrand.addEventListener('change', (e) => {
      this.brandFilter = e.target.value;
      this.renderInventory();
    });

    filterTrans.addEventListener('change', (e) => {
      this.transmissionFilter = e.target.value;
      this.renderInventory();
    });

    filterPrice.addEventListener('change', (e) => {
      this.priceRange = e.target.value;
      this.renderInventory();
    });

    sortBy.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.renderInventory();
    });

    addBtn.addEventListener('click', () => {
      this.openVehicleModal();
    });
  }

  getFilteredVehicles() {
    let list = store.getVehicles();

    // Filtro por estado
    if (this.statusFilter !== 'all') {
      list = list.filter(v => v.status === this.statusFilter);
    }

    // Filtro por búsqueda
    if (this.searchQuery) {
      list = list.filter(v => {
        const id = (v.inventoryId || '').toLowerCase();
        const brand = (v.brand || '').toLowerCase();
        const model = (v.model || '').toLowerCase();
        return id.includes(this.searchQuery) || brand.includes(this.searchQuery) || model.includes(this.searchQuery);
      });
    }

    // Filtro por marca
    if (this.brandFilter !== 'all') {
      list = list.filter(v => v.brand.toLowerCase() === this.brandFilter.toLowerCase());
    }

    // Filtro por transmisión
    if (this.transmissionFilter !== 'all') {
      list = list.filter(v => (v.transmission || '').toLowerCase().includes(this.transmissionFilter.toLowerCase()));
    }

    // Filtro por rango de precio
    if (this.priceRange === 'under_400k') {
      list = list.filter(v => v.price < 400000);
    } else if (this.priceRange === '400k_500k') {
      list = list.filter(v => v.price >= 400000 && v.price <= 500000);
    } else if (this.priceRange === 'over_500k') {
      list = list.filter(v => v.price > 500000);
    }

    // Ordenamiento
    list.sort((a, b) => {
      if (this.sortBy === 'price_asc') return a.price - b.price;
      if (this.sortBy === 'price_desc') return b.price - a.price;
      if (this.sortBy === 'year_desc') return b.year - a.year;
      return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
    });

    return list;
  }

  renderInventory() {
    const container = document.getElementById('inventory-content-container');
    if (!container) return;

    const vehicles = this.getFilteredVehicles();

    if (vehicles.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box card p-5">
          <div class="empty-icon">${getIcon('car')}</div>
          <h3>No se encontraron vehículos</h3>
          <p>No hay autos que coincidan con los filtros aplicados (${this.statusFilter !== 'all' ? `Estado: ${this.statusFilter}` : 'todos'}).</p>
          <button class="btn btn-outline btn-sm" id="btn-reset-inv-filter">Restablecer filtros</button>
        </div>
      `;

      const resetBtn = container.querySelector('#btn-reset-inv-filter');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.statusFilter = 'disponible';
          this.brandFilter = 'all';
          this.transmissionFilter = 'all';
          this.priceRange = 'all';
          this.render(document.getElementById('view-container'));
        });
      }
      return;
    }

    if (this.displayMode === 'cards') {
      this.renderCardsView(container, vehicles);
    } else {
      this.renderTableView(container, vehicles);
    }
  }

  // ==========================================
  // PRESENTACIÓN EN TARJETAS
  // ==========================================
  renderCardsView(container, vehicles) {
    container.innerHTML = `
      <div class="inventory-cards-grid">
        ${vehicles.map(v => {
          const mainImg = (v.images && v.images[0]) ? v.images[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
          
          let statusBadgeClass = 'badge-success';
          let statusIcon = getIcon('checkCircle');
          let statusText = 'Disponible';

          if (v.status === 'apartado') {
            statusBadgeClass = 'badge-warning';
            statusIcon = getIcon('bookmark');
            statusText = 'Apartado';
          } else if (v.status === 'vendido') {
            statusBadgeClass = 'badge-dark';
            statusIcon = getIcon('tag');
            statusText = 'Vendido';
          }

          return `
            <div class="vehicle-card card animate-fade-in" data-vehicle-id="${v.id}">
              <!-- Fotografía principal con etiqueta de estado -->
              <div class="vehicle-card-image-box">
                <img src="${mainImg}" alt="${v.brand} ${v.model}" class="vehicle-card-img" loading="lazy" />
                <span class="badge ${statusBadgeClass} vehicle-status-badge">
                  ${statusIcon} <span>${statusText}</span>
                </span>
                <span class="vehicle-id-badge">${v.inventoryId}</span>
              </div>

              <!-- Contenido de la tarjeta -->
              <div class="vehicle-card-body">
                <div class="vehicle-title-row">
                  <h3 class="vehicle-card-title">${v.brand} ${v.model}</h3>
                  <span class="vehicle-version">${v.version || ''}</span>
                </div>

                <div class="vehicle-specs-row">
                  <span class="spec-tag">${v.year}</span>
                  <span class="spec-divider">•</span>
                  <span class="spec-tag">${formatNumber(v.mileage)} km</span>
                  <span class="spec-divider">•</span>
                  <span class="spec-tag">${v.transmission}</span>
                </div>

                <div class="vehicle-pricing-box">
                  <div class="price-main">
                    <span class="price-label">Precio de venta</span>
                    <h4 class="price-val font-bold">${formatCurrency(v.price)}</h4>
                  </div>
                  <div class="down-payment-est">
                    <span class="down-label">Enganche estimado:</span>
                    <span class="down-val font-bold text-orange">${formatCurrency(v.estimatedDownPayment)}</span>
                  </div>
                </div>
              </div>

              <div class="vehicle-card-footer">
                <button class="btn btn-outline btn-sm btn-view-vehicle" data-vehicle-id="${v.id}">
                  ${getIcon('eye')} <span>Ver vehículo</span>
                </button>
                <div class="quick-card-actions">
                  ${v.status === 'disponible' ? `
                    <button class="btn-icon-sm btn-quick-td" data-vehicle-id="${v.id}" title="Programar prueba">${getIcon('testDrive')}</button>
                    <button class="btn-icon-sm btn-quick-reserve" data-vehicle-id="${v.id}" title="Apartar">${getIcon('bookmark')}</button>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.bindVehicleInteractions(container);
  }

  // ==========================================
  // PRESENTACIÓN EN TABLA
  // ==========================================
  renderTableView(container, vehicles) {
    container.innerHTML = `
      <div class="table-container card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>VEHÍCULO / ID</th>
                <th>AÑO & KM</th>
                <th>TRANSMISIÓN</th>
                <th>PRECIO DE VENTA</th>
                <th>ENGANCHE ESTIMADO</th>
                <th>ESTADO</th>
                <th class="text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              ${vehicles.map(v => {
                const thumbImg = (v.images && v.images[0]) ? v.images[0] : '';
                let statusBadge = `<span class="badge badge-success">${getIcon('checkCircle')} Disponible</span>`;
                if (v.status === 'apartado') statusBadge = `<span class="badge badge-warning">${getIcon('bookmark')} Apartado</span>`;
                if (v.status === 'vendido') statusBadge = `<span class="badge badge-dark">${getIcon('tag')} Vendido</span>`;

                return `
                  <tr class="table-vehicle-row" data-vehicle-id="${v.id}">
                    <td>
                      <div class="d-flex align-center gap-3">
                        <img src="${thumbImg}" class="table-thumb-img" alt="${v.model}" />
                        <div>
                          <a href="javascript:void(0)" class="link-vehicle-name font-bold" data-vehicle-id="${v.id}">
                            ${v.brand} ${v.model}
                          </a>
                          <div class="text-sm text-muted">${v.inventoryId} · ${v.version}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div><strong>${v.year}</strong></div>
                      <div class="text-sm text-muted">${formatNumber(v.mileage)} km</div>
                    </td>
                    <td>
                      <div>${v.transmission}</div>
                      <div class="text-sm text-muted">${v.fuel}</div>
                    </td>
                    <td class="font-bold text-dark">
                      ${formatCurrency(v.price)}
                    </td>
                    <td class="font-bold text-orange">
                      ${formatCurrency(v.estimatedDownPayment)}
                    </td>
                    <td>
                      ${statusBadge}
                    </td>
                    <td class="text-right">
                      <div class="table-actions-group">
                        <button class="btn-action-icon btn-view-vehicle" data-vehicle-id="${v.id}" title="Ver detalle">
                          ${getIcon('eye')}
                        </button>
                        <button class="btn-action-icon btn-edit-vehicle" data-vehicle-id="${v.id}" title="Editar">
                          ${getIcon('edit')}
                        </button>
                        <button class="btn-action-icon btn-delete-vehicle text-danger" data-vehicle-id="${v.id}" title="Eliminar">
                          ${getIcon('trash')}
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindVehicleInteractions(container);
  }

  bindVehicleInteractions(container) {
    // Abrir ficha del auto
    container.querySelectorAll('.btn-view-vehicle, .link-vehicle-name').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const vId = el.getAttribute('data-vehicle-id');
        this.openVehicleDetailModal(vId);
      });
    });

    // Editar vehículo
    container.querySelectorAll('.btn-edit-vehicle').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const vId = el.getAttribute('data-vehicle-id');
        const veh = store.getVehicleById(vId);
        if (veh) this.openVehicleModal(veh);
      });
    });

    // Eliminar vehículo
    container.querySelectorAll('.btn-delete-vehicle').forEach(el => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        const vId = el.getAttribute('data-vehicle-id');
        const veh = store.getVehicleById(vId);
        if (!veh) return;

        const confirmed = await confirmDialog({
          title: '¿Eliminar vehículo?',
          message: `¿Estás seguro de que deseas retirar del inventario el vehículo "${veh.brand} ${veh.model} ${veh.year}" (${veh.inventoryId})?`,
          confirmText: 'Sí, eliminar',
          isDestructive: true
        });

        if (confirmed) {
          store.deleteVehicle(vId);
          toast.success('Vehículo eliminado del inventario');
          this.renderInventory();
        }
      });
    });

    // Quick reserve
    container.querySelectorAll('.btn-quick-reserve').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const vId = el.getAttribute('data-vehicle-id');
        this.openApartarModal(vId);
      });
    });

    // Quick test drive
    container.querySelectorAll('.btn-quick-td').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const vId = el.getAttribute('data-vehicle-id');
        this.app.modals.openAddTestDriveModal(null, vId);
      });
    });
  }

  // ==========================================
  // FICHA DEL VEHÍCULO (360 PROFILE)
  // ==========================================
  openVehicleDetailModal(vehicleId) {
    const veh = store.getVehicleById(vehicleId);
    if (!veh) return;

    const clients = store.getClients();
    const interestedClients = (veh.interestedClientIds || [])
      .map(id => clients.find(c => c.id === id))
      .filter(Boolean);

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';

    let statusBadge = `<span class="badge badge-success">${getIcon('checkCircle')} Disponible</span>`;
    if (veh.status === 'apartado') statusBadge = `<span class="badge badge-warning">${getIcon('bookmark')} Apartado</span>`;
    if (veh.status === 'vendido') statusBadge = `<span class="badge badge-dark">${getIcon('tag')} Vendido</span>`;

    const images = (veh.images && veh.images.length > 0) ? veh.images : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'];

    backdrop.innerHTML = `
      <div class="modal-box modal-xl animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="d-flex align-center gap-3">
            <h3 class="modal-title">${veh.brand} ${veh.model} ${veh.year}</h3>
            ${statusBadge}
            <span class="badge badge-neutral">${veh.inventoryId}</span>
          </div>
          <button class="modal-close-btn" id="veh-modal-close">${getIcon('close')}</button>
        </div>

        <div class="modal-body">
          <!-- Barra de acciones directas desde la ficha -->
          <div class="profile-quick-actions mb-4">
            <button class="btn btn-outline btn-sm" id="btn-veh-edit">
              ${getIcon('edit')} <span>Editar vehículo</span>
            </button>
            <button class="btn btn-outline btn-sm" id="btn-veh-link-client">
              ${getIcon('users')} <span>Vincular con cliente</span>
            </button>
            ${veh.status === 'disponible' ? `
              <button class="btn btn-outline btn-sm" id="btn-veh-td">
                ${getIcon('testDrive')} <span>Programar prueba</span>
              </button>
              <button class="btn btn-outline btn-sm" id="btn-veh-apartar">
                ${getIcon('bookmark')} <span>Apartar vehículo</span>
              </button>
              <button class="btn btn-primary btn-sm" id="btn-veh-sell">
                ${getIcon('dollarSign')} <span>Registrar venta</span>
              </button>
            ` : ''}
            ${veh.status === 'apartado' ? `
              <button class="btn btn-primary btn-sm" id="btn-veh-sell">
                ${getIcon('dollarSign')} <span>Concretar venta definitiva</span>
              </button>
            ` : ''}
          </div>

          <!-- Dos columnas: Galería y Características técnicas -->
          <div class="vehicle-detail-layout">
            <!-- Galería de imágenes con selector interactivo -->
            <div class="gallery-column">
              <div class="gallery-main-image-box">
                <img src="${images[0]}" alt="${veh.model}" id="gallery-active-img" class="gallery-active-img" />
              </div>
              ${images.length > 1 ? `
                <div class="gallery-thumbs-row">
                  ${images.map((img, idx) => `
                    <img src="${img}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-idx="${idx}" alt="Foto ${idx+1}" />
                  `).join('')}
                </div>
              ` : ''}

              <!-- Tarjeta de precios destacada -->
              <div class="card p-3 mt-3 bg-light">
                <div class="d-flex justify-between align-center mb-2">
                  <span class="text-sm text-muted">Precio de Venta Contado:</span>
                  <span class="text-xl font-bold text-dark">${formatCurrency(veh.price)}</span>
                </div>
                <div class="d-flex justify-between align-center">
                  <span class="text-sm text-muted">Enganche Estimado (Mínimo sugerido):</span>
                  <span class="text-md font-bold text-orange">${formatCurrency(veh.estimatedDownPayment)}</span>
                </div>
                <div class="mt-2 text-xs text-italic text-muted">
                  * Nota: El enganche estimado es una referencia financiera para el cliente. Solo los importes de enganche cobrados se suman a los KPIs.
                </div>
              </div>
            </div>

            <!-- Ficha técnica y Clientes interesados -->
            <div class="specs-column">
              <h4 class="profile-section-title">Especificaciones Técnicas</h4>
              <div class="specs-table-grid">
                <div class="spec-cell">
                  <span class="spec-label">Marca</span>
                  <span class="spec-val font-bold">${veh.brand}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Modelo</span>
                  <span class="spec-val font-bold">${veh.model}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Versión</span>
                  <span class="spec-val font-bold">${veh.version || 'Base'}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Año</span>
                  <span class="spec-val font-bold">${veh.year}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Color exterior</span>
                  <span class="spec-val font-bold">${veh.color || 'No especificado'}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Kilometraje</span>
                  <span class="spec-val font-bold">${formatNumber(veh.mileage)} km</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Transmisión</span>
                  <span class="spec-val font-bold">${veh.transmission}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Combustible</span>
                  <span class="spec-val font-bold">${veh.fuel}</span>
                </div>
              </div>

              <!-- Observaciones -->
              <h4 class="profile-section-title mt-4">Observaciones y Condiciones</h4>
              <p class="profile-comments-box input-italic">${veh.observations || 'Sin observaciones registradas.'}</p>

              <!-- Clientes interesados -->
              <h4 class="profile-section-title mt-4">Clientes Interesados (${interestedClients.length})</h4>
              <div class="interested-clients-box">
                ${interestedClients.length === 0 ? '<p class="text-sm text-muted">Aún no hay clientes vinculados a este auto.</p>' : `
                  <div class="interested-clients-list">
                    ${interestedClients.map(c => `
                      <div class="interested-client-item">
                        <div>
                          <strong>${c.name}</strong> · ${c.phone}
                          <div class="text-xs text-muted">${c.email || 'Sin correo'}</div>
                        </div>
                        <button class="btn btn-outline btn-xs btn-open-client-from-veh" data-client-id="${c.id}">
                          Ver ficha
                        </button>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="btn-veh-close-footer">Cerrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#veh-modal-close').onclick = close;
    backdrop.querySelector('#btn-veh-close-footer').onclick = close;

    // Miniaturas de galería
    const activeImg = backdrop.querySelector('#gallery-active-img');
    const thumbs = backdrop.querySelectorAll('.gallery-thumb');
    thumbs.forEach(t => {
      t.onclick = () => {
        thumbs.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        activeImg.src = t.src;
      };
    });

    // Acción: Editar auto
    backdrop.querySelector('#btn-veh-edit').onclick = () => {
      close();
      this.openVehicleModal(veh);
    };

    // Acción: Vincular cliente
    backdrop.querySelector('#btn-veh-link-client').onclick = () => {
      this.openLinkClientModal(veh, () => {
        close();
        this.openVehicleDetailModal(veh.id);
      });
    };

    // Acción: Programar prueba
    const btnTd = backdrop.querySelector('#btn-veh-td');
    if (btnTd) {
      btnTd.onclick = () => {
        close();
        this.app.modals.openAddTestDriveModal(null, veh.id);
      };
    }

    // Acción: Apartar auto
    const btnApartar = backdrop.querySelector('#btn-veh-apartar');
    if (btnApartar) {
      btnApartar.onclick = () => {
        close();
        this.openApartarModal(veh.id);
      };
    }

    // Acción: Registrar venta
    const btnSell = backdrop.querySelector('#btn-veh-sell');
    if (btnSell) {
      btnSell.onclick = () => {
        close();
        this.app.modals.openAddSaleModal(null, veh.id);
      };
    }

    // Ver ficha de cliente interesado
    backdrop.querySelectorAll('.btn-open-client-from-veh').forEach(b => {
      b.onclick = () => {
        const cId = b.getAttribute('data-client-id');
        close();
        this.app.navigate('clientes');
        setTimeout(() => {
          this.app.clientesView.openClientProfileModal(cId);
        }, 150);
      };
    });
  }

  // Modal para vincular cliente a vehículo
  openLinkClientModal(veh, onDone) {
    const clients = store.getClients();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box modal-sm animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Vincular Cliente Interesado</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <div class="modal-body">
          <p class="text-sm mb-3">Selecciona un cliente para vincularlo a <strong>${veh.brand} ${veh.model} (${veh.inventoryId})</strong>:</p>
          <div class="form-group">
            <select id="link-cli-select" class="input-select">
              ${clients.map(c => `
                <option value="${c.id}">${c.name} — ${c.phone}</option>
              `).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="btn-cancel">Cancelar</button>
          <button class="btn btn-primary" id="btn-save-link">Vincular</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    const close = () => { backdrop.remove(); };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;
    backdrop.querySelector('#btn-save-link').onclick = () => {
      const selectedClientId = backdrop.querySelector('#link-cli-select').value;
      if (selectedClientId) {
        store.linkVehicleToClient(selectedClientId, veh.id);
        toast.success('Cliente vinculado al vehículo con éxito');
        close();
        if (onDone) onDone();
      }
    };
  }

  // Modal para apartar vehículo
  openApartarModal(vehicleId) {
    const veh = store.getVehicleById(vehicleId);
    if (!veh) return;

    if (veh.status === 'vendido') {
      toast.error('Este vehículo ya está vendido y no puede apartarse.');
      return;
    }

    const clients = store.getClients();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Apartar Vehículo: ${veh.brand} ${veh.model}</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="apartar-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label class="form-label">Vehículo seleccionado</label>
              <div class="input-static">
                <strong>${veh.brand} ${veh.model} ${veh.year}</strong> (${veh.inventoryId}) — Precio: ${formatCurrency(veh.price)}
              </div>
            </div>

            <div class="form-group full-width">
              <label for="apartar-client" class="form-label required">Cliente que aparta</label>
              <select id="apartar-client" class="input-select" required>
                ${clients.map(c => `
                  <option value="${c.id}">${c.name} (${c.phone})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="apartar-amount" class="form-label required">Monto de enganche recibido ($ MXN)</label>
              <input type="number" id="apartar-amount" class="input-text" min="1000" step="1000" value="25000" required />
              <span class="form-hint">Este importe se suma al KPI de Enganches</span>
            </div>

            <div class="form-group half-width">
              <label for="apartar-method" class="form-label required">Forma de pago</label>
              <select id="apartar-method" class="input-select" required>
                <option value="Transferencia SPEI">Transferencia SPEI</option>
                <option value="Tarjeta de Débito/Crédito">Tarjeta de Débito/Crédito</option>
                <option value="Efectivo en Caja">Efectivo en Caja</option>
                <option value="Cheque certificado">Cheque certificado</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="apartar-ref" class="form-label">Número de folio / referencia</label>
              <input type="text" id="apartar-ref" class="input-text" placeholder="Ej. SPEI-89201" />
            </div>

            <div class="form-group half-width">
              <label for="apartar-date" class="form-label required">Fecha de apartado</label>
              <input type="date" id="apartar-date" class="input-text" value="${getTodayISO()}" required />
            </div>

            <div class="form-group full-width">
              <label for="apartar-obs" class="form-label">Observaciones</label>
              <textarea id="apartar-obs" class="input-textarea input-italic" rows="2" placeholder="Condiciones del apartado, vigencia de 5 días hábiles..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">Confirmar Apartado y Registrar Enganche</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);
    const close = () => { backdrop.remove(); };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;

    backdrop.querySelector('#apartar-form').onsubmit = (e) => {
      e.preventDefault();
      const clientId = backdrop.querySelector('#apartar-client').value;
      const amount = Number(backdrop.querySelector('#apartar-amount').value);
      const method = backdrop.querySelector('#apartar-method').value;
      const ref = backdrop.querySelector('#apartar-ref').value.trim();
      const date = backdrop.querySelector('#apartar-date').value;
      const obs = backdrop.querySelector('#apartar-obs').value.trim();

      if (!amount || amount <= 0) {
        toast.error('Ingresa un monto de enganche válido.');
        return;
      }

      // Registrar enganche recibido y cambiar estado a 'apartado'
      store.addDownPayment({
        clientId,
        vehicleId: veh.id,
        amount,
        method,
        reference: ref,
        date,
        notes: obs || `Apartado registrado por cliente.`
      });

      // Vincular cliente a vehículo
      store.linkVehicleToClient(clientId, veh.id);

      toast.success(`¡Vehículo apartado! Enganche de ${formatCurrency(amount)} registrado en caja.`);
      close();
      this.renderInventory();
    };
  }

  // ==========================================
  // MODAL: ALTA Y EDICIÓN DE VEHÍCULO
  // ==========================================
  openVehicleModal(veh = null) {
    const isEdit = !!veh;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box modal-lg animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo al Inventario'}</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="vehicle-form">
          <div class="modal-body form-grid">
            <div class="form-group half-width">
              <label for="veh-id" class="form-label required">ID de Inventario</label>
              <input type="text" id="veh-id" class="input-text font-bold" value="${veh ? veh.inventoryId : `OUT-2024-${String(store.getVehicles().length + 1).padStart(3, '0')}`}" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-status" class="form-label required">Estado</label>
              <select id="veh-status" class="input-select" required>
                <option value="disponible" ${!veh || veh.status === 'disponible' ? 'selected' : ''}>Disponible</option>
                <option value="apartado" ${veh && veh.status === 'apartado' ? 'selected' : ''}>Apartado</option>
                <option value="vendido" ${veh && veh.status === 'vendido' ? 'selected' : ''}>Vendido</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="veh-brand" class="form-label required">Marca</label>
              <input type="text" id="veh-brand" class="input-text" value="${veh ? veh.brand : ''}" placeholder="Ej. Nissan, Mazda, Toyota" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-model" class="form-label required">Modelo</label>
              <input type="text" id="veh-model" class="input-text" value="${veh ? veh.model : ''}" placeholder="Ej. Versa, RAV4, Jetta" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-version" class="form-label">Versión</label>
              <input type="text" id="veh-version" class="input-text" value="${veh ? veh.version : ''}" placeholder="Ej. Exclusive CVT, R-Line 1.4 TSI" />
            </div>

            <div class="form-group half-width">
              <label for="veh-year" class="form-label required">Año</label>
              <input type="number" id="veh-year" class="input-text" min="2000" max="2026" value="${veh ? veh.year : 2023}" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-color" class="form-label">Color</label>
              <input type="text" id="veh-color" class="input-text" value="${veh ? (veh.color || '') : ''}" placeholder="Ej. Blanco Puro, Rojo Soul Red" />
            </div>

            <div class="form-group half-width">
              <label for="veh-mileage" class="form-label required">Kilometraje</label>
              <input type="number" id="veh-mileage" class="input-text" min="0" value="${veh ? veh.mileage : 30000}" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-trans" class="form-label required">Transmisión</label>
              <select id="veh-trans" class="input-select" required>
                <option value="Automática" ${!veh || (veh.transmission && veh.transmission.includes('Automática')) ? 'selected' : ''}>Automática</option>
                <option value="Manual" ${veh && (veh.transmission && veh.transmission.includes('Manual')) ? 'selected' : ''}>Manual</option>
                <option value="CVT" ${veh && (veh.transmission && veh.transmission.includes('CVT')) ? 'selected' : ''}>CVT</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="veh-fuel" class="form-label required">Tipo de combustible</label>
              <select id="veh-fuel" class="input-select" required>
                <option value="Gasolina" ${!veh || veh.fuel === 'Gasolina' ? 'selected' : ''}>Gasolina</option>
                <option value="Híbrido" ${veh && veh.fuel === 'Híbrido' ? 'selected' : ''}>Híbrido</option>
                <option value="Eléctrico" ${veh && veh.fuel === 'Eléctrico' ? 'selected' : ''}>Eléctrico</option>
                <option value="Diésel" ${veh && veh.fuel === 'Diésel' ? 'selected' : ''}>Diésel</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="veh-price" class="form-label required">Precio de venta ($ MXN)</label>
              <input type="number" id="veh-price" class="input-text font-bold" min="10000" step="1000" value="${veh ? veh.price : 350000}" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-down" class="form-label required">Enganche estimado ($ MXN)</label>
              <input type="number" id="veh-down" class="input-text font-bold text-orange" min="1000" step="1000" value="${veh ? veh.estimatedDownPayment : 70000}" required />
              <span class="form-hint">Sugerencia (típicamente 20% del valor)</span>
            </div>

            <div class="form-group full-width">
              <label for="veh-image-url" class="form-label">URL de Fotografía principal</label>
              <input type="url" id="veh-image-url" class="input-text" value="${veh && veh.images && veh.images[0] ? veh.images[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}" placeholder="https://..." />
            </div>

            <div class="form-group full-width">
              <label for="veh-obs" class="form-label">Observaciones y equipamiento</label>
              <textarea id="veh-obs" class="input-textarea input-italic" rows="2" placeholder="Factura, garantías, estética, servicios al corriente...">${veh ? (veh.observations || '') : ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Registrar Vehículo'}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);
    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;

    const priceInput = backdrop.querySelector('#veh-price');
    const downInput = backdrop.querySelector('#veh-down');
    priceInput.addEventListener('input', () => {
      if (!isEdit) {
        downInput.value = Math.round(Number(priceInput.value) * 0.2);
      }
    });

    const form = backdrop.querySelector('#vehicle-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const payload = {
        inventoryId: form.querySelector('#veh-id').value.trim(),
        status: form.querySelector('#veh-status').value,
        brand: form.querySelector('#veh-brand').value.trim(),
        model: form.querySelector('#veh-model').value.trim(),
        version: form.querySelector('#veh-version').value.trim(),
        year: Number(form.querySelector('#veh-year').value),
        color: form.querySelector('#veh-color').value.trim(),
        mileage: Number(form.querySelector('#veh-mileage').value),
        transmission: form.querySelector('#veh-trans').value,
        fuel: form.querySelector('#veh-fuel').value,
        price: Number(priceInput.value),
        estimatedDownPayment: Number(downInput.value),
        images: [form.querySelector('#veh-image-url').value.trim()],
        observations: form.querySelector('#veh-obs').value.trim()
      };

      if (!payload.brand || !payload.model || !payload.price) {
        toast.error('Completa los campos obligatorios del vehículo.');
        return;
      }

      if (isEdit) {
        store.updateVehicle(veh.id, payload);
        toast.success('Vehículo actualizado exitosamente');
      } else {
        store.addVehicle(payload);
        toast.success('Vehículo registrado en el inventario');
      }

      close();
      this.renderInventory();
    };
  }
}

// --- File: js\app.js ---
// Aplicación Principal Outlet Autocorp Mini CRM

class App {
  constructor() {
    this.currentViewId = 'general';
    this.modals = new ModalManager(this);
    this.dashboardView = new DashboardView(this);
    this.guardiasView = new GuardiasView(this);
    this.clientesView = new ClientesView(this);
    this.inventarioView = new InventarioView(this);

    this.init();
  }

  init() {
    this.renderLayout();
    this.bindNavigation();
    this.navigate('general');

    // Suscribirse a cambios en el store para actualizar la vista activa si cambia algo
    store.subscribe(() => {
      this.refreshCurrentView();
    });
  }

  renderLayout() {
    const appEl = document.getElementById('app');
    const todayFormatted = formatDate(new Date().toISOString().split('T')[0], 'long');

    appEl.innerHTML = `
      <div class="app-layout">
        <!-- MENÚ LATERAL (DESKTOP) Y DRAWER (MÓVIL) -->
        <aside class="app-sidebar" id="app-sidebar">
          <div class="sidebar-brand">
            <div class="brand-logo-icon">
              ${getIcon('car')}
            </div>
            <div class="brand-text">
              <span class="brand-title">OUTLET AUTOCORP</span>
              <span class="brand-subtitle">Mini CRM Seminuevos</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <button class="nav-item active" data-view="general">
              <span class="nav-icon">${getIcon('dashboard')}</span>
              <span class="nav-label">General</span>
            </button>
            <button class="nav-item" data-view="guardias">
              <span class="nav-icon">${getIcon('calendar')}</span>
              <span class="nav-label">Guardias y actividades</span>
            </button>
            <button class="nav-item" data-view="clientes">
              <span class="nav-icon">${getIcon('users')}</span>
              <span class="nav-label">Clientes</span>
            </button>
            <button class="nav-item" data-view="inventario">
              <span class="nav-icon">${getIcon('car')}</span>
              <span class="nav-label">Inventario</span>
            </button>
          </nav>

          <div class="sidebar-footer">
            <div class="demo-mode-indicator">
              <span class="demo-dot"></span>
              <span class="demo-text">Datos de demostración</span>
            </div>
            <button class="btn btn-outline-light btn-xs" id="btn-reset-demo" title="Recargar lote con datos iniciales">
              ${getIcon('refresh')} <span>Restablecer demo</span>
            </button>
          </div>
        </aside>

        <!-- Sombra de fondo para menú móvil -->
        <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

        <!-- CONTENEDOR PRINCIPAL -->
        <div class="app-main-wrapper">
          <!-- ENCABEZADO SUPERIOR -->
          <header class="app-header">
            <div class="header-left">
              <button class="btn-menu-mobile" id="btn-toggle-menu" aria-label="Abrir menú">
                ${getIcon('menu')}
              </button>
              <div class="header-titles">
                <span class="header-outlet-name">Outlet Autocorp</span>
                <h1 class="header-view-title" id="header-view-title">Vista General — Dashboard</h1>
              </div>
            </div>

            <div class="header-right">
              <a href="diseno2/index.html" class="btn btn-outline btn-xs" style="border-radius: 20px; text-decoration: none; font-weight: 700; color: #ff8901; border-color: #ff8901;" title="Conocer el Diseño Alternativo (Showroom Studio)">
                <span>Ver Diseño 2 (Executive) →</span>
              </a>
              <div class="header-date">
                <span class="date-icon">${getIcon('calendar')}</span>
                <span class="date-text">${todayFormatted}</span>
              </div>
            </div>
          </header>

          <!-- ÁREA DE CONTENIDO DE LA VISTA -->
          <main class="app-content-area" id="view-container">
            <!-- Vistas inyectadas aquí -->
          </main>
        </div>
      </div>
    `;
  }

  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const btnToggleMenu = document.getElementById('btn-toggle-menu');
    const btnResetDemo = document.getElementById('btn-reset-demo');

    // Cambiar de vista
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const viewId = item.getAttribute('data-view');
        this.navigate(viewId);
        // Cerrar menú móvil al navegar
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
      });
    });

    // Menú móvil
    if (btnToggleMenu) {
      btnToggleMenu.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('open');
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
      });
    }

    // Botón restablecer demo
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', async () => {
        const confirmed = await confirmDialog({
          title: '¿Restablecer datos de demostración?',
          message: 'Se reiniciarán todos los clientes, inventario de vehículos, guardias y ventas a sus valores originales de prueba.',
          confirmText: 'Sí, restablecer',
          isDestructive: false
        });

        if (confirmed) {
          store.resetDemoData();
          toast.success('Datos de demostración restablecidos correctamente.');
          this.refreshCurrentView();
        }
      });
    }
  }

  navigate(viewId, subParam = null) {
    this.currentViewId = viewId;

    // Actualizar nav activa
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Actualizar título en encabezado
    const headerTitle = document.getElementById('header-view-title');
    const titles = {
      general: 'Vista General — Dashboard',
      guardias: 'Guardias y Actividades',
      clientes: 'Directorio de Clientes',
      inventario: 'Inventario de Vehículos'
    };
    if (headerTitle) {
      headerTitle.textContent = titles[viewId] || 'Outlet Autocorp';
    }

    const container = document.getElementById('view-container');
    if (!container) return;

    if (viewId === 'general') {
      this.dashboardView.render(container);
    } else if (viewId === 'guardias') {
      if (subParam) this.guardiasView.setTab(subParam);
      this.guardiasView.render(container);
    } else if (viewId === 'clientes') {
      this.clientesView.render(container);
    } else if (viewId === 'inventario') {
      this.inventarioView.render(container);
    }

    // Scroll arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  refreshCurrentView() {
    const container = document.getElementById('view-container');
    if (!container) return;

    if (this.currentViewId === 'general') {
      this.dashboardView.update();
    } else if (this.currentViewId === 'guardias') {
      this.guardiasView.renderCurrentTab();
    } else if (this.currentViewId === 'clientes') {
      this.clientesView.renderClientsTable();
    } else if (this.currentViewId === 'inventario') {
      this.inventarioView.renderInventory();
    }
  }
}

// Iniciar aplicación al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  window.outletApp = new App();
});


})();