'use client';

import React, { useState, useEffect } from 'react';
import { useNotify } from '@/store/features/ui/useNotify';
import { useGetCatalogoQuery } from '@/store/features/catalogos/catalogoApiSlice';
import { useGetVehiculosQuery } from '@/store/features/vehiculos/vehiculoApiSlice';
import { useGetClientesQuery } from '@/store/features/clientes/clienteApiSlice';
import { useCreateNegocioMutation, useUpdateNegocioMutation } from '@/store/features/negocios/negocioApiSlice';
import { CloseIcon, FileTextIcon, DollarIcon } from '@/components/ui/Icons';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { formatCurrency } from '@/lib/utils';

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px solid #d5d0ce',
  fontSize: 13,
  backgroundColor: '#ffffff',
  color: '#251f1d',
  outline: 'none',
  boxSizing: 'border-box',
};

export function NegocioModal({ isOpen, onClose, cliente, modo = 'solicitud', negocioExistente = null, onSuccess = null }) {
  const notify = useNotify();

  const { data: lineasNegocio = [] } = useGetCatalogoQuery('linea-negocio');

  const { data: clientesData } = useGetClientesQuery();
  const clientes = React.useMemo(() => {
    if (!clientesData) return [];
    return Array.isArray(clientesData) ? clientesData : (clientesData.items || []);
  }, [clientesData]);

  const [selectedClientId, setSelectedClientId] = useState(cliente?.id ? String(cliente.id) : '');

  const clienteOptions = React.useMemo(() => {
    return clientes.map((c) => ({
      id: c.id,
      label: c.nombre,
      sublabel: c.telefono ? `Tel: ${c.telefono}` : null,
    }));
  }, [clientes]);

  const activeCliente = React.useMemo(() => {
    if (selectedClientId) {
      const found = clientes.find((c) => String(c.id) === String(selectedClientId));
      if (found) return found;
    }
    return cliente || clientes[0] || null;
  }, [selectedClientId, clientes, cliente]);

  React.useEffect(() => {
    if (cliente?.id) {
      setSelectedClientId(String(cliente.id));
    }
  }, [cliente]);

  const { data: vehiculosData } = useGetVehiculosQuery();
  const vehiculos = React.useMemo(() => {
    if (!vehiculosData) return [];
    return Array.isArray(vehiculosData) ? vehiculosData : (vehiculosData.items || []);
  }, [vehiculosData]);

  // Solo se pueden asignar vehículos DISPONIBLES — uno ya APARTADO o VENDIDO
  // no debería poder volver a elegirse en un negocio nuevo. Excepción: el
  // vehículo que este MISMO negocio ya tiene asignado (al editarlo) se deja
  // ver aunque esté APARTADO/VENDIDO, porque es justamente el que lo puso
  // en ese estatus — si no, se perdería de la lista al editar.
  const vehiculosSeleccionables = React.useMemo(() => {
    return vehiculos.filter((v) => v.estatus === 'DISPONIBLE' || v.id === negocioExistente?.vehiculoId);
  }, [vehiculos, negocioExistente]);

  // Si el cliente tiene preferencia de marca, se ordenan primero los de su marca.
  const vehiculosDisponibles = React.useMemo(() => {
    if (!vehiculosSeleccionables.length) return [];
    const cl = activeCliente || cliente;
    if (cl?.visitaMarcaEspecifica && cl?.marcaId) {
      const deSuMarca = vehiculosSeleccionables.filter((v) => v.marcaId === cl.marcaId);
      const otras = vehiculosSeleccionables.filter((v) => v.marcaId !== cl.marcaId);
      return [...deSuMarca, ...otras];
    }
    return vehiculosSeleccionables;
  }, [vehiculosSeleccionables, activeCliente, cliente]);

  const [createNegocio, { isLoading: isCreating }] = useCreateNegocioMutation();
  const [updateNegocio, { isLoading: isUpdating }] = useUpdateNegocioMutation();
  const isSubmitting = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    lineaNegocioId: '',
    vehiculoId: '',
    observaciones: '',
    totalUnidad: '',
    folio: '',
    enganche: '',
  });

  const esVenta = modo === 'venta';
  const esEnganche = modo === 'enganche';
  const esSolicitud = modo === 'solicitud';

  useEffect(() => {
    if (!isOpen) return;

    if (negocioExistente) {
      setFormData({
        lineaNegocioId: negocioExistente.lineaNegocioId ? String(negocioExistente.lineaNegocioId) : (lineasNegocio[0]?.id ? String(lineasNegocio[0].id) : ''),
        vehiculoId: negocioExistente.vehiculoId ? String(negocioExistente.vehiculoId) : '',
        observaciones: negocioExistente.observaciones || '',
        totalUnidad: negocioExistente.totalUnidad != null ? String(negocioExistente.totalUnidad) : '',
        folio: negocioExistente.folio || '',
        enganche: negocioExistente.enganche != null ? String(negocioExistente.enganche) : '',
      });
    } else {
      setFormData({
        lineaNegocioId: lineasNegocio[0]?.id ? String(lineasNegocio[0].id) : '',
        vehiculoId: '',
        observaciones: '',
        totalUnidad: '',
        folio: '',
        enganche: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, modo, negocioExistente, lineasNegocio]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lineaNegocioId) {
      notify('Selecciona la línea de negocio.', 'error');
      return;
    }

    if (esVenta) {
      if (!formData.vehiculoId) {
        notify('Selecciona la unidad de inventario vendida.', 'error');
        return;
      }
      if (!formData.folio.trim()) {
        notify('Para facturar / registrar la venta es necesario ingresar el folio.', 'error');
        return;
      }
      if (!(Number(formData.totalUnidad) > 0)) {
        notify('Ingresa el monto total de la venta.', 'error');
        return;
      }
    }

    if (esEnganche) {
      if (!formData.vehiculoId) {
        notify('Selecciona la unidad de inventario a apartar con el enganche.', 'error');
        return;
      }
      if (!(Number(formData.enganche) > 0)) {
        notify('Ingresa un monto de enganche mayor a 0.', 'error');
        return;
      }
    }

    // `tipo` es la fuente única de verdad de qué es este negocio (y de si
    // aparta o no el vehículo) — el backend deriva dioEnganche de él.
    const payload = {
      lineaNegocioId: Number(formData.lineaNegocioId),
      vehiculoId: formData.vehiculoId ? Number(formData.vehiculoId) : null,
      folio: formData.folio?.trim() || null,
      observaciones: formData.observaciones,
      tipo: esVenta ? 'VENTA' : (esEnganche ? 'APARTADO' : 'SOLICITUD'),
      enganche: esEnganche ? Number(formData.enganche) : null,
      totalUnidad: esVenta && formData.totalUnidad !== '' ? Number(formData.totalUnidad) : (negocioExistente ? negocioExistente.totalUnidad : null),
    };

    const finalClienteId = selectedClientId || cliente?.id;
    if (!finalClienteId) {
      notify('Selecciona o busca un cliente.', 'error');
      return;
    }

    try {
      if (negocioExistente) {
        await updateNegocio({ id: negocioExistente.id, data: payload }).unwrap();
        notify(esVenta ? 'Venta registrada correctamente' : (esEnganche ? 'Enganche registrado correctamente' : 'Negocio actualizado correctamente'));
      } else {
        await createNegocio({ clienteId: Number(finalClienteId), ...payload }).unwrap();
        notify(esVenta ? 'Venta registrada correctamente' : (esEnganche ? 'Enganche registrado correctamente' : 'Solicitud de crédito registrada correctamente'));
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      notify(err?.data?.error || 'No se pudo guardar el negocio', 'error');
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
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f2efed', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: esVenta ? '#251f1d' : (esEnganche ? '#dcfce7' : '#fff5eb'),
                color: esVenta ? '#ffffff' : (esEnganche ? '#16a34a' : '#ff8901'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {esVenta ? <DollarIcon size={20} /> : (esEnganche ? <DollarIcon size={20} /> : <FileTextIcon size={20} />)}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#251f1d' }}>
                {esVenta ? '💵 Registrar Venta' : (esEnganche ? '💰 Registrar Enganche' : '📄 Solicitud de crédito')}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#8e8784' }}>
                {activeCliente ? (
                  <>Cliente: <strong style={{ color: '#251f1d' }}>{activeCliente.nombre}</strong></>
                ) : (
                  'Selecciona o busca un cliente'
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8784', padding: '6px', borderRadius: '6px', display: 'flex' }} title="Cerrar">
            <CloseIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Seleccionar Cliente con buscador de texto */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
              Cliente *
            </label>
            {clientes.length === 0 ? (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef3c7', border: '1px solid #fde68a', fontSize: '12px', color: '#b45309' }}>
                No hay clientes registrados en la base de datos.
              </div>
            ) : (
              <SearchableCombobox
                options={clienteOptions}
                value={selectedClientId}
                onChange={(val) => setSelectedClientId(String(val || ''))}
                placeholder="Escribe para buscar cliente por nombre o teléfono..."
                required
              />
            )}
          </div>
          {/* Vehículo de inventario (mismo formato que prueba de manejo) */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
              {esVenta ? 'Vehículo a facturar / vender *' : (esEnganche ? 'Vehículo a apartar *' : 'Vehículo de interés')}
            </label>
            {vehiculos.length === 0 ? (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#f3f4f6', border: '1px solid #e5e7eb', fontSize: '12px', color: '#4b5563' }}>
                Aún no hay vehículos registrados en inventario.
              </div>
            ) : vehiculosDisponibles.length === 0 ? (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef3c7', border: '1px solid #fde68a', fontSize: '12px', color: '#b45309' }}>
                No hay vehículos disponibles para asignar.
              </div>
            ) : (
              <select
                value={formData.vehiculoId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const v = vehiculosDisponibles.find((item) => String(item.id) === String(selectedId));
                  setFormData((prev) => ({
                    ...prev,
                    vehiculoId: selectedId,
                    totalUnidad: esVenta && v?.precioLista ? String(v.precioLista) : prev.totalUnidad,
                  }));
                }}
                required={esVenta || esEnganche}
                style={inputStyle}
              >
                <option value="">Seleccionar vehículo...</option>
                {vehiculosDisponibles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.marca?.nombre || ''} {v.nombre} {v.anio} — {formatCurrency(v.precioLista || 0)} [{v.estatus}]
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
              Línea de negocio *
            </label>
            {lineasNegocio.length === 0 ? (
              <div style={{ padding: '8px 10px', borderRadius: 8, background: '#fef3c7', border: '1px solid #fde68a', fontSize: 11, color: '#b45309' }}>
                Sin líneas de negocio.
              </div>
            ) : (
              <select value={formData.lineaNegocioId} onChange={(e) => setFormData({ ...formData, lineaNegocioId: e.target.value })} required style={inputStyle}>
                <option value="">Seleccionar…</option>
                {lineasNegocio.map((l) => (
                  <option key={l.id} value={l.id}>{l.nombre}</option>
                ))}
              </select>
            )}
          </div>

          {/* Sección exclusiva de VENTA */}
          {esVenta && (
            <div style={{ background: '#faf9f8', padding: '14px 16px', borderRadius: '10px', border: '1px solid #f0edeb' }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                  Folio de factura / venta <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. F-10294"
                  value={formData.folio}
                  onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                  Total de la venta <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.totalUnidad}
                  onChange={(e) => setFormData({ ...formData, totalUnidad: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Sección exclusiva de ENGANCHE */}
          {esEnganche && (
            <div style={{ background: '#f0fdf4', padding: '14px 16px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '5px' }}>
                  Monto del enganche recibido <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.enganche}
                  onChange={(e) => setFormData({ ...formData, enganche: e.target.value })}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#166534', display: 'block', marginBottom: '5px' }}>
                  Folio o recibo de caja (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. REC-4091"
                  value={formData.folio}
                  onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Folio opcional para Solicitud */}
          {esSolicitud && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                Folio de solicitud (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. SOL-2041"
                value={formData.folio}
                onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
              Observaciones
            </label>
            <textarea
              rows={2}
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f2efed' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #d5d0ce', backgroundColor: '#ffffff', color: '#251f1d', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: esVenta ? '#251f1d' : (esEnganche ? '#16a34a' : '#ff8901'),
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting
                ? 'Guardando…'
                : (esVenta ? 'Guardar Venta' : (esEnganche ? 'Guardar Enganche' : 'Guardar Solicitud de crédito'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
