'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatDate, getTodayISO } from '@/lib/utils';
import {
  CalendarIcon,
  FlipIcon,
  PlusIcon,
  CarIcon,
  UsersIcon,
  FileTextIcon,
  CheckIcon,
  CloseIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon
} from '@/components/ui/Icons';

export function GuardiasView() {
  const { data, addShift, addActivity, toggleActivityStatus, deleteShift, deleteActivity } = useStore();
  const [subTab, setSubTab] = useState('calendario'); // 'calendario' | 'actividades'
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week'
  const [responsibleFilter, setResponsibleFilter] = useState('all');
  const [activityStatusFilter, setActivityStatusFilter] = useState('all');

  // Modales
  const [activeShiftModal, setActiveShiftModal] = useState(null); // { isEdit: boolean, shift: object, defaultDate: string }
  const [activeActivityModal, setActiveActivityModal] = useState(null); // { isEdit: boolean, act: object }
  const [hoveredShift, setHoveredShift] = useState(null);

  // Form states
  const [shiftForm, setShiftForm] = useState({
    date: '2026-11-11',
    responsible: '',
    startTime: '09:00',
    endTime: '15:00',
    phone: '',
    email: '',
    area: 'Recepción y Piso de Ventas',
    observations: ''
  });

  const [actForm, setActForm] = useState({
    title: '',
    iconType: 'apertura',
    status: 'pendiente',
    responsible: '',
    date: '2026-11-11',
    time: '10:00',
    description: '',
    observations: ''
  });

  const shifts = data?.shifts || [];
  const activities = data?.activities || [];

  // Lista de asesores únicos para el filtro
  const allResponsibles = Array.from(new Set(shifts.map((s) => s.responsible).filter(Boolean)));

  const filteredShifts = shifts.filter((s) => {
    if (responsibleFilter === 'all') return true;
    return s.responsible === responsibleFilter;
  });

  const filteredActivities = activities.filter((a) => {
    if (activityStatusFilter === 'all') return true;
    return a.status === activityStatusFilter;
  });

  // Handlers para Guardias
  const openNewShiftModal = (defaultDate = '2026-11-11') => {
    setShiftForm({
      date: defaultDate,
      responsible: '',
      startTime: '09:00',
      endTime: '15:00',
      phone: '',
      email: '',
      area: 'Recepción y Piso de Ventas',
      observations: ''
    });
    setActiveShiftModal({ isEdit: false, defaultDate });
  };

  const openEditShiftModal = (shift) => {
    setShiftForm({
      date: shift.date || '2026-11-11',
      responsible: shift.responsible || '',
      startTime: shift.startTime || '09:00',
      endTime: shift.endTime || '15:00',
      phone: shift.phone || '',
      email: shift.email || '',
      area: shift.area || 'Recepción y Piso de Ventas',
      observations: shift.observations || ''
    });
    setActiveShiftModal({ isEdit: true, shift });
  };

  const handleSaveShift = (e) => {
    e.preventDefault();
    if (!shiftForm.responsible.trim()) {
      alert('El nombre del responsable es obligatorio.');
      return;
    }
    if (activeShiftModal?.isEdit && activeShiftModal?.shift) {
      // update
      addShift({
        ...shiftForm,
        id: activeShiftModal.shift.id
      });
    } else {
      addShift(shiftForm);
    }
    setActiveShiftModal(null);
  };

  // Handlers para Actividades
  const openNewActivityModal = () => {
    setActForm({
      title: '',
      iconType: 'apertura',
      status: 'pendiente',
      responsible: '',
      date: '2026-11-11',
      time: '10:00',
      description: '',
      observations: ''
    });
    setActiveActivityModal({ isEdit: false });
  };

  const openEditActivityModal = (act) => {
    setActForm({
      title: act.title || '',
      iconType: act.iconType || 'apertura',
      status: act.status || 'pendiente',
      responsible: act.responsible || '',
      date: act.date || '2026-11-11',
      time: act.time || '10:00',
      description: act.description || '',
      observations: act.observations || ''
    });
    setActiveActivityModal({ isEdit: true, act });
  };

  const handleSaveActivity = (e) => {
    e.preventDefault();
    if (!actForm.title.trim()) {
      alert('El nombre de la actividad es obligatorio.');
      return;
    }
    if (activeActivityModal?.isEdit && activeActivityModal?.act) {
      addActivity({
        ...actForm,
        id: activeActivityModal.act.id
      });
    } else {
      addActivity(actForm);
    }
    setActiveActivityModal(null);
  };

  const getInitials = (name) => {
    if (!name) return 'CM';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="view-content active" id="view-guardias" style={{ paddingBottom: 60 }}>
      {/* =========================================================================
          1. SUBPESTAÑAS DE NAVEGACIÓN Y BOTÓN DE ALTA (RÉPLICA EXACTA DE IMAGEN 1 & 2)
          ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', background: '#e8e6e5', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setSubTab('calendario')}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: subTab === 'calendario' ? '#ff8901' : 'transparent',
              color: subTab === 'calendario' ? '#251f1d' : '#6e6764',
              transition: 'all 0.2s'
            }}
          >
            <CalendarIcon size={15} />
            <span>Calendario de Guardias</span>
          </button>
          <button
            onClick={() => setSubTab('actividades')}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: subTab === 'actividades' ? '#ff8901' : 'transparent',
              color: subTab === 'actividades' ? '#251f1d' : '#6e6764',
              transition: 'all 0.2s'
            }}
          >
            <FlipIcon size={15} />
            <span>Tarjetas de Actividades</span>
          </button>
        </div>

        {subTab === 'calendario' ? (
          <button
            onClick={() => openNewShiftModal('2026-11-11')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ff8901',
              color: '#251f1d',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255,137,1,0.25)'
            }}
          >
            <PlusIcon size={14} /> <span>Nueva guardia</span>
          </button>
        ) : (
          <button
            onClick={openNewActivityModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ff8901',
              color: '#251f1d',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255,137,1,0.25)'
            }}
          >
            <PlusIcon size={14} /> <span>Agregar actividad</span>
          </button>
        )}
      </div>

      {/* =========================================================================
          2. CALENDARIO DE GUARDIAS (RÉPLICA EXACTA DE IMAGEN 1)
          ========================================================================= */}
      {subTab === 'calendario' && (
        <div className="card" style={{ padding: '24px', borderRadius: '14px', border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          {/* Barra de control del calendario */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn btn-outline-dark btn-sm" style={{ padding: '6px 12px' }}>&lt;</button>
                <button className="btn btn-outline-dark btn-sm" style={{ padding: '6px 14px' }}>Hoy</button>
                <button className="btn btn-outline-dark btn-sm" style={{ padding: '6px 12px' }}>&gt;</button>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#251f1d', letterSpacing: '0.5px', margin: 0 }}>
                NOVIEMBRE DE 2026
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', background: '#f0eceb', padding: '3px', borderRadius: '8px' }}>
                <button
                  onClick={() => setCalendarView('month')}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: calendarView === 'month' ? '#ffffff' : 'transparent',
                    color: '#251f1d',
                    boxShadow: calendarView === 'month' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  Mes
                </button>
                <button
                  onClick={() => setCalendarView('week')}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: calendarView === 'week' ? '#ffffff' : 'transparent',
                    color: '#251f1d',
                    boxShadow: calendarView === 'week' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  Semana
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6e6764', fontWeight: 600 }}>Filtrar por responsable:</span>
                <select
                  value={responsibleFilter}
                  onChange={(e) => setResponsibleFilter(e.target.value)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d5d0ce',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: '#ffffff',
                    color: '#251f1d',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">Todos los responsables</option>
                  {allResponsibles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* =============================================================
              VISTA MENSUAL DEL CALENDARIO (RÉPLICA EXACTA DE IMAGEN 1)
              ============================================================= */}
          {calendarView === 'month' && (
            <div style={{ border: '1px solid #e8e6e5', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f6f6f6', borderBottom: '1px solid #e8e6e5', textAlign: 'center', padding: '12px 0', fontSize: '11px', fontWeight: 800, color: '#251f1d', letterSpacing: '0.6px' }}>
                <div>LUNES</div>
                <div>MARTES</div>
                <div>MIÉRCOLES</div>
                <div>JUEVES</div>
                <div>VIERNES</div>
                <div>SÁBADO</div>
                <div>DOMINGO</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {/* Celda vacía 1 a 6 para ajustar al primer día domingo */}
                {[...Array(6)].map((_, i) => (
                  <div key={`empty-${i}`} style={{ minHeight: '115px', background: '#faf9f8', borderRight: '1px solid #e8e6e5', borderBottom: '1px solid #e8e6e5' }} />
                ))}

                {/* Días 1 al 30 de Noviembre */}
                {[...Array(30)].map((_, i) => {
                  const day = i + 1;
                  const colIndex = (6 + (day - 1)) % 7; // 0: Lunes, 1: Martes, 2: Miércoles, 3: Jueves, 4: Viernes, 5: Sábado, 6: Domingo
                  const isToday = day === 11;
                  const dayStr = String(day).padStart(2, '0');
                  const dayDate = `2026-11-${dayStr}`;
                  const dayShifts = filteredShifts.filter((s) => s.date === dayDate);

                  return (
                    <div
                      key={`day-${day}`}
                      onClick={() => openNewShiftModal(dayDate)}
                      style={{
                        minHeight: '115px',
                        padding: '8px',
                        borderRight: '1px solid #e8e6e5',
                        borderBottom: '1px solid #e8e6e5',
                        background: isToday ? '#fffdfa' : '#ffffff',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isToday) e.currentTarget.style.backgroundColor = '#faf9f8';
                      }}
                      onMouseLeave={(e) => {
                        if (!isToday) e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            width: isToday ? '24px' : 'auto',
                            height: isToday ? '24px' : 'auto',
                            borderRadius: isToday ? '50%' : '0',
                            background: isToday ? '#ff8901' : 'transparent',
                            color: '#251f1d',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {day}
                        </span>
                        {isToday && (
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#ff8901', textTransform: 'uppercase' }}>
                            HOY
                          </span>
                        )}
                      </div>

                      {/* Chips de guardias con franja de color izquierda (Imagen 1) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {dayShifts.map((shift) => {
                          const shiftColor = shift.responsible.includes('Alejandro')
                            ? '#0284c7'
                            : shift.responsible.includes('Roberto')
                            ? '#8b5cf6'
                            : shift.responsible.includes('Mariana')
                            ? '#10b981'
                            : shift.responsible.includes('Carlos')
                            ? '#ff8901'
                            : '#251f1d';

                          return (
                            <div
                              key={shift.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditShiftModal(shift);
                              }}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredShift({ ...shift, rect, colIndex });
                              }}
                              onMouseLeave={() => setHoveredShift(null)}
                              style={{
                                background: '#f8f7f6',
                                border: '1px solid #e8e6e5',
                                borderLeft: `3px solid ${shiftColor}`,
                                borderRadius: '6px',
                                padding: '4px 6px',
                                fontSize: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <span
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: shiftColor,
                                  color: '#ffffff',
                                  fontWeight: 800,
                                  fontSize: '9px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                {getInitials(shift.responsible)}
                              </span>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <div style={{ fontSize: '8px', color: '#8e8784' }}>{shift.startTime} - {shift.endTime}</div>
                                <strong style={{ fontSize: '10px', color: '#251f1d' }}>{shift.responsible}</strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =============================================================
              VISTA SEMANAL DEL CALENDARIO (RÉPLICA EXACTA DE IMAGEN 2)
              ============================================================= */}
          {calendarView === 'week' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
              {[
                { name: 'LUNES', day: 9, date: '2026-11-09' },
                { name: 'MARTES', day: 10, date: '2026-11-10' },
                { name: 'MIÉRCOLES', day: 11, date: '2026-11-11', isToday: true },
                { name: 'JUEVES', day: 12, date: '2026-11-12' },
                { name: 'VIERNES', day: 13, date: '2026-11-13' },
                { name: 'SÁBADO', day: 14, date: '2026-11-14' },
                { name: 'DOMINGO', day: 15, date: '2026-11-15' }
              ].map((wDay, wDayIndex) => {
                const colIndex = wDayIndex; // 0: Lunes ... 6: Domingo
                const dayShifts = filteredShifts.filter((s) => s.date === wDay.date);

                return (
                  <div
                    key={wDay.date}
                    onClick={() => openNewShiftModal(wDay.date)}
                    style={{
                      border: wDay.isToday ? '2px solid #ff8901' : '1px solid #e8e6e5',
                      borderRadius: '12px',
                      padding: '14px 12px',
                      background: '#ffffff',
                      boxShadow: wDay.isToday ? '0 4px 14px rgba(255,137,1,0.12)' : 'none',
                      cursor: 'pointer',
                      minHeight: '260px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '14px', borderBottom: '1px solid #f0edeb', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#6e6764', letterSpacing: '0.5px' }}>
                        {wDay.name}
                      </span>
                      <div style={{ marginTop: '4px' }}>
                        <span
                          style={{
                            fontSize: '16px',
                            fontWeight: 800,
                            width: wDay.isToday ? '28px' : 'auto',
                            height: wDay.isToday ? '28px' : 'auto',
                            borderRadius: wDay.isToday ? '50%' : '0',
                            background: wDay.isToday ? '#ff8901' : 'transparent',
                            color: '#251f1d',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {wDay.day}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      {dayShifts.map((shift) => {
                        const shiftColor = shift.responsible.includes('Alejandro')
                          ? '#0284c7'
                          : shift.responsible.includes('Roberto')
                          ? '#8b5cf6'
                          : shift.responsible.includes('Mariana')
                          ? '#10b981'
                          : shift.responsible.includes('Carlos')
                          ? '#ff8901'
                          : '#251f1d';

                        return (
                          <div
                            key={shift.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditShiftModal(shift);
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredShift({ ...shift, rect, colIndex });
                            }}
                            onMouseLeave={() => setHoveredShift(null)}
                            style={{
                              background: '#f8f7f6',
                              border: '1px solid #e8e6e5',
                              borderLeft: `3px solid ${shiftColor}`,
                              borderRadius: '8px',
                              padding: '10px',
                              cursor: 'pointer',
                              transition: 'transform 0.15s, box-shadow 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: shiftColor,
                                  color: '#ffffff',
                                  fontWeight: 800,
                                  fontSize: '9px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                {getInitials(shift.responsible)}
                              </span>
                              <span style={{ fontSize: '10px', color: '#6e6764', fontWeight: 600 }}>{shift.startTime} - {shift.endTime}</span>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#251f1d', marginBottom: '2px' }}>
                              {shift.responsible}
                            </div>
                            <div style={{ fontSize: '10px', color: '#8e8784' }}>
                              {shift.area || (shift.startTime === '09:00' ? 'Recepción y Piso de Ventas' : 'Cierre y Supervisión de Patio')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pie explicativo del calendario (Imagen 2) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', background: '#f8f7f6', borderRadius: '8px', marginTop: '16px', fontSize: '12px', color: '#6e6764' }}>
            <span style={{ color: '#ff8901', display: 'flex' }}><ClockIcon size={14} /></span>
            <span>Pasa el cursor o toca una guardia para ver detalles completos. Haz clic en un día para programar una nueva guardia.</span>
          </div>
        </div>
      )}

      {/* =============================================================
          POPOVER FLOTANTE AL LADO DE LA TARJETA (RÉPLICA EXACTA DE IMÁGENES 1, 2 Y 3)
          Normalmente se coloca al lado derecho (left = rect.right + 10px).
          SÓLO si está en el borde del lado derecho (Sábado o Domingo, colIndex >= 5),
          se coloca a la izquierda adyacente (left = rect.left - width - 10px).
          ============================================================= */}
      {hoveredShift && hoveredShift.rect && (() => {
        const popoverWidth = 280;
        const colIndex = hoveredShift.colIndex ?? 0;
        const isRightEdge = colIndex >= 5;
        const leftPos = isRightEdge
          ? hoveredShift.rect.left - popoverWidth - 10
          : hoveredShift.rect.right + 10;
        const topPos = Math.min(
          Math.max(hoveredShift.rect.top - 8, 15),
          (typeof window !== 'undefined' ? window.innerHeight : 900) - 300
        );

        return (
          <div
            style={{
              position: 'fixed',
              zIndex: 999999,
              top: `${topPos}px`,
              left: `${leftPos}px`,
              width: `${popoverWidth}px`,
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '16px 18px',
              boxShadow: '0 14px 40px rgba(0,0,0,0.20)',
              border: '1px solid #eae7e5',
              borderTop: `3px solid ${
                hoveredShift.responsible.includes('Mariana')
                  ? '#10b981'
                  : hoveredShift.responsible.includes('Alejandro')
                  ? '#0284c7'
                  : hoveredShift.responsible.includes('Roberto')
                  ? '#8b5cf6'
                  : '#ff8901'
              }`,
              pointerEvents: 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#251f1d' }}>
                {hoveredShift.responsible}
              </h4>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '16px', background: '#fff5eb', color: '#ff8901', border: '1px solid #ffd8b3', whiteSpace: 'nowrap' }}>
                {hoveredShift.area || 'Recepción y Piso de Ventas'}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: '#6e6764', display: 'flex', flexDirection: 'column', gap: '7px', margin: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#ff8901', display: 'flex' }}><CalendarIcon size={14} /></span>
                <span>{formatDate(hoveredShift.date, 'long')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#ff8901', display: 'flex' }}><ClockIcon size={14} /></span>
                <strong style={{ color: '#251f1d' }}>{hoveredShift.startTime} - {hoveredShift.endTime}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#ff8901', display: 'flex' }}><PhoneIcon size={14} /></span>
                <span>{hoveredShift.phone || '5543219876'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#ff8901', display: 'flex' }}><MailIcon size={14} /></span>
                <span>{hoveredShift.email || `${hoveredShift.responsible.toLowerCase().replace(/\s+/g, '.')}@autocorp.mx`}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8f7f6', borderRadius: '8px', padding: '10px 12px', fontSize: '11px', fontStyle: 'italic', color: '#6e6764', margin: '10px 0 8px 0', lineHeight: 1.4 }}>
              "{hoveredShift.observations || 'Responsable de apertura puntual, activación de exhibición y recepción del primer turno.'}"
            </div>

            <div style={{ fontSize: '10px', color: '#8e8784', textAlign: 'right' }}>
              Haz clic para editar guardia
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          3. TARJETAS DE ACTIVIDADES 3D (RÉPLICA EXACTA DE IMAGEN 2)
          ========================================================================= */}
      {subTab === 'actividades' && (
        <div className="card" style={{ padding: '24px', borderRadius: '14px', border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#251f1d', margin: 0 }}>
                Actividades Operativas de la Sucursal
              </h3>
              <p style={{ fontSize: '12px', color: '#8e8784', margin: '4px 0 0 0' }}>
                Acerca el puntero o toca una tarjeta para girarla y consultar su reverso con detalles y acciones.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#6e6764', fontWeight: 600 }}>Filtrar por estado:</span>
              <select
                value={activityStatusFilter}
                onChange={(e) => setActivityStatusFilter(e.target.value)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d5d0ce',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#251f1d',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>

          {/* Grilla 4x2 de Tarjetas de Actividades */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
            {filteredActivities.map((act) => {
              const badgeClass =
                act.status === 'completada'
                  ? 'badge-success'
                  : act.status === 'en_proceso'
                  ? 'badge-warning'
                  : 'badge-dark';

              const badgeColor =
                act.status === 'completada'
                  ? { bg: '#dcfce7', text: '#16a34a', label: 'Completada' }
                  : act.status === 'en_proceso'
                  ? { bg: '#e0f2fe', text: '#0284c7', label: 'En proceso' }
                  : { bg: '#fef3c7', text: '#d97706', label: 'Pendiente' };

              return (
                <div
                  key={act.id}
                  className="flip-wrapper"
                  onClick={() => openEditActivityModal(act)}
                  style={{ height: '220px', cursor: 'pointer' }}
                >
                  <div className="flip-inner" style={{ height: '100%' }}>
                    {/* Frente de la Tarjeta */}
                    <div
                      className="flip-face flip-front"
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #eae7e5',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fff5eb', color: '#ff8901', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                          {act.iconType === 'key' ? '🔑' : act.iconType === 'car' ? '🚗' : act.iconType === 'tools' ? '🛠' : act.iconType === 'user' ? '🤝' : act.iconType === 'shield' ? '🛡' : act.iconType === 'lock' ? '🔒' : act.iconType === 'inspection' ? '🔍' : '📋'}
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            backgroundColor: badgeColor.bg,
                            color: badgeColor.text
                          }}
                        >
                          ● {badgeColor.label}
                        </span>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#251f1d', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                          {act.title}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0edeb', paddingTop: '10px', fontSize: '11px', color: '#8e8784' }}>
                        <span>🕒 {act.time} · {formatDate(act.date, 'short')}</span>
                        <span style={{ fontSize: '14px' }}>⇅</span>
                      </div>
                    </div>

                    {/* Reverso de la Tarjeta */}
                    <div
                      className="flip-face flip-back"
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #eae7e5',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#ff8901', textTransform: 'uppercase' }}>
                          Detalle de Asignación
                        </span>
                        <h5 style={{ fontSize: '14px', fontWeight: 800, margin: '4px 0 6px 0', color: '#251f1d' }}>
                          {act.responsible}
                        </h5>
                        <p style={{ fontSize: '11px', color: '#6e6764', margin: 0, lineHeight: 1.4 }}>
                          {act.description || 'Sin notas adicionales.'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0edeb', paddingTop: '10px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActivityStatus(act.id);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #251f1d',
                            background: '#ffffff',
                            color: '#251f1d',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {act.status === 'completada' ? 'Reabrir' : 'Completar'}
                        </button>
                        <span style={{ fontSize: '11px', color: '#ff8901', fontWeight: 700 }}>Volver ↺</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MODAL: PROGRAMAR NUEVA GUARDIA (RÉPLICA EXACTA DE IMAGEN 3)
          ========================================================================= */}
      {activeShiftModal && (
        <div className="modal-backdrop" onClick={() => setActiveShiftModal(null)}>
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid #eae7e5'
            }}
          >
            {/* Cabecera */}
            <div style={{ padding: '20px 28px', borderBottom: '1px solid #f0edeb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#251f1d' }}>
                {activeShiftModal.isEdit ? 'Editar Guardia' : 'Programar Nueva Guardia'}
              </h3>
              <button
                onClick={() => setActiveShiftModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex' }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveShift} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Fecha de guardia * */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                  Fecha de guardia *
                </label>
                <input
                  type="date"
                  required
                  value={shiftForm.date}
                  onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                />
              </div>

              {/* Responsable * */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                  Responsable *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Morales"
                  value={shiftForm.responsible}
                  onChange={(e) => setShiftForm({ ...shiftForm, responsible: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                />
              </div>

              {/* Horario de inicio * y Horario de fin * */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                    Horario de inicio *
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftForm.startTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                    Horario de fin *
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftForm.endTime}
                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
              </div>

              {/* Celular y Correo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                    Celular de contacto
                  </label>
                  <input
                    type="tel"
                    placeholder="10 dígitos"
                    value={shiftForm.phone}
                    onChange={(e) => setShiftForm({ ...shiftForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="correo@autocorp.mx"
                    value={shiftForm.email}
                    onChange={(e) => setShiftForm({ ...shiftForm, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
              </div>

              {/* Área o función asignada */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                  Área o función asignada
                </label>
                <select
                  value={shiftForm.area}
                  onChange={(e) => setShiftForm({ ...shiftForm, area: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                >
                  <option value="Recepción y Piso de Ventas">Recepción y Piso de Ventas</option>
                  <option value="Showroom Principal">Showroom Principal</option>
                  <option value="Pruebas de Manejo">Pruebas de Manejo</option>
                  <option value="Cierre y Supervisión de Patio">Cierre y Supervisión de Patio</option>
                  <option value="Valuación y Entregas VIP">Valuación y Entregas VIP</option>
                </select>
              </div>

              {/* Observaciones */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                  Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Instrucciones especiales o notas de la guardia"
                  value={shiftForm.observations}
                  onChange={(e) => setShiftForm({ ...shiftForm, observations: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d', resize: 'vertical' }}
                />
              </div>

              {/* Botones del footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid #f0edeb' }}>
                <button
                  type="button"
                  onClick={() => setActiveShiftModal(null)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: '1px solid #d5d0ce',
                    background: '#ffffff',
                    color: '#251f1d',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ff8901',
                    color: '#251f1d',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '13px',
                    boxShadow: '0 2px 8px rgba(255,137,1,0.3)'
                  }}
                >
                  {activeShiftModal.isEdit ? 'Guardar Cambios' : 'Crear Guardia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. MODAL: NUEVA ACTIVIDAD OPERATIVA (RÉPLICA EXACTA DE IMAGEN 4)
          ========================================================================= */}
      {activeActivityModal && (
        <div className="modal-backdrop" onClick={() => setActiveActivityModal(null)}>
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid #eae7e5'
            }}
          >
            {/* Cabecera */}
            <div style={{ padding: '20px 28px', borderBottom: '1px solid #f0edeb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#251f1d' }}>
                {activeActivityModal.isEdit ? 'Editar Actividad' : 'Nueva Actividad Operativa'}
              </h3>
              <button
                onClick={() => setActiveActivityModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex' }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Nombre de la actividad * */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                  Nombre de la actividad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Revisión técnica de autos en patio"
                  value={actForm.title}
                  onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                />
              </div>

              {/* Icono representativo * y Estado actual * */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                    Icono representativo *
                  </label>
                  <select
                    value={actForm.iconType}
                    onChange={(e) => setActForm({ ...actForm, iconType: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                  >
                    <option value="key">Apertura (Llave)</option>
                    <option value="car">Vehículo (Auto)</option>
                    <option value="tools">Herramientas (Limpieza/Mecánica)</option>
                    <option value="user">Recepción (Usuario)</option>
                    <option value="shield">Seguridad (Escudo)</option>
                    <option value="lock">Cierre (Candado)</option>
                    <option value="inspection">Inspección / Peritaje</option>
                    <option value="clipboard">Reunión / Estrategia</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                    Estado actual *
                  </label>
                  <select
                    value={actForm.status}
                    onChange={(e) => setActForm({ ...actForm, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </div>

              {/* Responsable * */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                  Responsable *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Morales"
                  value={actForm.responsible}
                  onChange={(e) => setActForm({ ...actForm, responsible: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                />
              </div>

              {/* Fecha asignada * y Horario * */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                    Fecha asignada *
                  </label>
                  <input
                    type="date"
                    required
                    value={actForm.date}
                    onChange={(e) => setActForm({ ...actForm, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                    Horario *
                  </label>
                  <input
                    type="time"
                    required
                    value={actForm.time}
                    onChange={(e) => setActForm({ ...actForm, time: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalle de lo que involucra la actividad"
                  value={actForm.description}
                  onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d', resize: 'vertical' }}
                />
              </div>

              {/* Observaciones */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                  Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas adicionales o seguimiento"
                  value={actForm.observations}
                  onChange={(e) => setActForm({ ...actForm, observations: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d', resize: 'vertical' }}
                />
              </div>

              {/* Botones del footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid #f0edeb' }}>
                <button
                  type="button"
                  onClick={() => setActiveActivityModal(null)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: '1px solid #d5d0ce',
                    background: '#ffffff',
                    color: '#251f1d',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ff8901',
                    color: '#251f1d',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '13px',
                    boxShadow: '0 2px 8px rgba(255,137,1,0.3)'
                  }}
                >
                  {activeActivityModal.isEdit ? 'Guardar Cambios' : 'Agregar Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
