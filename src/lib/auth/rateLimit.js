// Limitador en memoria, a propósito: este es un solo proceso Node para un
// evento de días, no un cluster — no justifica Redis. Se reinicia si el
// proceso reinicia, lo cual es aceptable aquí (no es el único control, el
// hash de password con bcrypt ya hace cada intento lento).
const intentos = new Map(); // key -> { count, windowStart }

const VENTANA_MS = 15 * 60 * 1000; // 15 minutos
const MAX_INTENTOS = 5;

export function registrarIntentoFallido(key) {
  const ahora = Date.now();
  const actual = intentos.get(key);

  if (!actual || ahora - actual.windowStart > VENTANA_MS) {
    intentos.set(key, { count: 1, windowStart: ahora });
    return;
  }
  actual.count += 1;
}

export function limpiarIntentos(key) {
  intentos.delete(key);
}

// true si debe bloquearse (ya alcanzó el máximo dentro de la ventana activa).
export function estaBloqueado(key) {
  const actual = intentos.get(key);
  if (!actual) return false;
  if (Date.now() - actual.windowStart > VENTANA_MS) {
    intentos.delete(key);
    return false;
  }
  return actual.count >= MAX_INTENTOS;
}
