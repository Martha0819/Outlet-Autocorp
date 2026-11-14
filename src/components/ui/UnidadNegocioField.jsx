'use client';

import React, { useEffect } from 'react';

// Un no-Administrador solo opera en su propia unidad — el servidor ya lo
// fuerza así (ver requirePermiso/esAdministrador en cada ruta), esto solo
// hace que la UI no le ofrezca elegir una unidad que de todos modos el
// servidor va a ignorar o rechazar.
export function UnidadNegocioField({
  value,
  onChange,
  unidadesNegocio,
  esAdministrador,
  miUnidadNegocioId,
  inputStyle,
  optional = false,
  optionalLabel = 'Toda la unidad / evento (opcional)',
}) {
  useEffect(() => {
    if (!esAdministrador && value !== miUnidadNegocioId) {
      onChange(String(miUnidadNegocioId ?? ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esAdministrador, miUnidadNegocioId]);

  if (esAdministrador) {
    return (
      <select style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{optional ? optionalLabel : 'Unidad de negocio…'}</option>
        {unidadesNegocio.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
      </select>
    );
  }

  const miUnidad = unidadesNegocio.find((u) => u.id === miUnidadNegocioId);
  return (
    <input
      type="text"
      value={miUnidad?.nombre || 'Mi unidad de negocio'}
      disabled
      title="Solo puedes operar en tu propia unidad de negocio"
      style={{ ...inputStyle, backgroundColor: '#f3f1f0', color: '#8e8784', cursor: 'not-allowed' }}
    />
  );
}
