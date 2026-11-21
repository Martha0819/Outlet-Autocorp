import { describe, it, expect } from 'vitest';
import { estatusVehiculoParaNegocio } from '../estatusVehiculo';

describe('estatusVehiculoParaNegocio', () => {
  it('con totalUnidad, es VENDIDO (gana sobre dioEnganche)', () => {
    expect(estatusVehiculoParaNegocio({ totalUnidad: 300000, dioEnganche: true })).toBe('VENDIDO');
    expect(estatusVehiculoParaNegocio({ totalUnidad: 300000, dioEnganche: false })).toBe('VENDIDO');
  });

  it('sin totalUnidad pero con dioEnganche, es APARTADO', () => {
    expect(estatusVehiculoParaNegocio({ totalUnidad: null, dioEnganche: true })).toBe('APARTADO');
    expect(estatusVehiculoParaNegocio({ totalUnidad: '', dioEnganche: true })).toBe('APARTADO');
    expect(estatusVehiculoParaNegocio({ totalUnidad: undefined, dioEnganche: true })).toBe('APARTADO');
  });

  it('sin totalUnidad ni dioEnganche, es DISPONIBLE — libera el vehículo', () => {
    expect(estatusVehiculoParaNegocio({ totalUnidad: null, dioEnganche: false })).toBe('DISPONIBLE');
    expect(estatusVehiculoParaNegocio({ totalUnidad: '', dioEnganche: undefined })).toBe('DISPONIBLE');
  });
});
