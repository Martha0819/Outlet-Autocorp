// Gestor de Modales Comerciales Conectados (Invitados, Pruebas de Manejo, Solicitudes, Ventas)
import { store } from '../store.js';
import { getIcon } from './icons.js';
import { formatCurrency, getTodayISO, validatePhone, validateEmail } from '../utils.js';
import { toast } from './toast.js';

export class ModalManager {
  constructor(app) {
    this.app = app;
  }

  // ==========================================
  // MODAL: REGISTRAR INVITADO / VISITA
  // ==========================================
  openAddGuestModal() {
    const clients = store.getClients();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Registrar Invitado / Visita</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="guest-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label class="form-label required">Tipo de registro</label>
              <div class="d-flex gap-4">
                <label class="radio-label">
                  <input type="radio" name="guest_type" value="new" checked />
                  <span>Nuevo prospecto / visitante</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="guest_type" value="existing" />
                  <span>Cliente ya registrado (nueva visita)</span>
                </label>
              </div>
            </div>

            <!-- Sección: Cliente Existente -->
            <div class="form-group full-width" id="existing-client-group" style="display: none;">
              <label for="existing-client-select" class="form-label required">Selecciona el cliente</label>
              <select id="existing-client-select" class="input-select">
                ${clients.map(c => `
                  <option value="${c.id}">${c.name} — ${c.phone}</option>
                `).join('')}
              </select>
            </div>

            <!-- Sección: Nuevo Cliente -->
            <div id="new-client-fields" class="form-grid full-width" style="margin: 0; padding: 0;">
              <!-- Alerta de posible duplicado -->
              <div id="guest-dupe-warning" class="alert-box alert-warning full-width" style="display: none;">
                <div class="alert-icon">${getIcon('alertCircle')}</div>
                <div class="alert-content">
                  <strong class="text-sm">Aviso de duplicado:</strong>
                  <p id="guest-dupe-text" class="text-xs"></p>
                </div>
              </div>

              <div class="form-group full-width">
                <label for="guest-name" class="form-label required">Nombre completo del invitado</label>
                <input type="text" id="guest-name" class="input-text" placeholder="Ej. Mariana López" required />
              </div>

              <div class="form-group half-width">
                <label for="guest-phone" class="form-label required">Celular (10 dígitos)</label>
                <input type="tel" id="guest-phone" class="input-text" placeholder="Ej. 5512345678" required />
              </div>

              <div class="form-group half-width">
                <label for="guest-email" class="form-label">Correo electrónico</label>
                <input type="email" id="guest-email" class="input-text" placeholder="correo@ejemplo.com" />
              </div>

              <div class="form-group half-width">
                <label for="guest-has-brand" class="form-label required">¿Busca marca específica?</label>
                <select id="guest-has-brand" class="input-select">
                  <option value="no">Sin preferencia</option>
                  <option value="si">Sí, marca en específico</option>
                </select>
              </div>

              <div class="form-group half-width" id="guest-brand-group" style="display: none;">
                <label for="guest-brand" class="form-label">Marca de interés</label>
                <select id="guest-brand" class="input-select">
                  <option value="Nissan">Nissan</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Ford">Ford</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="KIA">KIA</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="BMW">BMW</option>
                </select>
              </div>
            </div>

            <!-- Notas de la visita de hoy -->
            <div class="form-group full-width">
              <label for="guest-notes" class="form-label required">Motivo / Notas de la visita de hoy</label>
              <input type="text" id="guest-notes" class="input-text input-italic" value="Visita inicial al showroom para conocer inventario." required />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">Registrar Visita</button>
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

    const radios = backdrop.querySelectorAll('input[name="guest_type"]');
    const existingGroup = backdrop.querySelector('#existing-client-group');
    const newFields = backdrop.querySelector('#new-client-fields');
    const guestHasBrand = backdrop.querySelector('#guest-has-brand');
    const guestBrandGroup = backdrop.querySelector('#guest-brand-group');
    const phoneInput = backdrop.querySelector('#guest-phone');
    const emailInput = backdrop.querySelector('#guest-email');
    const dupeWarning = backdrop.querySelector('#guest-dupe-warning');
    const dupeText = backdrop.querySelector('#guest-dupe-text');

    radios.forEach(r => {
      r.addEventListener('change', () => {
        if (r.value === 'existing') {
          existingGroup.style.display = 'block';
          newFields.style.display = 'none';
          backdrop.querySelector('#guest-name').removeAttribute('required');
          backdrop.querySelector('#guest-phone').removeAttribute('required');
        } else {
          existingGroup.style.display = 'none';
          newFields.style.display = 'grid';
          backdrop.querySelector('#guest-name').setAttribute('required', 'true');
          backdrop.querySelector('#guest-phone').setAttribute('required', 'true');
        }
      });
    });

    guestHasBrand.addEventListener('change', () => {
      guestBrandGroup.style.display = guestHasBrand.value === 'si' ? 'block' : 'none';
    });

    const checkGuestDupes = () => {
      const phone = phoneInput.value.trim();
      const email = emailInput.value.trim();
      const duplicate = store.checkDuplicateClient(phone, email);
      if (duplicate) {
        dupeWarning.style.display = 'flex';
        dupeText.textContent = `Coincide con "${duplicate.name}" (${duplicate.phone}). Te sugerimos cambiar a 'Cliente ya registrado' para no duplicar su ficha.`;
      } else {
        dupeWarning.style.display = 'none';
      }
    };

    phoneInput.addEventListener('input', checkGuestDupes);
    emailInput.addEventListener('input', checkGuestDupes);

    const form = backdrop.querySelector('#guest-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const type = form.querySelector('input[name="guest_type"]:checked').value;
      const notes = form.querySelector('#guest-notes').value.trim();

      if (type === 'existing') {
        const clientId = form.querySelector('#existing-client-select').value;
        store.registerClientVisit(clientId, notes || 'Visita registrada.');
        toast.success('Visita registrada con éxito. Se actualizó el KPI de Invitados.');
      } else {
        const name = form.querySelector('#guest-name').value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim();
        const hasBrand = guestHasBrand.value;
        const brand = hasBrand === 'si' ? form.querySelector('#guest-brand').value : '';

        if (!validatePhone(phone)) {
          toast.error('El número de celular debe ser de 10 dígitos.');
          return;
        }

        if (email && !validateEmail(email)) {
          toast.error('El formato de correo no es válido.');
          return;
        }

        store.addClient({
          name,
          phone,
          email,
          hasBrandPreference: hasBrand,
          preferredBrand: brand,
          comments: notes
        });
        toast.success(`Nuevo prospecto ${name} registrado y visita contabilizada en KPIs.`);
      }

      close();
      this.app.refreshCurrentView();
    };
  }

  // ==========================================
  // MODAL: PROGRAMAR PRUEBA DE MANEJO
  // ==========================================
  openAddTestDriveModal(defaultClientId = null, defaultVehicleId = null, onComplete = null) {
    const clients = store.getClients();
    const vehicles = store.getVehicles();
    const advisors = store.data.advisors || [];

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Programar Prueba de Manejo</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="td-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label for="td-client" class="form-label required">Cliente</label>
              <select id="td-client" class="input-select" required>
                ${clients.map(c => `
                  <option value="${c.id}" ${defaultClientId === c.id ? 'selected' : ''}>${c.name} (${c.phone})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group full-width">
              <label for="td-vehicle" class="form-label required">Vehículo a evaluar</label>
              <select id="td-vehicle" class="input-select" required>
                ${vehicles.map(v => `
                  <option value="${v.id}" ${defaultVehicleId === v.id ? 'selected' : ''}>
                    ${v.brand} ${v.model} ${v.year} — ${formatCurrency(v.price)} [${v.status}]
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="td-date" class="form-label required">Fecha</label>
              <input type="date" id="td-date" class="input-text" value="${getTodayISO()}" required />
            </div>

            <div class="form-group half-width">
              <label for="td-time" class="form-label required">Horario</label>
              <input type="time" id="td-time" class="input-text" value="16:00" required />
            </div>

            <div class="form-group half-width">
              <label for="td-advisor" class="form-label required">Asesor de guardia / responsable</label>
              <select id="td-advisor" class="input-select" required>
                ${advisors.map(a => `<option value="${a.name}">${a.name} (${a.role})</option>`).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="td-status" class="form-label required">Estado</label>
              <select id="td-status" class="input-select" required>
                <option value="Programada" selected>Programada</option>
                <option value="Realizada">Realizada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="td-notes" class="form-label">Ruta u observaciones previas</label>
              <textarea id="td-notes" class="input-textarea input-italic" rows="2" placeholder="Ruta urbana de 20 minutos, verificar licencia vigente..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">Agendar Prueba de Manejo</button>
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

    backdrop.querySelector('#td-form').onsubmit = (e) => {
      e.preventDefault();
      const form = backdrop.querySelector('#td-form');
      const payload = {
        clientId: form.querySelector('#td-client').value,
        vehicleId: form.querySelector('#td-vehicle').value,
        date: form.querySelector('#td-date').value,
        time: form.querySelector('#td-time').value,
        responsible: form.querySelector('#td-advisor').value,
        status: form.querySelector('#td-status').value,
        notes: form.querySelector('#td-notes').value.trim()
      };

      store.addTestDrive(payload);
      toast.success('Prueba de manejo programada y vinculada exitosamente');
      close();
      if (onComplete) onComplete();
      this.app.refreshCurrentView();
    };
  }

  // ==========================================
  // MODAL: CREAR SOLICITUD DE COMPRA / CRÉDITO
  // ==========================================
  openAddRequestModal(defaultClientId = null, defaultVehicleId = null, onComplete = null) {
    const clients = store.getClients();
    const vehicles = store.getVehicles();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Crear Solicitud de Compra / Financiamiento</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="req-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label for="req-client" class="form-label required">Cliente solicitante</label>
              <select id="req-client" class="input-select" required>
                ${clients.map(c => `
                  <option value="${c.id}" ${defaultClientId === c.id ? 'selected' : ''}>${c.name} (${c.phone})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group full-width">
              <label for="req-vehicle" class="form-label required">Vehículo solicitado</label>
              <select id="req-vehicle" class="input-select" required>
                ${vehicles.map(v => `
                  <option value="${v.id}" ${defaultVehicleId === v.id ? 'selected' : ''}>
                    ${v.brand} ${v.model} ${v.year} — ${formatCurrency(v.price)} [${v.status}]
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="req-type" class="form-label required">Modalidad</label>
              <select id="req-type" class="input-select" required>
                <option value="Financiamiento" selected>Financiamiento bancario / casa</option>
                <option value="Contado">Contado directo</option>
                <option value="Arrendamiento">Arrendamiento puro (Leasing)</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="req-down" class="form-label required">Enganche planeado ($ MXN)</label>
              <input type="number" id="req-down" class="input-text font-bold text-orange" min="0" step="1000" value="80000" required />
            </div>

            <div class="form-group half-width">
              <label for="req-date" class="form-label required">Fecha de solicitud</label>
              <input type="date" id="req-date" class="input-text" value="${getTodayISO()}" required />
            </div>

            <div class="form-group half-width">
              <label for="req-status" class="form-label required">Estado de la solicitud</label>
              <select id="req-status" class="input-select" required>
                <option value="Pendiente" selected>Pendiente de análisis</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Rechazada">Rechazada</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="req-notes" class="form-label">Institución bancaria y notas</label>
              <textarea id="req-notes" class="input-textarea input-italic" rows="2" placeholder="Banco Santander, plazo a 48 meses, entrega de comprobantes fiscales..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-primary">Registrar Solicitud</button>
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

    backdrop.querySelector('#req-form').onsubmit = (e) => {
      e.preventDefault();
      const form = backdrop.querySelector('#req-form');
      const payload = {
        clientId: form.querySelector('#req-client').value,
        vehicleId: form.querySelector('#req-vehicle').value,
        type: form.querySelector('#req-type').value,
        downPaymentPlanned: Number(form.querySelector('#req-down').value),
        date: form.querySelector('#req-date').value,
        status: form.querySelector('#req-status').value,
        notes: form.querySelector('#req-notes').value.trim()
      };

      store.addRequest(payload);
      toast.success('Solicitud registrada con éxito. Se actualizó el KPI de Solicitudes.');
      close();
      if (onComplete) onComplete();
      this.app.refreshCurrentView();
    };
  }

  // ==========================================
  // MODAL: REGISTRAR VENTA DEFINITIVA
  // ==========================================
  openAddSaleModal(defaultClientId = null, defaultVehicleId = null, onComplete = null) {
    const clients = store.getClients();
    // Excluir vehículos ya vendidos
    const availableVehicles = store.getVehicles().filter(v => v.status !== 'vendido');
    const advisors = store.data.advisors || [];

    if (availableVehicles.length === 0) {
      toast.warning('No hay vehículos disponibles o apartados para vender en este momento.');
      return;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box modal-lg animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">Registrar Venta de Vehículo</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="sale-form">
          <div class="modal-body form-grid">
            <div class="alert-box alert-info full-width">
              <div class="alert-icon">${getIcon('dollarSign')}</div>
              <div class="alert-content">
                <strong>Confirmación de Cierre Comercial:</strong>
                <p class="text-xs">Al registrar la venta, el vehículo pasará automáticamente a estado <strong>Vendido</strong> y se actualizarán los KPIs de Ventas e Inventario.</p>
              </div>
            </div>

            <div class="form-group half-width">
              <label for="sale-client" class="form-label required">Cliente comprador</label>
              <select id="sale-client" class="input-select" required>
                ${clients.map(c => `
                  <option value="${c.id}" ${defaultClientId === c.id ? 'selected' : ''}>${c.name} (${c.phone})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="sale-vehicle" class="form-label required">Vehículo vendido</label>
              <select id="sale-vehicle" class="input-select" required>
                ${availableVehicles.map(v => `
                  <option value="${v.id}" data-price="${v.price}" ${defaultVehicleId === v.id ? 'selected' : ''}>
                    ${v.brand} ${v.model} ${v.year} — ${formatCurrency(v.price)} (${v.status})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="sale-amount" class="form-label required">Monto final de venta ($ MXN)</label>
              <input type="number" id="sale-amount" class="input-text font-bold" min="1000" step="1000" required />
            </div>

            <div class="form-group half-width">
              <label for="sale-paytype" class="form-label required">Forma de pago</label>
              <select id="sale-paytype" class="input-select" required>
                <option value="Financiamiento Banorte">Financiamiento Banorte</option>
                <option value="Financiamiento Santander">Financiamiento Santander</option>
                <option value="Financiamiento BBVA">Financiamiento BBVA</option>
                <option value="Transferencia SPEI Contado">Transferencia SPEI Contado</option>
                <option value="Crédito de Casa Autocorp">Crédito de Casa Autocorp</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="sale-advisor" class="form-label required">Asesor comercial que cerró la venta</label>
              <select id="sale-advisor" class="input-select" required>
                ${advisors.map(a => `<option value="${a.name}">${a.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group half-width">
              <label for="sale-date" class="form-label required">Fecha de factura / venta</label>
              <input type="date" id="sale-date" class="input-text" value="${getTodayISO()}" required />
            </div>

            <div class="form-group full-width">
              <label for="sale-notes" class="form-label">Observaciones y entrega</label>
              <textarea id="sale-notes" class="input-textarea input-italic" rows="2" placeholder="Garantía de 1 año, entrega programada en sala VIP, kit de seguridad incluido..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn-dark">Confirmar Venta y Facturación</button>
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

    const vehSelect = backdrop.querySelector('#sale-vehicle');
    const amountInput = backdrop.querySelector('#sale-amount');

    const updatePrice = () => {
      const selectedOption = vehSelect.options[vehSelect.selectedIndex];
      if (selectedOption) {
        amountInput.value = selectedOption.getAttribute('data-price') || 350000;
      }
    };
    vehSelect.addEventListener('change', updatePrice);
    updatePrice();

    backdrop.querySelector('#sale-form').onsubmit = (e) => {
      e.preventDefault();
      const form = backdrop.querySelector('#sale-form');
      const vehicleId = vehSelect.value;
      const finalAmount = Number(amountInput.value);

      try {
        store.addSale({
          clientId: form.querySelector('#sale-client').value,
          vehicleId,
          finalAmount,
          paymentType: form.querySelector('#sale-paytype').value,
          advisor: form.querySelector('#sale-advisor').value,
          date: form.querySelector('#sale-date').value,
          notes: form.querySelector('#sale-notes').value.trim()
        });

        toast.success(`¡Venta cerrada con éxito por ${formatCurrency(finalAmount)}! Vehículo marcado como Vendido.`);
        close();
        if (onComplete) onComplete();
        this.app.refreshCurrentView();
      } catch (err) {
        toast.error(err.message || 'Error al procesar la venta.');
      }
    };
  }
}
