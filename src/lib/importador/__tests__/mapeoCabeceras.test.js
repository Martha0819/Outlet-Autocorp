import { describe, it, expect } from 'vitest';
import { sugerirMapeo } from '../mapeoCabeceras';

describe('sugerirMapeo', () => {
  it('reconoce cabeceras no estándar (con acentos/mayúsculas distintas) y las asigna al campo correcto', () => {
    const cabeceras = ['Modelo', 'Descripción', 'AÑO', 'Kilometraje', 'Marca', 'Unidad de Negocio', 'VIN', 'Transmisión', 'Condición', 'Precio'];
    const mapeo = sugerirMapeo(cabeceras);

    expect(mapeo).toEqual([
      { columna: 'Modelo', campo: 'modelo' },
      { columna: 'Descripción', campo: 'nombre' },
      { columna: 'AÑO', campo: 'anio' },
      { columna: 'Kilometraje', campo: 'km' },
      { columna: 'Marca', campo: 'marca' },
      { columna: 'Unidad de Negocio', campo: 'unidadNegocio' },
      { columna: 'VIN', campo: 'vin' },
      { columna: 'Transmisión', campo: 'transmision' },
      { columna: 'Condición', campo: 'condicion' },
      { columna: 'Precio', campo: 'precioLista' },
    ]);
  });

  it('deja sin asignar una columna que no corresponde a ningún campo del catálogo', () => {
    const mapeo = sugerirMapeo(['Modelo', 'Comentario interno']);

    expect(mapeo).toEqual([
      { columna: 'Modelo', campo: 'modelo' },
      { columna: 'Comentario interno', campo: null },
    ]);
  });
});
