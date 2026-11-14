'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { useGetVehiculosQuery } from '@/store/features/vehiculos/vehiculoApiSlice';
import { useGetClientesQuery } from '@/store/features/clientes/clienteApiSlice';
import { useGetUsuariosQuery } from '@/store/features/usuarios/usuarioApiSlice';
import { useGetGuardiasQuery } from '@/store/features/guardias/guardiaApiSlice';
import { useGetActividadesQuery } from '@/store/features/actividades/actividadApiSlice';
import { usePermiso } from '@/store/features/auth/usePermiso';
import { CarIcon, UsersIcon, CalendarIcon, FlipIcon, UserCogIcon } from '@/components/ui/Icons';

function StatTile({ icon: Icon, label, value, accent = '#ff8901' }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #eae7e5', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      <span style={{ width: 42, height: 42, borderRadius: 10, background: `${accent}1a`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} />
      </span>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#251f1d', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#8e8784', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

function EmptyState({ message, href, linkLabel }) {
  return (
    <div style={{ padding: '18px 16px', textAlign: 'center', fontSize: 12, color: '#8e8784' }}>
      {message}
      {href && (
        <>
          {' '}
          <Link href={href} style={{ color: '#ff8901', fontWeight: 700, textDecoration: 'none' }}>
            {linkLabel} →
          </Link>
        </>
      )}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #eae7e5', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: '#251f1d', margin: '0 0 14px 0' }}>{title}</h3>
      {children}
    </div>
  );
}

function BreakdownRow({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: '#251f1d', fontWeight: 600 }}>{label}</span>
        <span style={{ color: '#8e8784', fontWeight: 700 }}>{count}</span>
      </div>
      <div style={{ height: 6, background: '#f0eceb', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 9999 }} />
      </div>
    </div>
  );
}

const ESTATUS_VEHICULO = [
  { key: 'DISPONIBLE', label: 'Disponible', color: '#16a34a' },
  { key: 'APARTADO', label: 'Apartado', color: '#d97706' },
  { key: 'VENDIDO', label: 'Vendido', color: '#251f1d' },
  { key: 'NO_DISPONIBLE', label: 'No disponible', color: '#8e8784' }
];

const ESTATUS_ACTIVIDAD = [
  { key: 'PENDIENTE', label: 'Pendiente', color: '#d97706' },
  { key: 'EN_PROCESO', label: 'En proceso', color: '#0284c7' },
  { key: 'COMPLETADA', label: 'Completada', color: '#16a34a' }
];

export function DashboardView() {
  const { puede } = usePermiso();
  const puedeVehiculo = puede('vehiculo', 'leer');
  const puedeCliente = puede('cliente', 'leer');
  const puedeUsuario = puede('usuario', 'leer');
  const puedeGuardia = puede('guardia', 'leer');
  const puedeActividad = puede('actividad', 'leer');

  // skip evita el 403 (y el ruido en consola) cuando el rol no tiene el
  // permiso — el panel correspondiente muestra "sin acceso" en vez de un
  // "sin datos" engañoso.
  const { data: vehiculos = [], isLoading: loadingVeh } = useGetVehiculosQuery(undefined, { skip: !puedeVehiculo });
  const { data: clientes = [], isLoading: loadingCli } = useGetClientesQuery(undefined, { skip: !puedeCliente });
  const { data: usuarios = [], isLoading: loadingUsr } = useGetUsuariosQuery(undefined, { skip: !puedeUsuario });
  const { data: guardias = [], isLoading: loadingGua } = useGetGuardiasQuery(undefined, { skip: !puedeGuardia });
  const { data: actividades = [], isLoading: loadingAct } = useGetActividadesQuery(undefined, { skip: !puedeActividad });

  const isLoading =
    (puedeVehiculo && loadingVeh) ||
    (puedeCliente && loadingCli) ||
    (puedeUsuario && loadingUsr) ||
    (puedeGuardia && loadingGua) ||
    (puedeActividad && loadingAct);

  const disponibles = vehiculos.filter((v) => v.estatus === 'DISPONIBLE');
  const valorInventarioDisponible = disponibles.reduce((sum, v) => sum + (v.precio ? Number(v.precio) : 0), 0);
  const clientesConInteres = clientes.filter((c) => c.visitaMarcaEspecifica).length;
  const usuariosActivos = usuarios.filter((u) => u.activo).length;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const proximasGuardias = guardias
    .filter((g) => new Date(g.fecha) >= hoy)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .slice(0, 5);
  const actividadesPendientes = actividades.filter((a) => a.estatus !== 'COMPLETADA').length;

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#8e8784', fontSize: 13 }}>Cargando panel…</div>;
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatTile icon={CarIcon} label="Vehículos disponibles" value={disponibles.length} accent="#ff8901" />
        <StatTile icon={UsersIcon} label="Clientes registrados" value={clientes.length} accent="#0284c7" />
        <StatTile icon={CalendarIcon} label="Guardias próximas" value={proximasGuardias.length} accent="#16a34a" />
        <StatTile icon={FlipIcon} label="Actividades pendientes" value={actividadesPendientes} accent="#d97706" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Inventario */}
        <Panel title="Inventario por estatus">
          {!puedeVehiculo ? (
            <EmptyState message="No tienes permiso para ver el inventario." />
          ) : vehiculos.length === 0 ? (
            <EmptyState message="Aún no hay vehículos registrados." href="/inventario" linkLabel="Agregar el primero" />
          ) : (
            <>
              {ESTATUS_VEHICULO.map((e) => (
                <BreakdownRow key={e.key} label={e.label} count={vehiculos.filter((v) => v.estatus === e.key).length} total={vehiculos.length} color={e.color} />
              ))}
              <div style={{ marginTop: 10, fontSize: 12, color: '#8e8784' }}>
                Valor de inventario disponible: <strong style={{ color: '#251f1d' }}>{formatCurrency(valorInventarioDisponible)}</strong>
              </div>
            </>
          )}
        </Panel>

        {/* Clientes */}
        <Panel title="Clientes">
          {!puedeCliente ? (
            <EmptyState message="No tienes permiso para ver clientes." />
          ) : clientes.length === 0 ? (
            <EmptyState message="Aún no hay clientes registrados." href="/clientes" linkLabel="Registrar el primero" />
          ) : (
            <>
              <BreakdownRow label="Con marca de interés específica" count={clientesConInteres} total={clientes.length} color="#ff8901" />
              <BreakdownRow label="Sin preferencia de marca" count={clientes.length - clientesConInteres} total={clientes.length} color="#8e8784" />
            </>
          )}
        </Panel>

        {/* Guardias */}
        <Panel title="Próximas guardias">
          {!puedeGuardia ? (
            <EmptyState message="No tienes permiso para ver guardias." />
          ) : guardias.length === 0 ? (
            <EmptyState message="Aún no hay guardias programadas." href="/guardias" linkLabel="Programar una" />
          ) : proximasGuardias.length === 0 ? (
            <EmptyState message="No hay guardias programadas a partir de hoy." href="/guardias" linkLabel="Programar una" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {proximasGuardias.map((g) => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#ff8901', color: '#fff', fontWeight: 800, fontSize: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getInitials(g.usuario?.nombre)}
                  </span>
                  <span style={{ color: '#251f1d', fontWeight: 700 }}>{g.usuario?.nombre}</span>
                  <span style={{ color: '#8e8784' }}>{formatDate(g.fecha, 'short')} · {g.turno?.nombre}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Actividades */}
        <Panel title="Actividades por estatus">
          {!puedeActividad ? (
            <EmptyState message="No tienes permiso para ver actividades." />
          ) : actividades.length === 0 ? (
            <EmptyState message="Aún no hay actividades registradas." href="/guardias" linkLabel="Agregar una" />
          ) : (
            ESTATUS_ACTIVIDAD.map((e) => (
              <BreakdownRow key={e.key} label={e.label} count={actividades.filter((a) => a.estatus === e.key).length} total={actividades.length} color={e.color} />
            ))
          )}
        </Panel>
      </div>

      {/* Usuarios */}
      <Panel title="Usuarios del sistema">
        {!puedeUsuario ? (
          <EmptyState message="No tienes permiso para ver usuarios." />
        ) : usuarios.length === 0 ? (
          <EmptyState message="Aún no hay usuarios registrados." href="/usuarios" linkLabel="Crear el primero" />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <StatTile icon={UserCogIcon} label="Usuarios activos" value={usuariosActivos} accent="#16a34a" />
            <StatTile icon={UserCogIcon} label="Usuarios inactivos" value={usuarios.length - usuariosActivos} accent="#8e8784" />
          </div>
        )}
      </Panel>
    </div>
  );
}
