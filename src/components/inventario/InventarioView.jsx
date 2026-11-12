'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  formatCurrency,
  formatNumber,
  formatDate
} from '@/lib/utils';
import {
  SearchIcon,
  CloseIcon,
  PlusIcon
} from '@/components/ui/Icons';

export function InventarioView() {
  const { data, sellVehicle, addVehicle } = useStore();

  // Filtros
  const [filterStatus, setFilterStatus] = useState('disponible'); // 'disponible' | 'apartado' | 'vendido' | 'all'
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [transmissionFilter, setTransmissionFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Modales
  const [sellModalVehicle, setSellModalVehicle] = useState(null);
  const [sellFinalAmount, setSellFinalAmount] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Formulario nuevo vehículo
  const [vehForm, setVehForm] = useState({
    inventoryId: `OUT-2024-0${(data?.vehicles || []).length + 1}`,
    brand: '',
    model: '',
    version: '',
    year: 2023,
    color: 'Blanco',
    mileage: 25000,
    transmission: 'Automática',
    fuel: 'Gasolina',
    price: 350000,
    estimatedDownPayment: 70000,
    observations: ''
  });

  const allVehs = data?.vehicles || [];

  // Marcas disponibles
  const availableBrands = useMemo(() => {
    const defaultBrands = ['Nissan', 'Mazda', 'Toyota', 'Ford', 'Chevrolet', 'KIA', 'Seat', 'Volkswagen', 'BMW', 'Honda'];
    const currentBrands = allVehs.map((v) => v.brand).filter(Boolean);
    return Array.from(new Set([...defaultBrands, ...currentBrands]));
  }, [allVehs]);

  // Filtrado y Ordenamiento
  const filteredVehs = useMemo(() => {
    return allVehs.filter((v) => {
      // Estatus
      if (filterStatus !== 'all' && v.status !== filterStatus) return false;

      // Buscador
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          (v.brand || '').toLowerCase().includes(q) ||
          (v.model || '').toLowerCase().includes(q) ||
          (v.version || '').toLowerCase().includes(q) ||
          (v.inventoryId || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      // Marca
      if (brandFilter !== 'all' && v.brand !== brandFilter) return false;

      // Transmisión
      if (transmissionFilter !== 'all') {
        const t = (v.transmission || '').toLowerCase();
        if (transmissionFilter === 'Automática' && !t.includes('auto')) return false;
        if (transmissionFilter === 'Manual' && !t.includes('man')) return false;
      }

      // Rango de Precio
      if (priceRange === 'under_400k' && v.price >= 400000) return false;
      if (priceRange === '400k_500k' && (v.price < 400000 || v.price > 500000)) return false;
      if (priceRange === 'over_500k' && v.price <= 500000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'year_desc') return b.year - a.year;
      return 0; // Default: recent
    });
  }, [allVehs, filterStatus, search, brandFilter, transmissionFilter, priceRange, sortBy]);

  const openSellModal = (v, e) => {
    if (e) e.stopPropagation();
    setSellModalVehicle(v);
    setSellFinalAmount(v.price || 0);
  };

  const confirmSell = (e) => {
    e.preventDefault();
    if (!sellModalVehicle) return;
    const finalAmt = Number(sellFinalAmount);
    if (finalAmt <= 0) {
      alert('Ingresa un precio de venta válido.');
      return;
    }
    sellVehicle(sellModalVehicle.id, finalAmt);
    setSellModalVehicle(null);
  };

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
      year: Number(vehForm.year) || 2023,
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80']
    });
    setShowAddModal(false);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 60 }}>
      {/* =========================================================================
          BARRA DE HERRAMIENTAS BLANCA INTEGRADA (TOOLBAR + FILTROS DE LA IMAGEN)
          ========================================================================= */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          marginBottom: 24,
          border: '1px solid #eae7e5',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        {/* Fila Superior: Píldoras de Estatus + Buscador y Botón Agregar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          {/* Píldoras de Estatus (Disponibles, Apartados, Vendidos, Todos) */}
          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => setFilterStatus('disponible')}
              style={{
                padding: '8px 20px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: filterStatus === 'disponible' ? '#251f1d' : 'transparent',
                color: filterStatus === 'disponible' ? '#ffffff' : '#6e6764',
                transition: 'all 0.15s'
              }}
            >
              Disponibles
            </button>
            <button
              onClick={() => setFilterStatus('apartado')}
              style={{
                padding: '8px 20px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: filterStatus === 'apartado' ? '#251f1d' : 'transparent',
                color: filterStatus === 'apartado' ? '#ffffff' : '#6e6764',
                transition: 'all 0.15s'
              }}
            >
              Apartados
            </button>
            <button
              onClick={() => setFilterStatus('vendido')}
              style={{
                padding: '8px 20px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: filterStatus === 'vendido' ? '#251f1d' : 'transparent',
                color: filterStatus === 'vendido' ? '#ffffff' : '#6e6764',
                transition: 'all 0.15s'
              }}
            >
              Vendidos
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              style={{
                padding: '8px 20px',
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                backgroundColor: filterStatus === 'all' ? '#251f1d' : 'transparent',
                color: filterStatus === 'all' ? '#ffffff' : '#6e6764',
                transition: 'all 0.15s'
              }}
            >
              Todos
            </button>
          </div>

          {/* Buscador + Botón Agregar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <input
                type="text"
                placeholder="Buscar vehículo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 18px',
                  borderRadius: 9999,
                  border: '1px solid #e2dedc',
                  fontSize: 13,
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  color: '#251f1d'
                }}
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#ff8901',
                color: '#251f1d',
                border: 'none',
                padding: '9px 18px',
                borderRadius: 9999,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              <PlusIcon size={14} /> <span>Agregar vehículo</span>
            </button>
          </div>
        </div>

        {/* Fila Inferior: FILTROS DESPLEGABLES (RÉPLICA EXACTA DE LA IMAGEN) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            paddingTop: 14,
            borderTop: '1px solid #eae7e5'
          }}
        >
          {/* Marca: Todas */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23251f1d' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              padding: '8px 36px 8px 16px',
              borderRadius: 10,
              border: '1px solid #d5d0ce',
              backgroundColor: '#ffffff',
              color: '#251f1d',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            <option value="all">Marca: Todas</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Transmisión: Todas */}
          <select
            value={transmissionFilter}
            onChange={(e) => setTransmissionFilter(e.target.value)}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23251f1d' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              padding: '8px 36px 8px 16px',
              borderRadius: 10,
              border: '1px solid #d5d0ce',
              backgroundColor: '#ffffff',
              color: '#251f1d',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            <option value="all">Transmisión: Todas</option>
            <option value="Automática">Automática</option>
            <option value="Manual">Manual</option>
          </select>

          {/* Precio: Todos */}
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23251f1d' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              padding: '8px 36px 8px 16px',
              borderRadius: 10,
              border: '1px solid #d5d0ce',
              backgroundColor: '#ffffff',
              color: '#251f1d',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            <option value="all">Precio: Todos</option>
            <option value="under_400k">Menos de $400,000</option>
            <option value="400k_500k">$400,000 - $500,000</option>
            <option value="over_500k">Más de $500,000</option>
          </select>

          {/* Fecha de registro */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23251f1d' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              padding: '8px 36px 8px 16px',
              borderRadius: 10,
              border: '1px solid #d5d0ce',
              backgroundColor: '#ffffff',
              color: '#251f1d',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            <option value="recent">Fecha de registro</option>
            <option value="price_asc">Precio: Menor a Mayor</option>
            <option value="price_desc">Precio: Mayor a Menor</option>
            <option value="year_desc">Año: Más reciente</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          TABLA INTELIGENTE V2 (ÚNICA VISTA EN LISTA/TABLA)
          ========================================================================= */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid #eae7e5',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#251f1d' }}>
                <th style={{ padding: '16px 28px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>
                  VEHÍCULO
                </th>
                <th style={{ padding: '16px 20px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>
                  AÑO & KM
                </th>
                <th style={{ padding: '16px 20px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>
                  TRANSMISIÓN
                </th>
                <th style={{ padding: '16px 20px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>
                  PRECIO DE VENTA
                </th>
                <th style={{ padding: '16px 20px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>
                  ENGANCHE ESTIMADO
                </th>
                <th style={{ padding: '16px 20px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px' }}>
                  ESTADO
                </th>
                <th style={{ padding: '16px 28px', color: '#ffffff', fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', textAlign: 'right' }}>
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVehs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: '#8e8784', fontSize: 13 }}>
                    No se encontraron vehículos que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredVehs.map((v) => {
                  const badgeClass =
                    v.status === 'disponible'
                      ? 'badge-v2-green'
                      : v.status === 'apartado'
                      ? 'badge-v2-amber'
                      : 'badge-v2-dark';

                  return (
                    <tr
                      key={v.id}
                      onClick={() => setSelectedVehicle(v)}
                      style={{
                        borderBottom: '1px solid #eae7e5',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf9f8')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      {/* VEHÍCULO */}
                      <td style={{ padding: '20px 28px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#251f1d' }}>
                          {v.brand} {v.model}
                        </div>
                        <div style={{ fontSize: 11, color: '#8e8784', marginTop: 4 }}>
                          {v.inventoryId} · {v.version || 'Estándar'}
                        </div>
                      </td>

                      {/* AÑO & KM */}
                      <td style={{ padding: '20px 20px', verticalAlign: 'middle', fontSize: 13, color: '#251f1d' }}>
                        <strong>{v.year}</strong> <span style={{ color: '#8e8784' }}>· {formatNumber(v.mileage)} km</span>
                      </td>

                      {/* TRANSMISIÓN */}
                      <td style={{ padding: '20px 20px', verticalAlign: 'middle', fontSize: 13, color: '#251f1d' }}>
                        {v.transmission}
                      </td>

                      {/* PRECIO DE VENTA */}
                      <td style={{ padding: '20px 20px', verticalAlign: 'middle', fontSize: 14, fontWeight: 800, color: '#251f1d' }}>
                        {formatCurrency(v.price)}
                      </td>

                      {/* ENGANCHE ESTIMADO */}
                      <td style={{ padding: '20px 20px', verticalAlign: 'middle', fontSize: 13, fontWeight: 800, color: '#ff8901' }}>
                        {formatCurrency(v.estimatedDownPayment)}
                      </td>

                      {/* ESTADO */}
                      <td style={{ padding: '20px 20px', verticalAlign: 'middle' }}>
                        <span
                          className={`badge-v2 ${badgeClass}`}
                          style={{
                            padding: '4px 14px',
                            borderRadius: 9999,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'lowercase'
                          }}
                        >
                          {v.status}
                        </span>
                      </td>

                      {/* ACCIONES */}
                      <td style={{ padding: '20px 28px', verticalAlign: 'middle', textAlign: 'right' }}>
                        {v.status === 'disponible' && (
                          <button
                            onClick={(e) => openSellModal(v, e)}
                            style={{
                              padding: '8px 24px',
                              borderRadius: 9999,
                              border: 'none',
                              background: 'linear-gradient(135deg, #ff8901 0%, #f47f00 100%)',
                              color: '#251f1d',
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 3px 10px rgba(255,137,1,0.3)',
                              transition: 'transform 0.15s, box-shadow 0.15s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 5px 14px rgba(255,137,1,0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 3px 10px rgba(255,137,1,0.3)';
                            }}
                          >
                            Vender
                          </button>
                        )}
                        {v.status === 'apartado' && (
                          <button
                            onClick={(e) => openSellModal(v, e)}
                            style={{
                              padding: '8px 20px',
                              borderRadius: 9999,
                              border: 'none',
                              background: '#251f1d',
                              color: '#ffffff',
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            Concretar
                          </button>
                        )}
                        {v.status === 'vendido' && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#8e8784' }}>
                            ✓ Vendido
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL: REGISTRAR VENTA
          ========================================================================= */}
      {sellModalVehicle && (
        <div className="modal-backdrop" onClick={() => setSellModalVehicle(null)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '24px 28px',
              maxWidth: 460,
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid #eae7e5'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: '#251f1d' }}>Registrar Venta</h3>
              <button
                onClick={() => setSellModalVehicle(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex' }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#6e6764', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              Confirmar venta de <strong>{sellModalVehicle.brand} {sellModalVehicle.model}</strong> ({sellModalVehicle.inventoryId}).
            </p>

            <form onSubmit={confirmSell} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                  Precio Final de Cierre (MXN) *
                </label>
                <input
                  type="number"
                  required
                  value={sellFinalAmount}
                  onChange={(e) => setSellFinalAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid #ff8901',
                    fontSize: 16,
                    fontWeight: 800,
                    backgroundColor: '#ffffff',
                    color: '#251f1d'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setSellModalVehicle(null)}
                  style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #d5d0ce', background: '#ffffff', color: '#251f1d', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #ff8901 0%, #f47f00 100%)', color: '#251f1d', fontWeight: 800, cursor: 'pointer', fontSize: 13 }}
                >
                  Confirmar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: FICHA 360 DETALLE DEL VEHÍCULO
          ========================================================================= */}
      {selectedVehicle && (
        <div className="modal-backdrop" onClick={() => setSelectedVehicle(null)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '24px 28px',
              maxWidth: 560,
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid #eae7e5',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#ff8901', textTransform: 'uppercase' }}>
                  Ficha Técnica
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '2px 0 0 0', color: '#251f1d' }}>
                  {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                </h3>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex' }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              <div style={{ background: '#f5f4f3', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#8e8784' }}>Folio</span>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#251f1d', marginTop: 2 }}>{selectedVehicle.inventoryId}</div>
              </div>
              <div style={{ background: '#f5f4f3', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#8e8784' }}>Kilometraje</span>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#251f1d', marginTop: 2 }}>{formatNumber(selectedVehicle.mileage)} km</div>
              </div>
              <div style={{ background: '#f5f4f3', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#8e8784' }}>Transmisión</span>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#251f1d', marginTop: 2 }}>{selectedVehicle.transmission}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div style={{ background: '#fff9f0', border: '1px solid #ffd6a0', padding: 14, borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#8e8784', textTransform: 'uppercase' }}>Precio de Contado</span>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#251f1d', marginTop: 2 }}>{formatCurrency(selectedVehicle.price)}</div>
              </div>
              <div style={{ background: '#fff9f0', border: '1px solid #ffd6a0', padding: 14, borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: '#8e8784', textTransform: 'uppercase' }}>Enganche Estimado (20%)</span>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#ff8901', marginTop: 2 }}>{formatCurrency(selectedVehicle.estimatedDownPayment)}</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#251f1d', display: 'block', marginBottom: 4 }}>
                Observaciones y equipamiento:
              </span>
              <p style={{ fontSize: 13, color: '#4a4441', margin: 0, background: '#f8f7f6', padding: 12, borderRadius: 8, lineHeight: 1.4 }}>
                {selectedVehicle.observations || 'Vehículo certificado por Outlet Autocorp con garantía de 1 año en tren motriz.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button
                onClick={() => setSelectedVehicle(null)}
                style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #d5d0ce', background: '#ffffff', color: '#251f1d', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
              >
                Cerrar
              </button>
              {selectedVehicle.status === 'disponible' && (
                <button
                  onClick={(e) => {
                    const veh = selectedVehicle;
                    setSelectedVehicle(null);
                    openSellModal(veh, e);
                  }}
                  style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #ff8901 0%, #f47f00 100%)', color: '#251f1d', fontWeight: 800, cursor: 'pointer', fontSize: 13 }}
                >
                  Vender este auto
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REGISTRAR NUEVO VEHÍCULO AL INVENTARIO (RÉPLICA EXACTA DE IMAGEN 2)
          ========================================================================= */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: '28px 32px',
              maxWidth: 680,
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid #eae7e5',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
          >
            {/* Cabecera del Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#251f1d', margin: 0 }}>
                Registrar Nuevo Vehículo al Inventario
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex', padding: 4 }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Fila 1: ID de Inventario * / Estado * */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    ID de Inventario *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehForm.inventoryId}
                    onChange={(e) => setVehForm({ ...vehForm, inventoryId: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    Estado *
                  </label>
                  <select
                    value={vehForm.status || 'disponible'}
                    onChange={(e) => setVehForm({ ...vehForm, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="apartado">Apartado</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </div>
              </div>

              {/* Fila 2: Marca * / Modelo * */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    Marca *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Nissan, Mazda, Toyota"
                    value={vehForm.brand}
                    onChange={(e) => setVehForm({ ...vehForm, brand: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Versa, RAV4, Jetta"
                    value={vehForm.model}
                    onChange={(e) => setVehForm({ ...vehForm, model: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
              </div>

              {/* Fila 3: Versión / Año * */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    Versión
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Exclusive CVT, R-Line 1.4 TSI"
                    value={vehForm.version}
                    onChange={(e) => setVehForm({ ...vehForm, version: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    Año *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="2023"
                    value={vehForm.year}
                    onChange={(e) => setVehForm({ ...vehForm, year: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
              </div>

              {/* Fila 4: Color / Kilometraje * */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Blanco Puro, Rojo Soul Red"
                    value={vehForm.color}
                    onChange={(e) => setVehForm({ ...vehForm, color: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    Kilometraje *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="30000"
                    value={vehForm.mileage}
                    onChange={(e) => setVehForm({ ...vehForm, mileage: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
              </div>

              {/* Fila 5: Transmisión * / Tipo de combustible * */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    Transmisión *
                  </label>
                  <select
                    value={vehForm.transmission}
                    onChange={(e) => setVehForm({ ...vehForm, transmission: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  >
                    <option value="Automática">Automática</option>
                    <option value="Manual">Manual</option>
                    <option value="Automática e-CVT">Automática e-CVT</option>
                    <option value="Manual 6 vel.">Manual 6 vel.</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    Tipo de combustible *
                  </label>
                  <select
                    value={vehForm.fuel}
                    onChange={(e) => setVehForm({ ...vehForm, fuel: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  >
                    <option value="Gasolina">Gasolina</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                    <option value="Diésel">Diésel</option>
                  </select>
                </div>
              </div>

              {/* Fila 6: Precio de venta ($ MXN) * / Enganche estimado ($ MXN) * */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    Precio de venta ($ MXN) *
                  </label>
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
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                    Enganche estimado ($ MXN) *
                  </label>
                  <input
                    type="number"
                    value={vehForm.estimatedDownPayment}
                    onChange={(e) => setVehForm({ ...vehForm, estimatedDownPayment: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                  />
                  <span style={{ fontSize: 11, color: '#8e8784', marginTop: 4, display: 'block' }}>
                    Sugerencia (típicamente 20% del valor)
                  </span>
                </div>
              </div>

              {/* Fila 7: URL de Fotografía principal */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                  URL de Fotografía principal
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
                  value={vehForm.images ? vehForm.images[0] : ''}
                  onChange={(e) => setVehForm({ ...vehForm, images: [e.target.value] })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d' }}
                />
              </div>

              {/* Fila 8: Observaciones y equipamiento */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#251f1d' }}>
                  Observaciones y equipamiento
                </label>
                <textarea
                  rows={2}
                  placeholder="Factura, garantías, estética, servicios al corriente..."
                  value={vehForm.observations}
                  onChange={(e) => setVehForm({ ...vehForm, observations: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d5d0ce', fontSize: 13, backgroundColor: '#ffffff', color: '#251f1d', resize: 'vertical' }}
                />
              </div>

              {/* Botones de acción del footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 14, borderTop: '1px solid #f0edeb' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 8,
                    border: '1px solid #d5d0ce',
                    background: '#ffffff',
                    color: '#251f1d',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 26px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#ff8901',
                    color: '#251f1d',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: 13,
                    boxShadow: '0 2px 8px rgba(255,137,1,0.3)'
                  }}
                >
                  Registrar Vehículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
