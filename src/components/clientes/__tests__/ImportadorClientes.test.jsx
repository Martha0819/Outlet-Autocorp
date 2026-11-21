import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportadorClientes } from '../ImportadorClientes';

const ANALISIS = {
  mapeoSugerido: [{ columna: 'Nombre', campo: 'nombre' }, { columna: 'Celular', campo: 'telefono' }],
  filas: [
    {
      datosOriginales: { Nombre: 'Juan Perez', Celular: '5512345678' },
      estado: 'lista',
      valoresResueltos: { nombre: 'Juan Perez', telefono: '5512345678', correo: null, numeroAcompanantes: 0, visitaMarcaEspecifica: false, marcaId: null, observaciones: null },
    },
  ],
  catalogo: { marcas: [{ id: 1, nombre: 'Nissan' }] },
};

const RESUMEN = { importados: { cuenta: 1, lista: [] }, conError: { cuenta: 0, lista: [] }, resueltosManualmente: 0 };

function archivoCsv() {
  return new File(['Nombre,Celular\nJuan Perez,5512345678\n'], 'clientes.csv', { type: 'text/csv' });
}

function archivoXlsx() {
  return new File(['contenido-xlsx-simulado'], 'clientes.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

const REQUIERE_HOJA = { requiereHoja: true, hojas: ['Plantilla', 'Noviembre'], hojaActiva: 'Noviembre' };

describe('ImportadorClientes', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sube un archivo, muestra la revisión, confirma y muestra el resumen', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ANALISIS })
      .mockResolvedValueOnce({ ok: true, json: async () => RESUMEN });

    const onImportacionCompleta = vi.fn();
    render(<ImportadorClientes onImportacionCompleta={onImportacionCompleta} />);

    const input = screen.getByLabelText(/seleccionar archivo/i);
    fireEvent.change(input, { target: { files: [archivoCsv()] } });

    await waitFor(() => expect(screen.getByRole('button', { name: /confirmar importación/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /confirmar importación/i }));

    await waitFor(() => expect(screen.getByText('Resumen de la importación')).toBeInTheDocument());
    expect(onImportacionCompleta).toHaveBeenCalledWith(RESUMEN);

    // No se pide unidad de negocio: siempre es la del usuario que importa.
    expect(screen.queryByText(/unidad de negocio/i)).not.toBeInTheDocument();
  });

  it('con un archivo de varias hojas, pide elegir una antes de analizar', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => REQUIERE_HOJA })
      .mockResolvedValueOnce({ ok: true, json: async () => ANALISIS });

    render(<ImportadorClientes onImportacionCompleta={() => {}} />);

    const input = screen.getByLabelText(/seleccionar archivo/i);
    fireEvent.change(input, { target: { files: [archivoXlsx()] } });

    await waitFor(() => expect(screen.getByText(/varias hojas/i)).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/hoja a importar/i), { target: { value: 'Noviembre' } });

    await waitFor(() => expect(screen.getByRole('button', { name: /confirmar importación/i })).toBeInTheDocument());

    const segundaLlamada = global.fetch.mock.calls[1];
    const formDataEnviado = segundaLlamada[1].body;
    expect(formDataEnviado.get('hoja')).toBe('Noviembre');
    expect(formDataEnviado.get('archivo').name).toBe('clientes.xlsx');
  });
});
