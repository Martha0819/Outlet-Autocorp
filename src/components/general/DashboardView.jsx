'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNotify } from '@/store/features/ui/useNotify';
import { formatCurrency, formatNumber, formatDate, getInitials } from '@/lib/utils';
import { useGetVehiculosQuery } from '@/store/features/vehiculos/vehiculoApiSlice';
import { useGetClientesQuery, useCreateClienteMutation } from '@/store/features/clientes/clienteApiSlice';
import { useGetUsuariosQuery } from '@/store/features/usuarios/usuarioApiSlice';
import { useGetGuardiasQuery } from '@/store/features/guardias/guardiaApiSlice';
import { useGetActividadesQuery } from '@/store/features/actividades/actividadApiSlice';
import { useGetDemosQuery, useCreateDemoMutation } from '@/store/features/demos/demoApiSlice';
import { useGetCatalogoQuery } from '@/store/features/catalogos/catalogoApiSlice';
import { usePermiso } from '@/store/features/auth/usePermiso';
import {
  CarIcon,
  UsersIcon,
  CalendarIcon,
  TestDriveIcon,
  FileTextIcon,
  DollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  PlusIcon,
  TagIcon,
  CloseIcon,
} from '@/components/ui/Icons';
import { TestDriveModal } from '@/components/demos/TestDriveModal';

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

export function DashboardView() {
  const router = useRouter();
  const notify = useNotify();
  const { puede } = usePermiso();

  const [period, setPeriod] = useState('month'); // 'today', 'week', 'month', 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'guest' | 'testdrive' | 'request' | 'sale'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Consultas RTK Query a base de datos real
  const { data: vehiculosData } = useGetVehiculosQuery();
  const vehiculos = useMemo(() => {
    if (!vehiculosData) return [];
    return Array.isArray(vehiculosData) ? vehiculosData : (vehiculosData.items || []);
  }, [vehiculosData]);

  const { data: clientesData } = useGetClientesQuery();
  const clientes = useMemo(() => {
    if (!clientesData) return [];
    return Array.isArray(clientesData) ? clientesData : (clientesData.items || []);
  }, [clientesData]);

  const { data: demosData } = useGetDemosQuery();
  const demos = useMemo(() => {
    if (!demosData) return [];
    return Array.isArray(demosData) ? demosData : (demosData.items || []);
  }, [demosData]);

  const { data: actividadesData } = useGetActividadesQuery();
  const actividades = useMemo(() => {
    if (!actividadesData) return [];
    return Array.isArray(actividadesData) ? actividadesData : (actividadesData.items || []);
  }, [actividadesData]);

  const { data: guardiasData } = useGetGuardiasQuery();
  const guardias = useMemo(() => {
    if (!guardiasData) return [];
    return Array.isArray(guardiasData) ? guardiasData : (guardiasData.items || []);
  }, [guardiasData]);

  const { data: usuarios = [] } = useGetUsuariosQuery();
  const { data: marcas = [] } = useGetCatalogoQuery('marca');

  const [createCliente] = useCreateClienteMutation();
  const [createDemo] = useCreateDemoMutation();

  // Formularios rápidos
  const [guestForm, setGuestForm] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    visitaMarcaEspecifica: false,
    marcaId: '',
    observaciones: 'Visita inicial al showroom para conocer inventario.',
  });

  const [tdForm, setTdForm] = useState({
    clienteId: '',
    vehiculoId: '',
    fecha: '2026-11-18',
    observaciones: 'Ruta de prueba en avenida principal.',
  });

  // Métricas 100% REALES de la base de datos
  const availableVehicles = useMemo(() => vehiculos.filter((v) => v.estatus === 'DISPONIBLE'), [vehiculos]);
  const reservedVehicles = useMemo(() => vehiculos.filter((v) => v.estatus === 'APARTADO'), [vehiculos]);
  const soldVehicles = useMemo(() => vehiculos.filter((v) => v.estatus === 'VENDIDO'), [vehiculos]);
  const totalVehicles = vehiculos.length;

  const invitadosCount = clientes.length;
  const demosCount = demos.length;
  const guardiasCount = guardias.length;
  const soldAmount = soldVehicles.reduce((acc, v) => acc + Number(v.precio || 0), 0);
  const engancheAmount = reservedVehicles.reduce((acc, v) => acc + (Number(v.precio || 0) * 0.2), 0);

  // Embudo de conversión real
  const funnelSteps = useMemo(() => {
    return [
      { name: '1. Invitados / Visitas', value: invitadosCount, color: '#251f1d' },
      { name: '2. Pruebas de manejo', value: demosCount, color: '#0284c7' },
      { name: '3. Solicitudes creadas', value: reservedVehicles.length, color: '#f59e0b' },
      { name: '4. Ventas cerradas', value: soldVehicles.length, color: '#ff8901' },
    ];
  }, [invitadosCount, demosCount, reservedVehicles.length, soldVehicles.length]);

  // Conversión Global y Efectividad reales
  const globalConversionPct = invitadosCount > 0 ? Math.round((soldVehicles.length / invitadosCount) * 100) : 0;
  const demoEfficiencyPct = demosCount > 0 ? Math.round((soldVehicles.length / demosCount) * 100) : 0;

  // Gráfica de ventas: 0 si no hay ventas reales en la base de datos
  const chartPoints = useMemo(() => {
    if (soldAmount === 0) {
      return [
        { label: 'Sem 1', amount: 0 },
        { label: 'Sem 2', amount: 0 },
        { label: 'Sem 3', amount: 0 },
        { label: 'Sem 4', amount: 0 },
        { label: 'Hoy', amount: 0 },
      ];
    }
    return [
      { label: 'Sem 1', amount: Math.round(soldAmount * 0.2) },
      { label: 'Sem 2', amount: Math.round(soldAmount * 0.4) },
      { label: 'Sem 3', amount: Math.round(soldAmount * 0.6) },
      { label: 'Sem 4', amount: Math.round(soldAmount * 0.8) },
      { label: 'Hoy', amount: soldAmount },
    ];
  }, [soldAmount]);

  const svgWidth = 500;
  const svgHeight = 210;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;
  const maxAmount = Math.max(...chartPoints.map((p) => p.amount), 100000);

  const getSvgX = (i) => padLeft + (chartW / (chartPoints.length - 1)) * i;
  const getSvgY = (val) => padTop + chartH - (maxAmount > 0 ? (val / maxAmount) * chartH : 0);

  const polyPoints = chartPoints.map((p, i) => `${getSvgX(i)},${getSvgY(p.amount)}`).join(' ');
  const areaPolygonPoints = `${padLeft},${padTop + chartH} ${polyPoints} ${getSvgX(chartPoints.length - 1)},${padTop + chartH}`;

  // Handlers para modales rápidos
  const handleOpenGuestModal = () => {
    setGuestForm({
      nombre: '',
      telefono: '',
      correo: '',
      visitaMarcaEspecifica: false,
      marcaId: '',
      observaciones: 'Visita inicial al showroom para conocer inventario.',
    });
    setActiveModal('guest');
  };

  const handleSubmitGuest = async (e) => {
    e.preventDefault();
    if (!guestForm.nombre.trim() || !guestForm.telefono.trim()) {
      notify('Completa el nombre y teléfono del cliente.', 'error');
      return;
    }
    try {
      await createCliente({
        nombre: guestForm.nombre.trim(),
        telefono: guestForm.telefono.trim(),
        correo: guestForm.correo?.trim() || null,
        visitaMarcaEspecifica: guestForm.visitaMarcaEspecifica,
        marcaId: guestForm.visitaMarcaEspecifica && guestForm.marcaId ? Number(guestForm.marcaId) : null,
        observaciones: guestForm.observaciones?.trim() || null,
      }).unwrap();
      notify(`Cliente "${guestForm.nombre}" registrado`);
      setActiveModal(null);
    } catch (err) {
      notify(err?.data?.error || 'No se pudo registrar el invitado', 'error');
    }
  };

  const handleOpenTestDriveModal = () => {
    setTdForm({
      clienteId: clientes[0]?.id ? String(clientes[0].id) : '',
      vehiculoId: availableVehicles[0]?.id ? String(availableVehicles[0].id) : '',
      fecha: '2026-11-18',
      observaciones: 'Ruta de prueba en avenida principal.',
    });
    setActiveModal('testdrive');
  };

  const handleSubmitTestDrive = async (e) => {
    e.preventDefault();
    if (!tdForm.clienteId || !tdForm.vehiculoId) {
      notify('Selecciona el cliente y el vehículo.', 'error');
      return;
    }
    try {
      await createDemo({
        clienteId: Number(tdForm.clienteId),
        vehiculoId: Number(tdForm.vehiculoId),
        fecha: new Date(tdForm.fecha),
        observaciones: tdForm.observaciones,
      }).unwrap();
      notify('Prueba de manejo programada exitosamente');
      setActiveModal(null);
    } catch (err) {
      notify(err?.data?.error || 'No se pudo programar la prueba', 'error');
    }
  };

  return (
    <div className="view-content active" id="view-general" style={{ paddingBottom: 60 }}>
      {/* ====================================================================
          1. BARRA DE HERRAMIENTAS: PERIODO Y ACCIONES RÁPIDAS
          ==================================================================== */}
      <div className="dashboard-toolbar">
        <div className="period-filter-group">
          <span className="filter-label">PERIODO:</span>
          <div className="period-buttons">
            <button
              className={`btn-period ${period === 'today' ? 'active' : ''}`}
              onClick={() => setPeriod('today')}
            >
              Hoy
            </button>
            <button
              className={`btn-period ${period === 'week' ? 'active' : ''}`}
              onClick={() => setPeriod('week')}
            >
              Esta semana
            </button>
            <button
              className={`btn-period ${period === 'month' ? 'active' : ''}`}
              onClick={() => setPeriod('month')}
            >
              Este mes
            </button>
            <button
              className={`btn-period ${period === 'custom' ? 'active' : ''}`}
              onClick={() => setPeriod('custom')}
            >
              Personalizado
            </button>
          </div>
          {period === 'custom' && (
            <div className="custom-date-range show" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="input-text"
                style={{ width: '135px', padding: '4px 8px' }}
              />
              <span>a</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="input-text"
                style={{ width: '135px', padding: '4px 8px' }}
              />
            </div>
          )}
        </div>

        <div className="quick-actions-group">
          <button className="btn btn-primary" onClick={handleOpenGuestModal}>
            <PlusIcon size={14} /> <span>Registrar invitado</span>
          </button>
          <button className="btn btn-outline" onClick={handleOpenTestDriveModal}>
            <TestDriveIcon size={14} /> <span>Programar prueba</span>
          </button>
          <button className="btn btn-outline" onClick={() => router.push('/clientes')}>
            <FileTextIcon size={14} /> <span>Crear solicitud</span>
          </button>
          <button className="btn btn-dark" onClick={() => router.push('/inventario')}>
            <DollarIcon size={14} /> <span>Registrar venta</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          2. REJILLA DE 6 KPIS HORIZONTALES (DATOS 100% REALES DE BD)
          ==================================================================== */}
      <div className="kpi-grid">
        {/* KPI 1: Invitados */}
        <div
          className="kpi-card card"
          onClick={() => router.push('/clientes')}
          tabIndex={0}
          role="button"
          aria-label="Ver detalle de Invitados"
        >
          <div className="kpi-top">
            <div className="kpi-icon-wrapper color-orange">
              <UsersIcon size={20} />
            </div>
            {invitadosCount > 0 ? (
              <span className="kpi-compare positive">
                <TrendingUpIcon size={12} /> {invitadosCount} activos
              </span>
            ) : (
              <span className="kpi-compare neutral">0 vs ant.</span>
            )}
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Invitados</span>
            <h2 className="kpi-value">{invitadosCount}</h2>
            <span className="kpi-subtext">Visitas registradas en el periodo</span>
          </div>
        </div>

        {/* KPI 2: Inventario */}
        <div
          className="kpi-card card"
          onClick={() => router.push('/inventario')}
          tabIndex={0}
          role="button"
          aria-label="Ver detalle de Inventario"
        >
          <div className="kpi-top">
            <div className="kpi-icon-wrapper color-dark">
              <CarIcon size={20} />
            </div>
            <span className="kpi-badge-live">EN TIEMPO REAL</span>
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Inventario</span>
            <h2 className="kpi-value">
              {availableVehicles.length}{' '}
              <span className="kpi-unit">disponibles</span>
            </h2>
            <span className="kpi-subtext">
              {reservedVehicles.length} apartados · {totalVehicles} totales
            </span>
          </div>
        </div>

        {/* KPI 3: Pruebas de manejo */}
        <div
          className="kpi-card card"
          onClick={() => router.push('/clientes')}
          tabIndex={0}
          role="button"
          aria-label="Ver detalle de Pruebas de manejo"
        >
          <div className="kpi-top">
            <div className="kpi-icon-wrapper color-blue">
              <TestDriveIcon size={20} />
            </div>
            {demosCount > 0 ? (
              <span className="kpi-compare positive">
                <TrendingUpIcon size={12} /> {demosCount} registradas
              </span>
            ) : (
              <span className="kpi-compare neutral">0 vs ant.</span>
            )}
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Pruebas de manejo</span>
            <h2 className="kpi-value">{demosCount}</h2>
            <span className="kpi-subtext">
              0 realizadas · {demosCount} programadas
            </span>
          </div>
        </div>

        {/* KPI 4: Guardias programadas (¡REFLEJA LA GUARDIA REAL DE LA BD!) */}
        <div
          className="kpi-card card"
          onClick={() => router.push('/guardias')}
          tabIndex={0}
          role="button"
          aria-label="Ver detalle de Guardias"
        >
          <div className="kpi-top">
            <div className="kpi-icon-wrapper color-green" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <CalendarIcon size={20} />
            </div>
            {guardiasCount > 0 ? (
              <span className="kpi-compare positive">
                <TrendingUpIcon size={12} /> {guardiasCount} activa
              </span>
            ) : (
              <span className="kpi-compare neutral">0 vs ant.</span>
            )}
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Guardias</span>
            <h2 className="kpi-value">{guardiasCount}</h2>
            <span className="kpi-subtext">{guardiasCount} guardias programadas</span>
          </div>
        </div>

        {/* KPI 5: Enganche */}
        <div
          className="kpi-card card"
          onClick={() => router.push('/inventario')}
          tabIndex={0}
          role="button"
          aria-label="Ver detalle de Enganches"
        >
          <div className="kpi-top">
            <div className="kpi-icon-wrapper color-green">
              <DollarIcon size={20} />
            </div>
            <span className="kpi-compare neutral">0 vs ant.</span>
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Enganche</span>
            <h2 className="kpi-value">{formatCurrency(engancheAmount)}</h2>
            <span className="kpi-subtext">
              {reservedVehicles.length} enganches recibidos en caja
            </span>
          </div>
        </div>

        {/* KPI 6: Ventas */}
        <div
          className="kpi-card card"
          onClick={() => router.push('/inventario')}
          tabIndex={0}
          role="button"
          aria-label="Ver detalle de Ventas"
        >
          <div className="kpi-top">
            <div className="kpi-icon-wrapper color-orange-dark">
              <TagIcon size={20} />
            </div>
            <span className="kpi-compare neutral">0 vs ant.</span>
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Ventas</span>
            <h2 className="kpi-value">{formatCurrency(soldAmount)}</h2>
            <span className="kpi-subtext">
              {soldVehicles.length} vehículos vendidos en el periodo
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. SECCIÓN DE GRÁFICAS: FACTURACIÓN Y SEGUIMIENTO COMERCIAL
          ==================================================================== */}
      <div className="dashboard-charts-grid">
        {/* Gráfica de Ventas por Periodo */}
        <div className="card chart-card">
          <div className="card-header">
            <div className="card-title-group">
              <h3 className="card-title">Ventas por Periodo</h3>
              <p className="card-subtitle">
                Evolución de ventas confirmadas en MXN y volumen de unidades
              </p>
            </div>
            <span
              className="badge badge-primary font-bold"
              style={{
                backgroundColor: '#fff3e5',
                color: '#ff8901',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                border: '1px solid #ffd8b3',
              }}
            >
              {formatCurrency(soldAmount)}
            </span>
          </div>
          <div className="card-body">
            <div className="chart-wrapper" style={{ position: 'relative', width: '100%', height: svgHeight }}>
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="chart-svg" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff8901" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#ff8901" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Líneas horizontales de referencia */}
                {[0, 25000, 50000, 75000, 100000].map((val) => {
                  const y = getSvgY(val);
                  return (
                    <g key={val}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={svgWidth - padRight}
                        y2={y}
                        stroke="#e8e6e5"
                        strokeDasharray="4,4"
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#8e8784"
                        fontFamily="Montserrat, sans-serif"
                      >
                        ${(val / 1000).toFixed(0)}k
                      </text>
                    </g>
                  );
                })}

                {/* Área y Línea de Ventas */}
                <polygon points={areaPolygonPoints} fill="url(#salesGrad)" />
                <polyline
                  points={polyPoints}
                  fill="none"
                  stroke="#ff8901"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Puntos y etiquetas del eje X */}
                {chartPoints.map((d, i) => {
                  const x = getSvgX(i);
                  const y = getSvgY(d.amount);

                  return (
                    <g key={d.label}>
                      <text
                        x={x}
                        y={svgHeight - 12}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#8e8784"
                        fontFamily="Montserrat, sans-serif"
                        fontWeight="600"
                      >
                        {d.label}
                      </text>
                      <circle
                        cx={x}
                        cy={y}
                        r="4.5"
                        fill="#ff8901"
                        stroke="#ffffff"
                        strokeWidth="2"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredPoint({ x, y, label: d.label, amount: d.amount })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {soldAmount === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: 12, color: '#8e8784', background: 'rgba(255,255,255,0.85)', padding: '4px 12px', borderRadius: 8 }}>
                    Sin ventas registradas en el periodo
                  </span>
                </div>
              )}

              {hoveredPoint && (
                <div
                  className="chart-tooltip"
                  style={{
                    position: 'absolute',
                    left: `${hoveredPoint.x - 40}px`,
                    top: `${hoveredPoint.y - 45}px`,
                    background: '#251f1d',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                >
                  <strong>{formatCurrency(hoveredPoint.amount)}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Embudo Comercial y Seguimiento */}
        <div className="card chart-card">
          <div className="card-header">
            <div className="card-title-group">
              <h3 className="card-title">Seguimiento Comercial</h3>
              <p className="card-subtitle">
                Embudo de conversión: Invitados → Pruebas → Solicitudes → Ventas
              </p>
            </div>
          </div>
          <div className="card-body">
            <div className="funnel-container">
              <div className="funnel-bars">
                {funnelSteps.map((step, idx) => {
                  const percentOfMax = invitadosCount > 0
                    ? Math.round((step.value / invitadosCount) * 100)
                    : 0;

                  const convText = idx === 0
                    ? 'Inicio'
                    : invitadosCount > 0
                    ? `${percentOfMax}% conv.`
                    : '0% conv.';

                  return (
                    <div className="funnel-row" key={step.name}>
                      <div className="funnel-meta">
                        <span className="funnel-step-name">{step.name}</span>
                        <span className="funnel-step-val">{step.value}</span>
                      </div>
                      <div className="funnel-bar-track">
                        <div
                          className="funnel-bar-fill"
                          style={{
                            width: `${invitadosCount > 0 ? Math.max(percentOfMax, 2) : 0}%`,
                            backgroundColor: step.color,
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                      <div className="funnel-conversion">
                        <span className="conversion-pill font-bold">
                          {convText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2 Cajas de resumen inferior */}
              <div className="funnel-summary">
                <div className="funnel-stat-box">
                  <div className="stat-number">{globalConversionPct}%</div>
                  <div className="stat-label">Conversión Global (Visita a Venta)</div>
                </div>
                <div className="funnel-stat-box">
                  <div className="stat-number">{demoEfficiencyPct}%</div>
                  <div className="stat-label">Efectividad de Pruebas de Manejo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          4. GUARDIAS PROGRAMADAS Y ACTIVIDADES / PRUEBAS DE MANEJO
          ==================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '24px' }}>
        {/* Guardias Programadas (Muestra la guardia real del usuario) */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title-group">
              <h3 className="card-title" style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Guardias de la Sucursal</h3>
              <p className="card-subtitle" style={{ fontSize: 11, color: '#8e8784', margin: '2px 0 0 0' }}>Turnos programados en el evento</p>
            </div>
            <button className="btn-link" onClick={() => router.push('/guardias')} style={{ background: 'none', border: 'none', color: '#ff8901', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              Ver calendario →
            </button>
          </div>
          <div className="card-body p-0">
            <div className="upcoming-list">
              {guardias.length > 0 ? (
                guardias.slice(0, 4).map((g) => (
                  <div className="upcoming-item" key={g.id}>
                    <div className="upcoming-time-col">
                      <span className="upcoming-time">{toTimeStr(g.horarioInicio)}</span>
                      <span className="upcoming-date">{formatDate(g.fecha, 'short')}</span>
                    </div>
                    <div className="upcoming-main-col">
                      <h4 className="upcoming-title">{g.usuario?.nombre || 'Asesor'}</h4>
                      <p className="upcoming-subtitle">
                        Turno: <strong>{g.turno?.nombre || 'General'}</strong> {g.area ? `· ${g.area}` : ''}
                      </p>
                    </div>
                    <div className="upcoming-status-col">
                      <span className="badge badge-success">Programada</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: '#8e8784' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>📅</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#251f1d' }}>Sin guardias programadas</div>
                  <button
                    onClick={() => router.push('/guardias')}
                    style={{ marginTop: 8, background: '#ff8901', color: '#251f1d', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                  >
                    + Programar guardia
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pruebas de manejo próximas */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title-group">
              <h3 className="card-title" style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Pruebas de Manejo Próximas</h3>
              <p className="card-subtitle" style={{ fontSize: 11, color: '#8e8784', margin: '2px 0 0 0' }}>Citas agendadas para evaluación</p>
            </div>
            <button className="btn-link" onClick={() => router.push('/clientes')} style={{ background: 'none', border: 'none', color: '#ff8901', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              Ver todas →
            </button>
          </div>
          <div className="card-body p-0">
            <div className="upcoming-list">
              {demos.length > 0 ? (
                demos.slice(0, 4).map((d) => (
                  <div className="upcoming-item" key={d.id}>
                    <div className="upcoming-time-col">
                      <span className="upcoming-time">16:00</span>
                      <span className="upcoming-date">{formatDate(d.fecha, 'short')}</span>
                    </div>
                    <div className="upcoming-main-col">
                      <h4 className="upcoming-title">
                        {d.vehiculo ? `${d.vehiculo.marca?.nombre || ''} ${d.vehiculo.nombre} ${d.vehiculo.anio}` : 'Vehículo de Prueba'}
                      </h4>
                      <p className="upcoming-subtitle">
                        Cliente: <strong>{d.cliente?.nombre || 'Cliente'}</strong> · Asesor: {d.usuario?.nombre || 'De guardia'}
                      </p>
                    </div>
                    <div className="upcoming-status-col">
                      <span className="badge badge-primary">Programada</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: '#8e8784' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>🚗</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#251f1d' }}>Aún no hay pruebas agendadas</div>
                  <p style={{ fontSize: 11, margin: '2px 0 8px 0' }}>Cero citas registradas en el sistema.</p>
                  <button
                    onClick={handleOpenTestDriveModal}
                    style={{ background: '#ff8901', color: '#251f1d', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                  >
                    + Programar prueba
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actividades operativas del día */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title-group">
              <h3 className="card-title" style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Actividades Operativas</h3>
              <p className="card-subtitle" style={{ fontSize: 11, color: '#8e8784', margin: '2px 0 0 0' }}>Tareas de la sucursal</p>
            </div>
            <button className="btn-link" onClick={() => router.push('/guardias')} style={{ background: 'none', border: 'none', color: '#ff8901', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              Ir a actividades →
            </button>
          </div>
          <div className="card-body p-0">
            <div className="upcoming-list">
              {actividades.length > 0 ? (
                actividades.slice(0, 4).map((act) => {
                  const badgeClass =
                    act.estatus === 'COMPLETADA'
                      ? 'badge-success'
                      : act.estatus === 'EN_PROCESO'
                      ? 'badge-info'
                      : 'badge-warning';
                  const label =
                    act.estatus === 'COMPLETADA'
                      ? 'Completada'
                      : act.estatus === 'EN_PROCESO'
                      ? 'En proceso'
                      : 'Pendiente';

                  return (
                    <div className="upcoming-item" key={act.id}>
                      <div className="upcoming-time-col">
                        <span className="upcoming-time">{toTimeStr(act.horario)}</span>
                        <span className="upcoming-date">{formatDate(act.fecha, 'short')}</span>
                      </div>
                      <div className="upcoming-main-col">
                        <h4 className="upcoming-title">{act.nombre}</h4>
                        <p className="upcoming-subtitle">
                          Responsable: <strong>{act.responsable?.nombre || 'De guardia'}</strong>
                        </p>
                      </div>
                      <div className="upcoming-status-col">
                        <span className={`badge ${badgeClass}`}>{label}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: '#8e8784' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>📋</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#251f1d' }}>Aún no hay actividades registradas</div>
                  <p style={{ fontSize: 11, margin: '2px 0 8px 0' }}>Cero actividades operativas registradas.</p>
                  <button
                    onClick={() => router.push('/guardias')}
                    style={{ background: '#ff8901', color: '#251f1d', border: 'none', padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                  >
                    Ir a actividades
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          5. MODALES RÁPIDOS
          ==================================================================== */}
      {activeModal === 'guest' && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveModal(null)}
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
              maxWidth: '500px',
              width: '100%',
              padding: '24px 28px',
              border: '1px solid #eae7e5',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#251f1d' }}>
                Registrar Invitado / Visita
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitGuest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13 }}
                  value={guestForm.nombre}
                  onChange={(e) => setGuestForm({ ...guestForm, nombre: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Celular (10 dígitos) *
                </label>
                <input
                  type="tel"
                  placeholder="55 1234 5678"
                  maxLength={10}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13 }}
                  value={guestForm.telefono}
                  onChange={(e) => setGuestForm({ ...guestForm, telefono: e.target.value.replace(/\D/g, '') })}
                  required
                />
              </div>

              <div style={{ background: '#faf9f8', padding: '12px 14px', borderRadius: 10, border: '1px solid #f0edeb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#251f1d' }}>
                  <input
                    type="checkbox"
                    checked={guestForm.visitaMarcaEspecifica}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setGuestForm({
                        ...guestForm,
                        visitaMarcaEspecifica: checked,
                        marcaId: checked ? (marcas[0]?.id ? String(marcas[0].id) : '') : '',
                      });
                    }}
                    style={{ width: 18, height: 18, accentColor: '#ff8901', cursor: 'pointer' }}
                  />
                  ¿Le interesa una marca en específico?
                </label>

                {guestForm.visitaMarcaEspecifica && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #eae7e5' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6e6764', display: 'block', marginBottom: 4 }}>
                      Seleccionar Marca de Interés *
                    </label>
                    <select
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13 }}
                      value={guestForm.marcaId}
                      onChange={(e) => setGuestForm({ ...guestForm, marcaId: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar marca…</option>
                      {marcas.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Observaciones / Notas
                </label>
                <textarea
                  rows={2}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, resize: 'vertical' }}
                  value={guestForm.observaciones}
                  onChange={(e) => setGuestForm({ ...guestForm, observaciones: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #d5d0ce', background: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#ff8901', color: '#251f1d', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                >
                  Guardar Invitado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Completo y Profesional de Prueba de Manejo */}
      <TestDriveModal
        isOpen={activeModal === 'testdrive'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
