'use client';

import React, { useState, useEffect } from 'react';
import { useNotify } from '@/store/features/ui/useNotify';
import { useGetCatalogoQuery } from '@/store/features/catalogos/catalogoApiSlice';
import { useGetVehiculosQuery } from '@/store/features/vehiculos/vehiculoApiSlice';
import { useCreateNegocioMutation, useUpdateNegocioMutation } from '@/store/features/negocios/negocioApiSlice';
import { CloseIcon, FileTextIcon, DollarIcon } from '@/components/ui/Icons';

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px solid #d5d0ce',
  fontSize: 13,
  backgroundColor: '#ffffff',
  color: '#251f1d',
  outline: 'none',
};

export function NegocioModal({ isOpen, onClose, cliente, modo = 'solicitud', negocioExistente = null, onSuccess = null }) {
  const notify = useNotify();

  const { data: lineasNegocio = [] } = useGetCatalogoQuery('linea-negocio');
  const { data: etapas = [] } = useGetCatalogoQuery('etapa');
  const { data: tiposSeguimiento = [] } = useGetCatalogoQuery('tipo-seguimiento');

  const { data: vehiculosData } = useGetVehiculosQuery();
  const vehiculos = React.useMemo(() => {
    if (!vehiculosData) return [];
    return Array.isArray(vehiculosData) ? vehiculosData : (vehiculosData.items || []);
  }, [vehiculosData]);
  const vehiculosDisponibles = React.useMemo(() => {
    if (cliente?.visitaMarcaEspecifica && cliente?.marcaId) {
      return vehiculos.filter((v) => v.marcaId === cliente.marcaId);
    }
    return vehiculos;
  }, [vehiculos, cliente]);

  const [createNegocio, { isLoading: isCreating }] = useCreateNegocioMutation();
  const [updateNegocio, { isLoading: isUpdating }] = useUpdateNegocioMutation();
  const isSubmitting = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    lineaNegocioId: '',
    etapaId: '',
    tipoSeguimientoId: '',
    vehiculoId: '',
    observaciones: '',
    totalUnidad: '',
    dioEnganche: false,
    enganche: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    if (negocioExistente) {
      setFormData({
        lineaNegocioId: negocioExistente.lineaNegocioId ? String(negocioExistente.lineaNegocioId) : '',
        etapaId: negocioExistente.etapaId ? String(negocioExistente.etapaId) : '',
        tipoSeguimientoId: negocioExistente.tipoSeguimientoId ? String(negocioExistente.tipoSeguimientoId) : '',
        vehiculoId: negocioExistente.vehiculoId ? String(negocioExistente.vehiculoId) : '',
        observaciones: negocioExistente.observaciones || '',
        totalUnidad: negocioExistente.totalUnidad != null ? String(negocioExistente.totalUnidad) : '',
        dioEnganche: Boolean(negocioExistente.dioEnganche),
        enganche: negocioExistente.enganche != null ? String(negocioExistente.enganche) : '',
      });
    } else {
      setFormData({
        lineaNegocioId: lineasNegocio[0]?.id ? String(lineasNegocio[0].id) : '',
        etapaId: etapas[0]?.id ? String(etapas[0].id) : '',
        tipoSeguimientoId: '',
        vehiculoId: '',
        observaciones: '',
        totalUnidad: '',
        dioEnganche: false,
        enganche: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, negocioExistente, lineasNegocio, etapas]);

  if (!isOpen) return null;

  const esVenta = modo === 'venta';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lineaNegocioId || !formData.etapaId) {
      notify('Selecciona línea de negocio y etapa.', 'error');
      return;
    }
    if (formData.dioEnganche && !(Number(formData.enganche) > 0)) {
      notify('Si marcaste enganche recibido, captura un monto mayor a 0.', 'error');
      return;
    }

    const payload = {
      lineaNegocioId: Number(formData.lineaNegocioId),
      etapaId: Number(formData.etapaId),
      tipoSeguimientoId: formData.tipoSeguimientoId ? Number(formData.tipoSeguimientoId) : null,
      vehiculoId: formData.vehiculoId ? Number(formData.vehiculoId) : null,
      observaciones: formData.observaciones,
      dioEnganche: formData.dioEnganche,
      enganche: formData.dioEnganche ? Number(formData.enganche) : null,
      totalUnidad: esVenta && formData.totalUnidad !== '' ? Number(formData.totalUnidad) : (negocioExistente ? negocioExistente.totalUnidad : null),
    };

    try {
      if (negocioExistente) {
        await updateNegocio({ id: negocioExistente.id, data: payload }).unwrap();
        notify(esVenta ? 'Venta registrada correctamente' : 'Negocio actualizado correctamente');
      } else {
        await createNegocio({ clienteId: cliente.id, ...payload }).unwrap();
        notify(esVenta ? 'Venta registrada correctamente' : 'Solicitud registrada correctamente');
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
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f2efed', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: esVenta ? '#251f1d' : '#fff5eb',
                color: esVenta ? '#ffffff' : '#ff8901',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {esVenta ? <DollarIcon size={20} /> : <FileTextIcon size={20} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#251f1d' }}>
                {esVenta ? 'Registrar Venta' : 'Crear Solicitud'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#8e8784' }}>
                {cliente?.nombre}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8784', padding: '6px', borderRadius: '6px', display: 'flex' }} title="Cerrar">
            <CloseIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                Línea de negocio *
              </label>
              {lineasNegocio.length === 0 ? (
                <div style={{ padding: '8px 10px', borderRadius: 8, background: '#fef3c7', border: '1px solid #fde68a', fontSize: 11, color: '#b45309' }}>
                  Sin líneas de negocio. Da de alta una en Catálogos.
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

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                Etapa *
              </label>
              {etapas.length === 0 ? (
                <div style={{ padding: '8px 10px', borderRadius: 8, background: '#fef3c7', border: '1px solid #fde68a', fontSize: 11, color: '#b45309' }}>
                  Sin etapas. Da de alta una en Catálogos.
                </div>
              ) : (
                <select value={formData.etapaId} onChange={(e) => setFormData({ ...formData, etapaId: e.target.value })} required style={inputStyle}>
                  <option value="">Seleccionar…</option>
                  {etapas.map((et) => (
                    <option key={et.id} value={et.id}>{et.nombre}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                Tipo de seguimiento
              </label>
              <select value={formData.tipoSeguimientoId} onChange={(e) => setFormData({ ...formData, tipoSeguimientoId: e.target.value })} style={inputStyle}>
                <option value="">Sin especificar</option>
                {tiposSeguimiento.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                Vehículo de interés
              </label>
              <select value={formData.vehiculoId} onChange={(e) => setFormData({ ...formData, vehiculoId: e.target.value })} style={inputStyle}>
                <option value="">Sin vincular</option>
                {vehiculosDisponibles.map((v) => (
                  <option key={v.id} value={v.id}>{v.marca?.nombre || ''} {v.nombre || v.modelo} {v.anio}</option>
                ))}
              </select>
            </div>
          </div>

          {esVenta && (
            <div style={{ background: '#faf9f8', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f0edeb' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '5px' }}>
                Total de la unidad
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.totalUnidad}
                onChange={(e) => setFormData({ ...formData, totalUnidad: e.target.value })}
                style={{ ...inputStyle, marginBottom: 10 }}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#251f1d' }}>
                <input
                  type="checkbox"
                  checked={formData.dioEnganche}
                  onChange={(e) => setFormData({ ...formData, dioEnganche: e.target.checked, enganche: e.target.checked ? formData.enganche : '' })}
                  style={{ width: 18, height: 18, accentColor: '#ff8901', cursor: 'pointer' }}
                />
                <span>¿Recibió enganche?</span>
              </label>

              {formData.dioEnganche && (
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#6e6764', display: 'block', marginBottom: '4px' }}>
                    Monto del enganche *
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
              )}
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
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: esVenta ? '#251f1d' : '#ff8901',
                color: esVenta ? '#ffffff' : '#251f1d',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Guardando…' : (esVenta ? 'Registrar Venta' : 'Guardar Solicitud')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
