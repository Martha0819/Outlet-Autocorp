'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  getTodayISO
} from '@/lib/utils';
import { SearchIcon, PlusIcon } from '@/components/ui/Icons';

export function InventarioView() {
  const { data, activeDesign, addVehicle, reserveVehicle, sellVehicle } = useStore();
  const [filterStatus, setFilterStatus] = useState('disponible');
  const [search, setSearch] = useState('');
  const [displayMode, setDisplayMode] = useState('cards'); // 'cards' | 'table'
  const [showAddModal, setShowAddModal] = useState(false);

  // Formulario nuevo auto
  const [vehForm, setVehForm] = useState({
    inventoryId: `OUT-2024-00${(data?.vehicles || []).length + 1}`,
    brand: '',
    model: '',
    version: '',
    year: 2023,
    color: '',
    mileage: 25000,
    transmission: 'Automática',
    fuel: 'Gasolina',
    price: 350000,
    estimatedDownPayment: 70000,
    observations: '',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80']
  });

  const allVehs = data?.vehicles || [];

  let filteredVehs = allVehs;
  if (filterStatus !== 'all') {
    filteredVehs = filteredVehs.filter((v) => v.status === filterStatus);
  }
  if (search) {
    const q = search.toLowerCase();
    filteredVehs = filteredVehs.filter(
      (v) =>
        (v.brand || '').toLowerCase().includes(q) ||
        (v.model || '').toLowerCase().includes(q) ||
        (v.inventoryId || '').toLowerCase().includes(q)
    );
  }

  const handleCreateVehicle = (e) => {
    e.preventDefault();
    if (!vehForm.brand || !vehForm.model) {
      alert('Marca y modelo son obligatorios.');
      return;
    }
    addVehicle({
      ...vehForm,
      price: Number(vehForm.price) || 0,
      estimatedDownPayment: Number(vehForm.estimatedDownPayment) || 0,
      mileage: Number(vehForm.mileage) || 0,
      year: Number(vehForm.year) || 2023
    });
    setShowAddModal(false);
    setVehForm({
      inventoryId: `OUT-2024-00${allVehs.length + 2}`,
      brand: '',
      model: '',
      version: '',
      year: 2023,
      color: '',
      mileage: 25000,
      transmission: 'Automática',
      fuel: 'Gasolina',
      price: 350000,
      estimatedDownPayment: 70000,
      observations: '',
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80']
    });
  };

  const handleApartar = (v) => {
    const amountStr = prompt(`Ingresa el enganche recibido en caja para apartar ${v.brand} ${v.model}:`, '25000');
    const amount = Number(amountStr);
    if (amount > 0) {
      reserveVehicle(v.id, amount);
    }
  };

  const handleVender = (v) => {
    if (confirm(`¿Confirmar venta definitiva de ${v.brand} ${v.model} por ${formatCurrency(v.price)}?`)) {
      sellVehicle(v.id, v.price);
    }
  };

  return (
    <div className="inventario-container">
      {/* Barra de Filtros, Buscador y Conmutador */}
      <div className="toolbar-dashboard">
        <div className="period-pills-wrap">
          <button
            onClick={() => setFilterStatus('disponible')}
            className={`period-btn ${filterStatus === 'disponible' ? 'active' : ''}`}
          >
            Disponibles ({allVehs.filter((v) => v.status === 'disponible').length})
          </button>
          <button
            onClick={() => setFilterStatus('apartado')}
            className={`period-btn ${filterStatus === 'apartado' ? 'active' : ''}`}
          >
            Apartados ({allVehs.filter((v) => v.status === 'apartado').length})
          </button>
          <button
            onClick={() => setFilterStatus('vendido')}
            className={`period-btn ${filterStatus === 'vendido' ? 'active' : ''}`}
          >
            Vendidos ({allVehs.filter((v) => v.status === 'vendido').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`period-btn ${filterStatus === 'all' ? 'active' : ''}`}
          >
            Todos ({allVehs.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 240 }}>
            <input
              type="text"
              placeholder="Buscar vehículo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: 9999,
                border: '1px solid var(--border-subtle, #d5d0ce)',
                fontSize: 13,
                background: 'var(--bg-card, #ffffff)',
                color: 'inherit'
              }}
            />
            <div style={{ position: 'absolute', left: 10, top: 9, opacity: 0.5 }}>
              <SearchIcon size={15} />
            </div>
          </div>

          <div className="period-pills-wrap" style={{ padding: 2 }}>
            <button
              onClick={() => setDisplayMode('cards')}
              className={`period-btn ${displayMode === 'cards' ? 'active' : ''}`}
              title="Vista de Tarjetas"
            >
              Tarjetas
            </button>
            <button
              onClick={() => setDisplayMode('table')}
              className={`period-btn ${displayMode === 'table' ? 'active' : ''}`}
              title="Vista de Tabla"
            >
              Tabla
            </button>
          </div>

          <button onClick={() => setShowAddModal(true)} className="btn-primary-action">
            <PlusIcon size={15} /> <span>Agregar vehículo</span>
          </button>
        </div>
      </div>

      {/* --- VISTA EN TARJETAS HORIZONTALES / PODS --- */}
      {displayMode === 'cards' && (
        <div className="veh-horizontal-stack">
          {filteredVehs.map((v) => {
            const img = (v.images && v.images[0]) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
            let badgeClass = 'badge-green';
            if (v.status === 'apartado') badgeClass = 'badge-amber';
            if (v.status === 'vendido') badgeClass = 'badge-dark';

            return (
              <div key={v.id} className="veh-card-horizontal">
                {/* Media 16:9 */}
                <div className="veh-h-media">
                  <img src={img} alt={v.model} className="veh-h-img" loading="lazy" />
                  <span
                    className={`badge-pill ${badgeClass}`}
                    style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 800 }}
                  >
                    ● {v.status.toUpperCase()}
                  </span>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      background: 'rgba(37,31,29,0.85)',
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontFamily: 'monospace'
                    }}
                  >
                    {v.inventoryId}
                  </span>
                </div>

                {/* Contenido */}
                <div className="veh-h-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: 'inherit' }}>
                        {v.brand} {v.model}
                      </h3>
                      <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>
                        {v.version || ''} · Color {v.color}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase' }}>Precio de Contado</span>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'inherit' }}>{formatCurrency(v.price)}</div>
                      <div style={{ fontSize: 12, color: '#ff8901', fontWeight: 700, marginTop: 2 }}>
                        Enganche est.: {formatCurrency(v.estimatedDownPayment)}
                      </div>
                    </div>
                  </div>

                  {/* Especificaciones Técnicas */}
                  <div className="veh-h-grid-specs">
                    <div className="spec-h-item">
                      <span>Año</span>
                      <strong>{v.year}</strong>
                    </div>
                    <div className="spec-h-item">
                      <span>Kilometraje</span>
                      <strong>{formatNumber(v.mileage)} km</strong>
                    </div>
                    <div className="spec-h-item">
                      <span>Transmisión</span>
                      <strong>{v.transmission}</strong>
                    </div>
                    <div className="spec-h-item">
                      <span>Combustible</span>
                      <strong>{v.fuel}</strong>
                    </div>
                  </div>

                  {/* Observaciones y Acciones */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, borderTop: '1px solid var(--border-subtle, #eae7e5)', paddingTop: 14 }}>
                    <p style={{ fontSize: 12, fontStyle: 'italic', opacity: 0.75, maxWidth: '60%' }}>
                      "{v.observations || 'Sin observaciones adicionales.'}"
                    </p>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {v.status === 'disponible' && (
                        <>
                          <button onClick={() => handleApartar(v)} className="btn-secondary-action">
                            Apartar Auto
                          </button>
                          <button onClick={() => handleVender(v)} className="btn-primary-action">
                            Vender Ahora
                          </button>
                        </>
                      )}
                      {v.status === 'apartado' && (
                        <button onClick={() => handleVender(v)} className="btn-primary-action">
                          Concretar Venta
                        </button>
                      )}
                      {v.status === 'vendido' && (
                        <span className="badge-pill badge-dark" style={{ padding: '6px 14px' }}>
                          ✓ Venta Registrada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- VISTA EN TABLA --- */}
      {displayMode === 'table' && (
        <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid var(--border-subtle, #eae7e5)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>FOLIO</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>VEHÍCULO</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>AÑO</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>KILOMETRAJE</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>PRECIO (MXN)</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>ENGANCHE EST.</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>ESTATUS</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehs.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle, #eae7e5)' }}>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700 }}>{v.inventoryId}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <strong>{v.brand} {v.model}</strong>
                    <div style={{ fontSize: 11, opacity: 0.6 }}>{v.version}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>{v.year}</td>
                  <td style={{ padding: '14px 18px' }}>{formatNumber(v.mileage)} km</td>
                  <td style={{ padding: '14px 18px', fontWeight: 800 }}>{formatCurrency(v.price)}</td>
                  <td style={{ padding: '14px 18px', color: '#ff8901', fontWeight: 700 }}>{formatCurrency(v.estimatedDownPayment)}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span className={`badge-pill ${v.status === 'disponible' ? 'badge-green' : v.status === 'apartado' ? 'badge-amber' : 'badge-dark'}`}>
                      {v.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    {v.status === 'disponible' && (
                      <button onClick={() => handleApartar(v)} className="btn-secondary-action" style={{ fontSize: 11, padding: '4px 8px' }}>
                        Apartar
                      </button>
                    )}
                    {v.status === 'apartado' && (
                      <button onClick={() => handleVender(v)} className="btn-primary-action" style={{ fontSize: 11, padding: '4px 8px' }}>
                        Vender
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- MODAL PARA AGREGAR VEHÍCULO --- */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Ingresar Vehículo a Inventario</h3>
            <form onSubmit={handleCreateVehicle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>ID Inventario</label>
                  <input
                    type="text"
                    required
                    value={vehForm.inventoryId}
                    onChange={(e) => setVehForm({ ...vehForm, inventoryId: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Nissan, Toyota, BMW"
                    value={vehForm.brand}
                    onChange={(e) => setVehForm({ ...vehForm, brand: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Versa, RAV4, Serie 3"
                    value={vehForm.model}
                    onChange={(e) => setVehForm({ ...vehForm, model: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Versión</label>
                  <input
                    type="text"
                    placeholder="Ej. Exclusive CVT, XLE Hybrid"
                    value={vehForm.version}
                    onChange={(e) => setVehForm({ ...vehForm, version: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Año</label>
                  <input
                    type="number"
                    value={vehForm.year}
                    onChange={(e) => setVehForm({ ...vehForm, year: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Color</label>
                  <input
                    type="text"
                    placeholder="Plata, Blanco..."
                    value={vehForm.color}
                    onChange={(e) => setVehForm({ ...vehForm, color: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Kilometraje</label>
                  <input
                    type="number"
                    value={vehForm.mileage}
                    onChange={(e) => setVehForm({ ...vehForm, mileage: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Precio de Venta (MXN) *</label>
                  <input
                    type="number"
                    required
                    value={vehForm.price}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setVehForm({
                        ...vehForm,
                        price: p,
                        estimatedDownPayment: Math.round(p * 0.2)
                      });
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Enganche Estimado (MXN)</label>
                  <input
                    type="number"
                    value={vehForm.estimatedDownPayment}
                    onChange={(e) => setVehForm({ ...vehForm, estimatedDownPayment: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Garantía, equipamiento, número de dueños..."
                  value={vehForm.observations}
                  onChange={(e) => setVehForm({ ...vehForm, observations: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d5d0ce' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary-action">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-action">
                  Guardar Vehículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
