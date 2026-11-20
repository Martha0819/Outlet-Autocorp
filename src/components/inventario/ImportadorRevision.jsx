'use client';

import { useState } from 'react';
import { CheckIcon } from '@/components/ui/Icons';
import { usePermiso } from '@/store/features/auth/usePermiso';
import { useAppSelector } from '@/store/hooks';
import { UnidadNegocioField } from '@/components/ui/UnidadNegocioField';

// Campos resueltos contra un catálogo (marca/servicio): se muestran como
// <select> de candidatos, nunca como texto libre, porque lo que de verdad
// viaja al backend es el id resuelto, no el texto. La unidad de negocio NO
// entra aquí: es una sola para todo el archivo (ver unidadNegocioUnica).
const CAMPOS_CATALOGO = ['marca', 'servicio'];

const ETIQUETA_CAMPO_CATALOGO = { marca: 'marca', servicio: 'servicio' };

const CAMPOS_MAPEO = [
  { valor: '', etiqueta: 'Sin asignar' },
  { valor: 'modelo', etiqueta: 'Modelo' },
  { valor: 'nombre', etiqueta: 'Descripción' },
  { valor: 'anio', etiqueta: 'Año' },
  { valor: 'km', etiqueta: 'Km' },
  { valor: 'vin', etiqueta: 'VIN' },
  { valor: 'transmision', etiqueta: 'Transmisión' },
  { valor: 'marca', etiqueta: 'Marca' },
  { valor: 'servicio', etiqueta: 'Servicio' },
  { valor: 'precioSinIva', etiqueta: 'Precio sin IVA' },
  { valor: 'precioLista', etiqueta: 'Precio de lista' },
  { valor: 'precioRemate', etiqueta: 'Precio remate' },
  { valor: 'bono', etiqueta: 'Bono (si aplica)' },
  { valor: 'diasInventario', etiqueta: 'Días en inventario' },
];

const ESTADO_INFO = {
  lista: { etiqueta: 'Lista', bg: '#dcfce7', color: '#16a34a' },
  error: { etiqueta: 'Error', bg: '#fee2e2', color: '#dc2626' },
  'pendiente-marca': { etiqueta: 'Falta marca', bg: '#fef3c7', color: '#d97706' },
  'pendiente-servicio': { etiqueta: 'Falta servicio', bg: '#fef3c7', color: '#d97706' },
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

export function ImportadorRevision({ analisis, onConfirmar }) {
  const { esAdministrador } = usePermiso();
  const usuarioActual = useAppSelector((state) => state.auth.usuario);
  const [mapeo, setMapeo] = useState(analisis.mapeoSugerido);
  // { [indice]: { marca?: id|null, servicio?: id|null } }
  // id = elegido explícitamente; null = "descartar este campo" explícito; ausente = no tocado.
  const [resoluciones, setResoluciones] = useState({});
  const [marcaGlobal, setMarcaGlobal] = useState('');
  const [servicioGlobal, setServicioGlobal] = useState('');
  // Una sola unidad de negocio para todo el archivo (no varía por fila).
  const [unidadNegocioUnica, setUnidadNegocioUnica] = useState(
    esAdministrador ? '' : String(usuarioActual?.unidadNegocioId ?? '')
  );
  // Edición inline de celdas: { [indice]: { [columnaDelArchivo]: valorEditado } }
  const [edicionesFila, setEdicionesFila] = useState({});

  const catalogoPorCampo = {
    marca: analisis.catalogo.marcas,
    servicio: analisis.catalogo.lineasNegocio ?? [],
  };
  const globalPorCampo = { marca: marcaGlobal, servicio: servicioGlobal };

  function cambiarCampoMapeo(indice, campo) {
    setMapeo((actual) => actual.map((entrada, i) => (i === indice ? { ...entrada, campo: campo || null } : entrada)));
  }

  function editarCelda(indiceFila, columna, valor) {
    setEdicionesFila((actual) => ({ ...actual, [indiceFila]: { ...actual[indiceFila], [columna]: valor } }));
  }

  function elegirCandidato(indiceFila, campo, candidatoId) {
    setResoluciones((actual) => ({
      ...actual,
      [indiceFila]: { ...actual[indiceFila], [campo]: candidatoId === '' ? null : Number(candidatoId) },
    }));
  }

  function datosOriginalesEfectivos(fila, indice) {
    return { ...fila.datosOriginales, ...(edicionesFila[indice] || {}) };
  }

  // Resuelve el id de un campo-catálogo para DECIDIR si la fila se importa:
  // null (descartado a propósito) cuenta como "sin resolver" → la fila no se importa.
  function idResuelto(indice, campo, fila) {
    const guardado = resoluciones[indice]?.[campo];
    if (guardado === null) return undefined;
    if (guardado !== undefined) return guardado;
    return automaticoDeFila(fila, campo) ?? valorGlobalNumerico(campo);
  }

  // Resuelve el valor a MOSTRAR en el <select>: null se muestra vacío.
  function idMostrado(indice, campo, fila) {
    const guardado = resoluciones[indice]?.[campo];
    if (guardado === null) return '';
    if (guardado !== undefined) return guardado;
    return automaticoDeFila(fila, campo) ?? valorGlobalNumerico(campo) ?? '';
  }

  function automaticoDeFila(fila, campo) {
    const key = `${campo}Id`;
    if (fila.estado === 'lista') return fila.valoresResueltos[key] ?? undefined;
    return fila[`${key}Resuelto`];
  }

  function valorGlobalNumerico(campo) {
    const g = globalPorCampo[campo];
    return g ? Number(g) : undefined;
  }

  function construirFilaDecidida(fila, indice) {
    const datosOriginales = datosOriginalesEfectivos(fila, indice);

    const marcaId = idResuelto(indice, 'marca', fila);
    const servicioId = idResuelto(indice, 'servicio', fila);
    const unidadNegocioId = unidadNegocioUnica ? Number(unidadNegocioUnica) : undefined;

    if (marcaId === undefined || unidadNegocioId === undefined) {
      return { datosOriginales, decision: 'descartar', motivoDescartado: fila.estado === 'error' ? fila.motivoError : undefined };
    }

    // Para una fila "lista" sin ningún toque manual, resueltoManualmente queda
    // en false (coincide con lo que de verdad resolvió el análisis automático).
    const tocoAlgo = ['marca', 'servicio'].some((campo) => resoluciones[indice]?.[campo] !== undefined);
    return {
      datosOriginales,
      decision: 'importar',
      marcaId,
      unidadNegocioId,
      servicioId: servicioId ?? null,
      resueltoManualmente: fila.estado !== 'lista' || tocoAlgo,
    };
  }

  function confirmar() {
    if (!unidadNegocioUnica) return;
    const filasDecididas = analisis.filas.map((fila, indice) => construirFilaDecidida(fila, indice));
    onConfirmar({ mapeoFinal: mapeo, filasDecididas });
  }

  // Muestra SIEMPRE todas las columnas del archivo con sus valores en vivo,
  // reconocidas o no — una cabecera que el mapeo automático no identificó
  // nunca debe desaparecer de la vista: eso es justo lo que oculta datos.
  // Las columnas resueltas contra catálogo (marca/servicio) se excluyen aquí
  // porque ya tienen su propia celda de resolución más adelante.
  const columnasVisibles = mapeo.filter((entrada) => !CAMPOS_CATALOGO.includes(entrada.campo));

  return (
    <div>
      <div style={cardStyle}>
        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#251f1d', margin: '0 0 12px' }}>Mapeo de columnas del archivo</h3>

        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #eae7e5' }}>
          <label htmlFor="unidad-negocio-unica" style={labelStyle}>Unidad de negocio de este inventario (aplica a todas las filas)</label>
          <div style={{ maxWidth: 260 }}>
            <UnidadNegocioField
              id="unidad-negocio-unica"
              value={unidadNegocioUnica}
              onChange={setUnidadNegocioUnica}
              unidadesNegocio={analisis.catalogo.unidadesNegocio}
              esAdministrador={esAdministrador}
              miUnidadNegocioId={usuarioActual?.unidadNegocioId}
              inputStyle={inputStyle}
            />
          </div>
          {!unidadNegocioUnica && (
            <div style={{ fontSize: 11, color: '#dc2626', marginTop: 6 }}>Elige una unidad de negocio para poder confirmar la importación.</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {mapeo.map((entrada, indice) => (
            <div key={entrada.columna} style={{ flex: '0 1 180px' }}>
              <label htmlFor={`mapeo-${indice}`} style={labelStyle}>{entrada.columna}</label>
              <select
                id={`mapeo-${indice}`}
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
          <label htmlFor="marca-global" style={labelStyle}>Marca para filas sin marca reconocida (opcional)</label>
          <select id="marca-global" style={inputStyle} value={marcaGlobal} onChange={(e) => setMarcaGlobal(e.target.value)}>
            <option value="">Sin marca por defecto</option>
            {analisis.catalogo.marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
        <div style={{ flex: '0 1 260px' }}>
          <label htmlFor="servicio-global" style={labelStyle}>Servicio para filas sin servicio reconocido (opcional)</label>
          <select id="servicio-global" style={inputStyle} value={servicioGlobal} onChange={(e) => setServicioGlobal(e.target.value)}>
            <option value="">Sin servicio por defecto</option>
            {(analisis.catalogo.lineasNegocio ?? []).map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
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
                <th style={{ padding: '12px 16px', color: '#ffffff', fontSize: 10, fontWeight: 800, letterSpacing: '0.6px' }}>MARCA / SERVICIO</th>
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
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {CAMPOS_CATALOGO.map((campo) => (
                          <div key={campo} style={{ flex: '0 1 150px' }}>
                            <label htmlFor={`resolucion-${indice}-${campo}`} style={labelStyle}>
                              {`Fila ${indice + 1} — ${ETIQUETA_CAMPO_CATALOGO[campo]}`}
                            </label>
                            <select
                              id={`resolucion-${indice}-${campo}`}
                              style={inputStyle}
                              value={idMostrado(indice, campo, fila)}
                              onChange={(e) => elegirCandidato(indice, campo, e.target.value)}
                            >
                              <option value="">{campo === 'servicio' ? 'Sin servicio' : 'Descartar fila'}</option>
                              {catalogoPorCampo[campo].map((c) => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
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
          disabled={!unidadNegocioUnica}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: unidadNegocioUnica ? '#ff8901' : '#e2dedc',
            color: '#251f1d',
            border: 'none',
            padding: '11px 24px',
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 800,
            cursor: unidadNegocioUnica ? 'pointer' : 'not-allowed',
          }}
        >
          <CheckIcon size={16} /> Confirmar importación
        </button>
      </div>
    </div>
  );
}
