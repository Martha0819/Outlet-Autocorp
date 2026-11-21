import { describe, it, expect } from 'vitest';
import { estatusVehiculoParaNegocio } from '../estatusVehiculo';

describe('estatusVehiculoParaNegocio', () => {
  it('tipo VENTA es VENDIDO', () => {
    expect(estatusVehiculoParaNegocio({ tipo: 'VENTA' })).toBe('VENDIDO');
  });

  it('tipo APARTADO es APARTADO', () => {
    expect(estatusVehiculoParaNegocio({ tipo: 'APARTADO' })).toBe('APARTADO');
  });

  it('tipo SOLICITUD nunca aparta la unidad — queda DISPONIBLE', () => {
    expect(estatusVehiculoParaNegocio({ tipo: 'SOLICITUD' })).toBe('DISPONIBLE');
  });

  it('sin tipo reconocible, por seguridad queda DISPONIBLE (nunca aparta por accidente)', () => {
    expect(estatusVehiculoParaNegocio({ tipo: undefined })).toBe('DISPONIBLE');
    expect(estatusVehiculoParaNegocio({})).toBe('DISPONIBLE');
  });
});
