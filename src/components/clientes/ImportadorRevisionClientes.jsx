'use client';

import { useState } from 'react';
import { CheckIcon } from '@/components/ui/Icons';

// Mismo patrón que ImportadorRevision (inventario): mapeo editable de
// columnas, todas las columnas del archivo visibles aunque no se hayan
// reconocido, y los campos resueltos contra catálogo (aquí solo "marca")
// con su propio selector de candidatos. No hay unidad de negocio que
// elegir: igual que el alta manual, siempre es la del usuario que importa.
const CAMPOS_CATALOGO = ['marca'];

const CAMPOS_MAPEO = [
  { valor: '', etiqueta: 'Sin asignar' },
  { valor: 'nombre', etiqueta: 'Nombre' },
  { valor: 'telefono', etiqueta: 'Celular' },
  { valor: 'correo', etiqueta: 'Correo' },
  { valor: 'numeroAcompanantes', etiqueta: 'Acompañantes' },
  { valor: 'visitaMarcaEspecifica', etiqueta: '¿Visita una marca en específico?' },
  { valor: 'marca', etiqueta: 'Marca' },
  { valor: 'observaciones', etiqueta: 'Comentarios' },
];

const ESTADO_INFO = {
  lista: { etiqueta: 'Lista', bg: '#dcfce7', color: '#16a34a' },
  error: { etiqueta: 'Error', bg: '#fee2e2', color: '#dc2626' },
  'pendiente-marca': { etiqueta: 'Falta marca', bg: '#fef3c7', color: '#d97706' },
};

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  border: '1px solid #eae7e5',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  padding: '16px 20px',
  marginBottom: 20,
};

const inputStyle = {
  width: '100%',
  minWidth: 110,
  padding: '7px 10px',
  borderRadius: 8,
  border: '1px solid #d5d0ce',
  fontSize: 12,
  backgroundColor: '#ffffff',
  color: '#251f1d',
};

const labelStyle = { fontSize: 11, fontWeight: 700, color: '#6e6764', display: 'block', marginBottom: 6 };

function Badge({ estado }) {
  const info = ESTADO_INFO[estado] || { etiqueta: estado, bg: '#f3f4f6', color: '#4b5563' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 700,
        backgroundColor: info.bg,
        color: info.color,
        whiteSpace: 'nowrap',
      }}
    >
      {info.etiqueta}
    </span>
  );
}

export function ImportadorRevisionClientes({ analisis, onConfirmar }) {
  const [mapeo, setMapeo] = useState(analisis.mapeoSugerido);
  // { [indice]: id|null } — id = elegido explícitamente; null = "descartar
  // fila" explícito; ausente = no tocado (se usa lo que resolvió el análisis).
  const [resoluciones, setResoluciones] = useState({});
  const [marcaGlobal, setMarcaGlobal] = useState('');
  // Edición inline de celdas: { [indice]: { [columnaDelArchivo]: valorEditado } }
  const [edicionesFila, setEdicionesFila] = useState({});

  function cambiarCampoMapeo(indice, campo) {
    setMapeo((actual) => actual.map((entrada, i) => (i === indice ? { ...entrada, campo: campo || null } : entrada)));
  }

  function editarCelda(indiceFila, columna, valor) {
    setEdicionesFila((actual) => ({ ...actual, [indiceFila]: { ...actual[indiceFila], [columna]: valor } }));
  }

  function elegirCandidato(indiceFila, candidatoId) {
    setResoluciones((actual) => ({ ...actual, [indiceFila]: candidatoId === '' ? null : Number(candidatoId) }));
  }

  function datosOriginalesEfectivos(fila, indice) {
    return { ...fila.datosOriginales, ...(edicionesFila[indice] || {}) };
  }

  // Resuelve el id de marca para DECIDIR si la fila se importa. A diferencia
  // del importador de inventario (donde marca es obligatoria), aquí elegir
  // "Sin marca" a propósito en una fila pendiente SÍ importa la fila —
  // simplemente sin marca específica. Solo queda "sin resolver" (y por lo
  // tanto se descarta) una fila pendiente que nadie tocó y sin marca global.
  function marcaIdResuelto(indice, fila) {
    const guardado = resoluciones[indice];
    if (guardado !== undefined) return guardado;
    if (fila.estado === 'lista') return fila.valoresResueltos.marcaId ?? null;
    return marcaGlobal ? Number(marcaGlobal) : undefined;
  }

  function marcaIdMostrado(indice, fila) {
    const guardado = resoluciones[indice];
    if (guardado === null) return '';
    if (guardado !== undefined) return guardado;
    if (fila.estado === 'lista') return fila.valoresResueltos.marcaId ?? '';
    return marcaGlobal || '';
  }

  function construirFilaDecidida(fila, indice) {
    const datosOriginales = datosOriginalesEfectivos(fila, indice);

    if (fila.estado === 'error') {
      return { datosOriginales, decision: 'descartar', motivoDescartado: fila.motivoError };
    }

    const marcaId = marcaIdResuelto(indice, fila);
    if (fila.estado === 'pendiente-marca' && marcaId === undefined) {
      return { datosOriginales, decision: 'descartar' };
    }

    const tocoMarca = resoluciones[indice] !== undefined;
    return {
      datosOriginales,
      decision: 'importar',
      marcaId: marcaId ?? null,
      resueltoManualmente: fila.estado !== 'lista' || tocoMarca,
    };
  }

  function confirmar() {
    const filasDecididas = analisis.filas.map((fila, indice) => construirFilaDecidida(fila, indice));
    onConfirmar({ mapeoFinal: mapeo, filasDecididas });
  }

  // Todas las columnas del archivo quedan visibles con sus valores en vivo,
  // reconocidas o no — nunca se oculta una columna solo porque no se supo
  // mapear. "marca" se excluye porque ya tiene su propia celda de resolución.
  const columnasVisibles = mapeo.filter((entrada) => !CAMPOS_CATALOGO.includes(entrada.campo));

  return (
    <div>
      <div style={cardStyle}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#251f1d', margin: '0 0 12px' }}>Mapeo de columnas del archivo</h3>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {mapeo.map((entrada, indice) => (
            <div key={entrada.columna} style={{ flex: '0 1 180px' }}>
              <label htmlFor={`mapeo-cliente-${indice}`} style={labelStyle}>{entrada.columna}</label>
              <select
                id={`mapeo-cliente-${indice}`}
                style={inputStyle}
                value={entrada.campo || ''}
                onChange={(e) => cambiarCampoMapeo(indice, e.target.value)}
              >
                {CAMPOS_MAPEO.map((c) => (
                  <option key={c.valor} value={c.valor}>{c.etiqueta}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '0 1 260px' }}>
          <label htmlFor="marca-global-clientes" style={labelStyle}>Marca para filas sin marca reconocida (opcional)</label>
          <select id="marca-global-clientes" style={inputStyle} value={marcaGlobal} onChange={(e) => setMarcaGlobal(e.target.value)}>
            <option value="">Sin marca por defecto</option>
            {analisis.catalogo.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#251f1d' }}>
                <th style={{ padding: '12px 16px', color: '#ffffff', fontSize: 10, fontWeight: 800, letterSpacing: '0.6px' }}>FILA</th>
                <th style={{ padding: '12px 16px', color: '#ffffff', fontSize: 10, fontWeight: 800, letterSpacing: '0.6px' }}>ESTADO</th>
                {columnasVisibles.map((entrada) => (
                  <th key={entrada.columna} style={{ padding: '12px 16px', color: entrada.campo ? '#ffffff' : '#fde68a', fontSize: 10, fontWeight: 800, letterSpacing: '0.6px' }}>
                    {entrada.columna}
                    {!entrada.campo && <div style={{ fontWeight: 600, fontSize: 9, textTransform: 'none', letterSpacing: 0 }}>Sin asignar</div>}
                  </th>
                ))}
                <th style={{ padding: '12px 16px', color: '#ffffff', fontSize: 10, fontWeight: 800, letterSpacing: '0.6px' }}>MARCA</th>
              </tr>
            </thead>
            <tbody>
              {analisis.filas.map((fila, indice) => {
                const datos = datosOriginalesEfectivos(fila, indice);
                return (
                  <tr key={indice} style={{ borderBottom: '1px solid #eae7e5' }}>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#8e8784', fontWeight: 700 }}>{indice + 1}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <Badge estado={fila.estado} />
                      {fila.estado === 'error' && (
                        <div style={{ fontSize: 10, color: '#dc2626', marginTop: 4, maxWidth: 160 }}>{fila.motivoError}</div>
                      )}
                    </td>
                    {columnasVisibles.map((entrada) => {
                      const valor = datos[entrada.columna] ?? '';
                      return (
                        <td key={entrada.columna} style={{ padding: '10px 16px' }}>
                          <input style={inputStyle} value={valor} onChange={(e) => editarCelda(indice, entrada.columna, e.target.value)} />
                        </td>
                      );
                    })}
                    <td style={{ padding: '10px 16px' }}>
                      {fila.estado !== 'error' && (
                        <div style={{ flex: '0 1 150px' }}>
                          <label htmlFor={`resolucion-cliente-${indice}`} style={labelStyle}>{`Fila ${indice + 1} — marca`}</label>
                          <select
                            id={`resolucion-cliente-${indice}`}
                            style={inputStyle}
                            value={marcaIdMostrado(indice, fila)}
                            onChange={(e) => elegirCandidato(indice, e.target.value)}
                          >
                            <option value="">Sin marca</option>
                            {analisis.catalogo.marcas.map((m) => (
                              <option key={m.id} value={m.id}>{m.nombre}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        <button
          type="button"
          onClick={confirmar}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#ff8901',
            color: '#251f1d',
            border: 'none',
            padding: '11px 24px',
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <CheckIcon size={16} /> Confirmar importación
        </button>
      </div>
    </div>
  );
}
