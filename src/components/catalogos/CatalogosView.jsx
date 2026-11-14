'use client';

import React, { useState } from 'react';
import { useNotify } from '@/store/features/ui/useNotify';
import {
  useGetCatalogoQuery,
  useCreateCatalogoItemMutation,
  useUpdateCatalogoItemMutation,
  useDeleteCatalogoItemMutation,
} from '@/store/features/catalogos/catalogoApiSlice';
import { usePermiso } from '@/store/features/auth/usePermiso';
import {
  ChevronDownIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  CloseIcon,
  TagIcon,
  FileTextIcon,
  LayersIcon,
  GridIcon,
  UsersIcon,
  ClockIcon,
  ListIcon,
  PhoneIcon,
} from '@/components/ui/Icons';

// Un catálogo por sección de acordeón. "fields" define qué inputs se
// muestran tanto para agregar como para editar inline (sin modales).
// select + optionsFrom resuelve contra otro catálogo (marca, dependencia).
const CATALOGOS_META = [
  { tipo: 'marca', label: 'Marcas', icon: TagIcon, hasActivo: true, fields: [{ name: 'nombre', label: 'Nombre', type: 'text' }] },
  { tipo: 'linea-negocio', label: 'Líneas de negocio', icon: FileTextIcon, hasActivo: true, fields: [{ name: 'nombre', label: 'Nombre', type: 'text' }] },
  {
    tipo: 'unidad-negocio',
    label: 'Unidades de negocio',
    icon: LayersIcon,
    hasActivo: true,
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text' },
      { name: 'marcaId', label: 'Marca', type: 'select', optionsFrom: 'marca' },
    ],
  },
  {
    tipo: 'dependencia',
    label: 'Dependencias',
    icon: GridIcon,
    hasActivo: true,
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text' },
      { name: 'dependenciaPadreId', label: 'Dependencia padre', type: 'select', optionsFrom: 'dependencia', optional: true },
    ],
  },
  { tipo: 'tipo-usuario', label: 'Tipos de usuario', icon: UsersIcon, hasActivo: true, fields: [{ name: 'nombre', label: 'Nombre', type: 'text' }] },
  // 'permiso' se movió a /usuarios (subpestaña Permisos) — ver nota en
  // src/lib/catalogos/config.js.
  { tipo: 'turno', label: 'Turnos', icon: ClockIcon, hasActivo: false, fields: [{ name: 'nombre', label: 'Nombre', type: 'text' }] },
  {
    tipo: 'etapa',
    label: 'Etapas del proceso',
    icon: ListIcon,
    hasActivo: true,
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text' },
      { name: 'orden', label: 'Orden', type: 'number' },
    ],
  },
  { tipo: 'tipo-seguimiento', label: 'Tipos de seguimiento', icon: PhoneIcon, hasActivo: false, fields: [{ name: 'nombre', label: 'Nombre', type: 'text' }] },
];

function emptyForm(fields) {
  const form = {};
  for (const f of fields) {
    form[f.name] = f.type === 'number' ? '' : '';
  }
  return form;
}

function formToPayload(fields, form) {
  const data = {};
  for (const f of fields) {
    const raw = form[f.name];
    if (f.type === 'select') {
      data[f.name] = raw === '' ? null : Number(raw);
    } else if (f.type === 'number') {
      data[f.name] = raw === '' ? null : Number(raw);
    } else {
      data[f.name] = raw;
    }
  }
  return data;
}

function FieldInput({ field, value, onChange, optionsByTipo, excludeId }) {
  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #d5d0ce',
    fontSize: '13px',
    backgroundColor: '#ffffff',
    color: '#251f1d'
  };

  if (field.type === 'select') {
    const options = (optionsByTipo[field.optionsFrom] || []).filter((o) => o.id !== excludeId);
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        <option value="">{field.optional ? '— Ninguna —' : 'Selecciona…'}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.nombre}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      placeholder={field.label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
    />
  );
}

function resolveDisplayValue(field, rawValue, optionsByTipo) {
  if (field.type !== 'select') return rawValue;
  const options = optionsByTipo[field.optionsFrom] || [];
  const match = options.find((o) => o.id === rawValue);
  return match ? match.nombre : (rawValue ? `#${rawValue}` : '—');
}

function CatalogoSection({ meta, isOpen, onToggle, optionsByTipo }) {
  const { tipo, label, icon: Icon, hasActivo, fields } = meta;
  const notify = useNotify();
  const { puede } = usePermiso();
  const puedeCrear = puede('catalogo', 'crear');
  const puedeEditar = puede('catalogo', 'editar');
  const puedeEliminar = puede('catalogo', 'eliminar');

  // Los catálogos nunca se paginan — son listas chicas de referencia, y la
  // misma query se usa como fuente de los <select> en el resto de la app.
  const { data: items = [], isLoading } = useGetCatalogoQuery(tipo, { skip: !isOpen });
  const [createItem, { isLoading: isCreating }] = useCreateCatalogoItemMutation();
  const [updateItem] = useUpdateCatalogoItemMutation();
  const [deleteItem] = useDeleteCatalogoItemMutation();

  const [newForm, setNewForm] = useState(() => emptyForm(fields));
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
    if (!newForm.nombre?.trim()) {
      notify('El nombre es requerido', 'error');
      return;
    }
    const ok = await reportError(
      createItem({ tipo, data: formToPayload(fields, newForm) }),
      'No se pudo crear el elemento'
    );
    if (ok) {
      setNewForm(emptyForm(fields));
      notify(`"${newForm.nombre}" agregado a ${label}`);
    }
  };

  const startEdit = (item) => {
    const form = {};
    for (const f of fields) form[f.name] = item[f.name] ?? '';
    setEditForm(form);
    setEditingId(item.id);
  };

  const handleUpdate = async (id) => {
    const ok = await reportError(
      updateItem({ tipo, id, data: formToPayload(fields, editForm) }),
      'No se pudo guardar el cambio'
    );
    if (ok) {
      setEditingId(null);
      notify('Cambios guardados');
    }
  };

  const handleToggleActivo = (item) => {
    updateItem({ tipo, id: item.id, data: { activo: !item.activo } });
  };

  const handleDelete = async (item) => {
    if (!confirm(`¿Eliminar "${item.nombre}" de ${label}? Esta acción no se puede deshacer.`)) return;
    await reportError(deleteItem({ tipo, id: item.id }), 'No se pudo eliminar: puede tener registros dependientes');
  };

  return (
    <div className="card" style={{ borderRadius: '14px', border: '1px solid #eae7e5', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: isOpen ? '#fff8f0' : '#ffffff',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ width: 36, height: 36, borderRadius: 8, background: '#fff5eb', color: '#ff8901', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={18} />
          </span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#251f1d' }}>{label}</span>
          {isOpen && !isLoading && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e8784', background: '#f0eceb', padding: '2px 9px', borderRadius: '9999px' }}>
              {items.length}
            </span>
          )}
        </div>
        <span style={{ color: '#8e8784', display: 'flex', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <ChevronDownIcon size={18} />
        </span>
      </button>

      {isOpen && (
        <div style={{ borderTop: '1px solid #f0edeb', padding: '16px 20px' }}>
          {/* Fila de alta inline — sin modal, oculta sin catalogo.crear */}
          {puedeCrear && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap' }}>
              {fields.map((f) => (
                <div key={f.name} style={{ flex: f.type === 'select' ? '1 1 180px' : '1 1 200px' }}>
                  <FieldInput
                    field={f}
                    value={newForm[f.name]}
                    onChange={(v) => setNewForm((prev) => ({ ...prev, [f.name]: v }))}
                    optionsByTipo={optionsByTipo}
                  />
                </div>
              ))}
              <button
                onClick={handleCreate}
                disabled={isCreating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ff8901',
                  color: '#251f1d',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: isCreating ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <PlusIcon size={13} /> Agregar
              </button>
            </div>
          )}

          {/* Lista de elementos */}
          {isLoading ? (
            <p style={{ fontSize: '12px', color: '#8e8784' }}>Cargando…</p>
          ) : items.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#8e8784' }}>Sin elementos todavía.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {items.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isEditing ? '#fff8f0' : '#faf9f8',
                      border: '1px solid #f0edeb',
                      flexWrap: 'wrap'
                    }}
                  >
                    {isEditing ? (
                      <>
                        {fields.map((f) => (
                          <div key={f.name} style={{ flex: f.type === 'select' ? '1 1 180px' : '1 1 200px' }}>
                            <FieldInput
                              field={f}
                              value={editForm[f.name]}
                              onChange={(v) => setEditForm((prev) => ({ ...prev, [f.name]: v }))}
                              optionsByTipo={optionsByTipo}
                              excludeId={item.id}
                            />
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                          <button className="btn-action-icon" onClick={() => handleUpdate(item.id)} title="Guardar">
                            <CheckIcon size={14} />
                          </button>
                          <button className="btn-action-icon" onClick={() => setEditingId(null)} title="Cancelar">
                            <CloseIcon size={14} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ flex: '1 1 auto', display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {fields.map((f) => (
                            <span key={f.name} style={{ fontSize: '13px', color: f.name === 'nombre' ? '#251f1d' : '#6e6764', fontWeight: f.name === 'nombre' ? 700 : 600 }}>
                              {f.name !== 'nombre' && <span style={{ color: '#8e8784', fontWeight: 600 }}>{f.label}: </span>}
                              {resolveDisplayValue(f, item[f.name], optionsByTipo)}
                            </span>
                          ))}
                        </div>

                        {hasActivo && (
                          puedeEditar ? (
                            <button
                              onClick={() => handleToggleActivo(item)}
                              title="Click para cambiar estatus"
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                border: 'none',
                                cursor: 'pointer',
                                background: item.activo ? '#dcfce7' : '#f3f1f0',
                                color: item.activo ? '#16a34a' : '#8e8784'
                              }}
                            >
                              ● {item.activo ? 'Activo' : 'Inactivo'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', background: item.activo ? '#dcfce7' : '#f3f1f0', color: item.activo ? '#16a34a' : '#8e8784' }}>
                              ● {item.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          )
                        )}

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {puedeEditar && (
                            <button className="btn-action-icon" onClick={() => startEdit(item)} title="Editar">
                              <EditIcon size={14} />
                            </button>
                          )}
                          {puedeEliminar && (
                            <button className="btn-action-icon text-danger" onClick={() => handleDelete(item)} title="Eliminar">
                              <TrashIcon size={14} />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CatalogosView() {
  const [openMap, setOpenMap] = useState(() =>
    Object.fromEntries(CATALOGOS_META.map((m) => [m.tipo, false]))
  );

  const toggleTipo = (tipo) => setOpenMap((prev) => ({ ...prev, [tipo]: !prev[tipo] }));

  // Catálogos chicos que se usan como opciones de FK en otros catálogos —
  // se piden siempre (no solo cuando su propia sección está abierta) para
  // que unidad-negocio/dependencia puedan mostrar y editar su relación.
  const { data: marcas = [] } = useGetCatalogoQuery('marca');
  const { data: dependencias = [] } = useGetCatalogoQuery('dependencia');
  const optionsByTipo = { marca: marcas, dependencia: dependencias };

  return (
    <div className="view-content active" id="view-catalogos" style={{ paddingBottom: 60 }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#251f1d', margin: '0 0 4px 0' }}>
          Catálogos del Sistema
        </h2>
        <p style={{ fontSize: '12px', color: '#8e8784', margin: 0 }}>
          Marcas, unidades de negocio, tipos de usuario y demás listas base que alimentan el resto del CRM. Toca un catálogo para ver, agregar o editar sus elementos.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {CATALOGOS_META.map((meta) => (
          <CatalogoSection
            key={meta.tipo}
            meta={meta}
            isOpen={openMap[meta.tipo]}
            onToggle={() => toggleTipo(meta.tipo)}
            optionsByTipo={optionsByTipo}
          />
        ))}
      </div>
    </div>
  );
}
