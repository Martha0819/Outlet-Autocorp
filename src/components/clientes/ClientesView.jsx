'use client';

import React, { useState, useEffect } from 'react';
import { useNotify } from '@/store/features/ui/useNotify';
import { formatDate, getInitials, validatePhone } from '@/lib/utils';
import { useGetCatalogoQuery } from '@/store/features/catalogos/catalogoApiSlice';
import {
  useGetClientesQuery,
  useCreateClienteMutation,
  useUpdateClienteMutation,
} from '@/store/features/clientes/clienteApiSlice';
import { useGetVehiculosQuery } from '@/store/features/vehiculos/vehiculoApiSlice';
import { useGetDemosQuery, useCreateDemoMutation, useDeleteDemoMutation } from '@/store/features/demos/demoApiSlice';
import { usePermiso } from '@/store/features/auth/usePermiso';
import { SearchIcon, PlusIcon, EditIcon, CheckIcon, CloseIcon, TrashIcon, UsersIcon, TestDriveIcon } from '@/components/ui/Icons';
import { Pager } from '@/components/ui/Pager';

const PAGE_SIZE = 15;

function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #d5d0ce',
  fontSize: 13,
  backgroundColor: '#ffffff',
  color: '#251f1d'
};

function emptyForm() {
  return { nombre: '', telefono: '', correo: '', visitaMarcaEspecifica: false, marcaId: '', observaciones: '' };
}

function DirectorioTab() {
  const notify = useNotify();
  const { puede } = usePermiso();
  const puedeCrear = puede('cliente', 'crear');
  const puedeEditar = puede('cliente', 'editar');
  const { data: marcas = [] } = useGetCatalogoQuery('marca');
  const [createCliente, { isLoading: isCreating }] = useCreateClienteMutation();
  const [updateCliente] = useUpdateClienteMutation();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const searchDebounced = useDebouncedValue(search);
  useEffect(() => { setPage(1); }, [searchDebounced]);

  const { data, isLoading } = useGetClientesQuery({ page, pageSize: PAGE_SIZE, q: searchDebounced });
  const clientesPagina = data?.items ?? [];

  const [showAddRow, setShowAddRow] = useState(false);
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

  const handleCreate = async () => {
    if (!newForm.nombre.trim() || !newForm.telefono.trim()) {
      notify('Nombre y teléfono son requeridos', 'error');
      return;
    }
    if (!validatePhone(newForm.telefono)) {
      notify('El teléfono debe tener 10 dígitos', 'error');
      return;
    }
    const ok = await reportError(createCliente(newForm), 'No se pudo crear el cliente');
    if (ok) {
      setNewForm(emptyForm());
      setShowAddRow(false);
      notify(`Cliente "${newForm.nombre}" registrado`);
    }
  };

  const startEdit = (c) => {
    setEditForm({
      nombre: c.nombre,
      telefono: c.telefono,
      correo: c.correo || '',
      visitaMarcaEspecifica: c.visitaMarcaEspecifica,
      marcaId: c.marcaId || '',
      observaciones: c.observaciones || ''
    });
    setEditingId(c.id);
  };

  const handleUpdate = async (id) => {
    const ok = await reportError(updateCliente({ id, data: editForm }), 'No se pudo guardar el cambio');
    if (ok) {
      setEditingId(null);
      notify('Cambios guardados');
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24, border: '1px solid #eae7e5', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#251f1d', margin: '0 0 2px 0' }}>Directorio de Clientes</h3>
            <p style={{ fontSize: 12, color: '#8e8784', margin: 0 }}>{data?.total ?? 0} clientes registrados</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 260 }}>
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '9px 18px 9px 36px', borderRadius: 9999, border: '1px solid #e2dedc', fontSize: 13, outline: 'none', backgroundColor: '#ffffff', color: '#251f1d' }}
              />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8e8784', display: 'flex' }}>
                <SearchIcon size={14} />
              </span>
            </div>

            {puedeCrear && (
              <button
                onClick={() => setShowAddRow((prev) => !prev)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ff8901', color: '#251f1d', border: 'none', padding: '9px 18px', borderRadius: 9999, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                <PlusIcon size={14} /> <span>{showAddRow ? 'Cancelar' : 'Registrar cliente'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Alta inline — sin modal */}
        {showAddRow && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14, borderTop: '1px solid #eae7e5' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 180px' }}><input style={inputStyle} placeholder="Nombre completo" value={newForm.nombre} onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })} /></div>
              <div style={{ flex: '1 1 150px' }}><input style={inputStyle} placeholder="Teléfono (10 dígitos)" value={newForm.telefono} onChange={(e) => setNewForm({ ...newForm, telefono: e.target.value })} /></div>
              <div style={{ flex: '1 1 200px' }}><input style={inputStyle} type="email" placeholder="Correo (opcional)" value={newForm.correo} onChange={(e) => setNewForm({ ...newForm, correo: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#251f1d' }}>
                <input
                  type="checkbox"
                  checked={newForm.visitaMarcaEspecifica}
                  onChange={(e) => setNewForm({ ...newForm, visitaMarcaEspecifica: e.target.checked, marcaId: e.target.checked ? newForm.marcaId : '' })}
                  style={{ accentColor: '#ff8901' }}
                />
                Busca una marca específica
              </label>
              {newForm.visitaMarcaEspecifica && (
                <select style={{ ...inputStyle, width: 'auto' }} value={newForm.marcaId} onChange={(e) => setNewForm({ ...newForm, marcaId: e.target.value })}>
                  <option value="">Marca…</option>
                  {marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              )}
              <input style={{ ...inputStyle, flex: '1 1 220px' }} placeholder="Observaciones (opcional)" value={newForm.observaciones} onChange={(e) => setNewForm({ ...newForm, observaciones: e.target.value })} />
              <button
                onClick={handleCreate}
                disabled={isCreating}
                style={{ backgroundColor: '#ff8901', color: '#251f1d', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: isCreating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
              >
                Registrar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', padding: '12px 16px' }}>
        {isLoading ? (
          <p style={{ fontSize: 13, color: '#8e8784', padding: '20px 0', textAlign: 'center' }}>Cargando…</p>
        ) : clientesPagina.length === 0 ? (
          <p style={{ fontSize: 13, color: '#8e8784', padding: '20px 0', textAlign: 'center' }}>No se encontraron clientes.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {clientesPagina.map((c) => {
              const isEditing = editingId === c.id;

              if (isEditing) {
                return (
                  <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', borderRadius: 8, background: '#fff8f0', border: '1px solid #f0edeb' }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 180px' }}><input style={inputStyle} value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} /></div>
                      <div style={{ flex: '1 1 150px' }}><input style={inputStyle} value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} /></div>
                      <div style={{ flex: '1 1 200px' }}><input style={inputStyle} type="email" value={editForm.correo} onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#251f1d' }}>
                        <input
                          type="checkbox"
                          checked={editForm.visitaMarcaEspecifica}
                          onChange={(e) => setEditForm({ ...editForm, visitaMarcaEspecifica: e.target.checked, marcaId: e.target.checked ? editForm.marcaId : '' })}
                          style={{ accentColor: '#ff8901' }}
                        />
                        Busca una marca específica
                      </label>
                      {editForm.visitaMarcaEspecifica && (
                        <select style={{ ...inputStyle, width: 'auto' }} value={editForm.marcaId} onChange={(e) => setEditForm({ ...editForm, marcaId: e.target.value })}>
                          <option value="">Marca…</option>
                          {marcas.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                      )}
                      <input style={{ ...inputStyle, flex: '1 1 220px' }} placeholder="Observaciones" value={editForm.observaciones} onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-action-icon" onClick={() => handleUpdate(c.id)} title="Guardar"><CheckIcon size={14} /></button>
                        <button className="btn-action-icon" onClick={() => setEditingId(null)} title="Cancelar"><CloseIcon size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 8, background: '#faf9f8', border: '1px solid #f0edeb' }}>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#ff8901', color: '#fff', fontWeight: 800, fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getInitials(c.nombre)}
                  </span>

                  <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#251f1d' }}>{c.nombre}</div>
                    <div style={{ fontSize: 11, color: '#8e8784', marginTop: 2 }}>
                      {c.telefono} {c.correo && `· ${c.correo}`} · Alta: {formatDate(c.fechaRegistro, 'short')}
                    </div>
                    {c.observaciones && (
                      <div style={{ fontSize: 11, color: '#6e6764', marginTop: 4, fontStyle: 'italic' }}>"{c.observaciones}"</div>
                    )}
                  </div>

                  {c.visitaMarcaEspecifica ? (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, background: '#fff5eb', color: '#ff8901', border: '1px solid #ffd8b3', whiteSpace: 'nowrap' }}>
                      Busca {c.marca?.nombre || 'marca específica'}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, background: '#f0eceb', color: '#8e8784', whiteSpace: 'nowrap' }}>
                      Sin preferencia
                    </span>
                  )}

                  {puedeEditar && <button className="btn-action-icon" onClick={() => startEdit(c)} title="Editar"><EditIcon size={14} /></button>}
                </div>
              );
            })}
          </div>
        )}
        {data && <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />}
      </div>
    </div>
  );
}

// ─── Pruebas de manejo ──────────────────────────────────────────────────────

function emptyDemoForm() {
  return { clienteId: '', vehiculoId: '', observaciones: '' };
}

function DemosTab() {
  const notify = useNotify();
  const { puede } = usePermiso();
  const puedeCrear = puede('demo', 'crear');
  const puedeEliminar = puede('demo', 'eliminar');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetDemosQuery({ page, pageSize: PAGE_SIZE });
  const demosPagina = data?.items ?? [];
  // Sin pagination: dropdowns necesitan la lista completa de clientes y
  // vehículos, no solo la página actual de demos.
  const { data: clientes = [] } = useGetClientesQuery();
  const { data: vehiculos = [] } = useGetVehiculosQuery();
  const [createDemo, { isLoading: isCreating }] = useCreateDemoMutation();
  const [deleteDemo] = useDeleteDemoMutation();

  const [newForm, setNewForm] = useState(emptyDemoForm());

  const reportError = async (promise, fallbackMessage) => {
    try {
      await promise.unwrap();
      return true;
    } catch (error) {
      notify(error?.data?.error || fallbackMessage, 'error');
      return false;
    }
  };

  const handleCreate = async () => {
    if (!newForm.clienteId || !newForm.vehiculoId) {
      notify('Cliente y vehículo son requeridos', 'error');
      return;
    }
    const ok = await reportError(createDemo(newForm), 'No se pudo registrar la demo');
    if (ok) {
      setNewForm(emptyDemoForm());
      notify('Prueba de manejo registrada');
    }
  };

  const handleDelete = async (d) => {
    if (!confirm(`¿Eliminar la demo de ${d.cliente?.nombre} con ${d.vehiculo?.nombre}?`)) return;
    await reportError(deleteDemo(d.id), 'No se pudo eliminar la demo');
  };

  return (
    <div className="card" style={{ padding: 24, borderRadius: 14, border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
      {puedeCrear && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #f0edeb' }}>
          <div style={{ flex: '1 1 200px' }}>
            <select style={inputStyle} value={newForm.clienteId} onChange={(e) => setNewForm({ ...newForm, clienteId: e.target.value })}>
              <option value="">Cliente…</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <select style={inputStyle} value={newForm.vehiculoId} onChange={(e) => setNewForm({ ...newForm, vehiculoId: e.target.value })}>
              <option value="">Vehículo…</option>
              {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.marca?.nombre} {v.nombre} {v.modelo}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 220px' }}><input style={inputStyle} placeholder="Observaciones (opcional)" value={newForm.observaciones} onChange={(e) => setNewForm({ ...newForm, observaciones: e.target.value })} /></div>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ff8901', color: '#251f1d', border: 'none', padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: isCreating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
          >
            <PlusIcon size={13} /> Registrar demo
          </button>
        </div>
      )}

      {isLoading ? (
        <p style={{ fontSize: 12, color: '#8e8784' }}>Cargando…</p>
      ) : demosPagina.length === 0 ? (
        <p style={{ fontSize: 12, color: '#8e8784' }}>Sin pruebas de manejo registradas todavía.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {demosPagina.map((d) => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 8, background: '#faf9f8', border: '1px solid #f0edeb' }}>
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#251f1d' }}>
                  {d.cliente?.nombre} <span style={{ color: '#8e8784', fontWeight: 600 }}>probó</span> {d.vehiculo?.marca?.nombre} {d.vehiculo?.nombre} {d.vehiculo?.modelo}
                </div>
                <div style={{ fontSize: 11, color: '#8e8784' }}>
                  {formatDate(d.fecha, 'long')} · Asesor: {d.usuario?.nombre}
                </div>
                {d.observaciones && <div style={{ fontSize: 11, color: '#6e6764', marginTop: 4, fontStyle: 'italic' }}>"{d.observaciones}"</div>}
              </div>
              {puedeEliminar && <button className="btn-action-icon text-danger" onClick={() => handleDelete(d)} title="Eliminar"><TrashIcon size={14} /></button>}
            </div>
          ))}
        </div>
      )}
      {data && <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />}
    </div>
  );
}

export function ClientesView() {
  const [subTab, setSubTab] = useState('directorio');
  const { puede } = usePermiso();
  const puedeCliente = puede('cliente', 'leer');
  const puedeDemo = puede('demo', 'leer');

  return (
    <div>
      <div style={{ display: 'flex', background: '#e8e6e5', padding: 4, borderRadius: 10, marginBottom: 20, width: 'fit-content' }}>
        {puedeCliente && (
          <button
            onClick={() => setSubTab('directorio')}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: subTab === 'directorio' ? '#ff8901' : 'transparent', color: subTab === 'directorio' ? '#251f1d' : '#6e6764', transition: 'all 0.2s' }}
          >
            <UsersIcon size={15} /> <span>Directorio</span>
          </button>
        )}
        {puedeDemo && (
          <button
            onClick={() => setSubTab('demos')}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: subTab === 'demos' ? '#ff8901' : 'transparent', color: subTab === 'demos' ? '#251f1d' : '#6e6764', transition: 'all 0.2s' }}
          >
            <TestDriveIcon size={15} /> <span>Pruebas de manejo</span>
          </button>
        )}
      </div>

      {subTab === 'directorio' && puedeCliente ? <DirectorioTab /> : puedeDemo ? <DemosTab /> : <p style={{ fontSize: 12, color: '#8e8784' }}>No tienes permiso para ver esta sección.</p>}
    </div>
  );
}
