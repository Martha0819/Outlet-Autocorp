'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { useLogout } from '@/store/features/auth/useLogout';
import { formatDate, getInitials, getTodayISO } from '@/lib/utils';
import { CalendarIcon } from '@/components/ui/Icons';

export function AppHeader() {
  const pathname = usePathname();
  const usuario = useAppSelector((state) => state.auth.usuario);
  const { logout: handleLogout } = useLogout();

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Vista General — Dashboard';
      case '/guardias': return 'Guardias y Actividades';
      case '/clientes': return 'Directorio de Clientes';
      case '/inventario': return 'Inventario de Vehículos Seminuevos';
      case '/catalogos': return 'Catálogos del Sistema';
      case '/usuarios': return 'Gestión de Usuarios y Permisos';
      default: return 'Outlet Autocorp';
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div>
          <div className="header-outlet-name">OUTLET FARRERA</div>
          <h2 className="header-view-title">{getPageTitle(pathname)}</h2>
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="header-date">
          <CalendarIcon size={14} />
          <span>{formatDate(getTodayISO(), 'long')}</span>
        </div>

        {/* Perfil del Asesor / Usuario activo */}
        {usuario ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid #eae7e5' }}>
            <span
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#ff8901',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              {getInitials(usuario.nombre)}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', lineHeight: 1.2 }}>
                {usuario.nombre}
              </span>
              <span style={{ fontSize: '10px', color: '#8e8784', fontWeight: 600 }}>
                {usuario.tipoUsuarioNombre}
              </span>
            </div>

            {/* Botón Salir / Logout */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{
                background: 'none',
                border: '1px solid #e0dbd9',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: 'pointer',
                color: '#6e6764',
                fontSize: '11px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ff8901';
                e.currentTarget.style.color = '#ff8901';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0dbd9';
                e.currentTarget.style.color = '#6e6764';
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Salir</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: '#ff8901',
              color: '#251f1d',
              fontWeight: 800,
              fontSize: '12px',
              textDecoration: 'none'
            }}
          >
            Iniciar Sesión
          </Link>
        )}
      </div>
    </header>
  );
}
