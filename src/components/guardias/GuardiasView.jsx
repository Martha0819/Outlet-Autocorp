'use client';

import React, { useState } from 'react';
import { useNotify } from '@/store/features/ui/useNotify';
import { formatDate, getInitials } from '@/lib/utils';
import { useGetUsuariosQuery } from '@/store/features/usuarios/usuarioApiSlice';
import { useGetCatalogoQuery } from '@/store/features/catalogos/catalogoApiSlice';
import {
  useGetGuardiasQuery,
  useCreateGuardiaMutation,
  useUpdateGuardiaMutation,
  useDeleteGuardiaMutation,
} from '@/store/features/guardias/guardiaApiSlice';
import {
  useGetActividadesQuery,
  useCreateActividadMutation,
  useUpdateActividadMutation,
  useDeleteActividadMutation,
} from '@/store/features/actividades/actividadApiSlice';
import { usePermiso } from '@/store/features/auth/usePermiso';
import { useAppSelector } from '@/store/hooks';
import { UnidadNegocioField } from '@/components/ui/UnidadNegocioField';
import {
  CalendarIcon,
  FlipIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  CloseIcon,
} from '@/components/ui/Icons';
import { Pager } from '@/components/ui/Pager';

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

function toTimeInput(dateIso) {
  if (!dateIso) return '';
  return new Date(dateIso).toISOString().slice(11, 16);
}

// ─── Guardias ───────────────────────────────────────────────────────────────

function emptyGuardiaForm() {
  return { usuarioId: '', fecha: '', horarioInicio: '09:00', horarioFin: '15:00', turnoId: '', area: '' };
}

function GuardiasTab() {
  const notify = useNotify();
  const { puede } = usePermiso();
  const puedeCrear = puede('guardia', 'crear');
  const puedeEditar = puede('guardia', 'editar');
  const puedeEliminar = puede('guardia', 'eliminar');

  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetGuardiasQuery({ page, pageSize: PAGE_SIZE });
  const guardiasPagina = data?.items ?? [];
  const { data: usuarios = [] } = useGetUsuariosQuery();
  const { data: turnos = [] } = useGetCatalogoQuery('turno');
  const [createGuardia, { isLoading: isCreating }] = useCreateGuardiaMutation();
  const [updateGuardia] = useUpdateGuardiaMutation();
  const [deleteGuardia] = useDeleteGuardiaMutation();

  const [newForm, setNewForm] = useState(emptyGuardiaForm());
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
    if (!newForm.usuarioId || !newForm.fecha || !newForm.turnoId) {
      notify('Usuario, fecha y turno son requeridos', 'error');
      return;
    }
    const ok = await reportError(createGuardia(newForm), 'No se pudo programar la guardia');
    if (ok) {
      setNewForm(emptyGuardiaForm());
      notify('Guardia programada');
    }
  };

  const startEdit = (g) => {
    setEditForm({
      usuarioId: g.usuarioId,
      fecha: g.fecha.slice(0, 10),
      horarioInicio: toTimeInput(g.horarioInicio),
      horarioFin: toTimeInput(g.horarioFin),
      turnoId: g.turnoId,
      area: g.area || ''
    });
    setEditingId(g.id);
  };

  const handleUpdate = async (id) => {
    const ok = await reportError(updateGuardia({ id, data: editForm }), 'No se pudo guardar el cambio');
    if (ok) {
      setEditingId(null);
      notify('Cambios guardados');
    }
  };

  const handleDelete = async (g) => {
    if (!confirm(`¿Eliminar la guardia de ${g.usuario?.nombre} del ${formatDate(g.fecha, 'short')}?`)) return;
    await reportError(deleteGuardia(g.id), 'No se pudo eliminar la guardia');
  };

  return (
    <div className="card" style={{ padding: 24, borderRadius: 14, border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
      {/* Alta inline — oculta sin guardia.crear */}
      {puedeCrear && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #f0edeb' }}>
          <div style={{ flex: '1 1 180px' }}>
            <select style={inputStyle} value={newForm.usuarioId} onChange={(e) => setNewForm({ ...newForm, usuarioId: e.target.value })}>
              <option value="">Usuario…</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>
          <div style={{ flex: '0 1 160px' }}><input style={inputStyle} type="date" value={newForm.fecha} onChange={(e) => setNewForm({ ...newForm, fecha: e.target.value })} /></div>
          <div style={{ flex: '0 1 110px' }}><input style={inputStyle} type="time" value={newForm.horarioInicio} onChange={(e) => setNewForm({ ...newForm, horarioInicio: e.target.value })} /></div>
          <div style={{ flex: '0 1 110px' }}><input style={inputStyle} type="time" value={newForm.horarioFin} onChange={(e) => setNewForm({ ...newForm, horarioFin: e.target.value })} /></div>
          <div style={{ flex: '1 1 140px' }}>
            <select style={inputStyle} value={newForm.turnoId} onChange={(e) => setNewForm({ ...newForm, turnoId: e.target.value })}>
              <option value="">Turno…</option>
              {turnos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 160px' }}><input style={inputStyle} placeholder="Área (opcional)" value={newForm.area} onChange={(e) => setNewForm({ ...newForm, area: e.target.value })} /></div>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ff8901', color: '#251f1d', border: 'none', padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: isCreating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
          >
            <PlusIcon size={13} /> Programar
          </button>
        </div>
      )}

      {isLoading ? (
        <p style={{ fontSize: 12, color: '#8e8784' }}>Cargando…</p>
      ) : guardiasPagina.length === 0 ? (
        <p style={{ fontSize: 12, color: '#8e8784' }}>Sin guardias programadas todavía.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {guardiasPagina.map((g) => {
            const isEditing = editingId === g.id;

            if (isEditing) {
              return (
                <div key={g.id} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', padding: '12px 14px', borderRadius: 8, background: '#fff8f0', border: '1px solid #f0edeb' }}>
                  <div style={{ flex: '1 1 180px' }}>
                    <select style={inputStyle} value={editForm.usuarioId} onChange={(e) => setEditForm({ ...editForm, usuarioId: e.target.value })}>
                      {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '0 1 160px' }}><input style={inputStyle} type="date" value={editForm.fecha} onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })} /></div>
                  <div style={{ flex: '0 1 110px' }}><input style={inputStyle} type="time" value={editForm.horarioInicio} onChange={(e) => setEditForm({ ...editForm, horarioInicio: e.target.value })} /></div>
                  <div style={{ flex: '0 1 110px' }}><input style={inputStyle} type="time" value={editForm.horarioFin} onChange={(e) => setEditForm({ ...editForm, horarioFin: e.target.value })} /></div>
                  <div style={{ flex: '1 1 140px' }}>
                    <select style={inputStyle} value={editForm.turnoId} onChange={(e) => setEditForm({ ...editForm, turnoId: e.target.value })}>
                      {turnos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 160px' }}><input style={inputStyle} placeholder="Área" value={editForm.area} onChange={(e) => setEditForm({ ...editForm, area: e.target.value })} /></div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-action-icon" onClick={() => handleUpdate(g.id)} title="Guardar"><CheckIcon size={14} /></button>
                    <button className="btn-action-icon" onClick={() => setEditingId(null)} title="Cancelar"><CloseIcon size={14} /></button>
                  </div>
                </div>
              );
            }

            return (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 8, background: '#faf9f8', border: '1px solid #f0edeb' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#ff8901', color: '#fff', fontWeight: 800, fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getInitials(g.usuario?.nombre)}
                </span>
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#251f1d' }}>{g.usuario?.nombre}</div>
                  <div style={{ fontSize: 11, color: '#8e8784' }}>
                    {formatDate(g.fecha, 'long')} · {toTimeInput(g.horarioInicio)}–{toTimeInput(g.horarioFin)} · {g.turno?.nombre}
                    {g.area && ` · ${g.area}`}
                  </div>
                </div>
                {puedeEditar && <button className="btn-action-icon" onClick={() => startEdit(g)} title="Editar"><EditIcon size={14} /></button>}
                {puedeEliminar && <button className="btn-action-icon text-danger" onClick={() => handleDelete(g)} title="Eliminar"><TrashIcon size={14} /></button>}
              </div>
            );
          })}
        </div>
      )}
      {data && <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />}
    </div>
  );
}

// ─── Actividades ────────────────────────────────────────────────────────────

const ESTATUS_LABELS = { PENDIENTE: 'Pendiente', EN_PROCESO: 'En proceso', COMPLETADA: 'Completada' };
const ESTATUS_COLORS = {
  PENDIENTE: { bg: '#fef3c7', text: '#d97706' },
  EN_PROCESO: { bg: '#e0f2fe', text: '#0284c7' },
  COMPLETADA: { bg: '#dcfce7', text: '#16a34a' }
};

function emptyActividadForm() {
  return { nombre: '', fecha: '', horario: '10:00', unidadNegocioId: '', responsableId: '', observaciones: '' };
}

function ActividadesTab() {
  const notify = useNotify();
  const { puede, esAdministrador } = usePermiso();
  const usuarioActual = useAppSelector((state) => state.auth.usuario);
  const puedeCrear = puede('actividad', 'crear');
  const puedeEditar = puede('actividad', 'editar');
  const puedeEliminar = puede('actividad', 'eliminar');

  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetActividadesQuery({ page, pageSize: PAGE_SIZE });
  const actividadesPagina = data?.items ?? [];
  const { data: usuarios = [] } = useGetUsuariosQuery();
  const { data: unidadesNegocio = [] } = useGetCatalogoQuery('unidad-negocio');
  const [createActividad, { isLoading: isCreating }] = useCreateActividadMutation();
  const [updateActividad] = useUpdateActividadMutation();
  const [deleteActividad] = useDeleteActividadMutation();

  const [newForm, setNewForm] = useState(emptyActividadForm());
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
    if (!newForm.nombre.trim() || !newForm.fecha) {
      notify('Nombre y fecha son requeridos', 'error');
      return;
    }
    const ok = await reportError(createActividad(newForm), 'No se pudo crear la actividad');
    if (ok) {
      setNewForm(emptyActividadForm());
      notify('Actividad agregada');
    }
  };

  const startEdit = (a) => {
    setEditForm({
      nombre: a.nombre,
      fecha: a.fecha.slice(0, 10),
      horario: toTimeInput(a.horario),
      unidadNegocioId: a.unidadNegocioId || '',
      responsableId: a.responsableId || '',
      observaciones: a.observaciones || ''
    });
    setEditingId(a.id);
  };

  const handleUpdate = async (id) => {
    const ok = await reportError(updateActividad({ id, data: editForm }), 'No se pudo guardar el cambio');
    if (ok) {
      setEditingId(null);
      notify('Cambios guardados');
    }
  };

  const handleDelete = async (a) => {
    if (!confirm(`¿Eliminar la actividad "${a.nombre}"?`)) return;
    await reportError(deleteActividad(a.id), 'No se pudo eliminar la actividad');
  };

  const cycleEstatus = (a) => {
    const order = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA'];
    const next = order[(order.indexOf(a.estatus) + 1) % order.length];
    updateActividad({ id: a.id, data: { estatus: next } });
  };

  return (
    <div className="card" style={{ padding: 24, borderRadius: 14, border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
      {/* Alta inline — oculta sin actividad.crear */}
      {puedeCrear && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #f0edeb' }}>
          <div style={{ flex: '1 1 220px' }}><input style={inputStyle} placeholder="Nombre de la actividad" value={newForm.nombre} onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })} /></div>
          <div style={{ flex: '0 1 160px' }}><input style={inputStyle} type="date" value={newForm.fecha} onChange={(e) => setNewForm({ ...newForm, fecha: e.target.value })} /></div>
          <div style={{ flex: '0 1 110px' }}><input style={inputStyle} type="time" value={newForm.horario} onChange={(e) => setNewForm({ ...newForm, horario: e.target.value })} /></div>
          <div style={{ flex: '1 1 160px' }}>
            <select style={inputStyle} value={newForm.responsableId} onChange={(e) => setNewForm({ ...newForm, responsableId: e.target.value })}>
              <option value="">Responsable (opcional)…</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <UnidadNegocioField
              value={newForm.unidadNegocioId}
              onChange={(v) => setNewForm((prev) => ({ ...prev, unidadNegocioId: v }))}
              unidadesNegocio={unidadesNegocio}
              esAdministrador={esAdministrador}
              miUnidadNegocioId={usuarioActual?.unidadNegocioId}
              inputStyle={inputStyle}
              optional
            />
          </div>
          <div style={{ flex: '1 1 200px' }}><input style={inputStyle} placeholder="Observaciones (opcional)" value={newForm.observaciones} onChange={(e) => setNewForm({ ...newForm, observaciones: e.target.value })} /></div>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ff8901', color: '#251f1d', border: 'none', padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: isCreating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
          >
            <PlusIcon size={13} /> Agregar
          </button>
        </div>
      )}

      {isLoading ? (
        <p style={{ fontSize: 12, color: '#8e8784' }}>Cargando…</p>
      ) : actividadesPagina.length === 0 ? (
        <p style={{ fontSize: 12, color: '#8e8784' }}>Sin actividades todavía.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {actividadesPagina.map((a) => {
            const isEditing = editingId === a.id;
            const color = ESTATUS_COLORS[a.estatus];

            if (isEditing) {
              return (
                <div key={a.id} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', padding: '12px 14px', borderRadius: 8, background: '#fff8f0', border: '1px solid #f0edeb' }}>
                  <div style={{ flex: '1 1 220px' }}><input style={inputStyle} value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} /></div>
                  <div style={{ flex: '0 1 160px' }}><input style={inputStyle} type="date" value={editForm.fecha} onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })} /></div>
                  <div style={{ flex: '0 1 110px' }}><input style={inputStyle} type="time" value={editForm.horario} onChange={(e) => setEditForm({ ...editForm, horario: e.target.value })} /></div>
                  <div style={{ flex: '1 1 160px' }}>
                    <select style={inputStyle} value={editForm.responsableId} onChange={(e) => setEditForm({ ...editForm, responsableId: e.target.value })}>
                      <option value="">Sin responsable</option>
                      {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: '1 1 180px' }}>
                    <UnidadNegocioField
                      value={editForm.unidadNegocioId}
                      onChange={(v) => setEditForm((prev) => ({ ...prev, unidadNegocioId: v }))}
                      unidadesNegocio={unidadesNegocio}
                      esAdministrador={esAdministrador}
                      miUnidadNegocioId={usuarioActual?.unidadNegocioId}
                      inputStyle={inputStyle}
                      optional
                      optionalLabel="Sin unidad"
                    />
                  </div>
                  <div style={{ flex: '1 1 200px' }}><input style={inputStyle} placeholder="Observaciones" value={editForm.observaciones} onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })} /></div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-action-icon" onClick={() => handleUpdate(a.id)} title="Guardar"><CheckIcon size={14} /></button>
                    <button className="btn-action-icon" onClick={() => setEditingId(null)} title="Cancelar"><CloseIcon size={14} /></button>
                  </div>
                </div>
              );
            }

            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 8, background: '#faf9f8', border: '1px solid #f0edeb', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#251f1d' }}>{a.nombre}</div>
                  <div style={{ fontSize: 11, color: '#8e8784' }}>
                    {formatDate(a.fecha, 'long')} · {toTimeInput(a.horario)}
                    {a.responsable && ` · ${a.responsable.nombre}`}
                    {a.unidadNegocio && ` · ${a.unidadNegocio.nombre}`}
                  </div>
                  {a.observaciones && <div style={{ fontSize: 11, color: '#6e6764', marginTop: 4, fontStyle: 'italic' }}>"{a.observaciones}"</div>}
                </div>

                {puedeEditar ? (
                  <button
                    onClick={() => cycleEstatus(a)}
                    title="Click para avanzar el estatus"
                    style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, border: 'none', cursor: 'pointer', background: color.bg, color: color.text, whiteSpace: 'nowrap' }}
                  >
                    ● {ESTATUS_LABELS[a.estatus]}
                  </button>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, background: color.bg, color: color.text, whiteSpace: 'nowrap' }}>
                    ● {ESTATUS_LABELS[a.estatus]}
                  </span>
                )}

                {puedeEditar && <button className="btn-action-icon" onClick={() => startEdit(a)} title="Editar"><EditIcon size={14} /></button>}
                {puedeEliminar && <button className="btn-action-icon text-danger" onClick={() => handleDelete(a)} title="Eliminar"><TrashIcon size={14} /></button>}
              </div>
            );
          })}
        </div>
      )}
      {data && <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />}
    </div>
  );
}

export function GuardiasView() {
  const [subTab, setSubTab] = useState('guardias');
  const { puede } = usePermiso();
  const puedeGuardia = puede('guardia', 'leer');
  const puedeActividad = puede('actividad', 'leer');

  return (
    <div className="view-content active" id="view-guardias" style={{ paddingBottom: 60 }}>
      <div style={{ display: 'flex', background: '#e8e6e5', padding: 4, borderRadius: 10, marginBottom: 20, width: 'fit-content' }}>
        {puedeGuardia && (
          <button
            onClick={() => setSubTab('guardias')}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: subTab === 'guardias' ? '#ff8901' : 'transparent', color: subTab === 'guardias' ? '#251f1d' : '#6e6764', transition: 'all 0.2s' }}
          >
            <CalendarIcon size={15} /> <span>Guardias</span>
          </button>
        )}
        {puedeActividad && (
          <button
            onClick={() => setSubTab('actividades')}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: subTab === 'actividades' ? '#ff8901' : 'transparent', color: subTab === 'actividades' ? '#251f1d' : '#6e6764', transition: 'all 0.2s' }}
          >
            <FlipIcon size={15} /> <span>Actividades</span>
          </button>
        )}
      </div>

      {subTab === 'guardias' && puedeGuardia ? <GuardiasTab /> : puedeActividad ? <ActividadesTab /> : <p style={{ fontSize: 12, color: '#8e8784' }}>No tienes permiso para ver esta sección.</p>}
    </div>
  );
}
