import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ImportadorInventario } from '../ImportadorInventario';

function renderComoAdmin(ui) {
  const estado = { auth: { usuario: { esAdministrador: true, unidadNegocioId: null, permisos: [] } } };
  const store = {
    getState: () => estado,
    subscribe: () => () => {},
    dispatch: () => {},
  };
  return render(<Provider store={store}>{ui}</Provider>);
}

const ANALISIS = {
  mapeoSugerido: [{ columna: 'Modelo', campo: 'modelo' }],
  filas: [
    {
      datosOriginales: { Modelo: 'Sentra' },
      estado: 'lista',
      valoresResueltos: { nombre: 'Auto', modelo: 'Sentra', anio: 2020, marcaId: 1 },
    },
  ],
  catalogo: { marcas: [], unidadesNegocio: [{ id: 10, nombre: 'Matriz' }], lineasNegocio: [] },
};

const RESUMEN = { importados: { cuenta: 1, lista: [] }, conError: { cuenta: 0, lista: [] }, resueltosManualmente: 0 };

function archivoCsv() {
  return new File(['Modelo\nSentra\n'], 'lote.csv', { type: 'text/csv' });
}

function archivoXlsx() {
  return new File(['contenido-xlsx-simulado'], 'lote.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

const REQUIERE_HOJA = { requiereHoja: true, hojas: ['Plantilla', 'Noviembre'], hojaActiva: 'Noviembre' };

describe('ImportadorInventario', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sube un archivo, muestra la pantalla de revisión, confirma y muestra el resumen', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ANALISIS })
      .mockResolvedValueOnce({ ok: true, json: async () => RESUMEN });

    const onImportacionCompleta = vi.fn();
    renderComoAdmin(<ImportadorInventario onImportacionCompleta={onImportacionCompleta} />);

    const input = screen.getByLabelText(/seleccionar archivo/i);
    fireEvent.change(input, { target: { files: [archivoCsv()] } });

    await waitFor(() => expect(screen.getByRole('button', { name: /confirmar importación/i })).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/unidad de negocio de este inventario/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    await waitFor(() => expect(screen.getByText('Resumen de la importación')).toBeInTheDocument());
    expect(onImportacionCompleta).toHaveBeenCalledWith(RESUMEN);
  });

  it('con un archivo de varias hojas, pide elegir una y la analiza sin mezclar las demás', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => REQUIERE_HOJA })
      .mockResolvedValueOnce({ ok: true, json: async () => ANALISIS });

    renderComoAdmin(<ImportadorInventario onImportacionCompleta={() => {}} />);

    const input = screen.getByLabelText(/seleccionar archivo/i);
    fireEvent.change(input, { target: { files: [archivoXlsx()] } });

    await waitFor(() => expect(screen.getByText(/varias hojas/i)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /confirmar importación/i })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/hoja a importar/i), { target: { value: 'Noviembre' } });

    await waitFor(() => expect(screen.getByRole('button', { name: /confirmar importación/i })).toBeInTheDocument());

    // La segunda llamada reutiliza el mismo archivo ya elegido y manda la hoja.
    const segundaLlamada = global.fetch.mock.calls[1];
    const formDataEnviado = segundaLlamada[1].body;
    expect(formDataEnviado.get('hoja')).toBe('Noviembre');
    expect(formDataEnviado.get('archivo').name).toBe('lote.xlsx');
  });
});
