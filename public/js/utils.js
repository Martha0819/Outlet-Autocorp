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
export function formatCurrency(amount, withCode = true) {
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
export function formatNumber(number) {
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
export function formatDate(dateStr, format = 'short') {
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
export function getTodayISO() {
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
export function validatePhone(phone) {
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
export function formatPhone(phone) {
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
export function validateEmail(email) {
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
export function generateId(prefix = 'ID') {
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
export function isDateInPeriod(dateStr, period, customStart = null, customEnd = null) {
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
export function isDateInPreviousPeriod(dateStr, period) {
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
