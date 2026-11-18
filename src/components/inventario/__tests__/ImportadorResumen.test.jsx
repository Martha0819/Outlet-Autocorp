import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImportadorResumen } from '../ImportadorResumen';

const RESUMEN_EJEMPLO = {
  importados: { cuenta: 3, lista: [] },
  conError: {
    cuenta: 2,
    lista: [
      { datosOriginales: { Modelo: 'Sentra' }, motivo: 'VIN duplicado' },
      { datosOriginales: { Modelo: 'Civic' }, motivo: 'campo obligatorio faltante: marca' },
    ],
  },
  resueltosManualmente: 1,
};

describe('ImportadorResumen', () => {
  it('muestra los tres números del resumen', () => {
    render(<ImportadorResumen resumen={RESUMEN_EJEMPLO} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('muestra el motivo de cada fila con error', () => {
    render(<ImportadorResumen resumen={RESUMEN_EJEMPLO} />);

    expect(screen.getByText('VIN duplicado')).toBeInTheDocument();
    expect(screen.getByText('campo obligatorio faltante: marca')).toBeInTheDocument();
  });
});
