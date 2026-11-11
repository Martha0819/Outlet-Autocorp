'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatDate, getTodayISO } from '@/lib/utils';
import { PlusIcon } from '@/components/ui/Icons';

export function GuardiasView() {
  const { data, activeDesign, addShift, addActivity, toggleActivityStatus } = useStore();
  const [subTab, setSubTab] = useState('calendario'); // 'calendario' | 'actividades'
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showActModal, setShowActModal] = useState(false);
  const [hoveredShift, setHoveredShift] = useState(null);

  // Form states
  const [shiftForm, setShiftForm] = useState({
    responsible: '',
    startTime: '09:00',
    endTime: '18:00',
    phone: '',
    email: '',
    area: 'Piso de Ventas',
    observations: ''
  });

  const [actForm, setActForm] = useState({
    title: '',
    iconType: 'revision',
    responsible: 'Carlos Morales',
    time: '09:00',
    description: '',
    observations: '',
    status: 'pendiente'
  });

  const shifts = data?.shifts || [];
  const activities = data?.activities || [];

  const handleCreateShift = (e) => {
    e.preventDefault();
    if (!shiftForm.responsible) {
      alert('Por favor ingresa el nombre del responsable.');
      return;
    }
    addShift({
      ...shiftForm,
      date: getTodayISO()
    });
    setShowShiftModal(false);
    setShiftForm({
      responsible: '',
      startTime: '09:00',
      endTime: '18:00',
      phone: '',
      email: '',
      area: 'Piso de Ventas',
      observations: ''
    });
  };

  const handleCreateActivity = (e) => {
    e.preventDefault();
    if (!actForm.title) {
      alert('Por favor ingresa el título de la actividad.');
      return;
    }
    addActivity({
      ...actForm,
      date: getTodayISO()
    });
    setShowActModal(false);
    setActForm({
      title: '',
      iconType: 'revision',
      responsible: 'Carlos Morales',
      time: '09:00',
      description: '',
      observations: '',
      status: 'pendiente'
    });
  };

  // Flip Card component
  const ActivityFlipCard = ({ act }) => {
    const [flipped, setFlipped] = useState(false);

    return (
      <div
        className="flip-wrapper-v2"
        onClick={() => setFlipped(!flipped)}
        style={{ cursor: 'pointer', height: 250, width: '100%' }}
      >
        <div className={`flip-inner-v2 ${flipped ? 'is-flipped' : ''}`}>
          {/* Frente */}
          <div className="flip-face-v2 flip-front-v2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge-pill badge-dark" style={{ fontSize: 11, textTransform: 'uppercase' }}>
                ● {act.iconType}
              </span>
              <span className={`badge-pill ${act.status === 'completada' ? 'badge-green' : act.status === 'en_proceso' ? 'badge-amber' : 'badge-dark'}`}>
                {act.status.toUpperCase()}
              </span>
            </div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginTop: 10, color: 'inherit' }}>{act.title}</h4>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                Resp: <strong>{act.responsible}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 8, fontSize: 11 }}>
              <span>{act.time} · {formatDate(act.date, 'short')}</span>
              <span style={{ color: '#ff8901', fontWeight: 700 }}>Girar ↻</span>
            </div>
          </div>

          {/* Reverso */}
          <div className="flip-face-v2 flip-back-v2">
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#ff8901', textTransform: 'uppercase' }}>
                Detalle Operativo
              </span>
              <h5 style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: 'inherit' }}>{act.responsible}</h5>
              <p style={{ fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>{act.description || 'Sin notas adicionales.'}</p>
              {act.observations && (
                <p style={{ fontSize: 10, fontStyle: 'italic', color: '#ff8901', marginTop: 4 }}>
                  "{act.observations}"
                </p>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 8 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleActivityStatus(act.id);
                }}
                className="btn-header-action"
                style={{ fontSize: 11, padding: '4px 8px' }}
              >
                {act.status === 'completada' ? 'Reabrir' : 'Completar'}
              </button>
              <span style={{ fontSize: 10, color: '#ff8901', fontWeight: 700 }}>Volver ↺</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="guardias-container">
      {/* Sub-barra de Pestañas */}
      <div className="toolbar-dashboard">
        <div className="period-pills-wrap">
          <button
            onClick={() => setSubTab('calendario')}
            className={`period-btn ${subTab === 'calendario' ? 'active' : ''}`}
          >
            Calendario de Guardias
          </button>
          <button
            onClick={() => setSubTab('actividades')}
            className={`period-btn ${subTab === 'actividades' ? 'active' : ''}`}
          >
            Tarjetas de Actividades (3D Flip)
          </button>
        </div>

        <div>
          {subTab === 'calendario' ? (
            <button onClick={() => setShowShiftModal(true)} className="btn-primary-action">
              <PlusIcon size={15} /> <span>Programar guardia</span>
            </button>
          ) : (
            <button onClick={() => setShowActModal(true)} className="btn-primary-action">
              <PlusIcon size={15} /> <span>Agregar actividad</span>
            </button>
          )}
        </div>
      </div>

      {/* --- SECCIÓN 1: CALENDARIO DE GUARDIAS --- */}
      {subTab === 'calendario' && (
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-title">Roles de Guardia en Turno</h3>
              <p className="dashboard-card-sub">Horarios de piso, recepción de clientes y pruebas de manejo</p>
            </div>
            <span className="badge-pill badge-green">Showroom Abierto</span>
          </div>
          <div className="dashboard-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {shifts.map((s) => (
                <div
                  key={s.id}
                  onMouseEnter={() => setHoveredShift(s)}
                  onMouseLeave={() => setHoveredShift(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: '1px solid var(--border-subtle, #eae7e5)',
                    background: 'var(--bg-card, #ffffff)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: '#ff8901',
                        color: '#251f1d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 16
                      }}
                    >
                      {s.responsible.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ fontSize: 15, display: 'block' }}>{s.responsible}</strong>
                      <span style={{ fontSize: 12, opacity: 0.7 }}>
                        {formatDate(s.date, 'long')} · <span style={{ fontStyle: 'italic' }}>{s.area}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge-pill badge-orange font-bold" style={{ fontSize: 12 }}>
                      {s.startTime} — {s.endTime}
                    </span>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                      {s.phone ? `Cel: ${s.phone}` : 'Confirmado'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SECCIÓN 2: TARJETAS DE ACTIVIDADES (3D FLIP KANBAN) --- */}
      {subTab === 'actividades' && (
        <div className="exec-kanban-board">
          {/* Columna 1: Pendientes */}
          <div className="kanban-col">
            <div className="kanban-col-header">
              <span className="kanban-col-title" style={{ color: '#6e6764' }}>📌 Pendientes</span>
              <span className="badge-pill badge-dark">
                {activities.filter((a) => a.status === 'pendiente').length}
              </span>
            </div>
            <div className="kanban-cards-stack">
              {activities.filter((a) => a.status === 'pendiente').map((act) => (
                <ActivityFlipCard key={act.id} act={act} />
              ))}
            </div>
          </div>

          {/* Columna 2: En Proceso */}
          <div className="kanban-col" style={{ backgroundColor: 'rgba(245, 158, 11, 0.04)', borderColor: 'rgba(245, 158, 11, 0.25)' }}>
            <div className="kanban-col-header" style={{ borderBottomColor: 'rgba(245, 158, 11, 0.3)' }}>
              <span className="kanban-col-title" style={{ color: '#d97706' }}>⚙️ En Proceso</span>
              <span className="badge-pill badge-amber">
                {activities.filter((a) => a.status === 'en_proceso').length}
              </span>
            </div>
            <div className="kanban-cards-stack">
              {activities.filter((a) => a.status === 'en_proceso').map((act) => (
                <ActivityFlipCard key={act.id} act={act} />
              ))}
            </div>
          </div>

          {/* Columna 3: Completadas */}
          <div className="kanban-col" style={{ backgroundColor: 'rgba(16, 185, 129, 0.04)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
            <div className="kanban-col-header" style={{ borderBottomColor: 'rgba(16, 185, 129, 0.3)' }}>
              <span className="kanban-col-title" style={{ color: '#10b981' }}>✅ Completadas</span>
              <span className="badge-pill badge-green">
                {activities.filter((a) => a.status === 'completada').length}
              </span>
            </div>
            <div className="kanban-cards-stack">
              {activities.filter((a) => a.status === 'completada').map((act) => (
                <ActivityFlipCard key={act.id} act={act} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PARA PROGRAMAR GUARDIA --- */}
      {showShiftModal && (
        <div className="modal-backdrop" onClick={() => setShowShiftModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Programar Guardia Showroom</h3>
            <form onSubmit={handleCreateShift} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Responsable *</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre del asesor o guardia"
                  value={shiftForm.responsible}
                  onChange={(e) => setShiftForm({ ...shiftForm, responsible: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Hora Inicio</label>
                  <input
                    type="time"
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Hora Fin</label>
                  <input
                    type="time"
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Celular</label>
                  <input
                    type="tel"
                    placeholder="55 1234 5678"
                    value={shiftForm.phone}
                    onChange={(e) => setShiftForm({ ...shiftForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Área o Función</label>
                  <input
                    type="text"
                    value={shiftForm.area}
                    onChange={(e) => setShiftForm({ ...shiftForm, area: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Notas especiales del turno"
                  value={shiftForm.observations}
                  onChange={(e) => setShiftForm({ ...shiftForm, observations: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" onClick={() => setShowShiftModal(false)} className="btn-secondary-action">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-action">
                  Guardar Guardia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL PARA AGREGAR ACTIVIDAD --- */}
      {showActModal && (
        <div className="modal-backdrop" onClick={() => setShowActModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Nueva Tarjeta de Actividad</h3>
            <form onSubmit={handleCreateActivity} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Nombre de la Actividad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Apertura de instalaciones y encendido de salas"
                  value={actForm.title}
                  onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Tipo / Icono</label>
                  <select
                    value={actForm.iconType}
                    onChange={(e) => setActForm({ ...actForm, iconType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  >
                    <option value="revision">Revisión de vehículos</option>
                    <option value="recepcion">Recepción de clientes</option>
                    <option value="seguridad">Seguridad</option>
                    <option value="limpieza">Limpieza</option>
                    <option value="apertura">Apertura</option>
                    <option value="cierre">Cierre</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Responsable</label>
                  <input
                    type="text"
                    value={actForm.responsible}
                    onChange={(e) => setActForm({ ...actForm, responsible: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Horario</label>
                  <input
                    type="time"
                    value={actForm.time}
                    onChange={(e) => setActForm({ ...actForm, time: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Estado Inicial</label>
                  <select
                    value={actForm.status}
                    onChange={(e) => setActForm({ ...actForm, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalles y pasos a ejecutar"
                  value={actForm.description}
                  onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" onClick={() => setShowActModal(false)} className="btn-secondary-action">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-action">
                  Guardar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
