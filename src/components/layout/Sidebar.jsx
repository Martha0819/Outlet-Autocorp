'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  CarIcon,
  CalendarIcon,
  UsersIcon,
  DashboardIcon
} from '@/components/ui/Icons';

export function Sidebar() {
  const pathname = usePathname();
  const { resetToDefaults } = useStore();

  const navItems = [
    { label: 'General', href: '/', icon: <DashboardIcon size={18} /> },
    { label: 'Guardias y actividades', href: '/guardias', icon: <CalendarIcon size={18} /> },
    { label: 'Clientes', href: '/clientes', icon: <UsersIcon size={18} /> },
    { label: 'Inventario', href: '/inventario', icon: <CarIcon size={18} /> }
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo-icon">
          <CarIcon size={24} />
        </div>
        <div className="brand-info">
          <h1 className="brand-title">OUTLET AUTOCORP</h1>
          <span className="brand-subtitle">Mini CRM Seminuevos</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
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
          style={{ width: '100%', marginTop: '6px' }}
        >
          ↺ Restablecer demo
        </button>
      </div>
    </aside>
  );
}
