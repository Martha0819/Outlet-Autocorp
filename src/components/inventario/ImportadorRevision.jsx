'use client';

import { useState } from 'react';

const CAMPOS_CATALOGO = [
  { valor: '', etiqueta: 'Sin asignar' },
  { valor: 'modelo', etiqueta: 'Modelo' },
  { valor: 'nombre', etiqueta: 'Descripción' },
  { valor: 'anio', etiqueta: 'Año' },
  { valor: 'km', etiqueta: 'Km' },
  { valor: 'vin', etiqueta: 'VIN' },
  { valor: 'transmision', etiqueta: 'Transmisión' },
  { valor: 'condicion', etiqueta: 'Condición' },
  { valor: 'marca', etiqueta: 'Marca' },
  { valor: 'unidadNegocio', etiqueta: 'Unidad de negocio' },
  { valor: 'precio', etiqueta: 'Precio' },
];

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #d5d0ce',
  fontSize: 13,
  backgroundColor: '#ffffff',
  color: '#251f1d',
};

function etiquetaEstado(estado) {
  switch (estado) {
    case 'lista':
      return 'Lista para importar';
    case 'error':
      return 'Error';
    case 'pendiente-marca':
      return 'Falta resolver marca';
    case 'pendiente-unidadNegocio':
      return 'Falta resolver unidad de negocio';
    default:
      return estado;
  }
}

export function ImportadorRevision({ analisis, onConfirmar }) {
  const [mapeo, setMapeo] = useState(analisis.mapeoSugerido);
  const [resoluciones, setResoluciones] = useState({});

  function cambiarCampoMapeo(indice, campo) {
    setMapeo((actual) => actual.map((entrada, i) => (i === indice ? { ...entrada, campo: campo || null } : entrada)));
  }

  function elegirCandidato(indiceFila, candidatoId) {
    setResoluciones((actual) => ({ ...actual, [indiceFila]: candidatoId === '' ? undefined : Number(candidatoId) }));
  }

  function construirFilaDecidida(fila, indice) {
    if (fila.estado === 'lista') {
      return {
        datosOriginales: fila.datosOriginales,
        decision: 'importar',
        marcaId: fila.valoresResueltos.marcaId,
        unidadNegocioId: fila.valoresResueltos.unidadNegocioId,
        resueltoManualmente: false,
      };
    }

    if (fila.estado === 'pendiente-marca' || fila.estado === 'pendiente-unidadNegocio') {
      const elegido = resoluciones[indice];
      if (elegido === undefined) {
        return { datosOriginales: fila.datosOriginales, decision: 'descartar' };
      }
      const marcaId = fila.estado === 'pendiente-marca' ? elegido : fila.marcaIdResuelto;
      const unidadNegocioId = fila.estado === 'pendiente-unidadNegocio' ? elegido : fila.unidadNegocioIdResuelto;
      return { datosOriginales: fila.datosOriginales, decision: 'importar', marcaId, unidadNegocioId, resueltoManualmente: true };
    }

    // estado === 'error'
    return { datosOriginales: fila.datosOriginales, decision: 'descartar', motivoDescartado: fila.motivoError };
  }

  function confirmar() {
    const filasDecididas = analisis.filas.map((fila, indice) => construirFilaDecidida(fila, indice));
    onConfirmar({ mapeoFinal: mapeo, filasDecididas });
  }

  return (
    <div>
      <h3>Mapeo de columnas</h3>
      <table>
        <tbody>
          {mapeo.map((entrada, indice) => (
            <tr key={entrada.columna}>
              <td>
                <label htmlFor={`mapeo-${indice}`}>{entrada.columna}</label>
              </td>
              <td>
                <select
                  id={`mapeo-${indice}`}
                  style={inputStyle}
                  value={entrada.campo || ''}
                  onChange={(e) => cambiarCampoMapeo(indice, e.target.value)}
                >
                  {CAMPOS_CATALOGO.map((c) => (
                    <option key={c.valor} value={c.valor}>
                      {c.etiqueta}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Filas</h3>
      <table>
        <tbody>
          {analisis.filas.map((fila, indice) => {
            const esPendiente = fila.estado === 'pendiente-marca' || fila.estado === 'pendiente-unidadNegocio';
            const candidatos = esPendiente ? fila.candidatosResolucion : [];
            const tipoPendiente = fila.estado === 'pendiente-marca' ? 'marca' : 'unidad de negocio';
            return (
              <tr key={indice}>
                <td>Fila {indice + 1}</td>
                <td>{etiquetaEstado(fila.estado)}</td>
                <td>{fila.estado === 'error' ? fila.motivoError : null}</td>
                <td>
                  {esPendiente ? (
                    <>
                      <label htmlFor={`resolucion-${indice}`}>{`Fila ${indice + 1} — elegir ${tipoPendiente}`}</label>
                      <select
                        id={`resolucion-${indice}`}
                        style={inputStyle}
                        value={resoluciones[indice] ?? ''}
                        onChange={(e) => elegirCandidato(indice, e.target.value)}
                      >
                        <option value="">Descartar fila</option>
                        {candidatos.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button type="button" onClick={confirmar}>
        Confirmar importación
      </button>
    </div>
  );
}
