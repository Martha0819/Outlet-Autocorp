import { describe, it, expect } from 'vitest';
import { sugerirMapeo } from '../mapeoCabeceras';

describe('sugerirMapeo', () => {
  it('reconoce cabeceras no estándar (con acentos/mayúsculas distintas) y las asigna al campo correcto', () => {
    const cabeceras = ['Modelo', 'Descripción', 'AÑO', 'Kilometraje', 'Marca', 'VIN', 'Transmisión', 'Servicio', 'Precio'];
    const mapeo = sugerirMapeo(cabeceras);

    expect(mapeo).toEqual([
      { columna: 'Modelo', campo: 'modelo' },
      { columna: 'Descripción', campo: 'nombre' },
      { columna: 'AÑO', campo: 'anio' },
      { columna: 'Kilometraje', campo: 'km' },
      { columna: 'Marca', campo: 'marca' },
      { columna: 'VIN', campo: 'vin' },
      { columna: 'Transmisión', campo: 'transmision' },
      { columna: 'Servicio', campo: 'servicio' },
      { columna: 'Precio', campo: 'precioLista' },
    ]);
  });

  it('reconoce la columna de días en inventario', () => {
    const mapeo = sugerirMapeo(['Modelo', 'Dias en Inventario']);

    expect(mapeo).toEqual([
      { columna: 'Modelo', campo: 'modelo' },
      { columna: 'Dias en Inventario', campo: 'diasInventario' },
    ]);
  });

  it('reconoce las columnas de color exterior e interior', () => {
    const mapeo = sugerirMapeo(['Modelo', 'Color ext.', 'Color int.']);

    expect(mapeo).toEqual([
      { columna: 'Modelo', campo: 'modelo' },
      { columna: 'Color ext.', campo: 'colorExterior' },
      { columna: 'Color int.', campo: 'colorInterior' },
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
