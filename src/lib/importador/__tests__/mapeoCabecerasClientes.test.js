import { describe, it, expect } from 'vitest';
import { sugerirMapeoClientes } from '../mapeoCabecerasClientes';

describe('sugerirMapeoClientes', () => {
  it('reconoce las cabeceras que pide el alta manual de cliente', () => {
    const cabeceras = ['Nombre', 'Celular', 'Correo', 'Acompañantes', '¿Visita una marca en específico?', 'Marca', 'Comentarios'];
    const mapeo = sugerirMapeoClientes(cabeceras);

    expect(mapeo).toEqual([
      { columna: 'Nombre', campo: 'nombre' },
      { columna: 'Celular', campo: 'telefono' },
      { columna: 'Correo', campo: 'correo' },
      { columna: 'Acompañantes', campo: 'numeroAcompanantes' },
      { columna: '¿Visita una marca en específico?', campo: 'visitaMarcaEspecifica' },
      { columna: 'Marca', campo: 'marca' },
      { columna: 'Comentarios', campo: 'observaciones' },
    ]);
  });

  it('deja sin campo una cabecera que no reconoce (ej. datos de negocio o demo)', () => {
    const mapeo = sugerirMapeoClientes(['Nombre', 'Folio de negocio', 'Fecha de demo']);
    expect(mapeo).toEqual([
      { columna: 'Nombre', campo: 'nombre' },
      { columna: 'Folio de negocio', campo: null },
      { columna: 'Fecha de demo', campo: null },
    ]);
  });
});
