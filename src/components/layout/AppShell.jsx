'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { formatDate, getTodayISO } from '@/lib/utils';
import {
  CarIcon,
  CalendarIcon,
  UsersIcon,
  DashboardIcon,
  SunIcon,
  MoonIcon
} from '@/components/ui/Icons';

export function AppShell({ children }) {
  const pathname = usePathname();
  const { activeDesign, changeDesign, theme, toggleTheme, resetToDefaults } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Vista General — Dashboard';
      case '/guardias': return 'Guardias & Actividades del Showroom';
      case '/clientes': return 'Directorio de Clientes';
      case '/inventario': return 'Inventario de Vehículos';
      default: return 'Outlet Autocorp';
    }
  };

  return (
    <div className={`app-root ${activeDesign === 'diseno4' && theme === 'light' ? 'theme-light' : ''}`}>
      {/* 1. SELECTOR SUPERIOR UNIVERSAL DE DISEÑOS */}
      <div className="design-selector-bar">
        <span>CONMUTADOR DE DISEÑOS OUTLET AUTOCORP (NEXT.JS REACT)</span>
        <div className="design-chips">
          <button
            onClick={() => changeDesign('diseno1')}
            className={`design-chip-link ${activeDesign === 'diseno1' ? 'active' : ''}`}
          >
            Diseño 1: Clásico
          </button>
          <button
            onClick={() => changeDesign('diseno2')}
            className={`design-chip-link ${activeDesign === 'diseno2' ? 'active' : ''}`}
          >
            Diseño 2: Executive
          </button>
          <button
            onClick={() => changeDesign('diseno3')}
            className={`design-chip-link ${activeDesign === 'diseno3' ? 'active' : ''}`}
          >
            Diseño 3: Titanium Glass
          </button>
          <button
            onClick={() => changeDesign('diseno4')}
            className={`design-chip-link ${activeDesign === 'diseno4' ? 'active' : ''}`}
          >
            Diseño 4: Carbon VIP
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CASO A: DISEÑO 1 — CLÁSICO INSTITUCIONAL (BARRA LATERAL IZQUIERDA) */}
      {/* ============================================================== */}
      {activeDesign === 'diseno1' && (
        <div className="app-layout">
          {/* Menú Lateral Fijo */}
          <aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="sidebar-brand" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Link href="/" style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                <img
                  src="/logo-outlet-farrera.png"
                  alt="Outlet Farrera Gran Remate"
                  style={{
                    maxWidth: '190px',
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))'
                  }}
                />
              </Link>
            </div>

            <nav className="sidebar-nav">
              <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
                <span className="nav-icon"><DashboardIcon size={18} /></span>
                <span className="nav-label">General</span>
              </Link>
              <Link href="/guardias" className={`nav-item ${pathname === '/guardias' ? 'active' : ''}`}>
                <span className="nav-icon"><CalendarIcon size={18} /></span>
                <span className="nav-label">Guardias y actividades</span>
              </Link>
              <Link href="/clientes" className={`nav-item ${pathname === '/clientes' ? 'active' : ''}`}>
                <span className="nav-icon"><UsersIcon size={18} /></span>
                <span className="nav-label">Clientes</span>
              </Link>
              <Link href="/inventario" className={`nav-item ${pathname === '/inventario' ? 'active' : ''}`}>
                <span className="nav-icon"><CarIcon size={18} /></span>
                <span className="nav-label">Inventario</span>
              </Link>
            </nav>

            <div className="sidebar-footer">
              <div className="demo-mode-indicator">
                <span className="demo-dot"></span>
                <span className="demo-text">Datos de demostración</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('¿Restablecer datos de demostración a valores de fábrica?')) {
                    resetToDefaults();
                  }
                }}
                className="btn btn-outline-light btn-xs"
                style={{ width: '100%', marginTop: '6px', borderRadius: '4px' }}
              >
                ↺ Restablecer demo
              </button>
            </div>
          </aside>

          {/* Área Principal de Contenido a la Derecha */}
          <div className="app-main-wrapper">
            <header className="app-header">
              <div className="header-left">
                <button
                  className="btn-menu-mobile"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{ display: 'none' }}
                >
                  ☰
                </button>
                <div>
                  <div className="header-outlet-name">OUTLET AUTOCORP</div>
                  <h2 className="header-view-title">{getPageTitle(pathname)}</h2>
                </div>
              </div>

              <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="header-date">
                  <CalendarIcon size={14} />
                  <span>{formatDate(getTodayISO(), 'long')}</span>
                </div>
                <button
                  onClick={() => changeDesign('diseno2')}
                  className="btn btn-outline-primary btn-sm"
                  style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '12px', borderColor: '#ff8901', color: '#ff8901' }}
                >
                  Ver Diseño 2 (Executive) →
                </button>
              </div>
            </header>

            <main className="app-content-area">
              {children}
            </main>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CASO B: DISEÑO 2 — EXECUTIVE STUDIO (BARRA SUPERIOR FLOTANTE)  */}
      {/* ============================================================== */}
      {activeDesign === 'diseno2' && (
        <div className="exec-layout">
          <header className="exec-header">
            <div className="exec-header-container">
              <div className="exec-brand-group">
                <div className="brand-badge-v2">
                  <CarIcon size={24} />
                </div>
                <div className="brand-titles-v2">
                  <span className="brand-name-v2">OUTLET AUTOCORP</span>
                  <span className="brand-tagline-v2">
                    <span className="tagline-pill">DISEÑO 2</span> Showroom Executive Studio
                  </span>
                </div>
              </div>

              <nav className="exec-nav-dock">
                <Link href="/" className={`exec-nav-item ${pathname === '/' ? 'active' : ''}`}>
                  <span>General</span>
                </Link>
                <Link href="/guardias" className={`exec-nav-item ${pathname === '/guardias' ? 'active' : ''}`}>
                  <span>Guardias y actividades</span>
                </Link>
                <Link href="/clientes" className={`exec-nav-item ${pathname === '/clientes' ? 'active' : ''}`}>
                  <span>Clientes</span>
                </Link>
                <Link href="/inventario" className={`exec-nav-item ${pathname === '/inventario' ? 'active' : ''}`}>
                  <span>Inventario</span>
                </Link>
              </nav>

              <div className="exec-header-right">
                <button
                  onClick={() => {
                    if (confirm('¿Restablecer datos de demo?')) resetToDefaults();
                  }}
                  className="btn-v2 btn-v2-outline"
                  style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '9999px' }}
                >
                  ↺ Reset
                </button>
              </div>
            </div>
          </header>

          <section className="section-hero-banner">
            <div className="hero-banner-inner">
              <div className="hero-info-group">
                <span className="hero-view-tag">Outlet Autocorp · Plataforma Comercial</span>
                <h1 className="hero-view-title">{getPageTitle(pathname)}</h1>
              </div>
              <div className="hero-meta-chips">
                <div className="hero-chip">
                  <span className="chip-dot"></span>
                  <span>Lote Activo en Tiempo Real</span>
                </div>
                <div className="hero-chip">
                  <span>{formatDate(getTodayISO(), 'long')}</span>
                </div>
              </div>
            </div>
          </section>

          <main className="main-content-v2">
            {children}
          </main>
        </div>
      )}

      {/* ============================================================== */}
      {/* CASO C: DISEÑO 3 — TITANIUM GLASS STUDIO                      */}
      {/* ============================================================== */}
      {activeDesign === 'diseno3' && (
        <div className="glass-shell" style={{ background: '#0e1117', minHeight: '100vh', color: '#fff' }}>
          <header style={{ background: 'rgba(20, 24, 33, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #ff8901, #e05300)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <CarIcon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.8px' }}>OUTLET AUTOCORP</div>
                <div style={{ fontSize: '11px', color: '#ff8901', fontWeight: 700 }}>TITANIUM GLASS STUDIO</div>
              </div>
            </div>

            <nav style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Link href="/" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: pathname === '/' ? '#251f1d' : '#a39c99', background: pathname === '/' ? '#ff8901' : 'transparent', textDecoration: 'none' }}>General</Link>
              <Link href="/guardias" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: pathname === '/guardias' ? '#251f1d' : '#a39c99', background: pathname === '/guardias' ? '#ff8901' : 'transparent', textDecoration: 'none' }}>Guardias y actividades</Link>
              <Link href="/clientes" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: pathname === '/clientes' ? '#251f1d' : '#a39c99', background: pathname === '/clientes' ? '#ff8901' : 'transparent', textDecoration: 'none' }}>Clientes</Link>
              <Link href="/inventario" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: pathname === '/inventario' ? '#251f1d' : '#a39c99', background: pathname === '/inventario' ? '#ff8901' : 'transparent', textDecoration: 'none' }}>Inventario</Link>
            </nav>

            <button
              onClick={() => {
                if (confirm('¿Restablecer demo?')) resetToDefaults();
              }}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}
            >
              ↺ Reset demo
            </button>
          </header>

          <main style={{ padding: '32px' }}>
            {children}
          </main>
        </div>
      )}

      {/* ============================================================== */}
      {/* CASO D: DISEÑO 4 — CARBON VIP PERFORMANCE LOUNGE (DÍA/NOCHE)   */}
      {/* ============================================================== */}
      {activeDesign === 'diseno4' && (
        <div className={`vip-shell ${theme === 'light' ? 'theme-light' : ''}`}>
          <header className="vip-header">
            <div className="vip-header-container">
              <div className="vip-brand-group">
                <div className="vip-brand-badge">
                  <CarIcon size={24} />
                </div>
                <div>
                  <span className="vip-brand-name">OUTLET AUTOCORP</span>
                  <span className="vip-brand-sub">CARBON VIP PERFORMANCE LOUNGE</span>
                </div>
              </div>

              <nav className="vip-nav-dock">
                <Link href="/" className={`vip-nav-btn ${pathname === '/' ? 'active' : ''}`}>
                  <span>General</span>
                </Link>
                <Link href="/guardias" className={`vip-nav-btn ${pathname === '/guardias' ? 'active' : ''}`}>
                  <span>Guardias & Actividades</span>
                </Link>
                <Link href="/clientes" className={`vip-nav-btn ${pathname === '/clientes' ? 'active' : ''}`}>
                  <span>Clientes</span>
                </Link>
                <Link href="/inventario" className={`vip-nav-btn ${pathname === '/inventario' ? 'active' : ''}`}>
                  <span>Inventario</span>
                </Link>
              </nav>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={toggleTheme}
                  className="theme-toggle-vip"
                  title="Cambiar entre Fondo Oscuro y Fondo Claro"
                >
                  {theme === 'dark' ? <><SunIcon size={14} /> Modo Día</> : <><MoonIcon size={14} /> Modo Noche</>}
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Restablecer datos demo VIP?')) resetToDefaults();
                  }}
                  style={{ background: 'transparent', border: '1px solid #362c28', color: '#a39b97', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                >
                  ↺ Reset
                </button>
              </div>
            </div>
          </header>

          <main style={{ padding: '28px 32px' }}>
            {children}
          </main>
        </div>
      )}
    </div>
  );
}
