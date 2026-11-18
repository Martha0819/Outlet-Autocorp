import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportadorInventario } from '../ImportadorInventario';

const ANALISIS = {
  mapeoSugerido: [{ columna: 'Modelo', campo: 'modelo' }],
  filas: [
    {
      datosOriginales: { Modelo: 'Sentra' },
      estado: 'lista',
      valoresResueltos: { nombre: 'Auto', modelo: 'Sentra', anio: 2020, marcaId: 1, unidadNegocioId: 10 },
    },
  ],
  catalogo: { marcas: [], unidadesNegocio: [] },
};

const RESUMEN = { importados: { cuenta: 1, lista: [] }, conError: { cuenta: 0, lista: [] }, resueltosManualmente: 0 };

function archivoCsv() {
  return new File(['Modelo\nSentra\n'], 'lote.csv', { type: 'text/csv' });
}

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
    render(<ImportadorInventario onImportacionCompleta={onImportacionCompleta} />);

    const input = screen.getByLabelText(/seleccionar archivo/i);
    fireEvent.change(input, { target: { files: [archivoCsv()] } });

    await waitFor(() => expect(screen.getByRole('button', { name: /confirmar importación/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    await waitFor(() => expect(screen.getByText('Resumen de la importación')).toBeInTheDocument());
    expect(onImportacionCompleta).toHaveBeenCalledWith(RESUMEN);
  });
});
