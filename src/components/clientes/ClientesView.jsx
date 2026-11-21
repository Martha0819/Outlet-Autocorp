'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useNotify } from '@/store/features/ui/useNotify';
import { formatDate, getInitials, validatePhone, formatCurrency } from '@/lib/utils';
import { useGetCatalogoQuery } from '@/store/features/catalogos/catalogoApiSlice';
import {
  useGetClientesQuery,
  useCreateClienteMutation,
  useUpdateClienteMutation,
} from '@/store/features/clientes/clienteApiSlice';
import { useGetVehiculosQuery } from '@/store/features/vehiculos/vehiculoApiSlice';
import {
  useGetDemosQuery,
  useCreateDemoMutation,
  useDeleteDemoMutation,
} from '@/store/features/demos/demoApiSlice';
import { useGetNegociosQuery } from '@/store/features/negocios/negocioApiSlice';
import { usePermiso } from '@/store/features/auth/usePermiso';
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CloseIcon,
  EyeIcon,
  CarIcon,
  TestDriveIcon,
  FileTextIcon,
  DollarIcon,
  CheckIcon,
} from '@/components/ui/Icons';
import { TestDriveModal } from '@/components/demos/TestDriveModal';
import { NegocioModal } from '@/components/clientes/NegocioModal';
import { ImportadorClientes } from '@/components/clientes/ImportadorClientes';

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

function formatPhoneDisplay(phone) {
  if (!phone) return '—';
  const clean = String(phone).replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 2)} ${clean.slice(2, 6)} ${clean.slice(6)}`;
  }
  return phone;
}

export function ClientesView() {
  const notify = useNotify();
  const { puede } = usePermiso();
  const puedeCrear = puede('cliente', 'crear');
  const puedeEditar = puede('cliente', 'editar');
  const puedeCrearNegocio = puede('negocio', 'crear');
  const puedeEditarNegocio = puede('negocio', 'editar');

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Modales
  const [activeClientModal, setActiveClientModal] = useState(null); // { isEdit: boolean, client: object }
  const [active360Client, setActive360Client] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoClientId, setDemoClientId] = useState(null);
  const [negocioModal, setNegocioModal] = useState(null); // { cliente, modo: 'solicitud'|'venta', negocioExistente }
  const [notaModalClient, setNotaModalClient] = useState(null);
  const [notaTexto, setNotaTexto] = useState('');
  const [isSavingNota, setIsSavingNota] = useState(false);

  // Formulario de Cliente (Alta / Edición)
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    numeroAcompanantes: 0,
    visitaMarcaEspecifica: false,
    marcaId: '',
    observaciones: '',
  });

  // Consultas RTK Query
  const { data: marcas = [] } = useGetCatalogoQuery('marca');
  const { data: clientesData, isLoading: loadingClientes, refetch: refetchClientes } = useGetClientesQuery();
  const [showImportador, setShowImportador] = useState(false);
  const allClients = useMemo(() => {
    if (!clientesData) return [];
    return Array.isArray(clientesData) ? clientesData : (clientesData.items || []);
  }, [clientesData]);

  const { data: vehiculosData } = useGetVehiculosQuery();
  const allVehicles = useMemo(() => {
    if (!vehiculosData) return [];
    return Array.isArray(vehiculosData) ? vehiculosData : (vehiculosData.items || []);
  }, [vehiculosData]);

  const { data: demosData } = useGetDemosQuery();
  const allDemos = useMemo(() => {
    if (!demosData) return [];
    return Array.isArray(demosData) ? demosData : (demosData.items || []);
  }, [demosData]);

  const { data: negociosData } = useGetNegociosQuery();
  const allNegocios = useMemo(() => {
    if (!negociosData) return [];
    return Array.isArray(negociosData) ? negociosData : (negociosData.items || []);
  }, [negociosData]);

  const [createCliente, { isLoading: isCreating }] = useCreateClienteMutation();
  const [updateCliente, { isLoading: isUpdating }] = useUpdateClienteMutation();

  const handleGuardarNota = async (e) => {
    if (e) e.preventDefault();
    if (!notaTexto.trim()) {
      notify('Por favor escribe el contenido de la nota.', 'error');
      return;
    }
    if (!notaModalClient) return;

    setIsSavingNota(true);
    try {
      const ahora = new Date();
      const fechaHora = ahora.toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const entradaNueva = `[${fechaHora}]: ${notaTexto.trim()}`;
      const observacionesActualizadas = notaModalClient.observaciones
        ? `${notaModalClient.observaciones}\n${entradaNueva}`
        : entradaNueva;

      await updateCliente({
        id: notaModalClient.id,
        data: { observaciones: observacionesActualizadas },
      }).unwrap();

      notify('Nota agregada al expediente correctamente');
      setNotaModalClient(null);
      setNotaTexto('');
    } catch (err) {
      notify(err?.data?.error || 'No se pudo guardar la nota', 'error');
    } finally {
      setIsSavingNota(false);
    }
  };

  // Filtrado de clientes
  const filteredClients = useMemo(() => {
    return allClients
      .filter((c) => {
        if (selectedBrand !== 'all') {
          if (selectedBrand === 'sin_preferencia') {
            if (c.visitaMarcaEspecifica) return false;
          } else {
            if (!c.visitaMarcaEspecifica || String(c.marcaId) !== String(selectedBrand)) {
              return false;
            }
          }
        }

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = (c.nombre || '').toLowerCase().includes(q);
          const matchPhone = (c.telefono || '').includes(q);
          const matchEmail = (c.correo || '').toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchEmail) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return (a.nombre || '').localeCompare(b.nombre || '');
        // default: recent
        return new Date(b.createdAt || b.fechaRegistro || 0) - new Date(a.createdAt || a.fechaRegistro || 0);
      });
  }, [allClients, selectedBrand, search, sortBy]);

  // Handlers para modales
  const openCreateModal = () => {
    setFormData({
      nombre: '',
      telefono: '',
      correo: '',
      numeroAcompanantes: 0,
      visitaMarcaEspecifica: false,
      marcaId: '',
      observaciones: '',
    });
    setActiveClientModal({ isEdit: false });
  };

  const openEditModal = (client) => {
    setFormData({
      nombre: client.nombre || '',
      telefono: client.telefono || '',
      correo: client.correo || '',
      numeroAcompanantes: client.numeroAcompanantes ?? 0,
      visitaMarcaEspecifica: Boolean(client.visitaMarcaEspecifica),
      marcaId: client.marcaId ? String(client.marcaId) : '',
      observaciones: client.observaciones || '',
    });
    setActiveClientModal({ isEdit: true, client });
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      notify('Nombre y teléfono son obligatorios', 'error');
      return;
    }
    if (!validatePhone(formData.telefono)) {
      notify('El teléfono debe tener 10 dígitos', 'error');
      return;
    }
    if (formData.visitaMarcaEspecifica && !formData.marcaId) {
      notify('Selecciona la marca de interés', 'error');
      return;
    }

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        correo: formData.correo?.trim() || null,
        numeroAcompanantes: Number(formData.numeroAcompanantes) || 0,
        visitaMarcaEspecifica: formData.visitaMarcaEspecifica,
        marcaId: formData.visitaMarcaEspecifica && formData.marcaId ? Number(formData.marcaId) : null,
        observaciones: formData.observaciones?.trim() || null,
      };

      if (activeClientModal?.isEdit) {
        await updateCliente({
          id: activeClientModal.client.id,
          data: payload,
        }).unwrap();
        notify('Cliente actualizado correctamente');
      } else {
        await createCliente(payload).unwrap();
        notify(`Cliente "${formData.nombre}" registrado`);
      }
      setActiveClientModal(null);
    } catch (err) {
      notify(err?.data?.error || 'No se pudo guardar el cliente', 'error');
    }
  };

  return (
    <div className="view-content active" id="view-clientes" style={{ paddingBottom: 60 }}>
      {/* =========================================================================
          1. BARRA SUPERIOR: BUSCADOR, FILTROS Y BOTÓN + AGREGAR CLIENTE
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: '14px',
          border: '1px solid #eae7e5',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        {/* Buscador */}
        <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '220px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8e8784', display: 'flex' }}>
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, celular o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #d5d0ce',
              fontSize: '13px',
              color: '#251f1d',
              outline: 'none',
              background: '#faf9f8',
            }}
          />
        </div>

        {/* Filtros a la derecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6e6764', fontWeight: 600 }}>Marca de interés:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #d5d0ce',
                fontSize: '12px',
                fontWeight: 600,
                background: '#ffffff',
                color: '#251f1d',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todas las marcas</option>
              <option value="sin_preferencia">Sin preferencia</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#6e6764', fontWeight: 600 }}>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #d5d0ce',
                fontSize: '12px',
                fontWeight: 600,
                background: '#ffffff',
                color: '#251f1d',
                cursor: 'pointer',
              }}
            >
              <option value="recent">Más recientes primero</option>
              <option value="name">Alfabético (A-Z)</option>
            </select>
          </div>

          {puedeCrear && (
            <button
              onClick={openCreateModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ff8901',
                color: '#251f1d',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255,137,1,0.25)',
              }}
            >
              <PlusIcon size={14} /> <span>Agregar cliente</span>
            </button>
          )}

          {puedeCrear && (
            <button
              onClick={() => setShowImportador((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                color: '#251f1d',
                border: '1px solid #d5d0ce',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <span>{showImportador ? 'Cancelar importación' : 'Importar desde archivo'}</span>
            </button>
          )}
        </div>
      </div>

      {showImportador && (
        <div className="card" style={{ borderRadius: '14px', border: '1px solid #eae7e5', backgroundColor: '#ffffff', padding: '16px 18px', marginTop: 16 }}>
          <ImportadorClientes
            onImportacionCompleta={() => {
              refetchClientes();
            }}
          />
        </div>
      )}

      {/* =========================================================================
          2. TABLA DE CLIENTES
          ========================================================================= */}
      <div
        className="card"
        style={{
          borderRadius: '14px',
          border: '1px solid #eae7e5',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#faf9f8', borderBottom: '1px solid #eae7e5' }}>
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#251f1d', letterSpacing: '0.6px' }}>
                  NOMBRE DE CLIENTE
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#251f1d', letterSpacing: '0.6px' }}>
                  CELULAR
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#251f1d', letterSpacing: '0.6px' }}>
                  CORREO
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#251f1d', letterSpacing: '0.6px' }}>
                  ¿VISITA UNA MARCA EN ESPECÍFICO?
                </th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#251f1d', letterSpacing: '0.6px' }}>
                  COMENTARIOS
                </th>
                <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 800, color: '#251f1d', letterSpacing: '0.6px', textAlign: 'right' }}>
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingClientes ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#8e8784', fontSize: '13px' }}>
                    Cargando clientes…
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#251f1d', margin: '0 0 6px 0' }}>
                      No se encontraron clientes registrados
                    </p>
                    <p style={{ fontSize: '12px', color: '#8e8784', margin: '0 0 16px 0' }}>
                      {search ? 'Prueba con otros términos de búsqueda.' : 'Comienza registrando al primer cliente en el showroom.'}
                    </p>
                    {puedeCrear && (
                      <button
                        onClick={openCreateModal}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#ff8901', color: '#251f1d', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                      >
                        <PlusIcon size={13} /> Registrar primer cliente
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const clientDemos = allDemos.filter((d) => d.clienteId === client.id);
                  const demoCount = clientDemos.length;

                  return (
                    <tr
                      key={client.id}
                      style={{ borderBottom: '1px solid #f0edeb', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf9f8')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Nombre y Avatar */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: '#251f1d',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '13px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(client.nombre)}
                          </span>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{client.nombre}</span>
                              {Number(client.numeroAcompanantes) > 0 && (
                                <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }} title={`${client.numeroAcompanantes} acompañante(s)`}>
                                  +{client.numeroAcompanantes} acomp.
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#8e8784' }}>
                              Alta: {formatDate(client.createdAt || client.fechaRegistro, 'short')} · {demoCount > 0 ? `${demoCount} pruebas` : '1 visita'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Celular */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 700, color: '#251f1d', whiteSpace: 'nowrap' }}>
                        {formatPhoneDisplay(client.telefono)}
                      </td>

                      {/* Correo */}
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6e6764' }}>
                        {client.correo || '—'}
                      </td>

                      {/* Marca en específico */}
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                        {client.visitaMarcaEspecifica && client.marca ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: '#fff5eb',
                              color: '#ff8901',
                            }}
                          >
                            Sí — {client.marca.nombre}
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: '#f4f2f0',
                              color: '#8e8784',
                            }}
                          >
                            No — Sin preferencia
                          </span>
                        )}
                      </td>

                      {/* Comentarios */}
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6e6764', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                        {client.observaciones ? `"${client.observaciones}"` : '—'}
                      </td>

                      {/* Acciones Rápidas */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {/* 1. Venta rápida */}
                          {(puedeCrearNegocio || puedeEditarNegocio) && (
                            <button
                              onClick={() => setNegocioModal({ cliente: client, modo: 'venta' })}
                              title="Registrar venta"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #251f1d',
                                background: '#251f1d',
                                color: '#ffffff',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ff8901'; e.currentTarget.style.borderColor = '#ff8901'; e.currentTarget.style.color = '#251f1d'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#251f1d'; e.currentTarget.style.borderColor = '#251f1d'; e.currentTarget.style.color = '#ffffff'; }}
                            >
                              <span>💵</span>
                              <span>Venta</span>
                            </button>
                          )}

                          {/* 2. Solicitud de crédito rápida */}
                          {puedeCrearNegocio && (
                            <button
                              onClick={() => setNegocioModal({ cliente: client, modo: 'solicitud' })}
                              title="Solicitud de crédito"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #d5d0ce',
                                background: '#ffffff',
                                color: '#251f1d',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff8901'; e.currentTarget.style.backgroundColor = '#fff5eb'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d5d0ce'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                            >
                              <span>📄</span>
                              <span>Solicitud</span>
                            </button>
                          )}

                          {/* 3. Prueba Demo rápida */}
                          <button
                            onClick={() => {
                              setDemoClientId(client.id);
                              setIsDemoModalOpen(true);
                            }}
                            title="Prueba Demo"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #ff8901',
                              background: '#fff5eb',
                              color: '#ea580c',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ff8901'; e.currentTarget.style.color = '#251f1d'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff5eb'; e.currentTarget.style.color = '#ea580c'; }}
                          >
                            <span>🚗</span>
                            <span>Demo</span>
                          </button>

                          {/* 4. Enganche rápido */}
                          {(puedeCrearNegocio || puedeEditarNegocio) && (
                            <button
                              onClick={() => setNegocioModal({ cliente: client, modo: 'enganche' })}
                              title="Registrar enganche"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #16a34a',
                                background: '#f0fdf4',
                                color: '#16a34a',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#16a34a'; e.currentTarget.style.color = '#ffffff'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; e.currentTarget.style.color = '#16a34a'; }}
                            >
                              <span>💰</span>
                              <span>Enganche</span>
                            </button>
                          )}

                          {/* 5. Ver Ficha 360 */}
                          <button
                            onClick={() => setActive360Client(client)}
                            title="Ver Ficha 360"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              border: '1px solid #eae7e5',
                              background: '#ffffff',
                              color: '#251f1d',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#faf9f8';
                              e.currentTarget.style.borderColor = '#ff8901';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#eae7e5';
                            }}
                          >
                            <EyeIcon size={14} />
                          </button>

                          {/* 6. Editar cliente */}
                          {puedeEditar && (
                            <button
                              onClick={() => openEditModal(client)}
                              title="Editar Cliente"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                border: '1px solid #eae7e5',
                                background: '#ffffff',
                                color: '#251f1d',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                flexShrink: 0,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#faf9f8';
                                e.currentTarget.style.borderColor = '#ff8901';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.borderColor = '#eae7e5';
                              }}
                            >
                              <EditIcon size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de conteo */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #eae7e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#8e8784' }}>
          <span>Mostrando 1 - {filteredClients.length} de {allClients.length} clientes</span>
          <span>Página 1 de 1</span>
        </div>
      </div>

      {/* =========================================================================
          3. MODAL: AGREGAR / EDITAR CLIENTE (CON CHECKBOX DE MARCA)
          ========================================================================= */}
      {activeClientModal && (
        <div
          className="modal-backdrop"
          onClick={() => setActiveClientModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '26px 30px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              border: '1px solid #eae7e5',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#251f1d' }}>
                {activeClientModal.isEdit ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button
                onClick={() => setActiveClientModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Mariana Zepeda Gómez"
                  style={inputStyle}
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                    Celular (10 dígitos) *
                  </label>
                  <input
                    type="tel"
                    placeholder="55 2345 6789"
                    maxLength={10}
                    style={inputStyle}
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '') })}
                    required
                  />
                  <span style={{ fontSize: 10, color: '#8e8784', marginTop: 2, display: 'block' }}>
                    Teléfono móvil a 10 dígitos sin espacios
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="mariana.zepeda@agencia.com"
                    style={inputStyle}
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  />
                  <span style={{ fontSize: 10, color: '#8e8784', marginTop: 2, display: 'block' }}>
                    Opcional para cotizaciones y solicitudes
                  </span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Número de acompañantes
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  style={inputStyle}
                  value={formData.numeroAcompanantes}
                  onChange={(e) => setFormData({ ...formData, numeroAcompanantes: e.target.value })}
                />
                <span style={{ fontSize: 10, color: '#8e8784', marginTop: 2, display: 'block' }}>
                  Cantidad de personas adicionales que acuden con el cliente
                </span>
              </div>

              {/* CHECKBOX: ¿Visita una marca en específico? */}
              <div style={{ background: '#faf9f8', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f0edeb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#251f1d' }}>
                  <input
                    type="checkbox"
                    checked={formData.visitaMarcaEspecifica}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData({
                        ...formData,
                        visitaMarcaEspecifica: checked,
                        marcaId: checked ? (formData.marcaId || (marcas[0]?.id ? String(marcas[0].id) : '')) : '',
                      });
                    }}
                    style={{ width: 18, height: 18, accentColor: '#ff8901', cursor: 'pointer' }}
                  />
                  <span>¿Le interesa / visita una marca en específico?</span>
                </label>

                {formData.visitaMarcaEspecifica && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #eae7e5' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6e6764', display: 'block', marginBottom: 4 }}>
                      Seleccionar Marca de Interés *
                    </label>
                    <select
                      style={inputStyle}
                      value={formData.marcaId}
                      onChange={(e) => setFormData({ ...formData, marcaId: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar marca…</option>
                      {marcas.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                  Comentarios u observaciones
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre las necesidades del cliente, auto que busca o presupuesto..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveClientModal(null)}
                  style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #d5d0ce', background: '#ffffff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#ff8901', color: '#251f1d', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                >
                  {activeClientModal.isEdit ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MODAL: FICHA 360 DEL CLIENTE
          ========================================================================= */}
      {active360Client && (() => {
        const currentClient = allClients.find((c) => c.id === active360Client.id) || active360Client;
        const clientDemos = allDemos.filter((d) => d.clienteId === currentClient.id);
        const interestedVehicles = allVehicles.filter((v) => {
          if (currentClient.visitaMarcaEspecifica && currentClient.marcaId) {
            return v.marcaId === currentClient.marcaId;
          }
          return v.estatus === 'DISPONIBLE';
        }).slice(0, 3);

        return (
          <div
            className="modal-backdrop"
            onClick={() => setActive360Client(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 16,
            }}
          >
            <div
              className="modal-box animate-scale-up"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                maxWidth: '820px',
                width: '100%',
                boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
                border: '1px solid #eae7e5',
                maxHeight: '92vh',
                overflowY: 'auto',
              }}
            >
              {/* Cabecera */}
              <div style={{ padding: '20px 28px', borderBottom: '1px solid #f0edeb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#251f1d',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getInitials(currentClient.nombre)}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#251f1d' }}>
                      {currentClient.nombre}
                    </h3>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#8e8784' }}>
                      Cliente registrado el {formatDate(currentClient.createdAt || currentClient.fechaRegistro, 'long')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActive360Client(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex' }}
                >
                  <CloseIcon size={20} />
                </button>
              </div>

              <div style={{ padding: '24px 28px' }}>
                {/* Botones de acción rápida de la Ficha */}
                <div className="ficha-actions-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <button
                    onClick={() => {
                      setNotaModalClient(currentClient);
                      setNotaTexto('');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#ffffff',
                      color: '#251f1d',
                      border: '1px solid #d5d0ce',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✏️ Agregar nota
                  </button>
                  <button
                    onClick={() => {
                      setDemoClientId(currentClient.id);
                      setIsDemoModalOpen(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#ffffff',
                      color: '#251f1d',
                      border: '1px solid #d5d0ce',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🚗 Prueba Demo
                  </button>
                  {puedeCrearNegocio && (
                    <button
                      onClick={() => setNegocioModal({ cliente: currentClient, modo: 'solicitud', negocioExistente: null })}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#ffffff',
                        color: '#251f1d',
                        border: '1px solid #d5d0ce',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      📄 Solicitud de crédito
                    </button>
                  )}
                  {(puedeCrearNegocio || puedeEditarNegocio) && (
                    <button
                      onClick={() => setNegocioModal({ cliente: currentClient, modo: 'enganche', negocioExistente: null })}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      💰 Registrar enganche
                    </button>
                  )}
                  {(puedeCrearNegocio || puedeEditarNegocio) && (
                    <button
                      onClick={() => {
                        const negocioAbierto = allNegocios
                          .filter((n) => n.clienteId === currentClient.id && n.tipo !== 'VENTA')
                          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
                        if (negocioAbierto && !puedeEditarNegocio) {
                          notify('No tienes permiso para editar negocios existentes', 'error');
                          return;
                        }
                        if (!negocioAbierto && !puedeCrearNegocio) {
                          notify('No tienes permiso para crear negocios', 'error');
                          return;
                        }
                        setNegocioModal({ cliente: currentClient, modo: 'venta', negocioExistente: negocioAbierto || null });
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#251f1d',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      💵 Registrar venta
                    </button>
                  )}
                </div>

                {/* Grid 2 Columnas de la Ficha 360 */}
                <div className="ficha-360-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Columna Izquierda: Información de Contacto, Comentarios, Vehículos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', margin: '0 0 8px 0' }}>
                        Información de Contacto
                      </h4>
                      <div style={{ background: '#faf9f8', borderRadius: '10px', padding: '14px', border: '1px solid #f0edeb', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div><strong style={{ color: '#8e8784' }}>Celular:</strong> <span style={{ fontWeight: 700, color: '#251f1d' }}>{formatPhoneDisplay(currentClient.telefono)}</span></div>
                        <div><strong style={{ color: '#8e8784' }}>Correo:</strong> <span style={{ color: '#251f1d' }}>{currentClient.correo || 'No especificado'}</span></div>
                        <div><strong style={{ color: '#8e8784' }}>Acompañantes:</strong> <span style={{ fontWeight: 700, color: '#251f1d' }}>{currentClient.numeroAcompanantes ?? 0} persona{currentClient.numeroAcompanantes === 1 ? '' : 's'}</span></div>
                        <div>
                          <strong style={{ color: '#8e8784' }}>Marca de interés:</strong>{' '}
                          {currentClient.visitaMarcaEspecifica && currentClient.marca ? (
                            <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#fff5eb', color: '#ff8901', fontWeight: 700, fontSize: '11px' }}>
                              {currentClient.marca.nombre}
                            </span>
                          ) : (
                            <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#f4f2f0', color: '#8e8784', fontWeight: 600, fontSize: '11px' }}>
                              Sin preferencia
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', margin: '0 0 8px 0' }}>
                        Comentarios y Observaciones
                      </h4>
                      <div style={{ background: '#faf9f8', borderRadius: '10px', padding: '14px', border: '1px solid #f0edeb', fontSize: '12px', color: '#6e6764', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {currentClient.observaciones || 'Sin comentarios registrados.'}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', margin: '0 0 8px 0' }}>
                        Vehículos Sugeridos / Interés
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {interestedVehicles.length === 0 ? (
                          <div style={{ fontSize: 11, color: '#8e8784', fontStyle: 'italic', padding: 8 }}>
                            Sin unidades vinculadas directamente.
                          </div>
                        ) : (
                          interestedVehicles.map((v) => (
                            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', border: '1px solid #eae7e5', background: '#ffffff' }}>
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#251f1d' }}>
                                  {v.marca?.nombre || ''} {v.nombre || v.modelo} {v.anio}
                                </div>
                                <div style={{ fontSize: '11px', color: '#8e8784' }}>
                                  {v.precioLista ? formatCurrency(v.precioLista) : 'Precio a cotizar'}
                                </div>
                              </div>
                              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: '#dcfce7', color: '#16a34a' }}>
                                {v.estatus.toLowerCase()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Historial, Pruebas, Solicitudes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Historial de Visitas */}
                    <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px', border: '1px solid #eae7e5' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', marginBottom: '8px' }}>
                        👤 Historial de Visitas (1)
                      </div>
                      <div style={{ fontSize: '11px', color: '#6e6764', borderLeft: '2px solid #ff8901', paddingLeft: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#251f1d' }}>
                          📅 {formatDate(currentClient.createdAt || currentClient.fechaRegistro, 'long')}
                        </div>
                        <div>Registro de visita y alta en recepción.</div>
                      </div>
                    </div>

                    {/* Pruebas de Manejo */}
                    <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px', border: '1px solid #eae7e5' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', marginBottom: '8px' }}>
                        🌐 Pruebas de Manejo ({clientDemos.length})
                      </div>
                      {clientDemos.length === 0 ? (
                        <div style={{ fontSize: '11px', color: '#8e8784' }}>No tiene pruebas de manejo agendadas.</div>
                      ) : (
                        clientDemos.map((d) => (
                          <div key={d.id} style={{ fontSize: '11px', color: '#6e6764', borderLeft: '2px solid #0284c7', paddingLeft: '8px', marginBottom: 6 }}>
                            <div style={{ fontWeight: 700, color: '#251f1d' }}>
                              {d.vehiculo?.marca?.nombre} {d.vehiculo?.nombre} {d.vehiculo?.anio}
                            </div>
                            <div>{formatDate(d.fecha, 'long')} · Asesor: {d.usuario?.nombre}</div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Solicitudes de crédito — tipo SOLICITUD exclusivamente; un
                        negocio que ya se volvió apartado o venta se cuenta en
                        su propia sección, nunca en las dos a la vez. */}
                    {(() => {
                      const clientNegocios = allNegocios.filter((n) => n.clienteId === currentClient.id && n.tipo === 'SOLICITUD');
                      return (
                        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px', border: '1px solid #eae7e5' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', marginBottom: '8px' }}>
                            📄 Solicitudes de Crédito ({clientNegocios.length})
                          </div>
                          {clientNegocios.length === 0 ? (
                            <div style={{ fontSize: '11px', color: '#8e8784' }}>Sin solicitudes de financiamiento registradas.</div>
                          ) : (
                            clientNegocios.map((n) => (
                              <div key={n.id} style={{ fontSize: '11px', color: '#6e6764', borderLeft: '2px solid #ff8901', paddingLeft: '8px', marginBottom: 6 }}>
                                <div style={{ fontWeight: 700, color: '#251f1d' }}>
                                  {n.lineaNegocio?.nombre} · {n.etapa?.nombre}
                                  {n.folio && (
                                    <span style={{ marginLeft: 6, background: '#fff5eb', color: '#ff8901', padding: '1px 6px', borderRadius: 4, fontWeight: 800, fontSize: '10px' }}>
                                      Folio: {n.folio}
                                    </span>
                                  )}
                                </div>
                                <div>{formatDate(n.fecha, 'long')} · Asesor: {n.usuario?.nombre}</div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })()}

                    {/* Enganches Recibidos */}
                    {(() => {
                      const engaches = allNegocios.filter((n) => n.clienteId === currentClient.id && n.tipo === 'APARTADO');
                      return (
                        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px', border: '1px solid #eae7e5' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', marginBottom: '8px' }}>
                            💵 Enganches Recibidos en Caja ({engaches.length})
                          </div>
                          {engaches.length === 0 ? (
                            <div style={{ fontSize: '11px', color: '#8e8784' }}>No se han registrado pagos de enganche para este cliente.</div>
                          ) : (
                            engaches.map((n) => (
                              <div key={n.id} style={{ fontSize: '11px', color: '#6e6764', borderLeft: '2px solid #16a34a', paddingLeft: '8px', marginBottom: 6 }}>
                                <div style={{ fontWeight: 700, color: '#251f1d' }}>
                                  {formatCurrency(n.enganche)}
                                  {n.vehiculo && (
                                    <span style={{ fontWeight: 600, color: '#6e6764', marginLeft: 6 }}>
                                      · {n.vehiculo.marca?.nombre} {n.vehiculo.nombre} {n.vehiculo.anio}
                                    </span>
                                  )}
                                  {n.folio && (
                                    <span style={{ marginLeft: 6, background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: 4, fontWeight: 800, fontSize: '10px' }}>
                                      Recibo: {n.folio}
                                    </span>
                                  )}
                                </div>
                                <div>{formatDate(n.fecha, 'long')} · Asesor: {n.usuario?.nombre}</div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })()}

                    {/* Compras Realizadas */}
                    {(() => {
                      const compras = allNegocios.filter((n) => n.clienteId === currentClient.id && n.tipo === 'VENTA');
                      return (
                        <div style={{ background: '#ffffff', borderRadius: '10px', padding: '14px', border: '1px solid #eae7e5' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', marginBottom: '8px' }}>
                            🏷️ Compras Realizadas ({compras.length})
                          </div>
                          {compras.length === 0 ? (
                            <div style={{ fontSize: '11px', color: '#8e8784' }}>Aún no ha concretado compras en el outlet.</div>
                          ) : (
                            compras.map((n) => (
                              <div key={n.id} style={{ fontSize: '11px', color: '#6e6764', borderLeft: '2px solid #251f1d', paddingLeft: '8px', marginBottom: 6 }}>
                                <div style={{ fontWeight: 700, color: '#251f1d' }}>
                                  {n.vehiculo ? `${n.vehiculo.marca?.nombre || ''} ${n.vehiculo.nombre} ${n.vehiculo.anio}` : 'Unidad sin vincular'} · {formatCurrency(n.totalUnidad)}
                                  {n.folio && (
                                    <span style={{ marginLeft: 6, background: '#f4f2f0', color: '#251f1d', border: '1px solid #d5d0ce', padding: '1px 6px', borderRadius: 4, fontWeight: 800, fontSize: '10px' }}>
                                      Folio: {n.folio}
                                    </span>
                                  )}
                                </div>
                                <div>{formatDate(n.fecha, 'long')}</div>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0edeb' }}>
                  <button
                    onClick={() => setActive360Client(null)}
                    style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cerrar ficha
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de Programar Prueba de Manejo */}
      <TestDriveModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        defaultClientId={demoClientId}
      />

      {/* Modal de Solicitud / Venta (Negocio) */}
      <NegocioModal
        isOpen={Boolean(negocioModal)}
        onClose={() => setNegocioModal(null)}
        cliente={negocioModal?.cliente}
        modo={negocioModal?.modo}
        negocioExistente={negocioModal?.negocioExistente}
      />

      {/* Modal Elegante para Agregar Nota */}
      {notaModalClient && (
        <div
          className="modal-backdrop animate-fade-in"
          onClick={() => {
            if (!isSavingNota) setNotaModalClient(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px',
          }}
        >
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #f2efed',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#251f1d' }}>
                  ✏️ Agregar Nota al Expediente
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#8e8784' }}>
                  Cliente: <strong style={{ color: '#251f1d' }}>{notaModalClient.nombre}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isSavingNota) setNotaModalClient(null);
                }}
                disabled={isSavingNota}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarNota} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {notaModalClient.observaciones && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#8e8784', display: 'block', marginBottom: '5px' }}>
                    Historial de notas previas:
                  </label>
                  <div
                    style={{
                      maxHeight: '110px',
                      overflowY: 'auto',
                      padding: '10px 12px',
                      backgroundColor: '#faf9f8',
                      borderRadius: '8px',
                      border: '1px solid #f0edeb',
                      fontSize: '11px',
                      color: '#6e6764',
                      lineHeight: 1.45,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {notaModalClient.observaciones}
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '6px' }}>
                  Nueva nota de seguimiento <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  autoFocus
                  rows={4}
                  placeholder="Ej. Se le dio seguimiento sobre la aprobación de crédito. Comentó que pasará mañana por la tarde..."
                  value={notaTexto}
                  onChange={(e) => setNotaTexto(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d5d0ce',
                    fontSize: '13px',
                    fontFamily: "'Montserrat', sans-serif",
                    color: '#251f1d',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid #f2efed' }}>
                <button
                  type="button"
                  onClick={() => setNotaModalClient(null)}
                  disabled={isSavingNota}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #d5d0ce',
                    backgroundColor: '#ffffff',
                    color: '#251f1d',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingNota}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#ff8901',
                    color: '#251f1d',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: isSavingNota ? 'not-allowed' : 'pointer',
                    opacity: isSavingNota ? 0.7 : 1,
                  }}
                >
                  {isSavingNota ? 'Guardando...' : 'Guardar Nota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
