'use client';

import React, { useState } from 'react';
import { useNotify } from '@/store/features/ui/useNotify';
import { formatCurrency, getTodayISO } from '@/lib/utils';
import { useGetClientesQuery } from '@/store/features/clientes/clienteApiSlice';
import { useGetVehiculosQuery } from '@/store/features/vehiculos/vehiculoApiSlice';
import { useGetUsuariosQuery } from '@/store/features/usuarios/usuarioApiSlice';
import { useCreateDemoMutation } from '@/store/features/demos/demoApiSlice';
import { CloseIcon, TestDriveIcon } from '@/components/ui/Icons';

export function TestDriveModal({
  isOpen,
  onClose,
  defaultClientId = null,
  defaultVehicleId = null,
  onSuccess = null,
}) {
  const notify = useNotify();

  const { data: clientesData } = useGetClientesQuery();
  const clientes = React.useMemo(() => {
    if (!clientesData) return [];
    return Array.isArray(clientesData) ? clientesData : (clientesData.items || []);
  }, [clientesData]);

  const { data: vehiculosData } = useGetVehiculosQuery();
  const vehiculos = React.useMemo(() => {
    if (!vehiculosData) return [];
    return Array.isArray(vehiculosData) ? vehiculosData : (vehiculosData.items || []);
  }, [vehiculosData]);

  const { data: usuarios = [] } = useGetUsuariosQuery();
  const [createDemo, { isLoading: isSubmitting }] = useCreateDemoMutation();

  const [formData, setFormData] = useState({
    clienteId: defaultClientId ? String(defaultClientId) : (clientes[0]?.id ? String(clientes[0].id) : ''),
    vehiculoId: defaultVehicleId ? String(defaultVehicleId) : (vehiculos[0]?.id ? String(vehiculos[0].id) : ''),
    fecha: getTodayISO(),
    horario: '16:00',
    usuarioId: usuarios[0]?.id ? String(usuarios[0].id) : '',
    estado: 'Programada',
    observaciones: 'Ruta urbana de 20 minutos, verificar licencia vigente antes de salir.',
  });

  // Sincronizar si cambian props o datos iniciales
  React.useEffect(() => {
    if (defaultClientId) {
      setFormData((prev) => ({ ...prev, clienteId: String(defaultClientId) }));
    } else if (clientes.length > 0 && !formData.clienteId) {
      setFormData((prev) => ({ ...prev, clienteId: String(clientes[0].id) }));
    }
  }, [defaultClientId, clientes]);

  React.useEffect(() => {
    if (defaultVehicleId) {
      setFormData((prev) => ({ ...prev, vehiculoId: String(defaultVehicleId) }));
    } else if (vehiculos.length > 0 && !formData.vehiculoId) {
      setFormData((prev) => ({ ...prev, vehiculoId: String(vehiculos[0].id) }));
    }
  }, [defaultVehicleId, vehiculos]);

  React.useEffect(() => {
    if (usuarios.length > 0 && !formData.usuarioId) {
      setFormData((prev) => ({ ...prev, usuarioId: String(usuarios[0].id) }));
    }
  }, [usuarios]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clienteId) {
      notify('Selecciona o registra un cliente.', 'error');
      return;
    }

    if (!formData.vehiculoId) {
      notify('Selecciona un vehículo para realizar la prueba.', 'error');
      return;
    }

    try {
      await createDemo({
        clienteId: Number(formData.clienteId),
        vehiculoId: Number(formData.vehiculoId),
        fecha: formData.fecha,
        horario: formData.horario,
        usuarioId: formData.usuarioId ? Number(formData.usuarioId) : undefined,
        estado: formData.estado,
        observaciones: formData.observaciones,
      }).unwrap();

      notify('Prueba de manejo agendada exitosamente');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      notify(err?.data?.error || 'No se pudo agendar la prueba de manejo', 'error');
    }
  };

  return (
    <div
      className="modal-backdrop animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '16px',
      }}
    >
      <div
        className="modal-box animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '560px',
          width: '100%',
          padding: '24px 28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          border: '1px solid #eae7e5',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Cabecera del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f2efed', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fff5eb',
                color: '#ff8901',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TestDriveIcon size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#251f1d' }}>
                Programar Prueba de Manejo
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#8e8784' }}>
                Agenda de demostración y recorrido de prueba
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#8e8784',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
            }}
            title="Cerrar"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Cliente */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
              Cliente *
            </label>
            {clientes.length === 0 ? (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef3c7', border: '1px solid #fde68a', fontSize: '12px', color: '#b45309' }}>
                No hay clientes registrados en la base de datos. Primero registra un cliente o invitado.
              </div>
            ) : (
              <select
                value={formData.clienteId}
                onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d5d0ce',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#251f1d',
                  outline: 'none',
                }}
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.telefono ? `(${c.telefono})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Vehículo a evaluar */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
              Vehículo a evaluar *
            </label>
            {vehiculos.length === 0 ? (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#f3f4f6', border: '1px solid #e5e7eb', fontSize: '12px', color: '#4b5563' }}>
                Aún no hay vehículos registrados en inventario.
              </div>
            ) : (
              <select
                value={formData.vehiculoId}
                onChange={(e) => setFormData({ ...formData, vehiculoId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d5d0ce',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#251f1d',
                  outline: 'none',
                }}
              >
                <option value="">Seleccionar vehículo...</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.marca?.nombre || ''} {v.nombre} {v.anio} — {formatCurrency(v.precioLista || 0)} [{v.estatus}]
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Fila Fecha y Horario */}
          <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                Fecha *
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d5d0ce',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#251f1d',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                Horario *
              </label>
              <input
                type="time"
                value={formData.horario}
                onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d5d0ce',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#251f1d',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Fila Asesor y Estado */}
          <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                Asesor de guardia / responsable *
              </label>
              <select
                value={formData.usuarioId}
                onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d5d0ce',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#251f1d',
                  outline: 'none',
                }}
              >
                <option value="">Asesor actual</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} {u.tipoUsuario?.nombre ? `(${u.tipoUsuario.nombre})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d5d0ce',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#251f1d',
                  outline: 'none',
                }}
              >
                <option value="Programada">Programada</option>
                <option value="Realizada">Realizada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Observaciones / Ruta previa */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
              Ruta u observaciones previas
            </label>
            <textarea
              rows={2}
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Ruta urbana de 20 minutos, verificar licencia vigente..."
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #d5d0ce',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                color: '#251f1d',
                outline: 'none',
                resize: 'vertical',
                fontStyle: 'italic',
              }}
            />
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f2efed' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid #d5d0ce',
                backgroundColor: '#ffffff',
                color: '#251f1d',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#ff8901',
                color: '#251f1d',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255,137,1,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <TestDriveIcon size={15} />
              <span>{isSubmitting ? 'Agendando...' : 'Agendar Prueba de Manejo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
