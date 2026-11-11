'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  formatCurrency,
  formatPhone,
  formatDate,
  validatePhone,
  validateEmail
} from '@/lib/utils';
import { SearchIcon, PlusIcon } from '@/components/ui/Icons';

export function ClientesView() {
  const { data, activeDesign, addClient, addClientVisit, addTestDrive, addRequest, sellVehicle } = useStore();
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Formulario nuevo cliente
  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    hasBrandPreference: 'no',
    preferredBrand: '',
    comments: ''
  });
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const allClients = data?.clients || [];
  const vehicles = data?.vehicles || [];
  const downPayments = data?.downPayments || [];
  const sales = data?.sales || [];
  const testDrives = data?.testDrives || [];
  const requests = data?.requests || [];

  // Filtrado
  let filteredClients = allClients;
  if (selectedBrand !== 'all') {
    filteredClients = filteredClients.filter((c) =>
      selectedBrand === 'sin_preferencia'
        ? c.hasBrandPreference === 'no' || !c.preferredBrand
        : (c.preferredBrand || '').toLowerCase() === selectedBrand.toLowerCase()
    );
  }
  if (search) {
    const q = search.toLowerCase();
    filteredClients = filteredClients.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    );
  }

  const selectedClient =
    allClients.find((c) => c.id === selectedClientId) || filteredClients[0] || allClients[0] || null;

  // Detección de duplicados al capturar
  const handlePhoneChange = (val) => {
    setClientForm({ ...clientForm, phone: val });
    const match = allClients.find((c) => c.phone.replace(/\D/g, '') === val.replace(/\D/g, ''));
    if (match && val.length >= 7) {
      setDuplicateWarning(`Aviso: Posible cliente duplicado encontrado (${match.name} con cel ${match.phone}).`);
    } else {
      setDuplicateWarning('');
    }
  };

  const handleCreateClient = (e) => {
    e.preventDefault();
    if (!clientForm.name.trim()) {
      alert('El nombre del cliente es obligatorio.');
      return;
    }
    if (!validatePhone(clientForm.phone)) {
      alert('Ingresa un número celular válido a 10 dígitos.');
      return;
    }
    if (clientForm.email && !validateEmail(clientForm.email)) {
      alert('El formato de correo electrónico no es válido.');
      return;
    }

    addClient(clientForm);
    setShowAddModal(false);
    setClientForm({
      name: '',
      phone: '',
      email: '',
      hasBrandPreference: 'no',
      preferredBrand: '',
      comments: ''
    });
    setDuplicateWarning('');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addClientVisit(selectedClient.id, newNote);
    setNewNote('');
    setShowNoteModal(false);
  };

  // Datos específicos del cliente seleccionado
  const clientVisits = selectedClient?.visits || [];
  const clientTD = testDrives.filter((td) => td.clientId === selectedClient?.id);
  const clientReq = requests.filter((r) => r.clientId === selectedClient?.id);
  const clientDP = downPayments.filter((dp) => dp.clientId === selectedClient?.id);
  const clientSales = sales.filter((s) => s.clientId === selectedClient?.id);

  return (
    <div className="clientes-container">
      {/* Barra de Filtros y Buscador */}
      <div className="toolbar-dashboard">
        <div style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 440 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Buscar por nombre, celular o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: 9999,
                border: '1px solid var(--border-subtle, #d5d0ce)',
                fontSize: 13,
                background: 'var(--bg-card, #ffffff)',
                color: 'inherit'
              }}
            />
            <div style={{ position: 'absolute', left: 12, top: 10, opacity: 0.5 }}>
              <SearchIcon size={16} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 9999,
              border: '1px solid var(--border-subtle, #d5d0ce)',
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--bg-card, #ffffff)',
              color: 'inherit'
            }}
          >
            <option value="all">Todas las marcas ({allClients.length})</option>
            <option value="Nissan">Nissan</option>
            <option value="Mazda">Mazda</option>
            <option value="Volkswagen">Volkswagen</option>
            <option value="Toyota">Toyota</option>
            <option value="BMW">BMW</option>
            <option value="sin_preferencia">Sin preferencia</option>
          </select>

          <button onClick={() => setShowAddModal(true)} className="btn-primary-action">
            <PlusIcon size={15} /> <span>Agregar cliente</span>
          </button>
        </div>
      </div>

      {/* --- ESTRUCTURA MASTER-DETAIL SPLIT CRM --- */}
      <div className="exec-split-layout">
        {/* Columna Izquierda: Master List */}
        <div className="exec-master-pane">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border-subtle, #eae7e5)' }}>
            <strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Directorio ({filteredClients.length})
            </strong>
            <span className="badge-pill badge-orange font-bold">Activos</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {filteredClients.map((c) => {
              const isSelected = selectedClient && selectedClient.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedClientId(c.id)}
                  className={`exec-client-row ${isSelected ? 'is-selected' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: '#ff8901',
                        color: '#251f1d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14
                      }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ fontSize: 14, display: 'block', color: 'inherit' }}>{c.name}</strong>
                      <span style={{ fontSize: 11, opacity: 0.7 }}>{formatPhone(c.phone)}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge-pill badge-dark" style={{ fontSize: 10 }}>
                      {c.hasBrandPreference === 'si' && c.preferredBrand ? c.preferredBrand : 'Sin pref.'}
                    </span>
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                      {(c.visits || []).length} visitas
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Expediente Ficha 360 en Vivo */}
        <div className="exec-detail-pane">
          {selectedClient ? (
            <div>
              {/* Header de la Ficha */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle, #eae7e5)', paddingBottom: 16 }}>
                <div>
                  <span className="badge-pill badge-orange font-bold" style={{ marginBottom: 6 }}>
                    EXPEDIENTE INTEGRAL 360°
                  </span>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: 'inherit', marginTop: 4 }}>{selectedClient.name}</h2>
                  <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>
                    Alta: {formatDate(selectedClient.dateRegistered, 'long')} · ID: {selectedClient.id}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setShowNoteModal(true)} className="btn-secondary-action" style={{ fontSize: 12 }}>
                    + Registrar Visita
                  </button>
                </div>
              </div>

              {/* Matriz de Contacto y Preferencias */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '18px 0', padding: 14, borderRadius: 12, background: 'rgba(0,0,0,0.03)' }}>
                <div>
                  <span style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase' }}>Celular</span>
                  <strong style={{ display: 'block', fontSize: 14, marginTop: 2 }}>{formatPhone(selectedClient.phone)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase' }}>Correo</span>
                  <strong style={{ display: 'block', fontSize: 13, marginTop: 2 }}>{selectedClient.email || 'No registrado'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase' }}>Marca de Interés</span>
                  <strong style={{ display: 'block', fontSize: 14, marginTop: 2, color: '#ff8901' }}>
                    {selectedClient.hasBrandPreference === 'si' ? selectedClient.preferredBrand : 'Sin preferencia'}
                  </strong>
                </div>
              </div>

              {/* Comentarios del Cliente */}
              <div style={{ marginBottom: 20 }}>
                <strong style={{ fontSize: 12, textTransform: 'uppercase', opacity: 0.7, display: 'block', marginBottom: 4 }}>
                  Comentarios y Observaciones
                </strong>
                <p style={{ fontStyle: 'italic', fontSize: 13, padding: '10px 14px', borderRadius: 8, background: 'rgba(255, 137, 1, 0.08)', borderLeft: '3px solid #ff8901' }}>
                  "{selectedClient.comments || 'Sin comentarios registrados.'}"
                </p>
              </div>

              {/* Historial de Visitas */}
              <div style={{ marginBottom: 20 }}>
                <strong style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>
                  Historial de Visitas Físicas ({clientVisits.length})
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {clientVisits.map((v, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle, #eae7e5)', fontSize: 12 }}>
                      <span>{v.notes}</span>
                      <strong style={{ opacity: 0.7 }}>{formatDate(v.date, 'short')}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial Comercial (Pruebas, Solicitudes, Enganches, Compras) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle, #eae7e5)' }}>
                  <strong style={{ fontSize: 12, textTransform: 'uppercase', opacity: 0.7 }}>Pruebas de Manejo</strong>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{clientTD.length}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{clientTD.map((t) => t.status).join(', ') || 'Ninguna'}</div>
                </div>

                <div style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle, #eae7e5)' }}>
                  <strong style={{ fontSize: 12, textTransform: 'uppercase', opacity: 0.7 }}>Expedientes de Crédito</strong>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{clientReq.length}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{clientReq.map((r) => r.type).join(', ') || 'Ninguno'}</div>
                </div>

                <div style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle, #eae7e5)' }}>
                  <strong style={{ fontSize: 12, textTransform: 'uppercase', opacity: 0.7 }}>Enganches en Caja</strong>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#ff8901', marginTop: 4 }}>
                    {formatCurrency(clientDP.reduce((s, d) => s + Number(d.amount || 0), 0))}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{clientDP.length} abonos recibidos</div>
                </div>

                <div style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-subtle, #eae7e5)' }}>
                  <strong style={{ fontSize: 12, textTransform: 'uppercase', opacity: 0.7 }}>Compras Realizadas</strong>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{clientSales.length} autos</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>
                    {clientSales.length > 0 ? 'Cliente con compra cerrada' : 'Prospecto en seguimiento'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.6 }}>
              Selecciona un cliente del directorio para consultar su ficha 360°.
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL PARA AGREGAR CLIENTE --- */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Registrar Nuevo Cliente</h3>
            <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Sánchez García"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Celular (10 dígitos) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="55 1234 5678"
                    value={clientForm.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
              </div>

              {duplicateWarning && (
                <div style={{ padding: '8px 12px', borderRadius: 6, background: '#fffbeb', border: '1px solid #f59e0b', color: '#b45309', fontSize: 12, fontWeight: 600 }}>
                  ⚠️ {duplicateWarning}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>¿Visita una marca en específico?</label>
                  <select
                    value={clientForm.hasBrandPreference}
                    onChange={(e) => setClientForm({ ...clientForm, hasBrandPreference: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  >
                    <option value="no">Sin preferencia</option>
                    <option value="si">Sí, busca marca específica</option>
                  </select>
                </div>

                {clientForm.hasBrandPreference === 'si' && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Marca de Interés</label>
                    <input
                      type="text"
                      placeholder="Ej. Nissan, Mazda, BMW"
                      value={clientForm.preferredBrand}
                      onChange={(e) => setClientForm({ ...clientForm, preferredBrand: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Comentarios</label>
                <textarea
                  rows={2}
                  placeholder="Presupuesto aproximado, versión requerida o condiciones de compra"
                  value={clientForm.comments}
                  onChange={(e) => setClientForm({ ...clientForm, comments: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary-action">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-action">
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL PARA REGISTRAR VISITA --- */}
      {showNoteModal && (
        <div className="modal-backdrop" onClick={() => setShowNoteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Registrar Nueva Visita</h3>
            <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 14 }}>
              Agrega una bitácora de visita para <strong>{selectedClient?.name}</strong> sin duplicar su expediente.
            </p>
            <textarea
              rows={3}
              placeholder="Detalles de la visita en showroom..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={() => setShowNoteModal(false)} className="btn-secondary-action">
                Cancelar
              </button>
              <button type="button" onClick={handleAddNote} className="btn-primary-action">
                Guardar Visita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
