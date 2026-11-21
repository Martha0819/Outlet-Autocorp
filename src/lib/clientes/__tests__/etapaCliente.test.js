import { describe, it, expect } from 'vitest';
import { etapaDeCliente, etapaDeClientePorListas } from '../etapaCliente';

describe('etapaDeCliente', () => {
  it('recién registrado, sin nada más, es LEAD', () => {
    expect(etapaDeCliente({ tieneDemo: false, tieneApartado: false, tieneVenta: false })).toBe('LEAD');
  });

  it('con demo realizada, es DEMO', () => {
    expect(etapaDeCliente({ tieneDemo: true, tieneApartado: false, tieneVenta: false })).toBe('DEMO');
  });

  it('con enganche/apartado, es APARTADO (gana sobre demo)', () => {
    expect(etapaDeCliente({ tieneDemo: true, tieneApartado: true, tieneVenta: false })).toBe('APARTADO');
  });

  it('con venta, es VENTA (gana sobre todo lo demás)', () => {
    expect(etapaDeCliente({ tieneDemo: true, tieneApartado: true, tieneVenta: true })).toBe('VENTA');
  });
});

describe('etapaDeClientePorListas', () => {
  it('deriva de listas de demos/negocios filtrados por tipo', () => {
    expect(etapaDeClientePorListas({ demos: [], negocios: [] })).toBe('LEAD');
    expect(etapaDeClientePorListas({ demos: [{ id: 1 }], negocios: [] })).toBe('DEMO');
    expect(etapaDeClientePorListas({ demos: [{ id: 1 }], negocios: [{ tipo: 'SOLICITUD' }] })).toBe('DEMO');
    expect(etapaDeClientePorListas({ demos: [], negocios: [{ tipo: 'APARTADO' }] })).toBe('APARTADO');
    expect(etapaDeClientePorListas({ demos: [], negocios: [{ tipo: 'APARTADO' }, { tipo: 'VENTA' }] })).toBe('VENTA');
  });
});
