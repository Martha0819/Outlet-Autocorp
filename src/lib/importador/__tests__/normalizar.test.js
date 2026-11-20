import { describe, it, expect } from 'vitest';
import { aNumero, numeroOpcional } from '../normalizar';

describe('aNumero', () => {
  it('parsea un número plano', () => {
    expect(aNumero('250000')).toBe(250000);
  });

  it('extrae el número de un valor con símbolo de moneda y separadores de miles', () => {
    expect(aNumero('$1,051,900.00')).toBe(1051900);
  });

  it('extrae el número cuando viene con texto antes o después', () => {
    expect(aNumero('$40,000.00 DESCUENTO')).toBe(40000);
    expect(aNumero('TARJETA GASOLINA $6,000.00')).toBe(6000);
  });

  it('da NaN cuando no hay ningún dígito', () => {
    expect(Number.isNaN(aNumero('TANQUE /TAPETES O PELICULA'))).toBe(true);
    expect(Number.isNaN(aNumero(''))).toBe(true);
    expect(Number.isNaN(aNumero(undefined))).toBe(true);
    expect(Number.isNaN(aNumero(null))).toBe(true);
  });
});

describe('numeroOpcional', () => {
  it('devuelve el número cuando se puede parsear', () => {
    expect(numeroOpcional('$40,000.00 DESCUENTO')).toBe(40000);
  });

  it('devuelve null (no NaN) cuando no hay ningún número, para no romper la fila', () => {
    expect(numeroOpcional('TANQUE /TAPETES O PELICULA')).toBeNull();
    expect(numeroOpcional('')).toBeNull();
    expect(numeroOpcional(undefined)).toBeNull();
  });
});
