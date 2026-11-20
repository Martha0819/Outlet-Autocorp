'use client';

import { useState } from 'react';
import { ImportadorRevision } from './ImportadorRevision';
import { ImportadorResumen } from './ImportadorResumen';
import { FileTextIcon } from '@/components/ui/Icons';

export function ImportadorInventario({ onImportacionCompleta }) {
  const [analisis, setAnalisis] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  // El archivo se conserva para poder re-analizarlo con otra hoja elegida,
  // sin pedirle al usuario que lo vuelva a seleccionar.
  const [archivoActual, setArchivoActual] = useState(null);
  const [seleccionHojas, setSeleccionHojas] = useState(null); // { hojas, hojaActiva }

  async function analizarArchivo(archivo, hoja) {
    setError(null);
    setCargando(true);
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      if (hoja) formData.append('hoja', hoja);
      const respuesta = await fetch('/api/importador-vehiculos/analizar', { method: 'POST', body: formData });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) {
        setError(cuerpo.error || 'No se pudo leer el archivo.');
        return;
      }
      // Varias hojas en el archivo: nunca se adivina ni se combinan — se le
      // pide al usuario elegir cuál analizar, una a la vez.
      if (cuerpo.requiereHoja) {
        setSeleccionHojas({ hojas: cuerpo.hojas, hojaActiva: cuerpo.hojaActiva });
        return;
      }
      setSeleccionHojas(null);
      setAnalisis(cuerpo);
    } finally {
      setCargando(false);
    }
  }

  async function subirArchivo(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setArchivoActual(archivo);
    await analizarArchivo(archivo);
  }

  async function elegirHoja(hoja) {
    if (!archivoActual) return;
    await analizarArchivo(archivoActual, hoja);
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
      {!analisis && !seleccionHojas && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            padding: '32px 20px',
            borderRadius: 16,
            border: '2px dashed #d5d0ce',
            backgroundColor: '#fafaf9',
            textAlign: 'center',
          }}
        >
          <FileTextIcon size={28} className="text-[#ff8901]" />
          <label htmlFor="importador-archivo" style={{ fontSize: 13, fontWeight: 800, color: '#251f1d', cursor: 'pointer' }}>
            Seleccionar archivo (CSV o Excel)
          </label>
          <span style={{ fontSize: 11, color: '#8e8784' }}>Sube tu lote de inventario para revisarlo antes de importar</span>
          <input
            id="importador-archivo"
            type="file"
            accept=".csv,.xlsx"
            onChange={subirArchivo}
            disabled={cargando}
            style={{ marginTop: 6, fontSize: 12 }}
          />
          {cargando && <span style={{ fontSize: 12, color: '#8e8784' }}>Analizando archivo…</span>}
        </div>
      )}
      {!analisis && seleccionHojas && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            padding: '32px 20px',
            borderRadius: 16,
            border: '1px solid #eae7e5',
            backgroundColor: '#ffffff',
            textAlign: 'center',
          }}
        >
          <FileTextIcon size={28} className="text-[#ff8901]" />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#251f1d' }}>Este archivo tiene varias hojas</span>
          <span style={{ fontSize: 11, color: '#8e8784', maxWidth: 360 }}>
            Elige cuál quieres analizar. Se procesa una hoja a la vez, para no mezclar datos de hojas distintas.
          </span>
          <label htmlFor="importador-hoja" style={{ fontSize: 11, fontWeight: 700, color: '#6e6764', marginTop: 8 }}>Hoja a importar</label>
          <select
            id="importador-hoja"
            defaultValue={seleccionHojas.hojaActiva || ''}
            onChange={(e) => elegirHoja(e.target.value)}
            disabled={cargando}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, minWidth: 200 }}
          >
            <option value="">Selecciona una hoja…</option>
            {seleccionHojas.hojas.map((nombreHoja) => (
              <option key={nombreHoja} value={nombreHoja}>{nombreHoja}</option>
            ))}
          </select>
          {cargando && <span style={{ fontSize: 12, color: '#8e8784' }}>Analizando hoja…</span>}
        </div>
      )}
      {error && (
        <p role="alert" style={{ marginTop: 12, padding: '10px 16px', borderRadius: 10, backgroundColor: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 700 }}>
          {error}
        </p>
      )}
      {analisis && <ImportadorRevision analisis={analisis} onConfirmar={confirmarImportacion} />}
    </div>
  );
}
