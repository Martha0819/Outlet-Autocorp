'use client';

import React, { useState, useMemo } from 'react';
import { useNotify } from '@/store/features/ui/useNotify';
import { formatDate, formatDateRange, getInitials, getTodayISO } from '@/lib/utils';
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
import {
  CalendarIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckIcon,
  CloseIcon,
  FlipIcon,
} from '@/components/ui/Icons';

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px solid #d5d0ce',
  fontSize: 13,
  backgroundColor: '#ffffff',
  color: '#251f1d',
  outline: 'none',
};

function toTimeStr(val) {
  if (!val) return '09:00';
  if (typeof val === 'string') {
    if (val.includes('T')) return val.slice(11, 16);
    if (val.length <= 5) return val;
  }
  try {
    return new Date(val).toISOString().slice(11, 16);
  } catch (e) {
    return '09:00';
  }
}

function toDateStr(val) {
  if (!val) return '';
  if (typeof val === 'string') {
    if (val.includes('T')) return val.slice(0, 10);
    return val.slice(0, 10);
  }
  try {
    return new Date(val).toISOString().slice(0, 10);
  } catch (e) {
    return '';
  }
}

export function GuardiasView() {
  const notify = useNotify();
  const { puede } = usePermiso();
  const puedeCrearGuardia = puede('guardia', 'crear');
  const puedeEditarGuardia = puede('guardia', 'editar');
  const puedeEliminarGuardia = puede('guardia', 'eliminar');

  const puedeCrearActividad = puede('actividad', 'crear');
  const puedeEditarActividad = puede('actividad', 'editar');
  const puedeEliminarActividad = puede('actividad', 'eliminar');

  const [subTab, setSubTab] = useState('calendario'); // 'calendario' | 'actividades'
  const [responsibleFilter, setResponsibleFilter] = useState('all');
  const [activityStatusFilter, setActivityStatusFilter] = useState('all');

  // Modo de visualización semanal: 'weekend' (Viernes a Domingo) o 'full' (Toda la semana)
  const [weekMode, setWeekMode] = useState('weekend'); // 'weekend' | 'full'
  const [weekOffset, setWeekOffset] = useState(0); // semanas de diferencia respecto a la actual

  // Consultas RTK Query a base de datos
  const { data: guardiasData, isLoading: loadingGuardias } = useGetGuardiasQuery();
  const guardias = useMemo(() => {
    if (!guardiasData) return [];
    return Array.isArray(guardiasData) ? guardiasData : (guardiasData.items || []);
  }, [guardiasData]);

  const { data: actividadesData, isLoading: loadingActividades } = useGetActividadesQuery();
  const actividades = useMemo(() => {
    if (!actividadesData) return [];
    return Array.isArray(actividadesData) ? actividadesData : (actividadesData.items || []);
  }, [actividadesData]);

  const { data: usuarios = [] } = useGetUsuariosQuery();
  const { data: turnos = [] } = useGetCatalogoQuery('turno');

  // Mutaciones RTK Query
  const [createGuardia, { isLoading: isCreatingGuardia }] = useCreateGuardiaMutation();
  const [updateGuardia, { isLoading: isUpdatingGuardia }] = useUpdateGuardiaMutation();
  const [deleteGuardia] = useDeleteGuardiaMutation();

  const [createActividad, { isLoading: isCreatingActividad }] = useCreateActividadMutation();
  const [updateActividad] = useUpdateActividadMutation();
  const [deleteActividad] = useDeleteActividadMutation();

  // Estados de Modales
  const [activeShiftModal, setActiveShiftModal] = useState(null); // { isEdit: boolean, guardia: object }
  const [activeActivityModal, setActiveActivityModal] = useState(null); // { isEdit: boolean, actividad: object }
  const [flippedCards, setFlippedCards] = useState({});
  const [hoveredShiftId, setHoveredShiftId] = useState(null);
  const [hoveredActivityId, setHoveredActivityId] = useState(null);
  const [popoverData, setPopoverData] = useState(null); // { shift: object, x: number, y: number }

  // Formularios
  const [shiftForm, setShiftForm] = useState({
    usuarioId: '',
    asesorNombre: '',
    asesorCorreo: '',
    asesorTelefono: '',
    fecha: '2026-11-20',
    horarioInicio: '09:00',
    horarioFin: '15:00',
    turnoId: '',
    area: 'Recepción y Piso de Ventas',
  });

  const [actForm, setActForm] = useState({
    nombre: '',
    responsableNombre: '',
    responsableId: '',
    fecha: '2026-11-20',
    horario: '10:00',
    estatus: 'PENDIENTE',
    observaciones: '',
  });

  // Lista de asesores únicos para el filtro
  const allResponsibles = useMemo(() => {
    const set = new Set();
    guardias.forEach((g) => {
      const nombre = g.asesorNombre || g.usuario?.nombre;
      if (nombre) set.add(nombre);
    });
    return Array.from(set).sort();
  }, [guardias]);

  const filteredGuardias = useMemo(() => {
    return guardias.filter((g) => {
      if (responsibleFilter === 'all') return true;
      const nombre = g.asesorNombre || g.usuario?.nombre;
      return nombre === responsibleFilter;
    });
  }, [guardias, responsibleFilter]);

  const filteredActivities = useMemo(() => {
    return actividades.filter((a) => {
      if (activityStatusFilter === 'all') return true;
      return a.estatus === activityStatusFilter;
    });
  }, [actividades, activityStatusFilter]);

  // Cálculo de los días de la semana activa
  const weekDays = useMemo(() => {
    // Base: 18 de noviembre de 2026
    const base = new Date('2026-11-18T12:00:00Z');
    base.setUTCDate(base.getUTCDate() + (weekOffset * 7));

    // Lunes de esta semana
    const dayOfWeek = (base.getUTCDay() + 6) % 7;
    const monday = new Date(base);
    monday.setUTCDate(base.getUTCDate() - dayOfWeek);

    const dayNames = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
    const shortMonths = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

    const allDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const isWeekend = i >= 4; // Viernes (4), Sábado (5), Domingo (6)
      const isToday = dateStr === '2026-11-18';

      allDays.push({
        index: i,
        name: dayNames[i],
        dayNum: d.getUTCDate(),
        monthName: shortMonths[d.getUTCMonth()],
        dateStr,
        isWeekend,
        isToday,
      });
    }

    if (weekMode === 'weekend') {
      // Solo Viernes, Sábado y Domingo (días de guardias del outlet)
      return allDays.filter((d) => d.isWeekend);
    }
    return allDays;
  }, [weekOffset, weekMode]);

  // Título de la semana para el encabezado
  const weekTitle = useMemo(() => {
    const base = new Date('2026-11-18T12:00:00Z');
    base.setUTCDate(base.getUTCDate() + (weekOffset * 7));
    const dayOfWeek = (base.getUTCDay() + 6) % 7;
    const monday = new Date(base);
    monday.setUTCDate(base.getUTCDate() - dayOfWeek);

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    if (weekMode === 'weekend') {
      const friday = new Date(monday);
      friday.setUTCDate(monday.getUTCDate() + 4);
      return `GUARDIAS DE FIN DE SEMANA: DEL ${friday.getUTCDate()} AL ${sunday.getUTCDate()} DE ${months[sunday.getUTCMonth()].toUpperCase()} DE ${sunday.getUTCFullYear()}`;
    }

    return `SEMANA DEL ${monday.getUTCDate()} AL ${sunday.getUTCDate()} DE ${months[sunday.getUTCMonth()].toUpperCase()} DE ${sunday.getUTCFullYear()}`;
  }, [weekOffset, weekMode]);

  // Handlers para Guardias
  const openNewShiftModal = (defaultDate = '2026-11-20') => {
    setShiftForm({
      usuarioId: '',
      asesorNombre: '',
      asesorCorreo: '',
      asesorTelefono: '',
      fecha: defaultDate,
      fechaFin: '',
      horarioInicio: '09:00',
      horarioFin: '15:00',
      turnoId: turnos[0]?.id ? String(turnos[0].id) : '',
      area: 'Recepción y Piso de Ventas',
    });
    setActiveShiftModal({ isEdit: false });
  };

  const openEditShiftModal = (g) => {
    setShiftForm({
      usuarioId: g.usuarioId ? String(g.usuarioId) : '',
      asesorNombre: g.asesorNombre || g.usuario?.nombre || '',
      asesorCorreo: g.asesorCorreo || g.usuario?.email || '',
      asesorTelefono: g.asesorTelefono || '',
      fecha: toDateStr(g.fecha) || '2026-11-20',
      fechaFin: toDateStr(g.fechaFin),
      horarioInicio: toTimeStr(g.horarioInicio) || '09:00',
      horarioFin: toTimeStr(g.horarioFin) || '15:00',
      turnoId: g.turnoId ? String(g.turnoId) : '',
      area: g.area || 'Recepción y Piso de Ventas',
    });
    setActiveShiftModal({ isEdit: true, guardia: g });
  };

  const handleSaveShift = async (e) => {
    e.preventDefault();
    if (!shiftForm.asesorNombre.trim() || !shiftForm.fecha || !shiftForm.turnoId) {
      notify('El nombre del asesor, fecha y turno son obligatorios', 'error');
      return;
    }
    const payload = {
      usuarioId: shiftForm.usuarioId ? Number(shiftForm.usuarioId) : null,
      asesorNombre: shiftForm.asesorNombre.trim(),
      asesorCorreo: shiftForm.asesorCorreo.trim() || null,
      asesorTelefono: shiftForm.asesorTelefono.trim() || null,
      fecha: shiftForm.fecha,
      fechaFin: shiftForm.fechaFin || null,
      horarioInicio: shiftForm.horarioInicio,
      horarioFin: shiftForm.horarioFin,
      turnoId: Number(shiftForm.turnoId),
      area: shiftForm.area,
    };
    try {
      if (activeShiftModal?.isEdit) {
        await updateGuardia({
          id: activeShiftModal.guardia.id,
          data: payload,
        }).unwrap();
        notify('Guardia actualizada correctamente');
      } else {
        await createGuardia(payload).unwrap();
        notify('Guardia programada exitosamente');
      }
      setActiveShiftModal(null);
    } catch (err) {
      notify(err?.data?.error || 'No se pudo guardar la guardia', 'error');
    }
  };

  const handleDeleteShift = async (g) => {
    const nombre = g.asesorNombre || g.usuario?.nombre || 'usuario';
    if (!confirm(`¿Eliminar la guardia de ${nombre} del ${formatDateRange(g.fecha, g.fechaFin)}?`)) return;
    try {
      await deleteGuardia(g.id).unwrap();
      notify('Guardia eliminada');
    } catch (err) {
      notify(err?.data?.error || 'No se pudo eliminar la guardia', 'error');
    }
  };

  // Handlers para Actividades
  const openNewActivityModal = () => {
    setActForm({
      nombre: '',
      responsableNombre: '',
      responsableId: '',
      fecha: '2026-11-20',
      fechaFin: '',
      horario: '10:00',
      estatus: 'PENDIENTE',
      observaciones: '',
    });
    setActiveActivityModal({ isEdit: false });
  };

  const openEditActivityModal = (act) => {
    setActForm({
      nombre: act.nombre || '',
      responsableNombre: act.responsableNombre || act.responsable?.nombre || '',
      responsableId: act.responsableId ? String(act.responsableId) : '',
      fecha: toDateStr(act.fecha) || '2026-11-20',
      fechaFin: toDateStr(act.fechaFin),
      horario: toTimeStr(act.horario) || '10:00',
      estatus: act.estatus || 'PENDIENTE',
      observaciones: act.observaciones || '',
    });
    setActiveActivityModal({ isEdit: true, actividad: act });
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!actForm.nombre.trim()) {
      notify('El nombre de la actividad es obligatorio', 'error');
      return;
    }
    const payload = {
      nombre: actForm.nombre.trim(),
      responsableNombre: actForm.responsableNombre.trim() || null,
      responsableId: actForm.responsableId ? Number(actForm.responsableId) : null,
      fecha: actForm.fecha,
      fechaFin: actForm.fechaFin || null,
      horario: actForm.horario,
      estatus: actForm.estatus || 'PENDIENTE',
      observaciones: actForm.observaciones,
    };
    try {
      if (activeActivityModal?.isEdit) {
        await updateActividad({
          id: activeActivityModal.actividad.id,
          data: payload,
        }).unwrap();
        notify('Actividad actualizada');
      } else {
        await createActividad(payload).unwrap();
        notify('Actividad creada exitosamente');
      }
      setActiveActivityModal(null);
    } catch (err) {
      notify(err?.data?.error || 'No se pudo guardar la actividad', 'error');
    }
  };

  const handleCycleStatus = async (e, act) => {
    e.stopPropagation();
    const cycle = {
      PENDIENTE: 'EN_PROCESO',
      EN_PROCESO: 'COMPLETADA',
      COMPLETADA: 'PENDIENTE',
    };
    const nextStatus = cycle[act.estatus] || 'EN_PROCESO';
    try {
      await updateActividad({
        id: act.id,
        data: { estatus: nextStatus },
      }).unwrap();
      notify(`Estatus cambiado a "${nextStatus}"`);
    } catch (err) {
      notify(err?.data?.error || 'No se pudo actualizar el estatus', 'error');
    }
  };

  const handleDeleteActivity = async (e, act) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar la actividad "${act.nombre}"?`)) return;
    try {
      await deleteActividad(act.id).unwrap();
      notify('Actividad eliminada');
    } catch (err) {
      notify(err?.data?.error || 'No se pudo eliminar la actividad', 'error');
    }
  };

  return (
    <div className="view-content active" id="view-guardias" style={{ paddingBottom: 60 }}>
      {/* =========================================================================
          1. SUBPESTAÑAS DE NAVEGACIÓN Y BOTÓN DE ALTA
          ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
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
              transition: 'all 0.2s',
            }}
          >
            <span>📅 Calendario de Guardias</span>
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
              transition: 'all 0.2s',
            }}
          >
            <span>⇅ Tarjetas de Actividades</span>
          </button>
        </div>

        {subTab === 'calendario' ? (
          puedeCrearGuardia && (
            <button
              onClick={() => openNewShiftModal('2026-11-20')}
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
                boxShadow: '0 2px 8px rgba(255,137,1,0.25)',
              }}
            >
              <PlusIcon size={14} /> <span>Nueva guardia</span>
            </button>
          )
        ) : (
          puedeCrearActividad && (
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
                boxShadow: '0 2px 8px rgba(255,137,1,0.25)',
              }}
            >
              <PlusIcon size={14} /> <span>Agregar actividad</span>
            </button>
          )
        )}
      </div>

      {/* =========================================================================
          2. CALENDARIO SEMANAL DE GUARDIAS (VIERNES A DOMINGO / TODA LA SEMANA)
          ========================================================================= */}
      {subTab === 'calendario' && (
        <div className="card" style={{ padding: '24px', borderRadius: '14px', border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', background: '#ffffff' }}>
          {/* Barra de control semanal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setWeekOffset((w) => w - 1)}
                  title="Semana anterior"
                  style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d5d0ce', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  &lt;
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  title="Semana actual del evento"
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #d5d0ce', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  Esta semana
                </button>
                <button
                  onClick={() => setWeekOffset((w) => w + 1)}
                  title="Semana siguiente"
                  style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d5d0ce', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  &gt;
                </button>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#251f1d', letterSpacing: '0.4px', margin: 0 }}>
                {weekTitle}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              {/* Selector: Viernes a Domingo vs Toda la semana */}
              <div style={{ display: 'flex', background: '#f0eceb', padding: '3px', borderRadius: '8px' }}>
                <button
                  onClick={() => setWeekMode('weekend')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: weekMode === 'weekend' ? '#ff8901' : 'transparent',
                    color: weekMode === 'weekend' ? '#251f1d' : '#6e6764',
                    boxShadow: weekMode === 'weekend' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  Viernes a Domingo
                </button>
                <button
                  onClick={() => setWeekMode('full')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: weekMode === 'full' ? '#ffffff' : 'transparent',
                    color: '#251f1d',
                    boxShadow: weekMode === 'full' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  Toda la semana
                </button>
              </div>

              {/* Filtro por Asesor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6e6764', fontWeight: 600 }}>Asesor:</span>
                <select
                  value={responsibleFilter}
                  onChange={(e) => setResponsibleFilter(e.target.value)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d5d0ce',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: '#ffffff',
                    color: '#251f1d',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">Todos los asesores</option>
                  {allResponsibles.map((nombre) => (
                    <option key={nombre} value={nombre}>
                      {nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Columnas Semanales de Guardias */}
          <div
            className={`guardias-week-grid mode-${weekMode}`}
            style={{
              display: 'grid',
              gridTemplateColumns: weekMode === 'weekend' ? 'repeat(3, 1fr)' : 'repeat(7, 1fr)',
              gap: '14px',
            }}
          >
            {weekDays.map((day) => {
              const dayShifts = filteredGuardias.filter((g) => {
                const f = toDateStr(g.fecha);
                return f === day.dateStr;
              });

              return (
                <div
                  key={day.dateStr}
                  className="guardias-day-column"
                  style={{
                    borderRadius: '12px',
                    border: day.isWeekend ? '2px solid #ff8901' : '1px solid #e8e6e5',
                    background: day.isWeekend ? '#fffdfa' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '380px',
                    boxShadow: day.isWeekend ? '0 4px 14px rgba(255,137,1,0.08)' : '0 2px 6px rgba(0,0,0,0.02)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Encabezado del día */}
                  <div
                    style={{
                      padding: '12px 14px',
                      background: day.isWeekend ? '#fff5eb' : '#faf9f8',
                      borderBottom: day.isWeekend ? '1px solid #fed7aa' : '1px solid #e8e6e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: day.isWeekend ? '#ea580c' : '#6e6764', letterSpacing: '0.5px' }}>
                        {day.name}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#251f1d', lineHeight: 1.1 }}>
                        {day.dayNum} <span style={{ fontSize: '12px', fontWeight: 600, color: '#8e8784' }}>{day.monthName}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      {day.isWeekend && (
                        <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#ff8901', color: '#ffffff' }}>
                          GUARDIA
                        </span>
                      )}
                      {day.isToday && (
                        <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#251f1d', color: '#ffffff' }}>
                          HOY
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cuerpo: Lista de guardias programadas */}
                  <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                    {dayShifts.length === 0 ? (
                      <div style={{ padding: '24px 8px', textAlign: 'center', color: '#8e8784', fontSize: '11px', fontStyle: 'italic' }}>
                        Sin guardias programadas
                      </div>
                    ) : (
                      dayShifts.map((shift) => {
                        const isHovered = hoveredShiftId === shift.id;
                        return (
                          <div
                            key={shift.id}
                            className={`guardia-shift-card ${isHovered ? 'active' : ''}`}
                            onMouseEnter={(e) => {
                              setHoveredShiftId(shift.id);
                              const rect = e.currentTarget.getBoundingClientRect();
                              const popoverWidth = 290;
                              let left = rect.right + 12;
                              if (left + popoverWidth > window.innerWidth) {
                                left = rect.left - popoverWidth - 12;
                              }
                              let top = rect.top - 10;
                              if (top + 280 > window.innerHeight) {
                                top = window.innerHeight - 290;
                              }
                              setPopoverData({
                                shift,
                                x: Math.max(left, 10),
                                y: Math.max(top, 10),
                              });
                            }}
                            onMouseLeave={() => {
                              setHoveredShiftId(null);
                              setPopoverData(null);
                            }}
                            onClick={() => {
                              setPopoverData(null);
                              puedeEditarGuardia && openEditShiftModal(shift);
                            }}
                            style={{
                              background: isHovered ? '#fffdfa' : '#ffffff',
                              borderRadius: '8px',
                              border: isHovered ? '1px solid #ff8901' : '1px solid #eae7e5',
                              borderLeft: '4px solid #ff8901',
                              padding: '10px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              boxShadow: isHovered ? '0 6px 18px rgba(255,137,1,0.22)' : '0 1px 4px rgba(0,0,0,0.03)',
                              transform: isHovered ? 'translateY(-2px)' : 'none',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ff8901',
                                    color: '#ffffff',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  {getInitials(shift.asesorNombre || shift.usuario?.nombre)}
                                </span>
                                <div>
                                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#251f1d', lineHeight: 1.2 }}>
                                    {shift.asesorNombre || shift.usuario?.nombre}
                                  </div>
                                  <div style={{ fontSize: '10px', color: '#8e8784' }}>
                                    {shift.turno?.nombre || 'Turno'}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: 3 }} onClick={(e) => e.stopPropagation()}>
                                {puedeEditarGuardia && (
                                  <button
                                    onClick={() => openEditShiftModal(shift)}
                                    style={{ padding: '3px', borderRadius: 4, border: '1px solid #d5d0ce', background: '#faf9f8', cursor: 'pointer', display: 'flex' }}
                                    title="Editar"
                                  >
                                    <EditIcon size={11} />
                                  </button>
                                )}
                                {puedeEliminarGuardia && (
                                  <button
                                    onClick={() => handleDeleteShift(shift)}
                                    style={{ padding: '3px', borderRadius: 4, border: '1px solid #fca5a5', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', display: 'flex' }}
                                    title="Eliminar"
                                  >
                                    <TrashIcon size={11} />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff8901', display: 'flex', alignItems: 'center', gap: 4 }}>
                              🕒 {toTimeStr(shift.horarioInicio)} – {toTimeStr(shift.horarioFin)}
                            </div>

                            {shift.area && (
                              <div style={{ fontSize: '10px', color: '#6e6764', background: isHovered ? '#fff3e6' : '#faf9f8', padding: '2px 6px', borderRadius: 4 }}>
                                📍 {shift.area}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Botón inferior: + Programar en este día */}
                  {puedeCrearGuardia && (
                    <div style={{ padding: '10px 12px', borderTop: '1px solid #f0edeb', background: '#faf9f8' }}>
                      <button
                        onClick={() => openNewShiftModal(day.dateStr)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px dashed #ff8901',
                          background: '#ffffff',
                          color: '#ff8901',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff5eb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }}
                      >
                        <PlusIcon size={12} /> <span>Programar guardia</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          3. TARJETAS DE ACTIVIDADES 3D
          ========================================================================= */}
      {subTab === 'actividades' && (
        <div className="card" style={{ padding: '24px', borderRadius: '14px', border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', background: '#ffffff' }}>
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
                  cursor: 'pointer',
                }}
              >
                <option value="all">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROCESO">En proceso</option>
                <option value="COMPLETADA">Completada</option>
              </select>
            </div>
          </div>

          {/* Grilla de Tarjetas de Actividades */}
          {filteredActivities.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', background: '#faf9f8', borderRadius: 12, border: '1px dashed #d5d0ce' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#251f1d', margin: '0 0 6px 0' }}>
                Aún no hay actividades registradas en la sucursal
              </p>
              <p style={{ fontSize: 12, color: '#8e8784', margin: '0 0 16px 0' }}>
                Organiza las tareas diarias del equipo asignando responsables y horarios.
              </p>
              {puedeCrearActividad && (
                <button
                  onClick={openNewActivityModal}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ff8901', color: '#251f1d', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                >
                  <PlusIcon size={14} /> Registrar primera actividad
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
              {filteredActivities.map((act) => {
                const badgeColor =
                  act.estatus === 'COMPLETADA'
                    ? { bg: '#dcfce7', text: '#16a34a', label: 'Completada' }
                    : act.estatus === 'EN_PROCESO'
                    ? { bg: '#e0f2fe', text: '#0284c7', label: 'En proceso' }
                    : { bg: '#fef3c7', text: '#d97706', label: 'Pendiente' };

                const isFlipped = flippedCards[act.id] || hoveredActivityId === act.id;

                return (
                  <div
                    key={act.id}
                    className={`flip-wrapper ${isFlipped ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredActivityId(act.id)}
                    onMouseLeave={() => setHoveredActivityId(null)}
                    onClick={() => {
                      setFlippedCards((prev) => ({ ...prev, [act.id]: !prev[act.id] }));
                    }}
                    style={{ height: '220px', cursor: 'pointer' }}
                  >
                    <div className={`flip-inner ${isFlipped ? 'is-flipped' : ''}`} style={{ height: '100%' }}>
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
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fff5eb', color: '#ff8901', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                            📋
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              backgroundColor: badgeColor.bg,
                              color: badgeColor.text,
                            }}
                          >
                            ● {badgeColor.label}
                          </span>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#251f1d', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                            {act.nombre}
                          </h4>
                          <p style={{ fontSize: '11px', color: '#8e8784', margin: 0 }}>
                            {act.responsableNombre || act.responsable?.nombre ? `Resp: ${act.responsableNombre || act.responsable.nombre}` : 'Sin responsable asignado'}
                          </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0edeb', paddingTop: '10px', fontSize: '11px', color: '#8e8784' }}>
                          <span>🕒 {toTimeStr(act.horario)} · {formatDateRange(act.fecha, act.fechaFin)}</span>
                          <span style={{ fontSize: '14px' }}>⇅</span>
                        </div>
                      </div>

                      {/* Reverso de la Tarjeta */}
                      <div
                        className="flip-face flip-back"
                        style={{
                          padding: '20px',
                          borderRadius: '12px',
                          border: '2px solid #ff8901',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#ff8901', textTransform: 'uppercase' }}>
                            Detalle de Asignación
                          </span>
                          <h5 style={{ fontSize: '14px', fontWeight: 800, margin: '4px 0 6px 0', color: '#251f1d' }}>
                            {act.responsableNombre || act.responsable?.nombre || 'Sin asignar'}
                          </h5>
                          <p style={{ fontSize: '11px', color: '#6e6764', margin: 0, lineHeight: 1.4, maxHeight: 60, overflowY: 'auto' }}>
                            {act.observaciones || 'Sin notas adicionales.'}
                          </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0edeb', paddingTop: '10px', gap: 6 }}>
                          {puedeEditarActividad && (
                            <button
                              onClick={(e) => handleCycleStatus(e, act)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #251f1d',
                                background: '#ffffff',
                                color: '#251f1d',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Cambiar estado
                            </button>
                          )}
                          <div style={{ display: 'flex', gap: 4 }}>
                            {puedeEditarActividad && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditActivityModal(act);
                                }}
                                style={{ padding: '4px 6px', borderRadius: 4, border: '1px solid #d5d0ce', background: '#faf9f8', cursor: 'pointer' }}
                                title="Editar"
                              >
                                <EditIcon size={12} />
                              </button>
                            )}
                            {puedeEliminarActividad && (
                              <button
                                onClick={(e) => handleDeleteActivity(e, act)}
                                style={{ padding: '4px 6px', borderRadius: 4, border: '1px solid #fca5a5', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer' }}
                                title="Eliminar"
                              >
                                <TrashIcon size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          4. MODAL: PROGRAMAR / EDITAR GUARDIA
          ========================================================================= */}
      {activeShiftModal && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveShiftModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              border: '1px solid #eae7e5',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#251f1d' }}>
                {activeShiftModal.isEdit ? 'Editar Guardia' : 'Programar Nueva Guardia'}
              </h3>
              <button
                onClick={() => setActiveShiftModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveShift} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Asesor / Responsable *
                </label>
                <input
                  type="text"
                  placeholder="Nombre completo del asesor..."
                  style={inputStyle}
                  value={shiftForm.asesorNombre}
                  onChange={(e) => setShiftForm({ ...shiftForm, asesorNombre: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                    Correo electrónico (opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    style={inputStyle}
                    value={shiftForm.asesorCorreo}
                    onChange={(e) => setShiftForm({ ...shiftForm, asesorCorreo: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="10 dígitos"
                    style={inputStyle}
                    value={shiftForm.asesorTelefono}
                    onChange={(e) => setShiftForm({ ...shiftForm, asesorTelefono: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                    Fecha *
                  </label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={shiftForm.fecha}
                    onChange={(e) => setShiftForm({ ...shiftForm, fecha: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                    Turno *
                  </label>
                  <select
                    style={inputStyle}
                    value={shiftForm.turnoId}
                    onChange={(e) => setShiftForm({ ...shiftForm, turnoId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar turno…</option>
                    {turnos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Fecha de fin (opcional, si la guardia dura varios días)
                </label>
                <input
                  type="date"
                  style={inputStyle}
                  value={shiftForm.fechaFin}
                  min={shiftForm.fecha || undefined}
                  onChange={(e) => setShiftForm({ ...shiftForm, fechaFin: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                    Horario Inicio *
                  </label>
                  <input
                    type="time"
                    style={inputStyle}
                    value={shiftForm.horarioInicio}
                    onChange={(e) => setShiftForm({ ...shiftForm, horarioInicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                    Horario Fin *
                  </label>
                  <input
                    type="time"
                    style={inputStyle}
                    value={shiftForm.horarioFin}
                    onChange={(e) => setShiftForm({ ...shiftForm, horarioFin: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Área / Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Recepción y Piso de Ventas"
                  style={inputStyle}
                  value={shiftForm.area}
                  onChange={(e) => setShiftForm({ ...shiftForm, area: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveShiftModal(null)}
                  style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #d5d0ce', background: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGuardia || isUpdatingGuardia}
                  style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#ff8901', color: '#251f1d', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                >
                  {activeShiftModal.isEdit ? 'Guardar Cambios' : 'Programar Guardia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. MODAL: AGREGAR / EDITAR ACTIVIDAD
          ========================================================================= */}
      {activeActivityModal && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveActivityModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              border: '1px solid #eae7e5',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#251f1d' }}>
                {activeActivityModal.isEdit ? 'Editar Actividad Operativa' : 'Agregar Actividad Operativa'}
              </h3>
              <button
                onClick={() => setActiveActivityModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Nombre de la Actividad *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Revisión técnica de autos en exhibición exterior"
                  style={inputStyle}
                  value={actForm.nombre}
                  onChange={(e) => setActForm({ ...actForm, nombre: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Responsable Asignado
                </label>
                <input
                  type="text"
                  placeholder="Nombre del responsable o área encargada..."
                  style={inputStyle}
                  value={actForm.responsableNombre}
                  onChange={(e) => setActForm({ ...actForm, responsableNombre: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                    Fecha *
                  </label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={actForm.fecha}
                    onChange={(e) => setActForm({ ...actForm, fecha: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                    Horario *
                  </label>
                  <input
                    type="time"
                    style={inputStyle}
                    value={actForm.horario}
                    onChange={(e) => setActForm({ ...actForm, horario: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Fecha de fin (opcional, si la actividad dura varios días)
                </label>
                <input
                  type="date"
                  style={inputStyle}
                  value={actForm.fechaFin}
                  min={actForm.fecha || undefined}
                  onChange={(e) => setActForm({ ...actForm, fechaFin: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Observaciones / Instrucciones
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre la ejecución de la actividad..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                  value={actForm.observaciones}
                  onChange={(e) => setActForm({ ...actForm, observaciones: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveActivityModal(null)}
                  style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #d5d0ce', background: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingActividad}
                  style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#ff8901', color: '#251f1d', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                >
                  {activeActivityModal.isEdit ? 'Guardar Cambios' : 'Crear Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popover / Tarjeta flotante lateral al pasar el cursor sobre una guardia */}
      {popoverData && (
        <div
          className="shift-popover animate-fade-in"
          style={{
            position: 'fixed',
            left: `${popoverData.x}px`,
            top: `${popoverData.y}px`,
            width: '290px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(37,31,29,0.18), 0 2px 6px rgba(0,0,0,0.06)',
            border: '1px solid #eae7e5',
            zIndex: 1500,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Cabecera con franja naranja superior */}
          <div
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid #f0edeb',
              borderTop: '4px solid #ff8901',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fffdfa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: '#ff8901',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getInitials(popoverData.shift.asesorNombre || popoverData.shift.usuario?.nombre)}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d' }}>
                {popoverData.shift.asesorNombre || popoverData.shift.usuario?.nombre || 'Asesor'}
              </span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#ffebd4',
                color: '#ea580c',
              }}
            >
              {popoverData.shift.turno?.nombre || 'Guardia'}
            </span>
          </div>

          {/* Cuerpo con los datos detallados */}
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#251f1d' }}>
              <span style={{ color: '#ff8901', fontSize: '14px' }}>🕒</span>
              <span>
                <strong>Horario:</strong> {toTimeStr(popoverData.shift.horarioInicio)} – {toTimeStr(popoverData.shift.horarioFin)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#251f1d' }}>
              <span style={{ color: '#ff8901', fontSize: '14px' }}>📅</span>
              <span>
                <strong>Fecha:</strong> {formatDateRange(popoverData.shift.fecha, popoverData.shift.fechaFin, 'long')}
              </span>
            </div>

            {popoverData.shift.area && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#251f1d' }}>
                <span style={{ color: '#ff8901', fontSize: '14px' }}>📍</span>
                <span>
                  <strong>Área:</strong> {popoverData.shift.area}
                </span>
              </div>
            )}

            {(popoverData.shift.asesorCorreo || popoverData.shift.usuario?.email) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6e6764', fontSize: '11px' }}>
                <span>✉️</span>
                <span>{popoverData.shift.asesorCorreo || popoverData.shift.usuario?.email}</span>
              </div>
            )}

            {popoverData.shift.asesorTelefono && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6e6764', fontSize: '11px' }}>
                <span>📞</span>
                <span>{popoverData.shift.asesorTelefono}</span>
              </div>
            )}
          </div>

          {/* Pie de Popover */}
          <div
            style={{
              padding: '8px 14px',
              backgroundColor: '#faf9f8',
              borderTop: '1px solid #f0edeb',
              fontSize: '11px',
              color: '#8e8784',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            Haz clic para consultar o editar la guardia
          </div>
        </div>
      )}
    </div>
  );
}
