'use client';

import { useState } from 'react';
import { ImportadorRevision } from './ImportadorRevision';
import { ImportadorResumen } from './ImportadorResumen';

export function ImportadorInventario({ onImportacionCompleta }) {
  const [analisis, setAnalisis] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function subirArchivo(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setError(null);
    setCargando(true);
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      const respuesta = await fetch('/api/importador-vehiculos/analizar', { method: 'POST', body: formData });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) {
        setError(cuerpo.error || 'No se pudo leer el archivo.');
        return;
      }
      setAnalisis(cuerpo);
    } finally {
      setCargando(false);
    }
  }

  async function confirmarImportacion(payload) {
    setCargando(true);
    try {
      const respuesta = await fetch('/api/importador-vehiculos/confirmar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) {
        setError(cuerpo.error || 'No se pudo confirmar la importación.');
        return;
      }
      setResumen(cuerpo);
      onImportacionCompleta?.(cuerpo);
    } finally {
      setCargando(false);
    }
  }

  if (resumen) {
    return <ImportadorResumen resumen={resumen} />;
  }

  return (
    <div>
      {!analisis && (
        <div>
          <label htmlFor="importador-archivo">Seleccionar archivo (CSV o Excel)</label>
          <input id="importador-archivo" type="file" accept=".csv,.xlsx" onChange={subirArchivo} disabled={cargando} />
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {analisis && <ImportadorRevision analisis={analisis} onConfirmar={confirmarImportacion} />}
    </div>
  );
}
