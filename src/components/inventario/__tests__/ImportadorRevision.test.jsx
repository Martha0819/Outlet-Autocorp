import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ImportadorRevision } from '../ImportadorRevision';

function renderComo(usuario, ui) {
  const estado = { auth: { usuario } };
  const store = {
    getState: () => estado,
    subscribe: () => () => {},
    dispatch: () => {},
  };
  return render(<Provider store={store}>{ui}</Provider>);
}

const ADMIN = { esAdministrador: true, unidadNegocioId: null, permisos: [] };
const NO_ADMIN = { esAdministrador: false, unidadNegocioId: 10, permisos: [] };

const ANALISIS_EJEMPLO = {
  mapeoSugerido: [
    { columna: 'Modelo', campo: 'modelo' },
    { columna: 'Comentario', campo: null },
  ],
  filas: [
    {
      datosOriginales: { Modelo: 'Sentra', Comentario: '' },
      estado: 'lista',
      valoresResueltos: { nombre: 'Auto seminuevo', modelo: 'Sentra', anio: 2020, marcaId: 1 },
    },
    {
      datosOriginales: { Modelo: 'Civic', Comentario: '' },
      estado: 'pendiente-marca',
      candidatosResolucion: [{ id: 2, nombre: 'Honda' }, { id: 3, nombre: 'Toyota' }],
    },
  ],
  catalogo: {
    marcas: [{ id: 2, nombre: 'Honda' }, { id: 3, nombre: 'Toyota' }],
    unidadesNegocio: [{ id: 10, nombre: 'Matriz' }, { id: 11, nombre: 'Sucursal Norte' }],
    lineasNegocio: [{ id: 5, nombre: 'Nuevos' }, { id: 6, nombre: 'Demo' }],
  },
};

function elegirUnidadNegocio(valor = '10') {
  fireEvent.change(screen.getByLabelText(/unidad de negocio de este inventario/i), { target: { value: valor } });
}

describe('ImportadorRevision', () => {
  it('permite editar el mapeo sugerido', () => {
    renderComo(ADMIN, <ImportadorRevision analisis={ANALISIS_EJEMPLO} onConfirmar={() => {}} />);

    const selectComentario = screen.getByLabelText('Comentario');
    fireEvent.change(selectComentario, { target: { value: 'precioLista' } });

    expect(selectComentario.value).toBe('precioLista');
  });

  it('no permite confirmar sin elegir la unidad de negocio del archivo', () => {
    const onConfirmar = vi.fn();
    renderComo(ADMIN, <ImportadorRevision analisis={ANALISIS_EJEMPLO} onConfirmar={onConfirmar} />);

    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it('un no-administrador ya trae su propia unidad de negocio preseleccionada', () => {
    const onConfirmar = vi.fn();
    renderComo(NO_ADMIN, <ImportadorRevision analisis={ANALISIS_EJEMPLO} onConfirmar={onConfirmar} />);

    const selectCandidato = screen.getByLabelText(/fila 2.*marca/i);
    fireEvent.change(selectCandidato, { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({
        filasDecididas: expect.arrayContaining([
          expect.objectContaining({ unidadNegocioId: 10 }),
        ]),
      })
    );
  });

  it('permite resolver manualmente una fila pendiente eligiendo un candidato, y "confirmar" envía exactamente las FilaDecidida esperadas', () => {
    const onConfirmar = vi.fn();
    renderComo(ADMIN, <ImportadorRevision analisis={ANALISIS_EJEMPLO} onConfirmar={onConfirmar} />);

    elegirUnidadNegocio('10');
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
          servicioId: null,
          resueltoManualmente: false,
        },
        {
          datosOriginales: ANALISIS_EJEMPLO.filas[1].datosOriginales,
          decision: 'importar',
          marcaId: 2,
          unidadNegocioId: 10,
          servicioId: null,
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
    renderComo(ADMIN, <ImportadorRevision analisis={analisisConError} onConfirmar={onConfirmar} />);

    elegirUnidadNegocio('10');
    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({
        filasDecididas: [expect.objectContaining({ decision: 'descartar', motivoDescartado: 'campo obligatorio faltante: modelo' })],
      })
    );
  });

  it('descarta una fila pendiente que el usuario no resuelve', () => {
    const onConfirmar = vi.fn();
    renderComo(ADMIN, <ImportadorRevision analisis={ANALISIS_EJEMPLO} onConfirmar={onConfirmar} />);

    elegirUnidadNegocio('10');
    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({
        filasDecididas: expect.arrayContaining([
          expect.objectContaining({ decision: 'descartar' }),
        ]),
      })
    );
  });

  it('al elegir una marca global, resuelve automáticamente las filas "pendiente-marca" que no se tocaron fila por fila', () => {
    const onConfirmar = vi.fn();
    renderComo(ADMIN, <ImportadorRevision analisis={ANALISIS_EJEMPLO} onConfirmar={onConfirmar} />);

    elegirUnidadNegocio('10');
    fireEvent.change(screen.getByLabelText(/marca para filas sin marca reconocida/i), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({
        filasDecididas: expect.arrayContaining([
          expect.objectContaining({ datosOriginales: ANALISIS_EJEMPLO.filas[1].datosOriginales, decision: 'importar', marcaId: 3, unidadNegocioId: 10, resueltoManualmente: true }),
        ]),
      })
    );
  });

  it('al elegir un servicio global, resuelve automáticamente las filas "pendiente-servicio"', () => {
    const onConfirmar = vi.fn();
    const analisisConServicioPendiente = {
      ...ANALISIS_EJEMPLO,
      filas: [
        {
          datosOriginales: { Modelo: 'Civic', Comentario: '' },
          estado: 'pendiente-servicio',
          candidatosResolucion: ANALISIS_EJEMPLO.catalogo.lineasNegocio,
          marcaIdResuelto: 2,
        },
      ],
    };
    renderComo(ADMIN, <ImportadorRevision analisis={analisisConServicioPendiente} onConfirmar={onConfirmar} />);

    elegirUnidadNegocio('10');
    fireEvent.change(screen.getByLabelText(/servicio para filas sin servicio reconocido/i), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({
        filasDecididas: expect.arrayContaining([
          expect.objectContaining({ decision: 'importar', marcaId: 2, unidadNegocioId: 10, servicioId: 6, resueltoManualmente: true }),
        ]),
      })
    );
  });

  it('editar una celda de texto inline cambia el valor enviado en datosOriginales al confirmar', () => {
    const onConfirmar = vi.fn();
    renderComo(ADMIN, <ImportadorRevision analisis={ANALISIS_EJEMPLO} onConfirmar={onConfirmar} />);

    elegirUnidadNegocio('10');
    const celdaModelo = screen.getByDisplayValue('Sentra');
    fireEvent.change(celdaModelo, { target: { value: 'Sentra XE' } });

    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({
        filasDecididas: expect.arrayContaining([
          expect.objectContaining({ datosOriginales: { Modelo: 'Sentra XE', Comentario: '' }, decision: 'importar' }),
        ]),
      })
    );
  });

  it('una fila "error" se puede rescatar eligiendo marca manualmente, sin re-subir el archivo', () => {
    const onConfirmar = vi.fn();
    const analisisConError = {
      ...ANALISIS_EJEMPLO,
      filas: [{ datosOriginales: { Modelo: '', Comentario: '' }, estado: 'error', motivoError: 'campo obligatorio faltante: modelo' }],
    };
    renderComo(ADMIN, <ImportadorRevision analisis={analisisConError} onConfirmar={onConfirmar} />);

    elegirUnidadNegocio('10');
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: 'Civic' } });
    fireEvent.change(screen.getByLabelText(/fila 1.*marca/i), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({
        filasDecididas: [
          expect.objectContaining({ datosOriginales: { Modelo: 'Civic', Comentario: '' }, decision: 'importar', marcaId: 2, unidadNegocioId: 10, resueltoManualmente: true }),
        ],
      })
    );
  });

  it('la marca global no pisa una fila que el usuario decidió descartar explícitamente', () => {
    const onConfirmar = vi.fn();
    renderComo(ADMIN, <ImportadorRevision analisis={ANALISIS_EJEMPLO} onConfirmar={onConfirmar} />);

    elegirUnidadNegocio('10');
    fireEvent.change(screen.getByLabelText(/marca para filas sin marca reconocida/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/fila 2.*marca/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({
        filasDecididas: expect.arrayContaining([
          expect.objectContaining({ datosOriginales: ANALISIS_EJEMPLO.filas[1].datosOriginales, decision: 'descartar' }),
        ]),
      })
    );
  });
});
