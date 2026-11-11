'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { CarIcon } from '@/components/ui/Icons';
import { formatDate, getTodayISO } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { activeDesign, changeDesign, theme, toggleTheme, resetToDefaults } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'General', href: '/' },
    { label: 'Guardias y actividades', href: '/guardias' },
    { label: 'Clientes', href: '/clientes' },
    { label: 'Inventario', href: '/inventario' }
  ];

  const designTitles = {
    diseno1: 'DISEÑO 1 · Clásico Institucional',
    diseno2: 'DISEÑO 2 · Showroom Executive Studio',
    diseno3: 'DISEÑO 3 · Titanium Glass Studio',
    diseno4: 'DISEÑO 4 · Carbon VIP Performance'
  };

  return (
    <>
      {/* 1. Selector Superior de Diseños */}
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

      {/* 2. Barra de Navegación Principal */}
      <header className="main-header">
        <div className="main-header-inner">
          <div className="brand-group">
            <div className="brand-icon-box">
              <CarIcon size={24} />
            </div>
            <div>
              <span className="brand-title">OUTLET AUTOCORP</span>
              <div className="brand-tagline">
                <span className="tagline-badge">{designTitles[activeDesign]}</span>
              </div>
            </div>
          </div>

          {/* Navegación Desktop */}
          <nav className="header-nav-dock">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-dock-btn ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Acciones de la derecha */}
          <div className="header-actions">
            {activeDesign === 'diseno4' && (
              <button
                onClick={toggleTheme}
                className="btn-header-action"
                title="Alternar entre Fondo Oscuro (Noche) y Fondo Claro (Día)"
              >
                <span>{theme === 'dark' ? '☀️ Modo Día' : '🌙 Modo Noche'}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (confirm('¿Restablecer datos de demostración a valores de fábrica?')) {
                  resetToDefaults();
                }
              }}
              className="btn-header-action"
            >
              ↺ Reset demo
            </button>

            {/* Botón Móvil */}
            <button
              className="btn-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Menú Móvil */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-drawer-item ${pathname === link.href ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* 3. Hero Banner de Vista */}
      <section className="section-hero-banner">
        <div className="hero-banner-inner">
          <div className="hero-info-group">
            <span className="hero-view-tag">Outlet Autocorp · Plataforma Comercial</span>
            <h1 className="hero-view-title">
              {pathname === '/' && 'Vista General — Dashboard'}
              {pathname === '/guardias' && 'Guardias & Actividades del Showroom'}
              {pathname === '/clientes' && 'Directorio de Clientes & CRM'}
              {pathname === '/inventario' && 'Inventario de Vehículos Seminuevos'}
            </h1>
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
    </>
  );
}
