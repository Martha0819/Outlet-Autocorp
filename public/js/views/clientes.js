// Vista Clientes — Directorio, Búsqueda, Duplicados y Ficha 360
import { store } from '../store.js';
import { getIcon } from '../components/icons.js';
import { formatCurrency, formatDate, formatPhone, validatePhone, validateEmail, getTodayISO } from '../utils.js';
import { toast, confirmDialog } from '../components/toast.js';

export class ClientesView {
  constructor(app) {
    this.app = app;
    this.searchQuery = '';
    this.brandFilter = 'all';
    this.sortBy = 'date_desc'; // 'name_asc', 'name_desc', 'date_desc', 'date_asc'
    this.currentPage = 1;
    this.pageSize = 8;
  }

  render(container) {
    container.innerHTML = `
      <div class="clientes-view animate-fade-in">
        <!-- Barra de herramientas: Búsqueda, Filtros y Botón de Alta -->
        <div class="table-toolbar card">
          <div class="toolbar-search-box">
            <span class="search-icon">${getIcon('search')}</span>
            <input 
              type="text" 
              id="client-search-input" 
              class="input-search" 
              placeholder="Buscar por nombre, celular o correo..." 
              value="${this.searchQuery}"
            />
            ${this.searchQuery ? `<button class="btn-clear-search" id="btn-clear-client-search">${getIcon('close')}</button>` : ''}
          </div>

          <div class="toolbar-filters">
            <!-- Filtro por marca de interés -->
            <div class="filter-item">
              <label for="client-filter-brand" class="sr-only">Marca de interés</label>
              <select id="client-filter-brand" class="input-select select-sm">
                <option value="all" ${this.brandFilter === 'all' ? 'selected' : ''}>Todas las marcas</option>
                <option value="no_pref" ${this.brandFilter === 'no_pref' ? 'selected' : ''}>Sin preferencia</option>
                <option value="Nissan" ${this.brandFilter === 'Nissan' ? 'selected' : ''}>Nissan</option>
                <option value="Mazda" ${this.brandFilter === 'Mazda' ? 'selected' : ''}>Mazda</option>
                <option value="Volkswagen" ${this.brandFilter === 'Volkswagen' ? 'selected' : ''}>Volkswagen</option>
                <option value="Toyota" ${this.brandFilter === 'Toyota' ? 'selected' : ''}>Toyota</option>
                <option value="Ford" ${this.brandFilter === 'Ford' ? 'selected' : ''}>Ford</option>
                <option value="Chevrolet" ${this.brandFilter === 'Chevrolet' ? 'selected' : ''}>Chevrolet</option>
                <option value="KIA" ${this.brandFilter === 'KIA' ? 'selected' : ''}>KIA</option>
                <option value="Hyundai" ${this.brandFilter === 'Hyundai' ? 'selected' : ''}>Hyundai</option>
                <option value="BMW" ${this.brandFilter === 'BMW' ? 'selected' : ''}>BMW</option>
              </select>
            </div>

            <!-- Ordenamiento -->
            <div class="filter-item">
              <label for="client-sort-by" class="sr-only">Ordenar</label>
              <select id="client-sort-by" class="input-select select-sm">
                <option value="date_desc" ${this.sortBy === 'date_desc' ? 'selected' : ''}>Más recientes primero</option>
                <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>Nombre (A - Z)</option>
                <option value="name_desc" ${this.sortBy === 'name_desc' ? 'selected' : ''}>Nombre (Z - A)</option>
              </select>
            </div>

            <!-- Botón principal de agregar cliente -->
            <button class="btn btn-primary" id="btn-add-client">
              ${getIcon('plus')} <span>Agregar cliente</span>
            </button>
          </div>
        </div>

        <!-- Tabla principal de clientes -->
        <div class="table-container card">
          <div class="table-responsive">
            <table class="data-table" id="clients-table">
              <thead>
                <tr>
                  <th>NOMBRE DE CLIENTE</th>
                  <th>CELULAR</th>
                  <th>CORREO</th>
                  <th>¿VISITA UNA MARCA EN ESPECÍFICO?</th>
                  <th>COMENTARIOS</th>
                  <th class="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody id="clients-tbody">
                <!-- Inyectado dinámicamente -->
              </tbody>
            </table>
          </div>

          <!-- Paginación y contador -->
          <div class="table-pagination-footer" id="clients-pagination">
            <!-- Inyectado -->
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.renderClientsTable();
  }

  bindEvents(container) {
    const searchInput = container.querySelector('#client-search-input');
    const brandFilter = container.querySelector('#client-filter-brand');
    const sortBy = container.querySelector('#client-sort-by');
    const addBtn = container.querySelector('#btn-add-client');
    const clearSearch = container.querySelector('#btn-clear-client-search');

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.currentPage = 1;
      this.renderClientsTable();
    });

    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        this.searchQuery = '';
        searchInput.value = '';
        this.currentPage = 1;
        this.renderClientsTable();
      });
    }

    brandFilter.addEventListener('change', (e) => {
      this.brandFilter = e.target.value;
      this.currentPage = 1;
      this.renderClientsTable();
    });

    sortBy.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.renderClientsTable();
    });

    addBtn.addEventListener('click', () => {
      this.openClientModal();
    });
  }

  getFilteredClients() {
    let clients = store.getClients();

    // Filtro por búsqueda
    if (this.searchQuery) {
      clients = clients.filter(c => {
        const name = (c.name || '').toLowerCase();
        const phone = (c.phone || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        return name.includes(this.searchQuery) || phone.includes(this.searchQuery) || email.includes(this.searchQuery);
      });
    }

    // Filtro por marca
    if (this.brandFilter !== 'all') {
      if (this.brandFilter === 'no_pref') {
        clients = clients.filter(c => c.hasBrandPreference === 'no' || !c.preferredBrand);
      } else {
        clients = clients.filter(c => c.hasBrandPreference === 'si' && c.preferredBrand === this.brandFilter);
      }
    }

    // Ordenamiento
    clients.sort((a, b) => {
      if (this.sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (this.sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (this.sortBy === 'date_asc') return new Date(a.dateRegistered || 0) - new Date(b.dateRegistered || 0);
      return new Date(b.dateRegistered || 0) - new Date(a.dateRegistered || 0);
    });

    return clients;
  }

  renderClientsTable() {
    const tbody = document.getElementById('clients-tbody');
    const paginationContainer = document.getElementById('clients-pagination');
    if (!tbody) return;

    const allFiltered = this.getFilteredClients();
    const totalItems = allFiltered.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;

    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginated = allFiltered.slice(startIndex, startIndex + this.pageSize);

    if (paginated.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="table-empty-td">
            <div class="empty-state-box">
              <p>No se encontraron clientes que coincidan con la búsqueda o filtros aplicados.</p>
              <button class="btn btn-outline btn-sm" id="btn-reset-client-search">Restablecer filtros</button>
            </div>
          </td>
        </tr>
      `;

      const resetBtn = tbody.querySelector('#btn-reset-client-search');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.searchQuery = '';
          this.brandFilter = 'all';
          this.render(document.getElementById('view-container'));
        });
      }

      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    tbody.innerHTML = paginated.map(c => {
      const brandBadge = c.hasBrandPreference === 'si' && c.preferredBrand
        ? `<span class="badge badge-primary font-bold">Sí — ${c.preferredBrand}</span>`
        : `<span class="badge badge-neutral">No — Sin preferencia</span>`;

      return `
        <tr class="table-client-row" data-client-id="${c.id}">
          <td class="font-bold">
            <div class="client-cell-name">
              <span class="client-avatar-circle">${c.name.charAt(0)}</span>
              <div>
                <a href="javascript:void(0)" class="client-name-link" data-client-id="${c.id}">${c.name}</a>
                <div class="client-meta-sub">Alta: ${formatDate(c.dateRegistered, 'short')} · ${(c.visits || []).length} visitas</div>
              </div>
            </div>
          </td>
          <td>
            <a href="tel:${c.phone}" class="link-neutral">${formatPhone(c.phone)}</a>
          </td>
          <td>
            <a href="mailto:${c.email}" class="link-neutral">${c.email || '—'}</a>
          </td>
          <td>
            ${brandBadge}
          </td>
          <td class="comments-cell">
            <span class="text-italic text-muted">${c.comments || 'Sin comentarios adicionales.'}</span>
          </td>
          <td class="text-right">
            <div class="table-actions-group">
              <button class="btn-action-icon btn-view-profile" data-client-id="${c.id}" title="Consultar ficha completa">
                ${getIcon('eye')}
              </button>
              <button class="btn-action-icon btn-edit-client" data-client-id="${c.id}" title="Editar cliente">
                ${getIcon('edit')}
              </button>
              <button class="btn-action-icon btn-delete-client text-danger" data-client-id="${c.id}" title="Eliminar cliente">
                ${getIcon('trash')}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Paginación
    if (paginationContainer) {
      paginationContainer.innerHTML = `
        <div class="pagination-info">
          Mostrando <strong>${startIndex + 1}</strong> - <strong>${Math.min(startIndex + this.pageSize, totalItems)}</strong> de <strong>${totalItems}</strong> clientes
        </div>
        <div class="pagination-controls">
          <button class="btn btn-outline btn-sm" id="btn-page-prev" ${this.currentPage === 1 ? 'disabled' : ''}>
            ${getIcon('chevronLeft')} Anterior
          </button>
          <span class="page-indicator">Página ${this.currentPage} de ${totalPages}</span>
          <button class="btn btn-outline btn-sm" id="btn-page-next" ${this.currentPage >= totalPages ? 'disabled' : ''}>
            Siguiente ${getIcon('chevronRight')}
          </button>
        </div>
      `;

      const prevBtn = paginationContainer.querySelector('#btn-page-prev');
      const nextBtn = paginationContainer.querySelector('#btn-page-next');
      if (prevBtn) prevBtn.onclick = () => { this.currentPage--; this.renderClientsTable(); };
      if (nextBtn) nextBtn.onclick = () => { this.currentPage++; this.renderClientsTable(); };
    }

    this.bindTableActions(tbody);
  }

  bindTableActions(tbody) {
    // Ficha del cliente
    tbody.querySelectorAll('.client-name-link, .btn-view-profile').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const clientId = el.getAttribute('data-client-id');
        this.openClientProfileModal(clientId);
      });
    });

    // Editar cliente
    tbody.querySelectorAll('.btn-edit-client').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const clientId = el.getAttribute('data-client-id');
        const client = store.getClientById(clientId);
        if (client) this.openClientModal(client);
      });
    });

    // Eliminar cliente
    tbody.querySelectorAll('.btn-delete-client').forEach(el => {
      el.addEventListener('click', async (e) => {
        e.preventDefault();
        const clientId = el.getAttribute('data-client-id');
        const client = store.getClientById(clientId);
        if (!client) return;

        const confirmed = await confirmDialog({
          title: '¿Eliminar cliente?',
          message: `¿Estás seguro de que deseas eliminar a "${client.name}"? Se perderá su historial de visitas y solicitudes.`,
          confirmText: 'Sí, eliminar',
          isDestructive: true
        });

        if (confirmed) {
          store.deleteClient(clientId);
          toast.success('Cliente eliminado con éxito');
          this.renderClientsTable();
        }
      });
    });
  }

  // ==========================================
  // MODAL: ALTA Y EDICIÓN DE CLIENTE (CON AVISO DE DUPLICADOS)
  // ==========================================
  openClientModal(client = null) {
    const isEdit = !!client;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="client-form">
          <div class="modal-body form-grid">
            <!-- Alerta de duplicado en vivo -->
            <div id="duplicate-warning" class="alert-box alert-warning full-width" style="display: none;">
              <div class="alert-icon">${getIcon('alertCircle')}</div>
              <div class="alert-content">
                <strong>Atención: Posible registro duplicado</strong>
                <p id="duplicate-warning-text" class="text-sm">Ya existe un cliente con este celular o correo.</p>
              </div>
            </div>

            <div class="form-group full-width">
              <label for="client-name" class="form-label required">Nombre completo</label>
              <input type="text" id="client-name" class="input-text" value="${client ? client.name : ''}" placeholder="Ej. Rodrigo Morales Valenzuela" required />
            </div>

            <div class="form-group half-width">
              <label for="client-phone" class="form-label required">Celular (10 dígitos)</label>
              <input type="tel" id="client-phone" class="input-text" value="${client ? client.phone : ''}" placeholder="Ej. 5541928374" required />
              <span class="form-hint">Teléfono móvil a 10 dígitos sin espacios</span>
            </div>

            <div class="form-group half-width">
              <label for="client-email" class="form-label">Correo electrónico</label>
              <input type="email" id="client-email" class="input-text" value="${client ? (client.email || '') : ''}" placeholder="cliente@correo.com" />
              <span class="form-hint">Opcional para cotizaciones y solicitudes</span>
            </div>

            <div class="form-group half-width">
              <label for="client-has-brand" class="form-label required">¿Visita una marca en específico?</label>
              <select id="client-has-brand" class="input-select" required>
                <option value="no" ${client && client.hasBrandPreference === 'no' ? 'selected' : ''}>No — Sin preferencia</option>
                <option value="si" ${!client || client.hasBrandPreference === 'si' ? 'selected' : ''}>Sí — Marca específica</option>
              </select>
            </div>

            <div class="form-group half-width" id="preferred-brand-group">
              <label for="client-pref-brand" class="form-label">Marca de interés</label>
              <select id="client-pref-brand" class="input-select">
                <option value="Nissan" ${client && client.preferredBrand === 'Nissan' ? 'selected' : ''}>Nissan</option>
                <option value="Mazda" ${client && client.preferredBrand === 'Mazda' ? 'selected' : ''}>Mazda</option>
                <option value="Volkswagen" ${client && client.preferredBrand === 'Volkswagen' ? 'selected' : ''}>Volkswagen</option>
                <option value="Toyota" ${client && client.preferredBrand === 'Toyota' ? 'selected' : ''}>Toyota</option>
                <option value="Ford" ${client && client.preferredBrand === 'Ford' ? 'selected' : ''}>Ford</option>
                <option value="Chevrolet" ${client && client.preferredBrand === 'Chevrolet' ? 'selected' : ''}>Chevrolet</option>
                <option value="KIA" ${client && client.preferredBrand === 'KIA' ? 'selected' : ''}>KIA</option>
                <option value="Hyundai" ${client && client.preferredBrand === 'Hyundai' ? 'selected' : ''}>Hyundai</option>
                <option value="BMW" ${client && client.preferredBrand === 'BMW' ? 'selected' : ''}>BMW</option>
                <option value="Honda" ${client && client.preferredBrand === 'Honda' ? 'selected' : ''}>Honda</option>
                <option value="Seat" ${client && client.preferredBrand === 'Seat' ? 'selected' : ''}>Seat</option>
                <option value="Jeep" ${client && client.preferredBrand === 'Jeep' ? 'selected' : ''}>Jeep</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="client-comments" class="form-label">Comentarios u observaciones</label>
              <textarea id="client-comments" class="input-textarea input-italic" rows="3" placeholder="Presupuesto aproximado, necesidades familiares, enganche disponible...">${client ? (client.comments || '') : ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Registrar Cliente'}</button>
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

    const hasBrandSelect = backdrop.querySelector('#client-has-brand');
    const brandGroup = backdrop.querySelector('#preferred-brand-group');
    const phoneInput = backdrop.querySelector('#client-phone');
    const emailInput = backdrop.querySelector('#client-email');
    const dupWarning = backdrop.querySelector('#duplicate-warning');
    const dupWarningText = backdrop.querySelector('#duplicate-warning-text');

    const updateBrandVisibility = () => {
      brandGroup.style.display = hasBrandSelect.value === 'si' ? 'block' : 'none';
    };
    hasBrandSelect.addEventListener('change', updateBrandVisibility);
    updateBrandVisibility();

    // Verificación de duplicados en tiempo real
    const checkDupes = () => {
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const duplicate = store.checkDuplicateClient(phone, email, client ? client.id : null);

      if (duplicate) {
        dupWarning.style.display = 'flex';
        dupWarningText.textContent = `Ya existe un cliente registrado con estos datos: "${duplicate.name}" (${formatPhone(duplicate.phone)}). Si es una nueva visita, se recomienda registrar la visita desde su ficha.`;
      } else {
        dupWarning.style.display = 'none';
      }
    };

    phoneInput.addEventListener('input', checkDupes);
    emailInput.addEventListener('input', checkDupes);

    const form = backdrop.querySelector('#client-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const name = form.querySelector('#client-name').value.trim();
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const hasBrand = hasBrandSelect.value;
      const prefBrand = hasBrand === 'si' ? form.querySelector('#client-pref-brand').value : '';
      const comments = form.querySelector('#client-comments').value.trim();

      if (!name) {
        toast.error('El nombre del cliente es obligatorio.');
        return;
      }

      if (!validatePhone(phone)) {
        toast.error('El celular debe contener exactamente 10 dígitos numéricos.');
        return;
      }

      if (email && !validateEmail(email)) {
        toast.error('El formato del correo electrónico no es válido.');
        return;
      }

      const payload = {
        name,
        phone,
        email,
        hasBrandPreference: hasBrand,
        preferredBrand: prefBrand,
        comments
      };

      if (isEdit) {
        store.updateClient(client.id, payload);
        toast.success('Cliente actualizado correctamente');
      } else {
        store.addClient(payload);
        toast.success('Cliente registrado y primera visita agregada al CRM');
      }

      close();
      this.renderClientsTable();
    };
  }

  // ==========================================
  // FICHA DEL CLIENTE (360 PROFILE)
  // ==========================================
  openClientProfileModal(clientId) {
    const client = store.getClientById(clientId);
    if (!client) return;

    const allVehicles = store.getVehicles();
    const testDrives = store.getTestDrives().filter(td => td.clientId === clientId);
    const requests = store.getRequests().filter(r => r.clientId === clientId);
    const downPayments = store.getDownPayments().filter(dp => dp.clientId === clientId);
    const sales = store.getSales().filter(s => s.clientId === clientId);

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.id = 'client-profile-modal-backdrop';

    backdrop.innerHTML = `
      <div class="modal-box modal-xl animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="profile-header-title">
            <span class="client-avatar-circle lg">${client.name.charAt(0)}</span>
            <div>
              <h3 class="modal-title">${client.name}</h3>
              <p class="modal-sub">Cliente registrado el ${formatDate(client.dateRegistered, 'long')}</p>
            </div>
          </div>
          <button class="modal-close-btn" id="profile-close">${getIcon('close')}</button>
        </div>

        <div class="modal-body profile-body">
          <!-- Barra rápida de acciones de la ficha (sin cambiar de vista) -->
          <div class="profile-quick-actions">
            <button class="btn btn-primary btn-sm" id="btn-profile-new-visit">
              ${getIcon('plus')} <span>Registrar visita hoy</span>
            </button>
            <button class="btn btn-outline btn-sm" id="btn-profile-add-note">
              ${getIcon('edit')} <span>Agregar nota</span>
            </button>
            <button class="btn btn-outline btn-sm" id="btn-profile-link-veh">
              ${getIcon('car')} <span>Vincular vehículo</span>
            </button>
            <button class="btn btn-outline btn-sm" id="btn-profile-testdrive">
              ${getIcon('testDrive')} <span>Programar prueba</span>
            </button>
            <button class="btn btn-outline btn-sm" id="btn-profile-request">
              ${getIcon('fileText')} <span>Crear solicitud</span>
            </button>
            <button class="btn btn-dark btn-sm" id="btn-profile-sale">
              ${getIcon('dollarSign')} <span>Registrar venta</span>
            </button>
          </div>

          <!-- Dos columnas: Información general y Pestañas de seguimiento -->
          <div class="profile-layout-grid">
            <!-- Columna lateral: Datos de contacto y preferencias -->
            <div class="profile-side-card card">
              <h4 class="profile-section-title">Información de Contacto</h4>
              <div class="profile-info-list">
                <div class="info-item">
                  <span class="info-label">Celular:</span>
                  <a href="tel:${client.phone}" class="info-val font-bold">${formatPhone(client.phone)}</a>
                </div>
                <div class="info-item">
                  <span class="info-label">Correo:</span>
                  <span class="info-val">${client.email || 'No registrado'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Marca de interés:</span>
                  <span class="info-val">
                    ${client.hasBrandPreference === 'si' && client.preferredBrand
                      ? `<span class="badge badge-primary">${client.preferredBrand}</span>`
                      : '<span class="badge badge-neutral">Sin preferencia</span>'
                    }
                  </span>
                </div>
              </div>

              <h4 class="profile-section-title mt-4">Comentarios y Observaciones</h4>
              <p class="profile-comments-box input-italic">${client.comments || 'Sin comentarios registrados.'}</p>

              <h4 class="profile-section-title mt-4">Vehículos de Interés</h4>
              <div class="interested-vehicles-list" id="profile-interested-vehicles">
                ${(client.interestedVehicleIds || []).map(vId => {
                  const veh = allVehicles.find(v => v.id === vId);
                  if (!veh) return '';
                  return `
                    <div class="interested-veh-pill">
                      <span>${veh.brand} ${veh.model} ${veh.year} (${formatCurrency(veh.price)})</span>
                      <span class="badge badge-sm ${veh.status === 'disponible' ? 'badge-success' : 'badge-neutral'}">${veh.status}</span>
                    </div>
                  `;
                }).join('') || '<p class="text-sm text-muted">Aún no hay vehículos vinculados.</p>'}
              </div>
            </div>

            <!-- Columna principal: Historial comercial, pruebas, solicitudes, enganches, compras -->
            <div class="profile-main-content">
              <!-- Historial de Visitas -->
              <div class="card p-3 mb-3">
                <div class="d-flex justify-between align-center mb-2">
                  <h4 class="profile-section-title">${getIcon('users')} Historial de Visitas (${(client.visits || []).length})</h4>
                </div>
                <div class="profile-timeline">
                  ${(client.visits || []).map(v => `
                    <div class="timeline-entry">
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <span class="timeline-date font-bold">${formatDate(v.date, 'long')}</span>
                        <p class="timeline-notes">${v.notes}</p>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Pruebas de manejo -->
              <div class="card p-3 mb-3">
                <h4 class="profile-section-title mb-2">${getIcon('testDrive')} Pruebas de Manejo (${testDrives.length})</h4>
                ${testDrives.length === 0 ? '<p class="text-sm text-muted">No tiene pruebas de manejo agendadas.</p>' : `
                  <div class="profile-subtable">
                    ${testDrives.map(td => {
                      const veh = allVehicles.find(v => v.id === td.vehicleId) || { brand: 'Auto', model: '' };
                      return `
                        <div class="subtable-row">
                          <div>
                            <strong>${veh.brand} ${veh.model}</strong> · ${formatDate(td.date, 'short')} ${td.time}
                            <div class="text-sm text-muted">Asesor: ${td.responsible || 'De guardia'} · ${td.notes || ''}</div>
                          </div>
                          <span class="badge ${td.status === 'Realizada' ? 'badge-success' : 'badge-primary'}">${td.status}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>

              <!-- Solicitudes de compra/financiamiento -->
              <div class="card p-3 mb-3">
                <h4 class="profile-section-title mb-2">${getIcon('fileText')} Solicitudes de Crédito / Compra (${requests.length})</h4>
                ${requests.length === 0 ? '<p class="text-sm text-muted">Sin solicitudes de financiamiento registradas.</p>' : `
                  <div class="profile-subtable">
                    ${requests.map(r => {
                      const veh = allVehicles.find(v => v.id === r.vehicleId) || { brand: 'Auto', model: '' };
                      return `
                        <div class="subtable-row">
                          <div>
                            <strong>${r.type} — ${veh.brand} ${veh.model}</strong> (${formatDate(r.date, 'short')})
                            <div class="text-sm text-muted">Enganche planeado: ${formatCurrency(r.downPaymentPlanned)} · ${r.notes || ''}</div>
                          </div>
                          <span class="badge ${r.status === 'Aprobada' ? 'badge-success' : 'badge-warning'}">${r.status}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>

              <!-- Enganches Recibidos -->
              <div class="card p-3 mb-3">
                <h4 class="profile-section-title mb-2">${getIcon('dollarSign')} Enganches Recibidos en Caja (${downPayments.length})</h4>
                ${downPayments.length === 0 ? '<p class="text-sm text-muted">No se han registrado pagos de enganche para este cliente.</p>' : `
                  <div class="profile-subtable">
                    ${downPayments.map(dp => {
                      const veh = allVehicles.find(v => v.id === dp.vehicleId) || { brand: 'Vehículo', model: '' };
                      return `
                        <div class="subtable-row">
                          <div>
                            <strong class="text-success">${formatCurrency(dp.amount)}</strong> · ${veh.brand} ${veh.model}
                            <div class="text-sm text-muted">Método: ${dp.method || 'Efectivo'} · Ref: ${dp.reference || '—'} · Fecha: ${formatDate(dp.date, 'short')}</div>
                          </div>
                          <span class="badge badge-success">Recibido</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>

              <!-- Compras Realizadas -->
              <div class="card p-3">
                <h4 class="profile-section-title mb-2">${getIcon('tag')} Compras Realizadas (${sales.length})</h4>
                ${sales.length === 0 ? '<p class="text-sm text-muted">Aún no ha concretado compras en el outlet.</p>' : `
                  <div class="profile-subtable">
                    ${sales.map(s => {
                      const veh = allVehicles.find(v => v.id === s.vehicleId) || { brand: 'Vehículo', model: '' };
                      return `
                        <div class="subtable-row">
                          <div>
                            <strong>${veh.brand} ${veh.model}</strong> — Monto final: <span class="font-bold text-orange">${formatCurrency(s.finalAmount)}</span>
                            <div class="text-sm text-muted">Fecha: ${formatDate(s.date, 'short')} · Tipo: ${s.paymentType} · Asesor: ${s.advisor}</div>
                          </div>
                          <span class="badge badge-dark">Vendido</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="profile-close-btn">Cerrar ficha</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => backdrop.remove(), 180);
    };

    backdrop.querySelector('#profile-close').onclick = close;
    backdrop.querySelector('#profile-close-btn').onclick = close;

    // Acción: Registrar nueva visita (sin duplicar ficha)
    backdrop.querySelector('#btn-profile-new-visit').onclick = () => {
      const notes = prompt('Ingresa el motivo u observaciones de la visita de hoy:', 'Visita al showroom para revisión de inventario.');
      if (notes !== null) {
        store.registerClientVisit(client.id, notes || 'Visita registrada.');
        toast.success('Nueva visita registrada con éxito (KPI Invitados actualizado)');
        close();
        this.openClientProfileModal(client.id);
      }
    };

    // Acción: Agregar nota
    backdrop.querySelector('#btn-profile-add-note').onclick = () => {
      const note = prompt('Escribe una nota o seguimiento para el cliente:', '');
      if (note) {
        const updatedComments = `${client.comments ? client.comments + '\n' : ''}[${formatDate(getTodayISO(), 'short')}]: ${note}`;
        store.updateClient(client.id, { comments: updatedComments });
        toast.success('Nota agregada al expediente');
        close();
        this.openClientProfileModal(client.id);
      }
    };

    // Acción: Vincular vehículo
    backdrop.querySelector('#btn-profile-link-veh').onclick = () => {
      this.openLinkVehicleModal(client, () => {
        close();
        this.openClientProfileModal(client.id);
      });
    };

    // Acción: Programar prueba de manejo
    backdrop.querySelector('#btn-profile-testdrive').onclick = () => {
      this.app.modals.openAddTestDriveModal(client.id, null, () => {
        close();
        this.openClientProfileModal(client.id);
      });
    };

    // Acción: Crear solicitud
    backdrop.querySelector('#btn-profile-request').onclick = () => {
      this.app.modals.openAddRequestModal(client.id, null, () => {
        close();
        this.openClientProfileModal(client.id);
      });
    };

    // Acción: Registrar venta
    backdrop.querySelector('#btn-profile-sale').onclick = () => {
      this.app.modals.openAddSaleModal(client.id, null, () => {
        close();
        this.openClientProfileModal(client.id);
      });
    };
  }

  // Modal para vincular vehículo a cliente
  openLinkVehicleModal(client, onDone) {
    const vehicles = store.getVehicles().filter(v => v.status === 'disponible');

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box modal-sm animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Vincular Vehículo de Interés</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <div class="modal-body">
          <p class="text-sm mb-3">Selecciona un vehículo del inventario disponible para vincularlo a <strong>${client.name}</strong>:</p>
          <div class="form-group">
            <select id="link-veh-select" class="input-select">
              ${vehicles.map(v => `
                <option value="${v.id}">${v.brand} ${v.model} ${v.year} — ${formatCurrency(v.price)}</option>
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
      const selectedId = backdrop.querySelector('#link-veh-select').value;
      if (selectedId) {
        store.linkVehicleToClient(client.id, selectedId);
        toast.success('Vehículo vinculado con éxito');
        close();
        if (onDone) onDone();
      }
    };
  }
}
