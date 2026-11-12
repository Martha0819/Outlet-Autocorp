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
  const { resetToDefaults, currentUser } = useStore();

  const navItems = [
    { label: 'General', href: '/', icon: <DashboardIcon size={18} /> },
    { label: 'Guardias y actividades', href: '/guardias', icon: <CalendarIcon size={18} /> },
    { label: 'Clientes', href: '/clientes', icon: <UsersIcon size={18} /> },
    { label: 'Inventario', href: '/inventario', icon: <CarIcon size={18} /> }
  ];

  return (
    <aside className="app-sidebar">
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
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', marginBottom: '10px' }}>
            <span
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: currentUser.color || '#ff8901',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {currentUser.avatar || 'US'}
            </span>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '9px', color: '#ff8901', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', fontWeight: 600 }}>
                {currentUser.role}
              </div>
            </div>
            <Link
              href="/login"
              title="Cambiar usuario"
              style={{ color: '#8e8784', display: 'flex', textDecoration: 'none' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </Link>
          </div>
        )}

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
