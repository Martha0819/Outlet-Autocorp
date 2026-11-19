import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImportadorRevision } from '../ImportadorRevision';

const ANALISIS_EJEMPLO = {
  mapeoSugerido: [
    { columna: 'Modelo', campo: 'modelo' },
    { columna: 'Comentario', campo: null },
  ],
  filas: [
    {
      datosOriginales: { Modelo: 'Sentra', Comentario: '' },
      estado: 'lista',
      valoresResueltos: { nombre: 'Auto seminuevo', modelo: 'Sentra', anio: 2020, marcaId: 1, unidadNegocioId: 10 },
    },
    {
      datosOriginales: { Modelo: 'Civic', Comentario: '' },
      estado: 'pendiente-marca',
      candidatosResolucion: [{ id: 2, nombre: 'Honda' }, { id: 3, nombre: 'Toyota' }],
      unidadNegocioIdResuelto: 10,
    },
  ],
  catalogo: { marcas: [{ id: 2, nombre: 'Honda' }, { id: 3, nombre: 'Toyota' }], unidadesNegocio: [{ id: 10, nombre: 'Matriz' }] },
};

describe('ImportadorRevision', () => {
  it('permite editar el mapeo sugerido', () => {
    render(<ImportadorRevision analisis={ANALISIS_EJEMPLO} onConfirmar={() => {}} />);

    const selectComentario = screen.getByLabelText('Comentario');
    fireEvent.change(selectComentario, { target: { value: 'precioLista' } });

    expect(selectComentario.value).toBe('precioLista');
  });

  it('permite resolver manualmente una fila pendiente eligiendo un candidato, y "confirmar" envía exactamente las FilaDecidida esperadas', () => {
    const onConfirmar = vi.fn();
    render(<ImportadorRevision analisis={ANALISIS_EJEMPLO} onConfirmar={onConfirmar} />);

    const selectCandidato = screen.getByLabelText(/fila 2.*marca/i);
    fireEvent.change(selectCandidato, { target: { value: '2' } });

    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).toHaveBeenCalledWith({
      mapeoFinal: ANALISIS_EJEMPLO.mapeoSugerido,
      filasDecididas: [
        {
          datosOriginales: ANALISIS_EJEMPLO.filas[0].datosOriginales,
          decision: 'importar',
          marcaId: 1,
          unidadNegocioId: 10,
          resueltoManualmente: false,
        },
        {
          datosOriginales: ANALISIS_EJEMPLO.filas[1].datosOriginales,
          decision: 'importar',
          marcaId: 2,
          unidadNegocioId: 10,
          resueltoManualmente: true,
        },
      ],
    });
  });

  it('conserva el motivo de una fila "error" al descartarla, para que el resumen final lo muestre', () => {
    const onConfirmar = vi.fn();
    const analisisConError = {
      ...ANALISIS_EJEMPLO,
      filas: [{ datosOriginales: { Modelo: '', Comentario: '' }, estado: 'error', motivoError: 'campo obligatorio faltante: modelo' }],
    };
    render(<ImportadorRevision analisis={analisisConError} onConfirmar={onConfirmar} />);

    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({
        filasDecididas: [expect.objectContaining({ decision: 'descartar', motivoDescartado: 'campo obligatorio faltante: modelo' })],
      })
    );
  });

  it('descarta una fila pendiente que el usuario no resuelve', () => {
    const onConfirmar = vi.fn();
    render(<ImportadorRevision analisis={ANALISIS_EJEMPLO} onConfirmar={onConfirmar} />);

    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({
        filasDecididas: expect.arrayContaining([
          expect.objectContaining({ decision: 'descartar' }),
        ]),
      })
    );
  });
});
