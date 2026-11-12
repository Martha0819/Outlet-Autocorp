'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { formatDate, getTodayISO } from '@/lib/utils';
import { CalendarIcon } from '@/components/ui/Icons';

export function AppHeader() {
  const pathname = usePathname();

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Vista General — Dashboard';
      case '/guardias': return 'Guardias y Actividades';
      case '/clientes': return 'Directorio de Clientes';
      case '/inventario': return 'Inventario de Vehículos Seminuevos';
      default: return 'Outlet Autocorp';
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
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
      </div>
    </header>
  );
}
