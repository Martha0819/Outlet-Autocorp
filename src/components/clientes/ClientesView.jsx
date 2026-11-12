'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  formatCurrency,
  formatPhone,
  formatDate,
  getTodayISO
} from '@/lib/utils';
import {
  SearchIcon,
  PlusIcon,
  CarIcon,
  TestDriveIcon,
  FileTextIcon,
  DollarIcon,
  CloseIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  UsersIcon,
  TagIcon
} from '@/components/ui/Icons';

export function ClientesView() {
  const {
    data,
    addClient,
    updateClient,
    deleteClient,
    addClientVisit,
    linkVehicleToClient,
    addTestDrive,
    addRequest,
    sellVehicle,
    notify
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Modales
  const [activeClientModal, setActiveClientModal] = useState(null); // { isEdit: boolean, client: object }
  const [active360Client, setActive360Client] = useState(null);
  const [activeSubModal, setActiveSubModal] = useState(null); // 'note' | 'link_vehicle' | 'request' | 'sale' | null

  // Estados de submodales
  const [noteText, setNoteText] = useState('');
  const [selectedVehicleToLink, setSelectedVehicleToLink] = useState('');
  const [solicitudForm, setSolicitudForm] = useState({
    vehicleId: '',
    advisor: 'Carlos Morales',
    status: 'Pendiente',
    type: 'Financiamiento Banorte',
    amount: '345000'
  });
  const [ventaForm, setVentaForm] = useState({
    vehicleId: '',
    finalAmount: '345000',
    vin: '3N1AB8CV4PY129845',
    folio: 'VTA-2026-08',
    date: '2026-11-11',
    advisor: 'Carlos Morales',
    paymentType: 'Contado'
  });

  // Formulario de Cliente (Alta/Edición)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    hasBrandPreference: 'no',
    preferredBrand: 'Nissan',
    comments: ''
  });

  const allClients = data?.clients || [];
  const allVehicles = data?.vehicles || [];
  const allTestDrives = data?.testDrives || [];
  const allRequests = data?.requests || [];
  const allDownPayments = data?.downPayments || [];
  const allSales = data?.sales || [];

  // Filtrado
  const filteredClients = useMemo(() => {
    return allClients.filter((c) => {
      if (selectedBrand !== 'all') {
        if (selectedBrand === 'sin_preferencia') {
          if (c.hasBrandPreference !== 'no' && c.preferredBrand) return false;
        } else {
          if ((c.preferredBrand || '').toLowerCase() !== selectedBrand.toLowerCase()) return false;
        }
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // default: recent
      return new Date(b.createdAt || '2026-11-11') - new Date(a.createdAt || '2026-11-11');
    });
  }, [allClients, selectedBrand, search, sortBy]);

  // Handlers
  const openCreateModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      hasBrandPreference: 'no',
      preferredBrand: 'Nissan',
      comments: ''
    });
    setActiveClientModal({ isEdit: false });
  };

  const openEditModal = (client) => {
    setFormData({
      name: client.name || '',
      phone: client.phone || '',
      email: client.email || '',
      hasBrandPreference: client.hasBrandPreference || 'no',
      preferredBrand: client.preferredBrand || 'Nissan',
      comments: client.comments || ''
    });
    setActiveClientModal({ isEdit: true, client });
  };

  const handleSaveClient = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('El nombre del cliente es obligatorio.');
      return;
    }
    if (!formData.phone.trim()) {
      alert('El celular es obligatorio.');
      return;
    }

    if (activeClientModal?.isEdit && activeClientModal?.client) {
      if (updateClient) {
        updateClient(activeClientModal.client.id, formData);
      }
    } else {
      addClient({
        ...formData,
        createdAt: new Date().toISOString()
      });
    }
    setActiveClientModal(null);
  };

  const handleDeleteClient = (client) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${client.name}?`)) {
      if (deleteClient) {
        deleteClient(client.id);
      }
    }
  };

  const getInitial = (name) => (name ? name.trim()[0].toUpperCase() : 'M');

  return (
    <div className="view-content active" id="view-clientes" style={{ paddingBottom: 60 }}>
      {/* =========================================================================
          1. BARRA DE HERRAMIENTAS Y BÚSQUEDA (RÉPLICA EXACTA DE IMAGEN 4)
          ========================================================================= */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px', borderRadius: '12px', border: '1px solid #eae7e5', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          {/* Buscador amplio */}
          <div style={{ position: 'relative', flex: 1, minWidth: '320px' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6e6764', display: 'flex' }}>
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, celular o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                borderRadius: '30px',
                border: '1px solid #d5d0ce',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                color: '#251f1d',
                outline: 'none'
              }}
            />
          </div>

          {/* Filtro Marca de Interés */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6e6764' }}>Marca de interés:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #d5d0ce',
                fontSize: '12px',
                fontWeight: 600,
                background: '#ffffff',
                color: '#251f1d',
                cursor: 'pointer'
              }}
            >
              <option value="all">Todas las marcas</option>
              <option value="Nissan">Nissan</option>
              <option value="Mazda">Mazda</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="Toyota">Toyota</option>
              <option value="Hyundai">Hyundai</option>
              <option value="sin_preferencia">Sin preferencia</option>
            </select>
          </div>

          {/* Ordenar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6e6764' }}>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #d5d0ce',
                fontSize: '12px',
                fontWeight: 600,
                background: '#ffffff',
                color: '#251f1d',
                cursor: 'pointer'
              }}
            >
              <option value="recent">Más recientes primero</option>
              <option value="name">Nombre (A - Z)</option>
            </select>
          </div>

          {/* Botón Agregar Cliente */}
          <button
            onClick={openCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ff8901',
              color: '#251f1d',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255,137,1,0.25)'
            }}
          >
            <PlusIcon size={14} /> <span>Agregar cliente</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. TABLA PRINCIPAL DE CLIENTES (RÉPLICA EXACTA DE IMAGEN 4)
          ========================================================================= */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#faf9f8', borderBottom: '1px solid #eae7e5', fontSize: '11px', fontWeight: 800, color: '#251f1d', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left' }}>NOMBRE DE CLIENTE</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>CELULAR</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>CORREO</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>¿VISITA UNA MARCA EN ESPECÍFICO?</th>
                <th style={{ padding: '16px 20px', textAlign: 'left' }}>COMENTARIOS</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const hasPref = client.hasBrandPreference === 'si' && client.preferredBrand;

                return (
                  <tr
                    key={client.id}
                    style={{ borderBottom: '1px solid #f0eceb', transition: 'background-color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf9f8')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    {/* Nombre y Avatar */}
                    <td style={{ padding: '16px 24px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: '#251f1d',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {getInitial(client.name)}
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#251f1d', display: 'block' }}>{client.name}</strong>
                          <div style={{ fontSize: '11px', color: '#8e8784', marginTop: '3px' }}>
                            Alta: {formatDate(client.createdAt || '2026-11-11', 'short')} · {(client.visits || []).length || 1} visitas
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Celular (texto normal oscuro tal como index.html) */}
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <span style={{ color: '#251f1d', fontWeight: 700, fontSize: '13px' }}>
                        {formatPhone(client.phone)}
                      </span>
                    </td>

                    {/* Correo */}
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <span style={{ color: '#6e6764', fontWeight: 500, fontSize: '13px' }}>
                        {client.email || '—'}
                      </span>
                    </td>

                    {/* Marca de Interés (Badges exactamente como la imagen) */}
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: hasPref ? '#fff5eb' : '#f3f4f6',
                          color: hasPref ? '#ff8901' : '#6b7280',
                          border: hasPref ? '1px solid #ffd8b3' : 'none'
                        }}
                      >
                        {hasPref ? `Sí — ${client.preferredBrand}` : 'No — Sin preferencia'}
                      </span>
                    </td>

                    {/* Comentarios */}
                    <td style={{ padding: '16px 20px', verticalAlign: 'middle', maxWidth: '280px' }}>
                      <span style={{ fontSize: '12px', color: '#6e6764', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                        {client.comments || 'Sin comentarios adicionales.'}
                      </span>
                    </td>

                    {/* Acciones: [ 👁 ] [ ✏ ] [ 🗑 ] con iconos SVG reales */}
                    <td style={{ padding: '16px 24px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => setActive360Client(client)}
                          title="Consultar Ficha 360"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1px solid #d5d0ce',
                            background: '#ffffff',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#251f1d'
                          }}
                        >
                          <EyeIcon size={14} />
                        </button>
                        <button
                          onClick={() => openEditModal(client)}
                          title="Editar cliente"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1px solid #d5d0ce',
                            background: '#ffffff',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#251f1d'
                          }}
                        >
                          <EditIcon size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client)}
                          title="Eliminar cliente"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            border: '1px solid #d5d0ce',
                            background: '#ffffff',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444'
                          }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginador al pie de tabla (como en Imagen 4) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderTop: '1px solid #eae7e5', fontSize: '12px', color: '#8e8784' }}>
          <div>Mostrando 1 - {filteredClients.length} de {filteredClients.length} clientes</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ cursor: 'pointer' }}>&lt; Anterior</span>
            <span style={{ color: '#251f1d', fontWeight: 600 }}>Página 1 de 1</span>
            <span style={{ cursor: 'pointer' }}>Siguiente &gt;</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MODAL: FICHA 360 DEL CLIENTE (RÉPLICA EXACTA DE IMAGEN 1)
          ========================================================================= */}
      {active360Client && (() => {
        const currentClient = allClients.find((c) => c.id === active360Client.id) || active360Client;
        const availableVehicles = allVehicles.filter((v) => v.status === 'disponible');

        // Vehículos de interés
        const interestedVehs = allVehicles.filter((v) =>
          (currentClient.interestedVehicleIds || []).includes(v.id)
        );

        // Pruebas de manejo
        const clientTestDrives = allTestDrives.filter(
          (td) => td.clientId === currentClient.id || (td.clientName && td.clientName.toLowerCase() === currentClient.name.toLowerCase())
        );

        // Solicitudes
        const clientRequests = allRequests.filter(
          (req) => req.clientId === currentClient.id || (req.clientName && req.clientName.toLowerCase() === currentClient.name.toLowerCase())
        );

        // Enganches
        const clientDownPayments = allDownPayments.filter((dp) => dp.clientId === currentClient.id);

        // Ventas / Compras Realizadas
        const clientSales = allSales.filter(
          (s) => s.clientId === currentClient.id || (s.clientName && s.clientName.toLowerCase() === currentClient.name.toLowerCase())
        );

        // Historial de visitas
        const clientVisits = currentClient.visits && currentClient.visits.length > 0
          ? currentClient.visits
          : [{ date: '2026-11-11', notes: 'Registro de visita nueva en recepción con Sofía Reyes.' }];

        return (
          <div className="modal-backdrop" onClick={() => setActive360Client(null)}>
            <div
              className="modal-box modal-xl animate-scale-up"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                maxWidth: '820px',
                width: '100%',
                boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
                border: '1px solid #eae7e5',
                maxHeight: '92vh',
                overflowY: 'auto'
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
                      justifyContent: 'center'
                    }}
                  >
                    {getInitial(currentClient.name)}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#251f1d' }}>{currentClient.name}</h3>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#8e8784' }}>
                      Cliente registrado el {formatDate(currentClient.createdAt || '2026-11-11', 'long')}
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
                {/* Botones de acción rápida de la Ficha (RÉPLICA EXACTA DE IMAGEN 2 / 6) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <button
                    onClick={() => {
                      addClientVisit(currentClient.id, 'Registro de visita nueva en recepción con Sofía Reyes.');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#ff8901',
                      color: '#251f1d',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    <PlusIcon size={13} />
                    <span>Registrar visita hoy</span>
                  </button>

                  <button
                    onClick={() => {
                      setNoteText('');
                      setActiveSubModal('note');
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
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <EditIcon size={13} />
                    <span>Agregar nota</span>
                  </button>

                  <button
                    onClick={() => {
                      const firstAvail = availableVehicles[0]?.id || allVehicles[0]?.id || '';
                      setSelectedVehicleToLink(firstAvail);
                      setActiveSubModal('link_vehicle');
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
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <CarIcon size={13} />
                    <span>Vincular vehículo</span>
                  </button>

                  <button
                    onClick={() => {
                      const veh = interestedVehs[0] || availableVehicles[0] || allVehicles[0];
                      addTestDrive({
                        clientId: currentClient.id,
                        clientName: currentClient.name,
                        vehicleId: veh?.id || 'veh-1',
                        vehicleName: veh ? `${veh.brand} ${veh.model} ${veh.year}` : 'KIA Seltos 2021',
                        date: '2026-11-12',
                        time: '11:00 - 12:00',
                        advisor: 'Carlos Morales',
                        status: 'Programada'
                      });
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
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <TestDriveIcon size={13} />
                    <span>Programar prueba</span>
                  </button>

                  <button
                    onClick={() => {
                      const veh = interestedVehs[0] || availableVehicles[0] || allVehicles[0];
                      setSolicitudForm({
                        vehicleId: veh?.id || allVehicles[0]?.id || '',
                        advisor: 'Carlos Morales',
                        status: 'Pendiente',
                        type: 'Financiamiento Banorte',
                        amount: veh?.price || 345000
                      });
                      setActiveSubModal('request');
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
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <FileTextIcon size={13} />
                    <span>Crear solicitud</span>
                  </button>

                  <button
                    onClick={() => {
                      const veh = interestedVehs[0] || availableVehicles[0] || allVehicles[0];
                      setVentaForm({
                        vehicleId: veh?.id || allVehicles[0]?.id || '',
                        finalAmount: veh?.price || 345000,
                        vin: veh?.vin || '3N1AB8CV4PY129845',
                        folio: `VTA-2026-0${(allSales.length + 1).toString().padStart(2, '0')}`,
                        date: '2026-11-11',
                        advisor: 'Carlos Morales',
                        paymentType: 'Contado'
                      });
                      setActiveSubModal('sale');
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
                      cursor: 'pointer'
                    }}
                  >
                    <DollarIcon size={13} />
                    <span>Registrar venta</span>
                  </button>
                </div>

                {/* Grid 2 Columnas de la Ficha */}
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
                  {/* Columna Izquierda: Información de Contacto */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#251f1d', margin: '0 0 12px 0' }}>Información de Contacto</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '20px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#8e8784', display: 'block' }}>Celular:</span>
                        <strong style={{ color: '#251f1d' }}>{formatPhone(currentClient.phone)}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#8e8784', display: 'block' }}>Correo:</span>
                        <span style={{ color: '#251f1d' }}>{currentClient.email || 'No registrado'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#8e8784', display: 'block' }}>Marca de interés:</span>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: currentClient.hasBrandPreference === 'si' ? '#fff5eb' : '#f3f4f6',
                            color: currentClient.hasBrandPreference === 'si' ? '#ff8901' : '#6b7280',
                            marginTop: '3px'
                          }}
                        >
                          {currentClient.hasBrandPreference === 'si' ? currentClient.preferredBrand : 'Sin preferencia'}
                        </span>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#251f1d', margin: '0 0 8px 0' }}>Comentarios y Observaciones</h4>
                    <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#6e6764', margin: '0 0 20px 0', background: '#f8f7f6', padding: '12px', borderRadius: '8px', lineHeight: 1.4 }}>
                      "{currentClient.comments || 'Primera compra de auto seminuevo. Requiere asesoría financiera detallada.'}"
                    </p>

                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#251f1d', margin: '0 0 8px 0' }}>Vehículos de Interés</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {interestedVehs.length > 0 ? (
                        interestedVehs.map((v) => (
                          <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f7f6', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
                            <span style={{ fontWeight: 600, color: '#251f1d' }}>{v.brand} {v.model} {v.year} ({formatCurrency(v.price)} MXN)</span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: v.status === 'vendido' ? '#dc2626' : v.status === 'apartado' ? '#ea580c' : '#16a34a',
                              background: v.status === 'vendido' ? '#fee2e2' : v.status === 'apartado' ? '#ffedd5' : '#dcfce7',
                              padding: '2px 8px',
                              borderRadius: '9999px'
                            }}>
                              {v.status || 'disponible'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f7f6', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
                            <span>KIA Seltos 2021 ($345,000 MXN)</span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '9999px' }}>disponible</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f7f6', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
                            <span>Seat Ibiza 2023 ($338,000 MXN)</span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '9999px' }}>disponible</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Columna Derecha: Tarjetas de Historial bien enmarcadas y divididas */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Historial de Visitas */}
                    <div style={{ border: '1px solid #eae7e5', borderRadius: '12px', padding: '16px 20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ color: '#251f1d', display: 'flex' }}><UsersIcon size={16} /></span>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', margin: 0 }}>
                          Historial de Visitas ({clientVisits.length})
                        </h4>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {clientVisits.map((v, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingLeft: '4px' }}>
                            <span style={{ color: '#ff8901', display: 'flex', marginTop: '2px' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff8901" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                            </span>
                            <div>
                              <strong style={{ fontSize: '12px', color: '#251f1d' }}>{formatDate(v.date, 'long')}</strong>
                              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#6e6764', lineHeight: 1.4 }}>
                                {v.notes || 'Registro de visita en el showroom.'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pruebas de Manejo */}
                    <div style={{ border: '1px solid #eae7e5', borderRadius: '12px', padding: '16px 20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: clientTestDrives.length > 0 ? '10px' : '4px' }}>
                        <span style={{ color: '#251f1d', display: 'flex' }}><TestDriveIcon size={16} /></span>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', margin: 0 }}>
                          Pruebas de Manejo ({clientTestDrives.length})
                        </h4>
                      </div>
                      {clientTestDrives.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {clientTestDrives.map((td) => (
                            <div key={td.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8f7f6', borderRadius: '8px', fontSize: '12px' }}>
                              <div>
                                <strong style={{ color: '#251f1d' }}>{td.vehicleName || 'Vehículo de prueba'}</strong>
                                <div style={{ fontSize: '11px', color: '#8e8784' }}>{formatDate(td.date, 'long')} — {td.time || '11:00'} | Asesor: {td.advisor || 'Carlos Morales'}</div>
                              </div>
                              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: td.status === 'Realizada' ? '#dcfce7' : '#fff5eb', color: td.status === 'Realizada' ? '#16a34a' : '#ff8901' }}>
                                {td.status || 'Programada'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#8e8784', display: 'block', paddingLeft: '24px' }}>
                          No tiene pruebas de manejo agendadas.
                        </span>
                      )}
                    </div>

                    {/* Solicitudes de Crédito / Compra */}
                    <div style={{ border: '1px solid #eae7e5', borderRadius: '12px', padding: '16px 20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: clientRequests.length > 0 ? '10px' : '4px' }}>
                        <span style={{ color: '#251f1d', display: 'flex' }}><FileTextIcon size={16} /></span>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', margin: 0 }}>
                          Solicitudes de Crédito / Compra ({clientRequests.length})
                        </h4>
                      </div>
                      {clientRequests.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {clientRequests.map((req) => {
                            const veh = allVehicles.find((v) => v.id === req.vehicleId);
                            const vehName = veh ? `${veh.brand} ${veh.model}` : (req.vehicleName || 'Unidad cotizada');
                            return (
                              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8f7f6', borderRadius: '8px', fontSize: '12px' }}>
                                <div>
                                  <strong style={{ color: '#251f1d' }}>{vehName} — {req.type || 'Financiamiento'}</strong>
                                  <div style={{ fontSize: '11px', color: '#8e8784' }}>Asesor: {req.advisor || 'Carlos Morales'} | Monto: {formatCurrency(req.amount || 345000)} MXN</div>
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: req.status === 'Aprobada' ? '#dcfce7' : '#fff5eb', color: req.status === 'Aprobada' ? '#16a34a' : '#ff8901' }}>
                                  {req.status || 'Pendiente'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#8e8784', display: 'block', paddingLeft: '24px' }}>
                          Sin solicitudes de financiamiento registradas.
                        </span>
                      )}
                    </div>

                    {/* Enganches Recibidos en Caja */}
                    <div style={{ border: '1px solid #eae7e5', borderRadius: '12px', padding: '16px 20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: clientDownPayments.length > 0 ? '10px' : '4px' }}>
                        <span style={{ color: '#251f1d', display: 'flex' }}><DollarIcon size={16} /></span>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', margin: 0 }}>
                          Enganches Recibidos en Caja ({clientDownPayments.length})
                        </h4>
                      </div>
                      {clientDownPayments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {clientDownPayments.map((dp) => (
                            <div key={dp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8f7f6', borderRadius: '8px', fontSize: '12px' }}>
                              <div>
                                <strong style={{ color: '#16a34a' }}>{formatCurrency(dp.amount)} MXN</strong>
                                <div style={{ fontSize: '11px', color: '#8e8784' }}>{formatDate(dp.date, 'long')} — {dp.method || 'SPEI'}</div>
                              </div>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                                Recibido
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#8e8784', display: 'block', paddingLeft: '24px' }}>
                          No se han registrado pagos de enganche para este cliente.
                        </span>
                      )}
                    </div>

                    {/* Compras Realizadas */}
                    <div style={{ border: '1px solid #eae7e5', borderRadius: '12px', padding: '16px 20px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: clientSales.length > 0 ? '10px' : '4px' }}>
                        <span style={{ color: '#251f1d', display: 'flex' }}><TagIcon size={16} /></span>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#251f1d', margin: 0 }}>
                          Compras Realizadas ({clientSales.length})
                        </h4>
                      </div>
                      {clientSales.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {clientSales.map((s) => {
                            const veh = allVehicles.find((v) => v.id === s.vehicleId);
                            const vehName = veh ? `${veh.brand} ${veh.model} ${veh.year}` : 'Vehículo adquirido';
                            return (
                              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8f7f6', borderRadius: '8px', fontSize: '12px' }}>
                                <div>
                                  <strong style={{ color: '#251f1d' }}>{vehName}</strong>
                                  <div style={{ fontSize: '11px', color: '#8e8784' }}>
                                    {formatDate(s.date, 'long')} | Venta: {formatCurrency(s.finalAmount)} MXN | Asesor: {s.advisor || 'Carlos Morales'}
                                  </div>
                                </div>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffffff', background: '#251f1d', padding: '2px 8px', borderRadius: '12px' }}>
                                  Vendida
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#8e8784', display: 'block', paddingLeft: '24px' }}>
                          Aún no ha concretado compras en el outlet.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botón Cerrar al pie */}
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f0edeb' }}>
                  <button
                    onClick={() => setActive360Client(null)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: '1px solid #d5d0ce',
                      background: '#ffffff',
                      color: '#251f1d',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Cerrar ficha
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          SUBMODAL 1: AGREGAR NOTA AL EXPEDIENTE
          ========================================================================= */}
      {activeSubModal === 'note' && active360Client && (
        <div className="modal-backdrop" style={{ zIndex: 100000 }} onClick={() => setActiveSubModal(null)}>
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid #eae7e5',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f0edeb', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#251f1d' }}>
                Agregar Nota al Expediente
              </h3>
              <button onClick={() => setActiveSubModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex' }}>
                <CloseIcon size={20} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#6e6764', margin: '0 0 14px 0' }}>
              Escribe observaciones relevantes para el seguimiento de <strong>{active360Client.name}</strong>:
            </p>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ej. El cliente está interesado en financiamiento a 36 meses, agendar seguimiento el viernes..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d5d0ce',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                color: '#251f1d',
                resize: 'vertical',
                marginBottom: '20px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', color: '#251f1d', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!noteText.trim()) return;
                  const updatedComments = active360Client.comments
                    ? `${active360Client.comments} | ${noteText.trim()}`
                    : noteText.trim();
                  updateClient(active360Client.id, { comments: updatedComments });
                  addClientVisit(active360Client.id, `Nota: ${noteText.trim()}`);
                  setActiveSubModal(null);
                }}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#ff8901', color: '#251f1d', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
              >
                Guardar Nota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBMODAL 2: VINCULAR VEHÍCULO DE INTERÉS (RÉPLICA EXACTA DE IMAGEN 2)
          ========================================================================= */}
      {activeSubModal === 'link_vehicle' && active360Client && (
        <div className="modal-backdrop" style={{ zIndex: 100000 }} onClick={() => setActiveSubModal(null)}>
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid #eae7e5',
              overflow: 'hidden'
            }}
          >
            {/* Header con título y 'X' */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0edeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#251f1d' }}>
                Vincular Vehículo de Interés
              </h3>
              <button onClick={() => setActiveSubModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex' }}>
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '22px 24px' }}>
              <p style={{ fontSize: '13px', color: '#554f4d', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Selecciona un vehículo del inventario disponible para vincularlo a <strong>{active360Client.name}</strong>:
              </p>

              <select
                value={selectedVehicleToLink}
                onChange={(e) => setSelectedVehicleToLink(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d5d0ce',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  color: '#251f1d',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {allVehicles
                  .filter((v) => v.status === 'disponible')
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} {v.year} — {formatCurrency(v.price)} MXN
                    </option>
                  ))}
                {allVehicles.filter((v) => v.status === 'disponible').length === 0 &&
                  allVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} {v.year} — {formatCurrency(v.price)} MXN
                    </option>
                  ))}
              </select>
            </div>

            {/* Footer con [ Cancelar ] y [ Vincular ] naranja */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0edeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                style={{
                  padding: '9px 22px',
                  borderRadius: '8px',
                  border: '1px solid #d5d0ce',
                  background: '#ffffff',
                  color: '#251f1d',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedVehicleToLink) {
                    linkVehicleToClient(active360Client.id, selectedVehicleToLink);
                  }
                  setActiveSubModal(null);
                }}
                style={{
                  padding: '9px 26px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ff7a00',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Vincular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBMODAL 3: CREAR SOLICITUD DE CRÉDITO
          ========================================================================= */}
      {activeSubModal === 'request' && active360Client && (
        <div className="modal-backdrop" style={{ zIndex: 100000 }} onClick={() => setActiveSubModal(null)}>
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid #eae7e5',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f0edeb', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#251f1d' }}>
                Nueva Solicitud de Crédito / Compra
              </h3>
              <button onClick={() => setActiveSubModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex' }}>
                <CloseIcon size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addRequest({
                  clientId: active360Client.id,
                  clientName: active360Client.name,
                  vehicleId: solicitudForm.vehicleId,
                  advisor: solicitudForm.advisor,
                  status: solicitudForm.status,
                  type: solicitudForm.type,
                  amount: Number(solicitudForm.amount) || 345000,
                  date: '2026-11-11'
                });
                setActiveSubModal(null);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                  Cliente
                </label>
                <input
                  type="text"
                  disabled
                  value={`${active360Client.name} (${active360Client.phone})`}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8e6e5', background: '#f8f7f6', fontSize: '13px', color: '#6e6764' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                  Unidad / Vehículo *
                </label>
                <select
                  value={solicitudForm.vehicleId}
                  onChange={(e) => {
                    const veh = allVehicles.find((v) => v.id === e.target.value);
                    setSolicitudForm({
                      ...solicitudForm,
                      vehicleId: e.target.value,
                      amount: veh ? veh.price : solicitudForm.amount
                    });
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', fontSize: '13px', color: '#251f1d' }}
                >
                  {allVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} {v.year} — {formatCurrency(v.price)} MXN
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                    Asesor Responsable *
                  </label>
                  <select
                    value={solicitudForm.advisor}
                    onChange={(e) => setSolicitudForm({ ...solicitudForm, advisor: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', fontSize: '13px', color: '#251f1d' }}
                  >
                    <option value="Carlos Morales">Carlos Morales</option>
                    <option value="Alejandro Peña">Alejandro Peña</option>
                    <option value="Mariana Garza">Mariana Garza</option>
                    <option value="Sofía Reyes">Sofía Reyes</option>
                    <option value="Roberto Méndez">Roberto Méndez</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                    Estatus *
                  </label>
                  <select
                    value={solicitudForm.status}
                    onChange={(e) => setSolicitudForm({ ...solicitudForm, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', fontSize: '13px', color: '#251f1d' }}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="En revisión">En revisión</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                  Tipo de Solicitud *
                </label>
                <select
                  value={solicitudForm.type}
                  onChange={(e) => setSolicitudForm({ ...solicitudForm, type: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', fontSize: '13px', color: '#251f1d' }}
                >
                  <option value="Financiamiento Banorte">Financiamiento Banorte</option>
                  <option value="Financiamiento BBVA">Financiamiento BBVA</option>
                  <option value="Financiamiento Santander">Financiamiento Santander</option>
                  <option value="Contado">Contado</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActiveSubModal(null)}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', color: '#251f1d', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 22px', borderRadius: '8px', border: 'none', background: '#ff8901', color: '#251f1d', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
                >
                  Crear Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBMODAL 4: REGISTRAR VENTA
          ========================================================================= */}
      {activeSubModal === 'sale' && active360Client && (
        <div className="modal-backdrop" style={{ zIndex: 100000 }} onClick={() => setActiveSubModal(null)}>
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid #eae7e5',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f0edeb', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#251f1d' }}>
                Registrar Venta Formal
              </h3>
              <button onClick={() => setActiveSubModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex' }}>
                <CloseIcon size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sellVehicle(ventaForm.vehicleId, Number(ventaForm.finalAmount) || 345000, active360Client.id);
                setActiveSubModal(null);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  disabled
                  value={active360Client.name}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e8e6e5', background: '#f8f7f6', fontSize: '13px', color: '#251f1d', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                  Vehículo a Vender *
                </label>
                <select
                  value={ventaForm.vehicleId}
                  onChange={(e) => {
                    const veh = allVehicles.find((v) => v.id === e.target.value);
                    setVentaForm({
                      ...ventaForm,
                      vehicleId: e.target.value,
                      finalAmount: veh ? veh.price : ventaForm.finalAmount,
                      vin: veh?.vin || ventaForm.vin
                    });
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', fontSize: '13px', color: '#251f1d' }}
                >
                  {allVehicles
                    .filter((v) => v.status !== 'vendido')
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} {v.year} — {formatCurrency(v.price)} MXN
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                    Precio de Venta (MXN) *
                  </label>
                  <input
                    type="number"
                    required
                    value={ventaForm.finalAmount}
                    onChange={(e) => setVentaForm({ ...ventaForm, finalAmount: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', fontSize: '13px', color: '#251f1d' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                    Folio de Venta *
                  </label>
                  <input
                    type="text"
                    required
                    value={ventaForm.folio}
                    onChange={(e) => setVentaForm({ ...ventaForm, folio: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', fontSize: '13px', color: '#251f1d' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                    VIN / Número de Serie *
                  </label>
                  <input
                    type="text"
                    required
                    value={ventaForm.vin}
                    onChange={(e) => setVentaForm({ ...ventaForm, vin: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', fontSize: '13px', color: '#251f1d' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                    Fecha de Venta *
                  </label>
                  <input
                    type="date"
                    required
                    value={ventaForm.date}
                    onChange={(e) => setVentaForm({ ...ventaForm, date: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', fontSize: '13px', color: '#251f1d' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: '4px' }}>
                  Asesor Comercial *
                </label>
                <select
                  value={ventaForm.advisor}
                  onChange={(e) => setVentaForm({ ...ventaForm, advisor: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', fontSize: '13px', color: '#251f1d' }}
                >
                  <option value="Carlos Morales">Carlos Morales</option>
                  <option value="Alejandro Peña">Alejandro Peña</option>
                  <option value="Mariana Garza">Mariana Garza</option>
                  <option value="Sofía Reyes">Sofía Reyes</option>
                  <option value="Roberto Méndez">Roberto Méndez</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActiveSubModal(null)}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #d5d0ce', background: '#ffffff', color: '#251f1d', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: '#ff8901', color: '#251f1d', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
                >
                  Confirmar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MODAL: EDITAR / REGISTRAR CLIENTE (RÉPLICA EXACTA DE IMAGEN 2)
          ========================================================================= */}
      {activeClientModal && (
        <div className="modal-backdrop" onClick={() => setActiveClientModal(null)}>
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid #eae7e5'
            }}
          >
            {/* Cabecera */}
            <div style={{ padding: '20px 28px', borderBottom: '1px solid #f0edeb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#251f1d' }}>
                {activeClientModal.isEdit ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button
                onClick={() => setActiveClientModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex' }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Nombre completo * */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rodrigo Morales Valenzuela"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                />
              </div>

              {/* Celular y Correo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                    Celular (10 dígitos) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 5541928374"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                  <span style={{ fontSize: '11px', color: '#8e8784', marginTop: '4px', display: 'block' }}>
                    Teléfono móvil a 10 dígitos sin espacios
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@correo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                  <span style={{ fontSize: '11px', color: '#8e8784', marginTop: '4px', display: 'block' }}>
                    Opcional para cotizaciones y solicitudes
                  </span>
                </div>
              </div>

              {/* ¿Visita una marca en específico? */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                  ¿Visita una marca en específico? *
                </label>
                <select
                  value={formData.hasBrandPreference === 'si' ? formData.preferredBrand : 'no'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'no') {
                      setFormData({ ...formData, hasBrandPreference: 'no', preferredBrand: '' });
                    } else {
                      setFormData({ ...formData, hasBrandPreference: 'si', preferredBrand: val });
                    }
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d' }}
                >
                  <option value="no">No — Sin preferencia</option>
                  <option value="Nissan">Sí — Nissan</option>
                  <option value="Mazda">Sí — Mazda</option>
                  <option value="Volkswagen">Sí — Volkswagen</option>
                  <option value="Toyota">Sí — Toyota</option>
                  <option value="Hyundai">Sí — Hyundai</option>
                  <option value="Ford">Sí — Ford</option>
                  <option value="Chevrolet">Sí — Chevrolet</option>
                </select>
              </div>

              {/* Comentarios u observaciones */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: '#251f1d' }}>
                  Comentarios u observaciones
                </label>
                <textarea
                  rows={3}
                  placeholder="Presupuesto aproximado, necesidades familiares, enganche disponible..."
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d5d0ce', fontSize: '13px', backgroundColor: '#ffffff', color: '#251f1d', resize: 'vertical' }}
                />
              </div>

              {/* Footer con Botones */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid #f0edeb' }}>
                <button
                  type="button"
                  onClick={() => setActiveClientModal(null)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: '1px solid #d5d0ce',
                    background: '#ffffff',
                    color: '#251f1d',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ff8901',
                    color: '#251f1d',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '13px',
                    boxShadow: '0 2px 8px rgba(255,137,1,0.3)'
                  }}
                >
                  {activeClientModal.isEdit ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
