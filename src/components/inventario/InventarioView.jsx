'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNotify } from '@/store/features/ui/useNotify';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useGetCatalogoQuery } from '@/store/features/catalogos/catalogoApiSlice';
import {
  useGetVehiculosQuery,
  useCreateVehiculoMutation,
  useUpdateVehiculoMutation,
} from '@/store/features/vehiculos/vehiculoApiSlice';
import { usePermiso } from '@/store/features/auth/usePermiso';
import { useAppSelector } from '@/store/hooks';
import { SearchIcon, PlusIcon, EditIcon, CheckIcon, CloseIcon } from '@/components/ui/Icons';
import { Pager } from '@/components/ui/Pager';
import { UnidadNegocioField } from '@/components/ui/UnidadNegocioField';
import { ImportadorInventario } from './ImportadorInventario';

const ESTATUS_OPTIONS = ['DISPONIBLE', 'APARTADO', 'VENDIDO', 'NO_DISPONIBLE'];
const ESTATUS_LABELS = { DISPONIBLE: 'Disponible', APARTADO: 'Apartado', VENDIDO: 'Vendido', NO_DISPONIBLE: 'No disponible' };
const CONDICION_OPTIONS = ['NUEVO', 'SEMINUEVO'];
const PAGE_SIZE = 15;

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #d5d0ce',
  fontSize: 13,
  backgroundColor: '#ffffff',
  color: '#251f1d'
};

const selectPillStyle = {
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23251f1d' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  padding: '8px 36px 8px 16px',
  borderRadius: 10,
  border: '1px solid #d5d0ce',
  backgroundColor: '#ffffff',
  color: '#251f1d',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
};

function emptyForm() {
  return { nombre: '', modelo: '', anio: '', km: '', vin: '', transmision: '', condicion: 'SEMINUEVO', marcaId: '', unidadNegocioId: '', precio: '' };
}

// Debounce simple: espera 350ms de silencio antes de disparar la búsqueda al
// servidor — si no, cada tecla sería un round-trip completo con paginación.
function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function InventarioView() {
  const notify = useNotify();
  const { puede, esAdministrador } = usePermiso();
  const usuarioActual = useAppSelector((state) => state.auth.usuario);
  const puedeCrear = puede('vehiculo', 'crear');
  const puedeEditar = puede('vehiculo', 'editar');
  const { data: marcas = [] } = useGetCatalogoQuery('marca');
  const { data: unidadesNegocio = [] } = useGetCatalogoQuery('unidad-negocio');
  const [createVehiculo, { isLoading: isCreating }] = useCreateVehiculoMutation();
  const [updateVehiculo] = useUpdateVehiculoMutation();

  const [filterEstatus, setFilterEstatus] = useState('DISPONIBLE');
  const [search, setSearch] = useState('');
  const [marcaFilter, setMarcaFilter] = useState('all');
  const [condicionFilter, setCondicionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);

  const searchDebounced = useDebouncedValue(search);

  // Cualquier cambio de filtro regresa a la página 1 — si no, podrías
  // quedar "parado" en una página 4 que ya no existe para el filtro nuevo.
  useEffect(() => { setPage(1); }, [filterEstatus, marcaFilter, condicionFilter, searchDebounced]);

  const { data, isLoading, refetch: refetchVehiculos } = useGetVehiculosQuery({
    page,
    pageSize: PAGE_SIZE,
    estatus: filterEstatus,
    marcaId: marcaFilter,
    condicion: condicionFilter,
    q: searchDebounced,
  });
  const vehiculosPagina = data?.items ?? [];

  const [showAddRow, setShowAddRow] = useState(false);
  const [showImportador, setShowImportador] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const reportError = async (promise, fallbackMessage) => {
    try {
      await promise.unwrap();
      return true;
    } catch (error) {
      notify(error?.data?.error || fallbackMessage, 'error');
      return false;
    }
  };

  // El orden solo aplica dentro de la página actual (ordenar las 15 filas ya
  // traídas) — un orden consistente entre páginas requeriría ordenar en el
  // servidor, que no se implementó en esta pasada.
  const vehiculosOrdenados = useMemo(() => {
    return [...vehiculosPagina].sort((a, b) => {
      if (sortBy === 'price_asc') return (a.precio ?? 0) - (b.precio ?? 0);
      if (sortBy === 'price_desc') return (b.precio ?? 0) - (a.precio ?? 0);
      if (sortBy === 'year_desc') return b.anio - a.anio;
      return b.id - a.id;
    });
  }, [vehiculosPagina, sortBy]);

  const handleCreate = async () => {
    if (!newForm.nombre.trim() || !newForm.modelo.trim() || !newForm.anio || !newForm.transmision.trim() || !newForm.marcaId || !newForm.unidadNegocioId) {
      notify('Nombre, modelo, año, transmisión, marca y unidad de negocio son requeridos', 'error');
      return;
    }
    const ok = await reportError(createVehiculo(newForm), 'No se pudo crear el vehículo');
    if (ok) {
      setNewForm(emptyForm());
      setShowAddRow(false);
      notify(`"${newForm.nombre} ${newForm.modelo}" agregado al inventario`);
    }
  };

  const startEdit = (v) => {
    setEditForm({
      nombre: v.nombre,
      modelo: v.modelo,
      anio: v.anio,
      km: v.km,
      vin: v.vin || '',
      transmision: v.transmision,
      condicion: v.condicion,
      marcaId: v.marcaId,
      unidadNegocioId: v.unidadNegocioId,
      precio: v.precio ?? ''
    });
    setEditingId(v.id);
  };

  const handleUpdate = async (id) => {
    const ok = await reportError(updateVehiculo({ id, data: editForm }), 'No se pudo guardar el cambio');
    if (ok) {
      setEditingId(null);
      notify('Cambios guardados');
    }
  };

  const handleEstatusChange = (v, estatus) => {
    updateVehiculo({ id: v.id, data: { estatus } });
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      {/* Barra de herramientas */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24, border: '1px solid #eae7e5', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {['DISPONIBLE', 'APARTADO', 'VENDIDO', 'NO_DISPONIBLE', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterEstatus(s)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: filterEstatus === s ? '#251f1d' : 'transparent',
                  color: filterEstatus === s ? '#ffffff' : '#6e6764',
                  transition: 'all 0.15s'
                }}
              >
                {s === 'all' ? 'Todos' : ESTATUS_LABELS[s]}
              </button>
            ))}
          </div>

          <div className="inventory-search-action-group" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="inventory-search-box" style={{ position: 'relative', width: 260, maxWidth: '100%' }}>
              <input
                type="text"
                placeholder="Buscar vehículo o VIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '9px 18px 9px 36px', borderRadius: 9999, border: '1px solid #e2dedc', fontSize: 13, outline: 'none', backgroundColor: '#ffffff', color: '#251f1d', boxSizing: 'border-box' }}
              />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8e8784', display: 'flex' }}>
                <SearchIcon size={14} />
              </span>
            </div>

            {puedeCrear && (
              <button
                onClick={() => setShowAddRow((prev) => !prev)}
                className="btn-add-vehicle"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#ff8901', color: '#251f1d', border: 'none', padding: '9px 18px', borderRadius: 9999, fontSize: 12, fontWeight: 800, cursor: 'pointer', boxSizing: 'border-box' }}
              >
                <PlusIcon size={14} /> <span>{showAddRow ? 'Cancelar' : 'Agregar vehículo'}</span>
              </button>
            )}

            {puedeCrear && (
              <button
                onClick={() => setShowImportador((prev) => !prev)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', color: '#251f1d', border: '1px solid #d5d0ce', padding: '9px 18px', borderRadius: 9999, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                <span>{showImportador ? 'Cancelar importación' : 'Importar desde archivo'}</span>
              </button>
            )}
          </div>
        </div>

        {showImportador && (
          <div style={{ paddingTop: 14, borderTop: '1px solid #eae7e5' }}>
            <ImportadorInventario
              onImportacionCompleta={() => {
                refetchVehiculos();
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid #eae7e5' }}>
          <select value={marcaFilter} onChange={(e) => setMarcaFilter(e.target.value)} style={selectPillStyle}>
            <option value="all">Marca: Todas</option>
            {marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>

          <select value={condicionFilter} onChange={(e) => setCondicionFilter(e.target.value)} style={selectPillStyle}>
            <option value="all">Condición: Todas</option>
            {CONDICION_OPTIONS.map((c) => <option key={c} value={c}>{c === 'NUEVO' ? 'Nuevo' : 'Seminuevo'}</option>)}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectPillStyle}>
            <option value="recent">Más reciente</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="year_desc">Año: Más reciente</option>
          </select>
        </div>

        {/* Fila de alta inline — sin modal */}
        {showAddRow && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', paddingTop: 14, borderTop: '1px solid #eae7e5' }}>
            <div style={{ flex: '1 1 140px' }}><input style={inputStyle} placeholder="Modelo" value={newForm.modelo} onChange={(e) => setNewForm({ ...newForm, modelo: e.target.value })} /></div>
            <div style={{ flex: '1 1 140px' }}><input style={inputStyle} placeholder="Descripción" value={newForm.nombre} onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })} /></div>
            <div style={{ flex: '0 1 90px' }}><input style={inputStyle} type="number" placeholder="Año" value={newForm.anio} onChange={(e) => setNewForm({ ...newForm, anio: e.target.value })} /></div>
            <div style={{ flex: '0 1 100px' }}><input style={inputStyle} type="number" placeholder="Km" value={newForm.km} onChange={(e) => setNewForm({ ...newForm, km: e.target.value })} /></div>
            <div style={{ flex: '1 1 140px' }}><input style={inputStyle} placeholder="Transmisión" value={newForm.transmision} onChange={(e) => setNewForm({ ...newForm, transmision: e.target.value })} /></div>
            <div style={{ flex: '1 1 130px' }}>
              <select style={inputStyle} value={newForm.condicion} onChange={(e) => setNewForm({ ...newForm, condicion: e.target.value })}>
                {CONDICION_OPTIONS.map((c) => <option key={c} value={c}>{c === 'NUEVO' ? 'Nuevo' : 'Seminuevo'}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <select style={inputStyle} value={newForm.marcaId} onChange={(e) => setNewForm({ ...newForm, marcaId: e.target.value })}>
                <option value="">Marca…</option>
                {marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 160px' }}>
              <UnidadNegocioField
                value={newForm.unidadNegocioId}
                onChange={(v) => setNewForm((prev) => ({ ...prev, unidadNegocioId: v }))}
                unidadesNegocio={unidadesNegocio}
                esAdministrador={esAdministrador}
                miUnidadNegocioId={usuarioActual?.unidadNegocioId}
                inputStyle={inputStyle}
              />
            </div>
            <div style={{ flex: '0 1 130px' }}><input style={inputStyle} placeholder="VIN (opcional)" value={newForm.vin} onChange={(e) => setNewForm({ ...newForm, vin: e.target.value })} /></div>
            <div style={{ flex: '0 1 130px' }}><input style={inputStyle} type="number" placeholder="Precio" value={newForm.precio} onChange={(e) => setNewForm({ ...newForm, precio: e.target.value })} /></div>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              style={{ backgroundColor: '#ff8901', color: '#251f1d', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: isCreating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              Crear
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#251f1d' }}>
                <th style={{ padding: '16px 28px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>VEHÍCULO</th>
                <th style={{ padding: '16px 20px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>AÑO & KM</th>
                <th style={{ padding: '16px 20px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>TRANSMISIÓN</th>
                <th style={{ padding: '16px 20px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>PRECIO</th>
                <th style={{ padding: '16px 20px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>UNIDAD DE NEGOCIO</th>
                <th style={{ padding: '16px 20px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>ESTATUS</th>
                <th style={{ padding: '16px 28px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#8e8784', fontSize: 13 }}>Cargando…</td></tr>
              ) : vehiculosOrdenados.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#8e8784', fontSize: 13 }}>No se encontraron vehículos que coincidan con los filtros aplicados.</td></tr>
              ) : (
                vehiculosOrdenados.map((v) => {
                  const isEditing = editingId === v.id;
                  const badgeClass = v.estatus === 'DISPONIBLE' ? 'badge-v2-green' : v.estatus === 'APARTADO' ? 'badge-v2-amber' : 'badge-v2-dark';

                  if (isEditing) {
                    return (
                      <tr key={v.id} style={{ borderBottom: '1px solid #eae7e5', background: '#fff8f0' }}>
                        <td style={{ padding: '14px 16px' }} colSpan={7}>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div style={{ flex: '1 1 140px' }}><input style={inputStyle} placeholder="Modelo" value={editForm.modelo} onChange={(e) => setEditForm({ ...editForm, modelo: e.target.value })} /></div>
                            <div style={{ flex: '1 1 140px' }}><input style={inputStyle} placeholder="Descripción" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} /></div>
                            <div style={{ flex: '0 1 90px' }}><input style={inputStyle} type="number" value={editForm.anio} onChange={(e) => setEditForm({ ...editForm, anio: e.target.value })} /></div>
                            <div style={{ flex: '0 1 100px' }}><input style={inputStyle} type="number" value={editForm.km} onChange={(e) => setEditForm({ ...editForm, km: e.target.value })} /></div>
                            <div style={{ flex: '1 1 140px' }}><input style={inputStyle} value={editForm.transmision} onChange={(e) => setEditForm({ ...editForm, transmision: e.target.value })} /></div>
                            <div style={{ flex: '1 1 130px' }}>
                              <select style={inputStyle} value={editForm.condicion} onChange={(e) => setEditForm({ ...editForm, condicion: e.target.value })}>
                                {CONDICION_OPTIONS.map((c) => <option key={c} value={c}>{c === 'NUEVO' ? 'Nuevo' : 'Seminuevo'}</option>)}
                              </select>
                            </div>
                            <div style={{ flex: '1 1 140px' }}>
                              <select style={inputStyle} value={editForm.marcaId} onChange={(e) => setEditForm({ ...editForm, marcaId: e.target.value })}>
                                {marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                              </select>
                            </div>
                            <div style={{ flex: '1 1 160px' }}>
                              <UnidadNegocioField
                                value={editForm.unidadNegocioId}
                                onChange={(v) => setEditForm((prev) => ({ ...prev, unidadNegocioId: v }))}
                                unidadesNegocio={unidadesNegocio}
                                esAdministrador={esAdministrador}
                                miUnidadNegocioId={usuarioActual?.unidadNegocioId}
                                inputStyle={inputStyle}
                              />
                            </div>
                            <div style={{ flex: '0 1 130px' }}><input style={inputStyle} placeholder="VIN" value={editForm.vin} onChange={(e) => setEditForm({ ...editForm, vin: e.target.value })} /></div>
                            <div style={{ flex: '0 1 130px' }}><input style={inputStyle} type="number" placeholder="Precio" value={editForm.precio} onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })} /></div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn-action-icon" onClick={() => handleUpdate(v.id)} title="Guardar"><CheckIcon size={14} /></button>
                              <button className="btn-action-icon" onClick={() => setEditingId(null)} title="Cancelar"><CloseIcon size={14} /></button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid #eae7e5', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '20px 28px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#251f1d' }}>{v.marca?.nombre} {v.nombre} {v.modelo}</div>
                        <div style={{ fontSize: 11, color: '#8e8784', marginTop: 4 }}>{v.vin || 'Sin VIN'} · {v.condicion === 'NUEVO' ? 'Nuevo' : 'Seminuevo'}</div>
                      </td>
                      <td style={{ padding: '20px 20px', verticalAlign: 'middle', fontSize: 13, color: '#251f1d' }}>
                        <strong>{v.anio}</strong> <span style={{ color: '#8e8784' }}>· {formatNumber(v.km)} km</span>
                      </td>
                      <td style={{ padding: '20px 20px', verticalAlign: 'middle', fontSize: 13, color: '#251f1d' }}>{v.transmision}</td>
                      <td style={{ padding: '20px 20px', verticalAlign: 'middle', fontSize: 14, fontWeight: 800, color: '#251f1d' }}>
                        {v.precio ? formatCurrency(Number(v.precio)) : '—'}
                      </td>
                      <td style={{ padding: '20px 20px', verticalAlign: 'middle', fontSize: 13, color: '#251f1d' }}>{v.unidadNegocio?.nombre}</td>
                      <td style={{ padding: '20px 20px', verticalAlign: 'middle' }}>
                        {puedeEditar ? (
                          <select
                            value={v.estatus}
                            onChange={(e) => handleEstatusChange(v, e.target.value)}
                            className={`badge-v2 ${badgeClass}`}
                            style={{ padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                          >
                            {ESTATUS_OPTIONS.map((e) => <option key={e} value={e}>{ESTATUS_LABELS[e]}</option>)}
                          </select>
                        ) : (
                          <span className={`badge-v2 ${badgeClass}`} style={{ padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700 }}>
                            {ESTATUS_LABELS[v.estatus]}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '20px 28px', verticalAlign: 'middle', textAlign: 'right' }}>
                        {puedeEditar && <button className="btn-action-icon" onClick={() => startEdit(v)} title="Editar"><EditIcon size={14} /></button>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <div style={{ padding: '0 20px' }}>
            <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
