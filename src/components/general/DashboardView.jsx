'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  isDateInPeriod,
  isDateInPreviousPeriod,
  getTodayISO
} from '@/lib/utils';
import {
  CarIcon,
  UsersIcon,
  TestDriveIcon,
  FileTextIcon,
  DollarIcon,
  TrendingUpIcon,
  PlusIcon
} from '@/components/ui/Icons';

export function DashboardView() {
  const { data, activeDesign, addClient, addTestDrive, addRequest, sellVehicle } = useStore();
  const [period, setPeriod] = useState('month');

  const vehicles = data?.vehicles || [];
  const clients = data?.clients || [];
  const testDrives = data?.testDrives || [];
  const requests = data?.requests || [];
  const downPayments = data?.downPayments || [];
  const sales = data?.sales || [];
  const activities = data?.activities || [];

  // Cálculos de periodos para KPIs
  let invitadosCount = 0;
  let prevInvitados = 0;
  clients.forEach((c) => {
    (c.visits || []).forEach((v) => {
      if (isDateInPeriod(v.date, period)) invitadosCount++;
      if (isDateInPreviousPeriod(v.date, period)) prevInvitados++;
    });
  });

  const availableVehs = vehicles.filter((v) => v.status === 'disponible');
  const reservedVehs = vehicles.filter((v) => v.status === 'apartado');

  const periodTD = testDrives.filter((td) => isDateInPeriod(td.date, period));
  const completedTD = periodTD.filter((td) => td.status === 'Realizada').length;
  const scheduledTD = periodTD.filter((td) => td.status === 'Programada').length;
  const prevTDCount = testDrives.filter((td) => isDateInPreviousPeriod(td.date, period)).length;

  const periodReq = requests.filter((r) => isDateInPeriod(r.date, period));
  const pendingReq = periodReq.filter((r) => r.status === 'Pendiente').length;
  const prevReqCount = requests.filter((r) => isDateInPreviousPeriod(r.date, period)).length;

  const periodDP = downPayments.filter((dp) => isDateInPeriod(dp.date, period));
  const totalDPAmount = periodDP.reduce((s, dp) => s + Number(dp.amount || 0), 0);
  const prevDPAmount = downPayments
    .filter((dp) => isDateInPreviousPeriod(dp.date, period))
    .reduce((s, dp) => s + Number(dp.amount || 0), 0);

  const periodSales = sales.filter((s) => isDateInPeriod(s.date, period));
  const totalSalesAmount = periodSales.reduce((s, x) => s + Number(x.finalAmount || 0), 0);
  const prevSalesAmount = sales
    .filter((s) => isDateInPreviousPeriod(s.date, period))
    .reduce((s, x) => s + Number(x.finalAmount || 0), 0);

  // Helper de cálculo porcentual
  const getDeltaBadge = (current, prev) => {
    if (prev === 0) {
      return (
        <span className="kpi-compare positive">
          <TrendingUpIcon size={13} /> +100% vs ant.
        </span>
      );
    }
    const diff = current - prev;
    const pct = Math.round((diff / prev) * 100);
    const isPos = pct >= 0;
    return (
      <span className={`kpi-compare ${isPos ? 'positive' : 'negative'}`}>
        {isPos ? '+' : ''}{pct}% vs ant.
      </span>
    );
  };

  // Acciones Rápidas
  const handleQuickGuest = () => {
    const name = prompt('Nombre completo del nuevo invitado / prospecto:');
    if (name) {
      const phone = prompt('Número celular a 10 dígitos:', '55');
      addClient({
        name,
        phone: phone || '5500000000',
        email: '',
        hasBrandPreference: 'no',
        preferredBrand: '',
        comments: 'Registrado desde botón de acción rápida.'
      });
    }
  };

  const handleQuickTD = () => {
    const client = clients[0];
    const vehicle = availableVehs[0];
    if (!vehicle) {
      alert('No hay vehículos disponibles en este momento.');
      return;
    }
    const time = prompt('Horario de la prueba de manejo (ej. 14:00):', '14:00');
    if (time) {
      addTestDrive({
        clientId: client ? client.id : '',
        vehicleId: vehicle.id,
        time,
        responsible: 'Carlos Morales',
        route: 'Ruta Periférico Sur'
      });
    }
  };

  const handleQuickReq = () => {
    const client = clients[0];
    const vehicle = availableVehs[0];
    if (!vehicle) {
      alert('No hay vehículos disponibles en inventario.');
      return;
    }
    addRequest({
      clientId: client ? client.id : '',
      vehicleId: vehicle.id,
      type: 'Financiamiento Banorte',
      amount: vehicle.price,
      termMonths: 48
    });
  };

  const handleQuickSale = () => {
    const vehicle = availableVehs[0];
    if (!vehicle) {
      alert('No hay vehículos disponibles para venta.');
      return;
    }
    if (confirm(`¿Registrar venta inmediata de ${vehicle.brand} ${vehicle.model} por ${formatCurrency(vehicle.price)}?`)) {
      sellVehicle(vehicle.id, vehicle.price);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Barra de Filtros de Periodo y Accesos Rápidos */}
      <div className="toolbar-dashboard">
        <div className="period-pills-wrap">
          <button
            onClick={() => setPeriod('today')}
            className={`period-btn ${period === 'today' ? 'active' : ''}`}
          >
            Hoy
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`period-btn ${period === 'week' ? 'active' : ''}`}
          >
            Esta semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`period-btn ${period === 'month' ? 'active' : ''}`}
          >
            Este mes
          </button>
        </div>

        <div className="quick-actions-bar">
          <button onClick={handleQuickGuest} className="btn-primary-action">
            <PlusIcon size={15} /> <span>Registrar invitado</span>
          </button>
          <button onClick={handleQuickTD} className="btn-secondary-action">
            <TestDriveIcon size={15} /> <span>Programar prueba</span>
          </button>
          <button onClick={handleQuickReq} className="btn-secondary-action">
            <FileTextIcon size={15} /> <span>Crear solicitud</span>
          </button>
          <button onClick={handleQuickSale} className="btn-dark-action">
            <DollarIcon size={15} /> <span>Registrar venta</span>
          </button>
        </div>
      </div>

      {/* --- SECCIÓN DE 6 KPIS SEGÚN EL DISEÑO ACTIVO --- */}
      {activeDesign === 'diseno2' ? (
        // Medidores Radiales & Telemetría Ejecutiva (Diseño 2)
        <div className="kpis-gauges-grid">
          {/* 1. Facturación con Velocímetro SVG */}
          <Link href="/inventario" className="exec-gauge-card">
            <div className="exec-gauge-header">
              <span className="exec-gauge-title">01 · FACTURACIÓN CERRADA</span>
              {getDeltaBadge(totalSalesAmount, prevSalesAmount)}
            </div>
            <div className="exec-gauge-body">
              <div>
                <div className="exec-gauge-val">{formatCurrency(totalSalesAmount)}</div>
                <div className="exec-gauge-sub">{periodSales.length} autos colocados · 86% meta</div>
              </div>
              <div className="exec-gauge-svg-wrap">
                <svg viewBox="0 0 100 65" width="80" height="52">
                  <path d="M 15 55 A 35 35 0 0 1 85 55" fill="none" stroke="#e5e5e5" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 15 55 A 35 35 0 0 1 85 55" fill="none" stroke="#ff8901" strokeWidth="8" strokeDasharray="110" strokeDashoffset={Math.max(0, 110 - (Math.min(totalSalesAmount / 4000000, 1) * 110))} strokeLinecap="round" />
                  <circle cx="50" cy="55" r="4" fill="#251f1d" />
                  <line x1="50" y1="55" x2="72" y2="30" stroke="#251f1d" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <div className="gauge-center-text" style={{ bottom: 2 }}>MXN</div>
              </div>
            </div>
          </Link>

          {/* 2. Donut SVG de Disponibilidad */}
          <Link href="/inventario" className="exec-gauge-card">
            <div className="exec-gauge-header">
              <span className="exec-gauge-title">02 · LOTE & DISPONIBILIDAD</span>
              <span className="badge-v2 badge-v2-green">En Tiempo Real</span>
            </div>
            <div className="exec-gauge-body">
              <div>
                <div className="exec-gauge-val">{formatNumber(availableVehs.length)} <span style={{ fontSize: 13, color: '#6e6764' }}>disp.</span></div>
                <div className="exec-gauge-sub">{reservedVehs.length} apartados · {vehicles.length} totales</div>
              </div>
              <div className="exec-gauge-svg-wrap">
                <svg viewBox="0 0 80 80" width="60" height="60">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="188.4" strokeDashoffset={188.4 - ((reservedVehs.length / (vehicles.length || 1)) * 188.4)} strokeLinecap="round" transform="rotate(-90 40 40)" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="188.4" strokeDashoffset={188.4 - ((availableVehs.length / (vehicles.length || 1)) * 188.4)} strokeLinecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div className="gauge-center-text" style={{ color: '#10b981' }}>{Math.round((availableVehs.length / (vehicles.length || 1)) * 100)}%</div>
              </div>
            </div>
          </Link>

          {/* 3. Pruebas de Manejo */}
          <Link href="/guardias" className="exec-gauge-card">
            <div className="exec-gauge-header">
              <span className="exec-gauge-title">03 · PRUEBAS DE MANEJO</span>
              {getDeltaBadge(periodTD.length, prevTDCount)}
            </div>
            <div className="exec-gauge-body">
              <div>
                <div className="exec-gauge-val">{formatNumber(periodTD.length)}</div>
                <div className="exec-gauge-sub">{completedTD} realizadas · {scheduledTD} pendientes</div>
              </div>
              <div className="exec-gauge-svg-wrap">
                <svg viewBox="0 0 80 80" width="60" height="60">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#e0f2fe" strokeWidth="8" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#0284c7" strokeWidth="8" strokeDasharray="188.4" strokeDashoffset={188.4 - ((completedTD / (periodTD.length || 1)) * 188.4)} strokeLinecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div className="gauge-center-text" style={{ color: '#0284c7' }}>{completedTD}/{periodTD.length}</div>
              </div>
            </div>
          </Link>

          {/* 4. Afluencia de Visitas */}
          <Link href="/clientes" className="exec-gauge-card">
            <div className="exec-gauge-header">
              <span className="exec-gauge-title">04 · AFLUENCIA DE INVITADOS</span>
              {getDeltaBadge(invitadosCount, prevInvitados)}
            </div>
            <div className="exec-gauge-body">
              <div>
                <div className="exec-gauge-val">{formatNumber(invitadosCount)}</div>
                <div className="exec-gauge-sub">Visitas físicas a sala de ventas</div>
              </div>
              <div className="exec-gauge-svg-wrap">
                <svg viewBox="0 0 80 60" width="70" height="50">
                  <rect x="5" y="35" width="8" height="25" rx="3" fill="#251f1d" />
                  <rect x="18" y="20" width="8" height="40" rx="3" fill="#251f1d" />
                  <rect x="31" y="28" width="8" height="32" rx="3" fill="#251f1d" />
                  <rect x="44" y="12" width="8" height="48" rx="3" fill="#ff8901" />
                  <rect x="57" y="18" width="8" height="42" rx="3" fill="#ff8901" />
                  <rect x="70" y="25" width="8" height="35" rx="3" fill="#251f1d" />
                </svg>
                <div className="gauge-center-text" style={{ bottom: -6, fontSize: 10, color: '#ff8901' }}>HOY</div>
              </div>
            </div>
          </Link>

          {/* 5. Expedientes de Crédito */}
          <Link href="/clientes" className="exec-gauge-card">
            <div className="exec-gauge-header">
              <span className="exec-gauge-title">05 · EXPEDIENTES DE CRÉDITO</span>
              {getDeltaBadge(periodReq.length, prevReqCount)}
            </div>
            <div className="exec-gauge-body">
              <div>
                <div className="exec-gauge-val">{formatNumber(periodReq.length)}</div>
                <div className="exec-gauge-sub">{pendingReq} en análisis crediticio</div>
              </div>
              <div className="exec-gauge-svg-wrap">
                <svg viewBox="0 0 80 80" width="60" height="60">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#fef3c7" strokeWidth="8" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#d97706" strokeWidth="8" strokeDasharray="188.4" strokeDashoffset={188.4 - ((pendingReq / (periodReq.length || 1)) * 188.4)} strokeLinecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div className="gauge-center-text" style={{ color: '#d97706' }}>{pendingReq} pen.</div>
              </div>
            </div>
          </Link>

          {/* 6. Enganches en Caja */}
          <Link href="/inventario" className="exec-gauge-card">
            <div className="exec-gauge-header">
              <span className="exec-gauge-title">06 · ENGANCHES EN CAJA</span>
              {getDeltaBadge(totalDPAmount, prevDPAmount)}
            </div>
            <div className="exec-gauge-body">
              <div>
                <div className="exec-gauge-val text-orange">{formatCurrency(totalDPAmount)}</div>
                <div className="exec-gauge-sub">{periodDP.length} cobros confirmados en caja</div>
              </div>
              <div className="exec-gauge-svg-wrap">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarIcon size={22} />
                </div>
                <div className="gauge-center-text" style={{ bottom: -6, fontSize: 10, color: '#16a34a', fontWeight: 700 }}>VALIDADO</div>
              </div>
            </div>
          </Link>
        </div>
      ) : activeDesign === 'diseno4' ? (
        // Instrument Cluster HUD (Diseño 4)
        <div className="kpis-gauges-grid">
          <Link href="/inventario" className="hud-instrument-card">
            <div className="hud-instrument-header">
              <span className="hud-instrument-title">TACHOMETER / FACTURACIÓN</span>
              <span className="badge-vip badge-vip-orange">86% RPM</span>
            </div>
            <div className="hud-instrument-body">
              <div>
                <div className="hud-instrument-val">{formatCurrency(totalSalesAmount)}</div>
                <div className="hud-instrument-sub">{periodSales.length} AUTOS COLOCADOS</div>
              </div>
              <div className="hud-dial-svg">
                <svg viewBox="0 0 100 80" width="90" height="70">
                  <path d="M 15 65 A 38 38 0 1 1 85 65" fill="none" stroke="#2a221f" strokeWidth="7" strokeLinecap="round" />
                  <path d="M 15 65 A 38 38 0 1 1 85 65" fill="none" stroke="#ff8901" strokeWidth="7" strokeDasharray="160" strokeDashoffset={Math.max(0, 160 - (Math.min(totalSalesAmount / 4000000, 1) * 160))} strokeLinecap="round" />
                  <circle cx="50" cy="45" r="4" fill="#ffffff" />
                  <line x1="50" y1="45" x2="76" y2="24" stroke="#ff8901" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="hud-center-text">MXN</div>
              </div>
            </div>
          </Link>

          <Link href="/inventario" className="hud-instrument-card">
            <div className="hud-instrument-header">
              <span className="hud-instrument-title">FUEL TANK / INVENTARIO</span>
              <span className="badge-vip badge-vip-green">EN LOTE</span>
            </div>
            <div className="hud-instrument-body">
              <div>
                <div className="hud-instrument-val">{formatNumber(availableVehs.length)} DISP.</div>
                <div className="hud-instrument-sub">{vehicles.length} TOTALES</div>
              </div>
              <div className="hud-dial-svg">
                <div className="hud-led-bar-wrap">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`hud-led-cell ${i < Math.round((availableVehs.length / (vehicles.length || 1)) * 6) ? 'lit-green' : ''}`}
                    />
                  ))}
                </div>
                <div className="hud-center-text">CAPACIDAD</div>
              </div>
            </div>
          </Link>

          <Link href="/guardias" className="hud-instrument-card">
            <div className="hud-instrument-header">
              <span className="hud-instrument-title">CHRONO / PRUEBAS DINÁMICAS</span>
              <span className="badge-vip badge-vip-orange">{completedTD} OK</span>
            </div>
            <div className="hud-instrument-body">
              <div>
                <div className="hud-instrument-val">{formatNumber(periodTD.length)} TEST</div>
                <div className="hud-instrument-sub">{scheduledTD} EN ESPERA</div>
              </div>
              <div className="hud-dial-svg">
                <svg viewBox="0 0 80 80" width="60" height="60">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#251c19" strokeWidth="6" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#0284c7" strokeWidth="6" strokeDasharray="201" strokeDashoffset={201 - ((completedTD / (periodTD.length || 1)) * 201)} strokeLinecap="round" transform="rotate(-90 40 40)" />
                  <line x1="40" y1="40" x2="40" y2="18" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <div className="hud-center-text">RPM</div>
              </div>
            </div>
          </Link>
        </div>
      ) : activeDesign === 'diseno3' ? (
        // Matriz Holográfica Titanium Glass (Diseño 3)
        <div className="hologram-matrix-grid">
          <Link href="/inventario" className="hologram-kpi-card">
            <div className="holo-header">
              <span className="holo-code">№ 01 · FACTURACIÓN EN CAJA</span>
              <span className="badge-glass-orange font-bold">+100% vs ant.</span>
            </div>
            <div className="holo-val text-orange">{formatCurrency(totalSalesAmount)}</div>
            <div className="holo-sub">{periodSales.length} unidades cerradas · 86% de meta</div>
            <div className="holo-progress-bar">
              <div className="holo-progress-fill" style={{ width: `${Math.min((totalSalesAmount / 4000000) * 100, 100)}%` }}></div>
            </div>
          </Link>

          <Link href="/inventario" className="hologram-kpi-card">
            <div className="holo-header">
              <span className="holo-code">№ 02 · LOT OCCUPANCY / PATIO</span>
              <span className="badge-glass-green">Lote Activo</span>
            </div>
            <div className="holo-val">{formatNumber(availableVehs.length)} <span style={{ fontSize: 14, color: '#6b6360' }}>disp.</span></div>
            <div className="holo-sub">{reservedVehs.length} apartados · {vehicles.length} total inventario</div>
            <div className="holo-progress-bar">
              <div className="holo-progress-fill" style={{ width: `${(availableVehs.length / (vehicles.length || 1)) * 100}%`, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' }}></div>
            </div>
          </Link>

          <Link href="/guardias" className="hologram-kpi-card">
            <div className="holo-header">
              <span className="holo-code">№ 03 · PRUEBAS DE MANEJO</span>
              <span className="badge-glass-orange font-bold">{completedTD}/{periodTD.length}</span>
            </div>
            <div className="holo-val">{formatNumber(periodTD.length)} <span style={{ fontSize: 14, color: '#6b6360' }}>dinámicas</span></div>
            <div className="holo-sub">{completedTD} realizadas · {scheduledTD} en agenda</div>
            <div className="holo-progress-bar">
              <div className="holo-progress-fill" style={{ width: `${periodTD.length > 0 ? (completedTD / periodTD.length) * 100 : 0}%`, background: '#0284c7' }}></div>
            </div>
          </Link>
        </div>
      ) : (
        // Tarjetas Clásicas Institucionales (Diseño 1)
        <div className="kpis-classic-grid">
          <Link href="/clientes" className="kpi-classic-card">
            <div className="kpi-icon-badge"><UsersIcon size={20} /></div>
            <div className="kpi-classic-title">Invitados</div>
            <div className="kpi-classic-val">{formatNumber(invitadosCount)}</div>
            {getDeltaBadge(invitadosCount, prevInvitados)}
          </Link>

          <Link href="/inventario" className="kpi-classic-card">
            <div className="kpi-icon-badge"><CarIcon size={20} /></div>
            <div className="kpi-classic-title">Inventario</div>
            <div className="kpi-classic-val">{formatNumber(availableVehs.length)}</div>
            <span className="kpi-sub-text">{reservedVehs.length} apartados actualmente</span>
          </Link>

          <Link href="/guardias" className="kpi-classic-card">
            <div className="kpi-icon-badge"><TestDriveIcon size={20} /></div>
            <div className="kpi-classic-title">Pruebas de manejo</div>
            <div className="kpi-classic-val">{formatNumber(periodTD.length)}</div>
            <span className="kpi-sub-text">{completedTD} realizadas · {scheduledTD} programadas</span>
          </Link>

          <Link href="/clientes" className="kpi-classic-card">
            <div className="kpi-icon-badge"><FileTextIcon size={20} /></div>
            <div className="kpi-classic-title">Solicitudes</div>
            <div className="kpi-classic-val">{formatNumber(periodReq.length)}</div>
            <span className="kpi-sub-text">{pendingReq} pendientes de aprobación</span>
          </Link>

          <Link href="/inventario" className="kpi-classic-card">
            <div className="kpi-icon-badge text-orange"><DollarIcon size={20} /></div>
            <div className="kpi-classic-title">Enganche recibido</div>
            <div className="kpi-classic-val text-orange">{formatCurrency(totalDPAmount)}</div>
            {getDeltaBadge(totalDPAmount, prevDPAmount)}
          </Link>

          <Link href="/inventario" className="kpi-classic-card">
            <div className="kpi-icon-badge"><DollarIcon size={20} /></div>
            <div className="kpi-classic-title">Ventas concretadas</div>
            <div className="kpi-classic-val">{formatCurrency(totalSalesAmount)}</div>
            <span className="kpi-sub-text">{periodSales.length} unidades vendidas</span>
          </Link>
        </div>
      )}

      {/* --- SECCIÓN DE GRÁFICAS: FACTURACIÓN & EMBUDO --- */}
      <div className="charts-main-grid">
        {/* Gráfica de Ventas */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-title">Facturación por Periodo</h3>
              <p className="dashboard-card-sub">Ingresos acumulados en MXN y unidades colocadas</p>
            </div>
            <span className="badge-total-sales font-bold">{formatCurrency(totalSalesAmount)}</span>
          </div>
          <div className="dashboard-card-body">
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: 210, overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartSalesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff8901" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ff8901" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="40" y1="170" x2="480" y2="170" stroke="#e5e5e5" strokeWidth="1" />
              <line x1="40" y1="95" x2="480" y2="95" stroke="#e5e5e5" strokeDasharray="3,3" strokeWidth="1" />
              <polygon
                points="40,170 120,130 200,145 280,80 360,60 440,30 480,170"
                fill="url(#chartSalesGrad)"
              />
              <polyline
                points="40,170 120,130 200,145 280,80 360,60 440,30"
                fill="none"
                stroke="#ff8901"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="120" cy="130" r="4.5" fill="#ff8901" stroke="#ffffff" strokeWidth="2" />
              <circle cx="200" cy="145" r="4.5" fill="#ff8901" stroke="#ffffff" strokeWidth="2" />
              <circle cx="280" cy="80" r="4.5" fill="#ff8901" stroke="#ffffff" strokeWidth="2" />
              <circle cx="360" cy="60" r="4.5" fill="#ff8901" stroke="#ffffff" strokeWidth="2" />
              <circle cx="440" cy="30" r="4.5" fill="#ff8901" stroke="#ffffff" strokeWidth="2" />
              <text x="120" y="190" textAnchor="middle" fontSize="11" fill="#6e6764">Sem 1</text>
              <text x="200" y="190" textAnchor="middle" fontSize="11" fill="#6e6764">Sem 2</text>
              <text x="280" y="190" textAnchor="middle" fontSize="11" fill="#6e6764">Sem 3</text>
              <text x="360" y="190" textAnchor="middle" fontSize="11" fill="#6e6764">Sem 4</text>
              <text x="440" y="190" textAnchor="middle" fontSize="11" fill="#6e6764">Hoy</text>
            </svg>
          </div>
        </div>

        {/* Embudo Comercial */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-title">Embudo de Conversión Comercial</h3>
              <p className="dashboard-card-sub">Flujo de prospectos desde la primera visita hasta la entrega</p>
            </div>
          </div>
          <div className="dashboard-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <strong>1. Invitados Registrados</strong>
                  <span className="font-bold">{invitadosCount}</span>
                </div>
                <div style={{ height: 10, background: '#e5e5e5', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#251f1d' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <strong>2. Pruebas de Manejo</strong>
                  <span className="font-bold text-orange">
                    {periodTD.length} ({invitadosCount > 0 ? Math.round((periodTD.length / invitadosCount) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ height: 10, background: '#e5e5e5', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${invitadosCount > 0 ? Math.min((periodTD.length / invitadosCount) * 100, 100) : 15}%`, height: '100%', background: '#0284c7' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <strong>3. Solicitudes de Financiamiento</strong>
                  <span className="font-bold" style={{ color: '#d97706' }}>{periodReq.length}</span>
                </div>
                <div style={{ height: 10, background: '#e5e5e5', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${invitadosCount > 0 ? Math.min((periodReq.length / invitadosCount) * 100, 100) : 12}%`, height: '100%', background: '#f59e0b' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <strong>4. Ventas Concretadas</strong>
                  <span className="font-bold text-orange">
                    {periodSales.length} ({invitadosCount > 0 ? Math.round((periodSales.length / invitadosCount) * 100) : 0}% conv.)
                  </span>
                </div>
                <div style={{ height: 10, background: '#e5e5e5', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${invitadosCount > 0 ? Math.min((periodSales.length / invitadosCount) * 100, 100) : 10}%`, height: '100%', background: '#ff8901' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PRÓXIMAS ACTIVIDADES Y PRUEBAS DE MANEJO --- */}
      <div className="charts-main-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Pruebas de Manejo Próximas</h3>
            <Link href="/guardias" className="btn-link-action">Ver agenda completa →</Link>
          </div>
          <div className="dashboard-card-body p-0">
            <div className="upcoming-list">
              {testDrives.slice(0, 4).map((td) => {
                const client = clients.find((c) => c.id === td.clientId) || { name: 'Cliente registrado' };
                const vehicle = vehicles.find((v) => v.id === td.vehicleId) || { brand: 'Auto', model: 'Catálogo', year: '' };
                const isDone = td.status === 'Realizada';

                return (
                  <div key={td.id} className="upcoming-item">
                    <div className="upcoming-time-col">
                      <span className="upcoming-time">{td.time || '12:00'}</span>
                      <span className="upcoming-date">{formatDate(td.date, 'short')}</span>
                    </div>
                    <div className="upcoming-main-col">
                      <strong className="upcoming-title">{vehicle.brand} {vehicle.model} {vehicle.year}</strong>
                      <div className="upcoming-subtitle">Cliente: {client.name} · Asesor: {td.responsible}</div>
                    </div>
                    <span className={`badge-pill ${isDone ? 'badge-green' : 'badge-orange'}`}>
                      {td.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Actividades del Showroom</h3>
            <Link href="/guardias" className="btn-link-action">Ver todas las tarjetas →</Link>
          </div>
          <div className="dashboard-card-body p-0">
            <div className="upcoming-list">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="upcoming-item">
                  <div className="upcoming-time-col">
                    <span className="upcoming-time">{act.time || '09:00'}</span>
                    <span className="upcoming-date">{formatDate(act.date, 'short')}</span>
                  </div>
                  <div className="upcoming-main-col">
                    <strong className="upcoming-title">{act.title}</strong>
                    <div className="upcoming-subtitle">Responsable: {act.responsible}</div>
                  </div>
                  <span className={`badge-pill ${act.status === 'completada' ? 'badge-green' : act.status === 'en_proceso' ? 'badge-amber' : 'badge-dark'}`}>
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
