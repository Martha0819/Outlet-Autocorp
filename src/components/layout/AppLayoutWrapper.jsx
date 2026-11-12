'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { AppHeader } from '@/components/layout/AppHeader';

export function AppLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}>{children}</main>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main-wrapper">
        <AppHeader />
        <main className="app-content-area">{children}</main>
      </div>
    </div>
  );
}
