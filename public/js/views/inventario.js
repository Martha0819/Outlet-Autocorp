// Vista Inventario — Tarjetas, Tabla, Filtros y Ficha 360 del Vehículo
import { store } from '../store.js';
import { getIcon } from '../components/icons.js';
import { formatCurrency, formatNumber, formatDate, getTodayISO } from '../utils.js';
import { toast, confirmDialog } from '../components/toast.js';

export class InventarioView {
  constructor(app) {
    this.app = app;
    this.displayMode = 'cards'; // 'cards' | 'table'
    this.statusFilter = 'disponible'; // Default: disponibles según requerimiento
    this.searchQuery = '';
    this.brandFilter = 'all';
    this.yearFilter = 'all';
    this.transmissionFilter = 'all';
    this.priceRange = 'all';
    this.sortBy = 'recent'; // 'price_asc', 'price_desc', 'year_desc', 'recent'
  }

  render(container) {
    container.innerHTML = `
      <div class="inventario-view animate-fade-in">
        <!-- Barra de herramientas superior: Búsqueda, Filtros y Conmutador de vista -->
        <div class="inventory-toolbar card">
          <div class="toolbar-top-row">
            <!-- Buscador -->
            <div class="toolbar-search-box">
              <span class="search-icon">${getIcon('search')}</span>
              <input 
                type="text" 
                id="inv-search-input" 
                class="input-search" 
                placeholder="Buscar por marca, modelo o ID de inventario..." 
                value="${this.searchQuery}"
              />
              ${this.searchQuery ? `<button class="btn-clear-search" id="btn-clear-inv-search">${getIcon('close')}</button>` : ''}
            </div>

            <!-- Botones a la derecha: Conmutador de vista y Agregar auto -->
            <div class="toolbar-actions-right">
              <div class="view-mode-toggle">
                <button class="btn-toggle-view ${this.displayMode === 'cards' ? 'active' : ''}" id="btn-view-cards" title="Vista en tarjetas">
                  ${getIcon('grid')} <span>Tarjetas</span>
                </button>
                <button class="btn-toggle-view ${this.displayMode === 'table' ? 'active' : ''}" id="btn-view-table" title="Vista en tabla">
                  ${getIcon('list')} <span>Tabla</span>
                </button>
              </div>

              <button class="btn btn-primary" id="btn-add-vehicle">
                ${getIcon('plus')} <span>Agregar vehículo</span>
              </button>
            </div>
          </div>

          <!-- Filtros de Estado (Pestañas rápidas) y Filtros avanzados -->
          <div class="toolbar-filters-row">
            <!-- Pestañas de estado -->
            <div class="status-tabs-group">
              <button class="status-tab ${this.statusFilter === 'disponible' ? 'active' : ''}" data-status="disponible">
                Disponibles
              </button>
              <button class="status-tab ${this.statusFilter === 'apartado' ? 'active' : ''}" data-status="apartado">
                Apartados
              </button>
              <button class="status-tab ${this.statusFilter === 'vendido' ? 'active' : ''}" data-status="vendido">
                Vendidos
              </button>
              <button class="status-tab ${this.statusFilter === 'all' ? 'active' : ''}" data-status="all">
                Todos los estados
              </button>
            </div>

            <!-- Filtros desplegables -->
            <div class="filter-dropdowns-group">
              <!-- Filtro Marca -->
              <select id="inv-filter-brand" class="input-select select-sm">
                <option value="all">Marca: Todas</option>
                <option value="Nissan" ${this.brandFilter === 'Nissan' ? 'selected' : ''}>Nissan</option>
                <option value="Mazda" ${this.brandFilter === 'Mazda' ? 'selected' : ''}>Mazda</option>
                <option value="Volkswagen" ${this.brandFilter === 'Volkswagen' ? 'selected' : ''}>Volkswagen</option>
                <option value="Toyota" ${this.brandFilter === 'Toyota' ? 'selected' : ''}>Toyota</option>
                <option value="Ford" ${this.brandFilter === 'Ford' ? 'selected' : ''}>Ford</option>
                <option value="Chevrolet" ${this.brandFilter === 'Chevrolet' ? 'selected' : ''}>Chevrolet</option>
                <option value="KIA" ${this.brandFilter === 'KIA' ? 'selected' : ''}>KIA</option>
                <option value="Hyundai" ${this.brandFilter === 'Hyundai' ? 'selected' : ''}>Hyundai</option>
                <option value="BMW" ${this.brandFilter === 'BMW' ? 'selected' : ''}>BMW</option>
                <option value="Honda" ${this.brandFilter === 'Honda' ? 'selected' : ''}>Honda</option>
                <option value="Seat" ${this.brandFilter === 'Seat' ? 'selected' : ''}>Seat</option>
                <option value="Jeep" ${this.brandFilter === 'Jeep' ? 'selected' : ''}>Jeep</option>
              </select>

              <!-- Filtro Transmisión -->
              <select id="inv-filter-trans" class="input-select select-sm">
                <option value="all">Transmisión: Todas</option>
                <option value="Automática" ${this.transmissionFilter === 'Automática' ? 'selected' : ''}>Automática</option>
                <option value="Manual" ${this.transmissionFilter === 'Manual' ? 'selected' : ''}>Manual</option>
              </select>

              <!-- Filtro Rango de Precio -->
              <select id="inv-filter-price" class="input-select select-sm">
                <option value="all">Precio: Todos</option>
                <option value="under_400k" ${this.priceRange === 'under_400k' ? 'selected' : ''}>Menos de $400,000</option>
                <option value="400k_500k" ${this.priceRange === '400k_500k' ? 'selected' : ''}>$400,000 - $500,000</option>
                <option value="over_500k" ${this.priceRange === 'over_500k' ? 'selected' : ''}>Más de $500,000</option>
              </select>

              <!-- Ordenamiento -->
              <select id="inv-sort-by" class="input-select select-sm">
                <option value="recent" ${this.sortBy === 'recent' ? 'selected' : ''}>Fecha de registro</option>
                <option value="price_asc" ${this.sortBy === 'price_asc' ? 'selected' : ''}>Precio (Menor a Mayor)</option>
                <option value="price_desc" ${this.sortBy === 'price_desc' ? 'selected' : ''}>Precio (Mayor a Menor)</option>
                <option value="year_desc" ${this.sortBy === 'year_desc' ? 'selected' : ''}>Año (Más reciente)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Contenedor del inventario (Tarjetas o Tabla) -->
        <div id="inventory-content-container" class="inventory-display-area">
          <!-- Inyectado dinámicamente -->
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.renderInventory();
  }

  bindEvents(container) {
    const searchInput = container.querySelector('#inv-search-input');
    const clearSearch = container.querySelector('#btn-clear-inv-search');
    const btnCards = container.querySelector('#btn-view-cards');
    const btnTable = container.querySelector('#btn-view-table');
    const statusTabs = container.querySelectorAll('.status-tab');
    const filterBrand = container.querySelector('#inv-filter-brand');
    const filterTrans = container.querySelector('#inv-filter-trans');
    const filterPrice = container.querySelector('#inv-filter-price');
    const sortBy = container.querySelector('#inv-sort-by');
    const addBtn = container.querySelector('#btn-add-vehicle');

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.renderInventory();
    });

    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        this.searchQuery = '';
        searchInput.value = '';
        this.renderInventory();
      });
    }

    btnCards.addEventListener('click', () => {
      this.displayMode = 'cards';
      btnCards.classList.add('active');
      btnTable.classList.remove('active');
      this.renderInventory();
    });

    btnTable.addEventListener('click', () => {
      this.displayMode = 'table';
      btnTable.classList.add('active');
      btnCards.classList.remove('active');
      this.renderInventory();
    });

    statusTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        statusTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.statusFilter = tab.getAttribute('data-status');
        this.renderInventory();
      });
    });

    filterBrand.addEventListener('change', (e) => {
      this.brandFilter = e.target.value;
      this.renderInventory();
    });

    filterTrans.addEventListener('change', (e) => {
      this.transmissionFilter = e.target.value;
      this.renderInventory();
    });

    filterPrice.addEventListener('change', (e) => {
      this.priceRange = e.target.value;
      this.renderInventory();
    });

    sortBy.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.renderInventory();
    });

    addBtn.addEventListener('click', () => {
      this.openVehicleModal();
    });
  }

  getFilteredVehicles() {
    let list = store.getVehicles();

    // Filtro por estado
    if (this.statusFilter !== 'all') {
      list = list.filter(v => v.status === this.statusFilter);
    }

    // Filtro por búsqueda
    if (this.searchQuery) {
      list = list.filter(v => {
        const id = (v.inventoryId || '').toLowerCase();
        const brand = (v.brand || '').toLowerCase();
        const model = (v.model || '').toLowerCase();
        return id.includes(this.searchQuery) || brand.includes(this.searchQuery) || model.includes(this.searchQuery);
      });
    }

    // Filtro por marca
    if (this.brandFilter !== 'all') {
      list = list.filter(v => v.brand.toLowerCase() === this.brandFilter.toLowerCase());
    }

    // Filtro por transmisión
    if (this.transmissionFilter !== 'all') {
      list = list.filter(v => (v.transmission || '').toLowerCase().includes(this.transmissionFilter.toLowerCase()));
    }

    // Filtro por rango de precio
    if (this.priceRange === 'under_400k') {
      list = list.filter(v => v.price < 400000);
    } else if (this.priceRange === '400k_500k') {
      list = list.filter(v => v.price >= 400000 && v.price <= 500000);
    } else if (this.priceRange === 'over_500k') {
      list = list.filter(v => v.price > 500000);
    }

    // Ordenamiento
    list.sort((a, b) => {
      if (this.sortBy === 'price_asc') return a.price - b.price;
      if (this.sortBy === 'price_desc') return b.price - a.price;
      if (this.sortBy === 'year_desc') return b.year - a.year;
      return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
    });

    return list;
  }

  renderInventory() {
    const container = document.getElementById('inventory-content-container');
    if (!container) return;

    const vehicles = this.getFilteredVehicles();

    if (vehicles.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box card p-5">
          <div class="empty-icon">${getIcon('car')}</div>
          <h3>No se encontraron vehículos</h3>
          <p>No hay autos que coincidan con los filtros aplicados (${this.statusFilter !== 'all' ? `Estado: ${this.statusFilter}` : 'todos'}).</p>
          <button class="btn btn-outline btn-sm" id="btn-reset-inv-filter">Restablecer filtros</button>
        </div>
      `;

      const resetBtn = container.querySelector('#btn-reset-inv-filter');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.statusFilter = 'disponible';
          this.brandFilter = 'all';
          this.transmissionFilter = 'all';
          this.priceRange = 'all';
          this.render(document.getElementById('view-container'));
        });
      }
      return;
    }

    if (this.displayMode === 'cards') {
      this.renderCardsView(container, vehicles);
    } else {
      this.renderTableView(container, vehicles);
    }
  }

  // ==========================================
  // PRESENTACIÓN EN TARJETAS
  // ==========================================
  renderCardsView(container, vehicles) {
    container.innerHTML = `
      <div class="inventory-cards-grid">
        ${vehicles.map(v => {
          const mainImg = (v.images && v.images[0]) ? v.images[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
          
          let statusBadgeClass = 'badge-success';
          let statusIcon = getIcon('checkCircle');
          let statusText = 'Disponible';

          if (v.status === 'apartado') {
            statusBadgeClass = 'badge-warning';
            statusIcon = getIcon('bookmark');
            statusText = 'Apartado';
          } else if (v.status === 'vendido') {
            statusBadgeClass = 'badge-dark';
            statusIcon = getIcon('tag');
            statusText = 'Vendido';
          }

          return `
            <div class="vehicle-card card animate-fade-in" data-vehicle-id="${v.id}">
              <!-- Fotografía principal con etiqueta de estado -->
              <div class="vehicle-card-image-box">
                <img src="${mainImg}" alt="${v.brand} ${v.model}" class="vehicle-card-img" loading="lazy" />
                <span class="badge ${statusBadgeClass} vehicle-status-badge">
                  ${statusIcon} <span>${statusText}</span>
                </span>
                <span class="vehicle-id-badge">${v.inventoryId}</span>
              </div>

              <!-- Contenido de la tarjeta -->
              <div class="vehicle-card-body">
                <div class="vehicle-title-row">
                  <h3 class="vehicle-card-title">${v.brand} ${v.model}</h3>
                  <span class="vehicle-version">${v.version || ''}</span>
                </div>

                <div class="vehicle-specs-row">
                  <span class="spec-tag">${v.year}</span>
                  <span class="spec-divider">•</span>
                  <span class="spec-tag">${formatNumber(v.mileage)} km</span>
                  <span class="spec-divider">•</span>
                  <span class="spec-tag">${v.transmission}</span>
                </div>

                <div class="vehicle-pricing-box">
                  <div class="price-main">
                    <span class="price-label">Precio de venta</span>
                    <h4 class="price-val font-bold">${formatCurrency(v.price)}</h4>
                  </div>
                  <div class="down-payment-est">
                    <span class="down-label">Enganche estimado:</span>
                    <span class="down-val font-bold text-orange">${formatCurrency(v.estimatedDownPayment)}</span>
                  </div>
                </div>
              </div>

              <div class="vehicle-card-footer">
                <button class="btn btn-outline btn-sm btn-view-vehicle" data-vehicle-id="${v.id}">
                  ${getIcon('eye')} <span>Ver vehículo</span>
                </button>
                <div class="quick-card-actions">
                  ${v.status === 'disponible' ? `
                    <button class="btn-icon-sm btn-quick-td" data-vehicle-id="${v.id}" title="Programar prueba">${getIcon('testDrive')}</button>
                    <button class="btn-icon-sm btn-quick-reserve" data-vehicle-id="${v.id}" title="Apartar">${getIcon('bookmark')}</button>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.bindVehicleInteractions(container);
  }

  // ==========================================
  // PRESENTACIÓN EN TABLA
  // ==========================================
  renderTableView(container, vehicles) {
    container.innerHTML = `
      <div class="table-container card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>VEHÍCULO / ID</th>
                <th>AÑO & KM</th>
                <th>TRANSMISIÓN</th>
                <th>PRECIO DE VENTA</th>
                <th>ENGANCHE ESTIMADO</th>
                <th>ESTADO</th>
                <th class="text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              ${vehicles.map(v => {
                const thumbImg = (v.images && v.images[0]) ? v.images[0] : '';
                let statusBadge = `<span class="badge badge-success">${getIcon('checkCircle')} Disponible</span>`;
                if (v.status === 'apartado') statusBadge = `<span class="badge badge-warning">${getIcon('bookmark')} Apartado</span>`;
                if (v.status === 'vendido') statusBadge = `<span class="badge badge-dark">${getIcon('tag')} Vendido</span>`;

                return `
                  <tr class="table-vehicle-row" data-vehicle-id="${v.id}">
                    <td>
                      <div class="d-flex align-center gap-3">
                        <img src="${thumbImg}" class="table-thumb-img" alt="${v.model}" />
                        <div>
                          <a href="javascript:void(0)" class="link-vehicle-name font-bold" data-vehicle-id="${v.id}">
                            ${v.brand} ${v.model}
                          </a>
                          <div class="text-sm text-muted">${v.inventoryId} · ${v.version}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div><strong>${v.year}</strong></div>
                      <div class="text-sm text-muted">${formatNumber(v.mileage)} km</div>
                    </td>
                    <td>
                      <div>${v.transmission}</div>
                      <div class="text-sm text-muted">${v.fuel}</div>
                    </td>
                    <td class="font-bold text-dark">
                      ${formatCurrency(v.price)}
                    </td>
                    <td class="font-bold text-orange">
                      ${formatCurrency(v.estimatedDownPayment)}
                    </td>
                    <td>
                      ${statusBadge}
                    </td>
                    <td class="text-right">
                      <div class="table-actions-group">
                        <button class="btn-action-icon btn-view-vehicle" data-vehicle-id="${v.id}" title="Ver detalle">
                          ${getIcon('eye')}
                        </button>
                        <button class="btn-action-icon btn-edit-vehicle" data-vehicle-id="${v.id}" title="Editar">
                          ${getIcon('edit')}
                        </button>
                        <button class="btn-action-icon btn-delete-vehicle text-danger" data-vehicle-id="${v.id}" title="Eliminar">
                          ${getIcon('trash')}
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindVehicleInteractions(container);
  }

  bindVehicleInteractions(container) {
    // Abrir ficha del auto
    container.querySelectorAll('.btn-view-vehicle, .link-vehicle-name').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const vId = el.getAttribute('data-vehicle-id');
        this.openVehicleDetailModal(vId);
      });
    });

    // Editar vehículo
    container.querySelectorAll('.btn-edit-vehicle').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const vId = el.getAttribute('data-vehicle-id');
        const veh = store.getVehicleById(vId);
        if (veh) this.openVehicleModal(veh);
      });
    });

    // Eliminar vehículo
    container.querySelectorAll('.btn-delete-vehicle').forEach(el => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        const vId = el.getAttribute('data-vehicle-id');
        const veh = store.getVehicleById(vId);
        if (!veh) return;

        const confirmed = await confirmDialog({
          title: '¿Eliminar vehículo?',
          message: `¿Estás seguro de que deseas retirar del inventario el vehículo "${veh.brand} ${veh.model} ${veh.year}" (${veh.inventoryId})?`,
          confirmText: 'Sí, eliminar',
          isDestructive: true
        });

        if (confirmed) {
          store.deleteVehicle(vId);
          toast.success('Vehículo eliminado del inventario');
          this.renderInventory();
        }
      });
    });

    // Quick reserve
    container.querySelectorAll('.btn-quick-reserve').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const vId = el.getAttribute('data-vehicle-id');
        this.openApartarModal(vId);
      });
    });

    // Quick test drive
    container.querySelectorAll('.btn-quick-td').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const vId = el.getAttribute('data-vehicle-id');
        this.app.modals.openAddTestDriveModal(null, vId);
      });
    });
  }

  // ==========================================
  // FICHA DEL VEHÍCULO (360 PROFILE)
  // ==========================================
  openVehicleDetailModal(vehicleId) {
    const veh = store.getVehicleById(vehicleId);
    if (!veh) return;

    const clients = store.getClients();
    const interestedClients = (veh.interestedClientIds || [])
      .map(id => clients.find(c => c.id === id))
      .filter(Boolean);

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';

    let statusBadge = `<span class="badge badge-success">${getIcon('checkCircle')} Disponible</span>`;
    if (veh.status === 'apartado') statusBadge = `<span class="badge badge-warning">${getIcon('bookmark')} Apartado</span>`;
    if (veh.status === 'vendido') statusBadge = `<span class="badge badge-dark">${getIcon('tag')} Vendido</span>`;

    const images = (veh.images && veh.images.length > 0) ? veh.images : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'];

    backdrop.innerHTML = `
      <div class="modal-box modal-xl animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="d-flex align-center gap-3">
            <h3 class="modal-title">${veh.brand} ${veh.model} ${veh.year}</h3>
            ${statusBadge}
            <span class="badge badge-neutral">${veh.inventoryId}</span>
          </div>
          <button class="modal-close-btn" id="veh-modal-close">${getIcon('close')}</button>
        </div>

        <div class="modal-body">
          <!-- Barra de acciones directas desde la ficha -->
          <div class="profile-quick-actions mb-4">
            <button class="btn btn-outline btn-sm" id="btn-veh-edit">
              ${getIcon('edit')} <span>Editar vehículo</span>
            </button>
            <button class="btn btn-outline btn-sm" id="btn-veh-link-client">
              ${getIcon('users')} <span>Vincular con cliente</span>
            </button>
            ${veh.status === 'disponible' ? `
              <button class="btn btn-outline btn-sm" id="btn-veh-td">
                ${getIcon('testDrive')} <span>Programar prueba</span>
              </button>
              <button class="btn btn-outline btn-sm" id="btn-veh-apartar">
                ${getIcon('bookmark')} <span>Apartar vehículo</span>
              </button>
              <button class="btn btn-primary btn-sm" id="btn-veh-sell">
                ${getIcon('dollarSign')} <span>Registrar venta</span>
              </button>
            ` : ''}
            ${veh.status === 'apartado' ? `
              <button class="btn btn-primary btn-sm" id="btn-veh-sell">
                ${getIcon('dollarSign')} <span>Concretar venta definitiva</span>
              </button>
            ` : ''}
          </div>

          <!-- Dos columnas: Galería y Características técnicas -->
          <div class="vehicle-detail-layout">
            <!-- Galería de imágenes con selector interactivo -->
            <div class="gallery-column">
              <div class="gallery-main-image-box">
                <img src="${images[0]}" alt="${veh.model}" id="gallery-active-img" class="gallery-active-img" />
              </div>
              ${images.length > 1 ? `
                <div class="gallery-thumbs-row">
                  ${images.map((img, idx) => `
                    <img src="${img}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-idx="${idx}" alt="Foto ${idx+1}" />
                  `).join('')}
                </div>
              ` : ''}

              <!-- Tarjeta de precios destacada -->
              <div class="card p-3 mt-3 bg-light">
                <div class="d-flex justify-between align-center mb-2">
                  <span class="text-sm text-muted">Precio de Venta Contado:</span>
                  <span class="text-xl font-bold text-dark">${formatCurrency(veh.price)}</span>
                </div>
                <div class="d-flex justify-between align-center">
                  <span class="text-sm text-muted">Enganche Estimado (Mínimo sugerido):</span>
                  <span class="text-md font-bold text-orange">${formatCurrency(veh.estimatedDownPayment)}</span>
                </div>
                <div class="mt-2 text-xs text-italic text-muted">
                  * Nota: El enganche estimado es una referencia financiera para el cliente. Solo los importes de enganche cobrados se suman a los KPIs.
                </div>
              </div>
            </div>

            <!-- Ficha técnica y Clientes interesados -->
            <div class="specs-column">
              <h4 class="profile-section-title">Especificaciones Técnicas</h4>
              <div class="specs-table-grid">
                <div class="spec-cell">
                  <span class="spec-label">Marca</span>
                  <span class="spec-val font-bold">${veh.brand}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Modelo</span>
                  <span class="spec-val font-bold">${veh.model}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Versión</span>
                  <span class="spec-val font-bold">${veh.version || 'Base'}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Año</span>
                  <span class="spec-val font-bold">${veh.year}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Color exterior</span>
                  <span class="spec-val font-bold">${veh.color || 'No especificado'}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Kilometraje</span>
                  <span class="spec-val font-bold">${formatNumber(veh.mileage)} km</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Transmisión</span>
                  <span class="spec-val font-bold">${veh.transmission}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-label">Combustible</span>
                  <span class="spec-val font-bold">${veh.fuel}</span>
                </div>
              </div>

              <!-- Observaciones -->
              <h4 class="profile-section-title mt-4">Observaciones y Condiciones</h4>
              <p class="profile-comments-box input-italic">${veh.observations || 'Sin observaciones registradas.'}</p>

              <!-- Clientes interesados -->
              <h4 class="profile-section-title mt-4">Clientes Interesados (${interestedClients.length})</h4>
              <div class="interested-clients-box">
                ${interestedClients.length === 0 ? '<p class="text-sm text-muted">Aún no hay clientes vinculados a este auto.</p>' : `
                  <div class="interested-clients-list">
                    ${interestedClients.map(c => `
                      <div class="interested-client-item">
                        <div>
                          <strong>${c.name}</strong> · ${c.phone}
                          <div class="text-xs text-muted">${c.email || 'Sin correo'}</div>
                        </div>
                        <button class="btn btn-outline btn-xs btn-open-client-from-veh" data-client-id="${c.id}">
                          Ver ficha
                        </button>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="btn-veh-close-footer">Cerrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#veh-modal-close').onclick = close;
    backdrop.querySelector('#btn-veh-close-footer').onclick = close;

    // Miniaturas de galería
    const activeImg = backdrop.querySelector('#gallery-active-img');
    const thumbs = backdrop.querySelectorAll('.gallery-thumb');
    thumbs.forEach(t => {
      t.onclick = () => {
        thumbs.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        activeImg.src = t.src;
      };
    });

    // Acción: Editar auto
    backdrop.querySelector('#btn-veh-edit').onclick = () => {
      close();
      this.openVehicleModal(veh);
    };

    // Acción: Vincular cliente
    backdrop.querySelector('#btn-veh-link-client').onclick = () => {
      this.openLinkClientModal(veh, () => {
        close();
        this.openVehicleDetailModal(veh.id);
      });
    };

    // Acción: Programar prueba
    const btnTd = backdrop.querySelector('#btn-veh-td');
    if (btnTd) {
      btnTd.onclick = () => {
        close();
        this.app.modals.openAddTestDriveModal(null, veh.id);
      };
    }

    // Acción: Apartar auto
    const btnApartar = backdrop.querySelector('#btn-veh-apartar');
    if (btnApartar) {
      btnApartar.onclick = () => {
        close();
        this.openApartarModal(veh.id);
      };
    }

    // Acción: Registrar venta
    const btnSell = backdrop.querySelector('#btn-veh-sell');
    if (btnSell) {
      btnSell.onclick = () => {
        close();
        this.app.modals.openAddSaleModal(null, veh.id);
      };
    }

    // Ver ficha de cliente interesado
    backdrop.querySelectorAll('.btn-open-client-from-veh').forEach(b => {
      b.onclick = () => {
        const cId = b.getAttribute('data-client-id');
        close();
        this.app.navigate('clientes');
        setTimeout(() => {
          this.app.clientesView.openClientProfileModal(cId);
        }, 150);
      };
    });
  }

  // Modal para vincular cliente a vehículo
  openLinkClientModal(veh, onDone) {
    const clients = store.getClients();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box modal-sm animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Vincular Cliente Interesado</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <div class="modal-body">
          <p class="text-sm mb-3">Selecciona un cliente para vincularlo a <strong>${veh.brand} ${veh.model} (${veh.inventoryId})</strong>:</p>
          <div class="form-group">
            <select id="link-cli-select" class="input-select">
              ${clients.map(c => `
                <option value="${c.id}">${c.name} — ${c.phone}</option>
              `).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="btn-cancel">Cancelar</button>
          <button class="btn btn-primary" id="btn-save-link">Vincular</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    const close = () => { backdrop.remove(); };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;
    backdrop.querySelector('#btn-save-link').onclick = () => {
      const selectedClientId = backdrop.querySelector('#link-cli-select').value;
      if (selectedClientId) {
        store.linkVehicleToClient(selectedClientId, veh.id);
        toast.success('Cliente vinculado al vehículo con éxito');
        close();
        if (onDone) onDone();
      }
    };
  }

  // Modal para apartar vehículo
  openApartarModal(vehicleId) {
    const veh = store.getVehicleById(vehicleId);
    if (!veh) return;

    if (veh.status === 'vendido') {
      toast.error('Este vehículo ya está vendido y no puede apartarse.');
      return;
    }

    const clients = store.getClients();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Apartar Vehículo: ${veh.brand} ${veh.model}</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="apartar-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label class="form-label">Vehículo seleccionado</label>
              <div class="input-static">
                <strong>${veh.brand} ${veh.model} ${veh.year}</strong> (${veh.inventoryId}) — Precio: ${formatCurrency(veh.price)}
              </div>
            </div>

            <div class="form-group full-width">
              <label for="apartar-client" class="form-label required">Cliente que aparta</label>
              <select id="apartar-client" class="input-select" required>
                ${clients.map(c => `
                  <option value="${c.id}">${c.name} (${c.phone})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="apartar-amount" class="form-label required">Monto de enganche recibido ($ MXN)</label>
              <input type="number" id="apartar-amount" class="input-text" min="1000" step="1000" value="25000" required />
              <span class="form-hint">Este importe se suma al KPI de Enganches</span>
            </div>

            <div class="form-group half-width">
              <label for="apartar-method" class="form-label required">Forma de pago</label>
              <select id="apartar-method" class="input-select" required>
                <option value="Transferencia SPEI">Transferencia SPEI</option>
                <option value="Tarjeta de Débito/Crédito">Tarjeta de Débito/Crédito</option>
                <option value="Efectivo en Caja">Efectivo en Caja</option>
                <option value="Cheque certificado">Cheque certificado</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="apartar-ref" class="form-label">Número de folio / referencia</label>
              <input type="text" id="apartar-ref" class="input-text" placeholder="Ej. SPEI-89201" />
            </div>

            <div class="form-group half-width">
              <label for="apartar-date" class="form-label required">Fecha de apartado</label>
              <input type="date" id="apartar-date" class="input-text" value="${getTodayISO()}" required />
            </div>

            <div class="form-group full-width">
              <label for="apartar-obs" class="form-label">Observaciones</label>
              <textarea id="apartar-obs" class="input-textarea input-italic" rows="2" placeholder="Condiciones del apartado, vigencia de 5 días hábiles..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">Confirmar Apartado y Registrar Enganche</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);
    const close = () => { backdrop.remove(); };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;

    backdrop.querySelector('#apartar-form').onsubmit = (e) => {
      e.preventDefault();
      const clientId = backdrop.querySelector('#apartar-client').value;
      const amount = Number(backdrop.querySelector('#apartar-amount').value);
      const method = backdrop.querySelector('#apartar-method').value;
      const ref = backdrop.querySelector('#apartar-ref').value.trim();
      const date = backdrop.querySelector('#apartar-date').value;
      const obs = backdrop.querySelector('#apartar-obs').value.trim();

      if (!amount || amount <= 0) {
        toast.error('Ingresa un monto de enganche válido.');
        return;
      }

      // Registrar enganche recibido y cambiar estado a 'apartado'
      store.addDownPayment({
        clientId,
        vehicleId: veh.id,
        amount,
        method,
        reference: ref,
        date,
        notes: obs || `Apartado registrado por cliente.`
      });

      // Vincular cliente a vehículo
      store.linkVehicleToClient(clientId, veh.id);

      toast.success(`¡Vehículo apartado! Enganche de ${formatCurrency(amount)} registrado en caja.`);
      close();
      this.renderInventory();
    };
  }

  // ==========================================
  // MODAL: ALTA Y EDICIÓN DE VEHÍCULO
  // ==========================================
  openVehicleModal(veh = null) {
    const isEdit = !!veh;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box modal-lg animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo al Inventario'}</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="vehicle-form">
          <div class="modal-body form-grid">
            <div class="form-group half-width">
              <label for="veh-id" class="form-label required">ID de Inventario</label>
              <input type="text" id="veh-id" class="input-text font-bold" value="${veh ? veh.inventoryId : `OUT-2024-${String(store.getVehicles().length + 1).padStart(3, '0')}`}" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-status" class="form-label required">Estado</label>
              <select id="veh-status" class="input-select" required>
                <option value="disponible" ${!veh || veh.status === 'disponible' ? 'selected' : ''}>Disponible</option>
                <option value="apartado" ${veh && veh.status === 'apartado' ? 'selected' : ''}>Apartado</option>
                <option value="vendido" ${veh && veh.status === 'vendido' ? 'selected' : ''}>Vendido</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="veh-brand" class="form-label required">Marca</label>
              <input type="text" id="veh-brand" class="input-text" value="${veh ? veh.brand : ''}" placeholder="Ej. Nissan, Mazda, Toyota" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-model" class="form-label required">Modelo</label>
              <input type="text" id="veh-model" class="input-text" value="${veh ? veh.model : ''}" placeholder="Ej. Versa, RAV4, Jetta" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-version" class="form-label">Versión</label>
              <input type="text" id="veh-version" class="input-text" value="${veh ? veh.version : ''}" placeholder="Ej. Exclusive CVT, R-Line 1.4 TSI" />
            </div>

            <div class="form-group half-width">
              <label for="veh-year" class="form-label required">Año</label>
              <input type="number" id="veh-year" class="input-text" min="2000" max="2026" value="${veh ? veh.year : 2023}" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-color" class="form-label">Color</label>
              <input type="text" id="veh-color" class="input-text" value="${veh ? (veh.color || '') : ''}" placeholder="Ej. Blanco Puro, Rojo Soul Red" />
            </div>

            <div class="form-group half-width">
              <label for="veh-mileage" class="form-label required">Kilometraje</label>
              <input type="number" id="veh-mileage" class="input-text" min="0" value="${veh ? veh.mileage : 30000}" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-trans" class="form-label required">Transmisión</label>
              <select id="veh-trans" class="input-select" required>
                <option value="Automática" ${!veh || (veh.transmission && veh.transmission.includes('Automática')) ? 'selected' : ''}>Automática</option>
                <option value="Manual" ${veh && (veh.transmission && veh.transmission.includes('Manual')) ? 'selected' : ''}>Manual</option>
                <option value="CVT" ${veh && (veh.transmission && veh.transmission.includes('CVT')) ? 'selected' : ''}>CVT</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="veh-fuel" class="form-label required">Tipo de combustible</label>
              <select id="veh-fuel" class="input-select" required>
                <option value="Gasolina" ${!veh || veh.fuel === 'Gasolina' ? 'selected' : ''}>Gasolina</option>
                <option value="Híbrido" ${veh && veh.fuel === 'Híbrido' ? 'selected' : ''}>Híbrido</option>
                <option value="Eléctrico" ${veh && veh.fuel === 'Eléctrico' ? 'selected' : ''}>Eléctrico</option>
                <option value="Diésel" ${veh && veh.fuel === 'Diésel' ? 'selected' : ''}>Diésel</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="veh-price" class="form-label required">Precio de venta ($ MXN)</label>
              <input type="number" id="veh-price" class="input-text font-bold" min="10000" step="1000" value="${veh ? veh.price : 350000}" required />
            </div>

            <div class="form-group half-width">
              <label for="veh-down" class="form-label required">Enganche estimado ($ MXN)</label>
              <input type="number" id="veh-down" class="input-text font-bold text-orange" min="1000" step="1000" value="${veh ? veh.estimatedDownPayment : 70000}" required />
              <span class="form-hint">Sugerencia (típicamente 20% del valor)</span>
            </div>

            <div class="form-group full-width">
              <label for="veh-image-url" class="form-label">URL de Fotografía principal</label>
              <input type="url" id="veh-image-url" class="input-text" value="${veh && veh.images && veh.images[0] ? veh.images[0] : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}" placeholder="https://..." />
            </div>

            <div class="form-group full-width">
              <label for="veh-obs" class="form-label">Observaciones y equipamiento</label>
              <textarea id="veh-obs" class="input-textarea input-italic" rows="2" placeholder="Factura, garantías, estética, servicios al corriente...">${veh ? (veh.observations || '') : ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Registrar Vehículo'}</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(backdrop);
    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#modal-close').onclick = close;
    backdrop.querySelector('#btn-cancel').onclick = close;

    const priceInput = backdrop.querySelector('#veh-price');
    const downInput = backdrop.querySelector('#veh-down');
    priceInput.addEventListener('input', () => {
      if (!isEdit) {
        downInput.value = Math.round(Number(priceInput.value) * 0.2);
      }
    });

    const form = backdrop.querySelector('#vehicle-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const payload = {
        inventoryId: form.querySelector('#veh-id').value.trim(),
        status: form.querySelector('#veh-status').value,
        brand: form.querySelector('#veh-brand').value.trim(),
        model: form.querySelector('#veh-model').value.trim(),
        version: form.querySelector('#veh-version').value.trim(),
        year: Number(form.querySelector('#veh-year').value),
        color: form.querySelector('#veh-color').value.trim(),
        mileage: Number(form.querySelector('#veh-mileage').value),
        transmission: form.querySelector('#veh-trans').value,
        fuel: form.querySelector('#veh-fuel').value,
        price: Number(priceInput.value),
        estimatedDownPayment: Number(downInput.value),
        images: [form.querySelector('#veh-image-url').value.trim()],
        observations: form.querySelector('#veh-obs').value.trim()
      };

      if (!payload.brand || !payload.model || !payload.price) {
        toast.error('Completa los campos obligatorios del vehículo.');
        return;
      }

      if (isEdit) {
        store.updateVehicle(veh.id, payload);
        toast.success('Vehículo actualizado exitosamente');
      } else {
        store.addVehicle(payload);
        toast.success('Vehículo registrado en el inventario');
      }

      close();
      this.renderInventory();
    };
  }
}
