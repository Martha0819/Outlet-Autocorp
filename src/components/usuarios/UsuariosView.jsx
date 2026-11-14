'use client';

import React, { useState } from 'react';
import { useNotify } from '@/store/features/ui/useNotify';
import { getInitials } from '@/lib/utils';
import { useGetCatalogoQuery } from '@/store/features/catalogos/catalogoApiSlice';
import {
  useGetUsuariosQuery,
  useCreateUsuarioMutation,
  useUpdateUsuarioMutation,
} from '@/store/features/usuarios/usuarioApiSlice';
import {
  useGetPermisosMatrizQuery,
  useTogglePermisoMutation,
} from '@/store/features/permisos/permisoApiSlice';
import { usePermiso } from '@/store/features/auth/usePermiso';
import { useAppSelector } from '@/store/hooks';
import { UsersIcon, CheckIcon, EditIcon, CloseIcon, PlusIcon } from '@/components/ui/Icons';
import { Pager } from '@/components/ui/Pager';
import { UnidadNegocioField } from '@/components/ui/UnidadNegocioField';

const PAGE_SIZE = 15;

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #d5d0ce',
  fontSize: '13px',
  backgroundColor: '#ffffff',
  color: '#251f1d'
};

const ACCION_LABELS = { crear: 'Crear', leer: 'Leer', editar: 'Editar', eliminar: 'Eliminar' };
const RECURSO_LABELS = {
  usuario: 'Usuarios',
  vehiculo: 'Vehículos',
  cliente: 'Clientes',
  negocio: 'Negocios',
  demo: 'Demos',
  guardia: 'Guardias',
  actividad: 'Actividades',
  catalogo: 'Catálogos'
};

function emptyUsuarioForm() {
  return { nombre: '', email: '', password: '', tipoUsuarioId: '', unidadNegocioId: '' };
}

function UsuariosTab() {
  const notify = useNotify();
  const { puede, esAdministrador } = usePermiso();
  const usuarioActual = useAppSelector((state) => state.auth.usuario);
  const puedeCrear = puede('usuario', 'crear');
  const puedeEditar = puede('usuario', 'editar');

  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetUsuariosQuery({ page, pageSize: PAGE_SIZE });
  const usuariosPagina = data?.items ?? [];
  const { data: tiposUsuario = [] } = useGetCatalogoQuery('tipo-usuario');
  const { data: unidadesNegocio = [] } = useGetCatalogoQuery('unidad-negocio');
  const [createUsuario, { isLoading: isCreating }] = useCreateUsuarioMutation();
  const [updateUsuario] = useUpdateUsuarioMutation();

  const [newForm, setNewForm] = useState(emptyUsuarioForm());
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
    if (!newForm.nombre.trim() || !newForm.email.trim() || !newForm.password.trim() || !newForm.tipoUsuarioId || !newForm.unidadNegocioId) {
      notify('Nombre, email, contraseña, tipo de usuario y unidad de negocio son requeridos', 'error');
      return;
    }
    const ok = await reportError(createUsuario(newForm), 'No se pudo crear el usuario');
    if (ok) {
      setNewForm(emptyUsuarioForm());
      notify(`Usuario "${newForm.nombre}" creado`);
    }
  };

  const startEdit = (u) => {
    setEditForm({
      nombre: u.nombre,
      email: u.email,
      password: '',
      tipoUsuarioId: u.tipoUsuarioId,
      unidadNegocioId: u.unidadNegocioId
    });
    setEditingId(u.id);
  };

  const handleUpdate = async (id) => {
    const payload = { ...editForm };
    if (!payload.password) delete payload.password;
    const ok = await reportError(updateUsuario({ id, data: payload }), 'No se pudo guardar el cambio');
    if (ok) {
      setEditingId(null);
      notify('Cambios guardados');
    }
  };

  const handleToggleActivo = (u) => {
    updateUsuario({ id: u.id, data: { activo: !u.activo } });
  };

  return (
    <div className="card" style={{ padding: '20px', borderRadius: '14px', border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#251f1d', margin: '0 0 4px 0' }}>Usuarios del sistema</h3>
      <p style={{ fontSize: '12px', color: '#8e8784', margin: '0 0 16px 0' }}>
        Un usuario nunca se borra, solo se desactiva — conserva el historial de lo que haya registrado.
      </p>

      {/* Alta inline — oculta si el rol no tiene usuario.crear */}
      {puedeCrear && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 160px' }}><input style={inputStyle} placeholder="Nombre" value={newForm.nombre} onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })} /></div>
          <div style={{ flex: '1 1 200px' }}><input style={inputStyle} type="email" placeholder="Correo" value={newForm.email} onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} /></div>
          <div style={{ flex: '1 1 160px' }}><input style={inputStyle} type="password" placeholder="Contraseña" value={newForm.password} onChange={(e) => setNewForm({ ...newForm, password: e.target.value })} /></div>
          <div style={{ flex: '1 1 160px' }}>
            <select style={inputStyle} value={newForm.tipoUsuarioId} onChange={(e) => setNewForm({ ...newForm, tipoUsuarioId: e.target.value })}>
              <option value="">Tipo de usuario…</option>
              {tiposUsuario.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
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
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ff8901', color: '#251f1d', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: isCreating ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
          >
            <PlusIcon size={13} /> Crear usuario
          </button>
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <p style={{ fontSize: '12px', color: '#8e8784' }}>Cargando…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {usuariosPagina.map((u) => {
            const isEditing = editingId === u.id;
            return (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', background: isEditing ? '#fff8f0' : '#faf9f8', border: '1px solid #f0edeb', flexWrap: 'wrap' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#ff8901', color: '#fff', fontWeight: 800, fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getInitials(u.nombre)}
                </span>

                {isEditing ? (
                  <>
                    <div style={{ flex: '1 1 140px' }}><input style={inputStyle} value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} /></div>
                    <div style={{ flex: '1 1 180px' }}><input style={inputStyle} type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
                    <div style={{ flex: '1 1 140px' }}>
                      <select style={inputStyle} value={editForm.tipoUsuarioId} onChange={(e) => setEditForm({ ...editForm, tipoUsuarioId: e.target.value })}>
                        {tiposUsuario.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
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
                    <div style={{ flex: '1 1 140px' }}><input style={inputStyle} type="password" placeholder="Nueva contraseña (opcional)" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} /></div>
                    <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                      <button className="btn-action-icon" onClick={() => handleUpdate(u.id)} title="Guardar"><CheckIcon size={14} /></button>
                      <button className="btn-action-icon" onClick={() => setEditingId(null)} title="Cancelar"><CloseIcon size={14} /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#251f1d' }}>{u.nombre}</div>
                      <div style={{ fontSize: '11px', color: '#8e8784' }}>{u.email} · {u.tipoUsuario?.nombre} · {u.unidadNegocio?.nombre}</div>
                    </div>
                    {puedeEditar ? (
                      <button
                        onClick={() => handleToggleActivo(u)}
                        title="Click para activar/desactivar"
                        style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', border: 'none', cursor: 'pointer', background: u.activo ? '#dcfce7' : '#f3f1f0', color: u.activo ? '#16a34a' : '#8e8784' }}
                      >
                        ● {u.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: u.activo ? '#dcfce7' : '#f3f1f0', color: u.activo ? '#16a34a' : '#8e8784' }}>
                        ● {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
                    {puedeEditar && (
                      <button className="btn-action-icon" onClick={() => startEdit(u)} title="Editar"><EditIcon size={14} /></button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      {data && <Pager page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />}
    </div>
  );
}

function PermisosTab() {
  const { data, isLoading } = useGetPermisosMatrizQuery();
  const [togglePermiso] = useTogglePermisoMutation();

  if (isLoading || !data) {
    return <p style={{ fontSize: '12px', color: '#8e8784' }}>Cargando…</p>;
  }

  const { permisos, tiposUsuario, asignaciones } = data;
  const isAsignado = (tipoUsuarioId, permisoId) =>
    asignaciones.some((a) => a.tipoUsuarioId === tipoUsuarioId && a.permisoId === permisoId);

  const recursos = [...new Set(permisos.map((p) => p.recurso))];

  return (
    <div className="card" style={{ padding: '20px', borderRadius: '14px', border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', overflowX: 'auto' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#251f1d', margin: '0 0 4px 0' }}>Permisos por rol</h3>
      <p style={{ fontSize: '12px', color: '#8e8784', margin: '0 0 16px 0' }}>
        Marca qué puede hacer cada tipo de usuario sobre cada modelo del sistema. Esto guarda la asignación; aplicarla en cada pantalla es un paso aparte.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eae7e5' }}>
            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#8e8784', fontWeight: 700 }}>Recurso</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', color: '#8e8784', fontWeight: 700 }}>Acción</th>
            {tiposUsuario.map((t) => (
              <th key={t.id} style={{ textAlign: 'center', padding: '8px 10px', color: '#251f1d', fontWeight: 800 }}>{t.nombre}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recursos.map((recurso) => {
            const permisosDeRecurso = permisos.filter((p) => p.recurso === recurso);
            return permisosDeRecurso.map((permiso, idx) => (
              <tr key={permiso.id} style={{ borderBottom: '1px solid #f0edeb' }}>
                {idx === 0 && (
                  <td rowSpan={permisosDeRecurso.length} style={{ padding: '8px 10px', fontWeight: 800, color: '#251f1d', verticalAlign: 'top', borderRight: '1px solid #f0edeb' }}>
                    {RECURSO_LABELS[recurso] || recurso}
                  </td>
                )}
                <td style={{ padding: '8px 10px', color: '#6e6764', fontWeight: 600 }}>{ACCION_LABELS[permiso.accion] || permiso.accion}</td>
                {tiposUsuario.map((t) => {
                  const checked = isAsignado(t.id, permiso.id);
                  return (
                    <td key={t.id} style={{ textAlign: 'center', padding: '8px 10px' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermiso({ tipoUsuarioId: t.id, permisoId: permiso.id })}
                        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#ff8901' }}
                      />
                    </td>
                  );
                })}
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}

export function UsuariosView() {
  const [subTab, setSubTab] = useState('usuarios');
  const { puede } = usePermiso();
  // Gestionar permisos requiere usuario.editar — mismo permiso que exige
  // /api/permisos en el servidor (ver src/app/api/permisos/route.js).
  const puedeGestionarPermisos = puede('usuario', 'editar');

  return (
    <div className="view-content active" id="view-usuarios" style={{ paddingBottom: 60 }}>
      <div style={{ display: 'flex', background: '#e8e6e5', padding: '4px', borderRadius: '10px', marginBottom: '20px', width: 'fit-content' }}>
        <button
          onClick={() => setSubTab('usuarios')}
          style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: subTab === 'usuarios' ? '#ff8901' : 'transparent', color: subTab === 'usuarios' ? '#251f1d' : '#6e6764', transition: 'all 0.2s' }}
        >
          <UsersIcon size={15} /> <span>Usuarios</span>
        </button>
        {puedeGestionarPermisos && (
          <button
            onClick={() => setSubTab('permisos')}
            style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: subTab === 'permisos' ? '#ff8901' : 'transparent', color: subTab === 'permisos' ? '#251f1d' : '#6e6764', transition: 'all 0.2s' }}
          >
            <CheckIcon size={15} /> <span>Permisos</span>
          </button>
        )}
      </div>

      {subTab === 'permisos' && puedeGestionarPermisos ? <PermisosTab /> : <UsuariosTab />}
    </div>
  );
}
