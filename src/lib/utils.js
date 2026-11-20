/**
 * @fileoverview Utilidades de formato, fechas y validaciones para Outlet Autocorp CRM
 */

export function getInitials(fullName) {
  if (!fullName) return 'US';
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

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

export function formatNumber(number) {
  if (number === undefined || number === null || isNaN(number)) return '0';
  return new Intl.NumberFormat('es-MX').format(number);
}

export function formatDate(dateStr, format = 'short') {
  if (!dateStr) return '';
  
  let date;
  const rawStr = typeof dateStr === 'string' ? dateStr : (dateStr instanceof Date ? dateStr.toISOString() : String(dateStr));
  
  // Si coincide con patrón YYYY-MM-DD (ej: 2026-11-20 o 2026-11-20T00:00:00.000Z),
  // descomponer año, mes y día para evitar que la zona horaria (UTC-6) desplace el día hacia atrás.
  if (/^\d{4}-\d{2}-\d{2}/.test(rawStr)) {
    const [y, m, d] = rawStr.slice(0, 10).split('-').map(Number);
    date = new Date(y, m - 1, d, 12, 0, 0);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return String(dateStr);

  if (format === 'short') {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
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

// Para eventos/guardias de un solo día (fechaFin vacío o igual a fecha),
// muestra solo la fecha de inicio; si abarca varios días, muestra el rango.
export function formatDateRange(fecha, fechaFin, format = 'short') {
  const inicio = formatDate(fecha, format);
  if (!fechaFin) return inicio;
  const finStr = typeof fechaFin === 'string' ? fechaFin.slice(0, 10) : fechaFin;
  const inicioStr = typeof fecha === 'string' ? fecha.slice(0, 10) : fecha;
  if (finStr === inicioStr) return inicio;
  return `${inicio} – ${formatDate(fechaFin, format)}`;
}

export function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateId(prefix = 'ID') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

export function validatePhone(phone) {
  if (!phone) return false;
  const cleaned = String(phone).replace(/\D/g, '');
  return cleaned.length === 10;
}

export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }
  return String(phone);
}

export function validateEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

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
