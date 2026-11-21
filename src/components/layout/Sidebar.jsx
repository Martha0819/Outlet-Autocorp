'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { useLogout } from '@/store/features/auth/useLogout';
import { usePermiso } from '@/store/features/auth/usePermiso';
import { getInitials } from '@/lib/utils';
import {
  CarIcon,
  CalendarIcon,
  UsersIcon,
  DashboardIcon,
  LayersIcon,
  UserCogIcon
} from '@/components/ui/Icons';

export function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const pathname = usePathname();
  const usuario = useAppSelector((state) => state.auth.usuario);
  const { logout } = useLogout();
  const { puede } = usePermiso();

  // Cada sección se oculta si el rol no tiene "leer" sobre su recurso — ver
  // src/lib/catalogos/config.js y la matriz de permisos en /usuarios.
  // "General" (dashboard) siempre se muestra: lee de varios recursos y cada
  // panel ya maneja su propio 403 mostrando "sin acceso" en vez de romper.
  const navItems = [
    { label: 'General', href: '/', icon: <DashboardIcon size={18} />, visible: true },
    { label: 'Guardias y actividades', href: '/guardias', icon: <CalendarIcon size={18} />, visible: puede('guardia', 'leer') || puede('actividad', 'leer') },
    { label: 'Clientes', href: '/clientes', icon: <UsersIcon size={18} />, visible: !usuario?.esInvitado && puede('cliente', 'leer') },
    { label: 'Inventario', href: '/inventario', icon: <CarIcon size={18} />, visible: puede('vehiculo', 'leer') },
    { label: 'Catálogos', href: '/catalogos', icon: <LayersIcon size={18} />, visible: puede('catalogo', 'leer') },
    { label: 'Usuarios', href: '/usuarios', icon: <UserCogIcon size={18} />, visible: puede('usuario', 'leer') }
  ].filter((item) => item.visible);

  return (
    <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-brand" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Botón cerrar menú lateral en móvil */}
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="mobile-close-btn"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Cerrar menú"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        <Link href="/" onClick={onCloseMobile} style={{ display: 'block', width: '100%', textAlign: 'center' }}>
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
        {usuario && !(usuario.tipoUsuarioNombre === 'Invitado' || usuario.esInvitado) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px' }}>
            <span
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#ff8901',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {getInitials(usuario.nombre)}
            </span>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {usuario.nombre}
              </div>
              <div style={{ fontSize: '9px', color: '#ff8901', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', fontWeight: 600 }}>
                {usuario.tipoUsuarioNombre}
              </div>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              style={{ color: '#8e8784', display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
