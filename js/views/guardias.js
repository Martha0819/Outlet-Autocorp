// Vista Guardias y Actividades
import { store } from '../store.js';
import { getIcon } from '../components/icons.js';
import { formatDate, getTodayISO } from '../utils.js';
import { toast, confirmDialog } from '../components/toast.js';

export class GuardiasView {
  constructor(app) {
    this.app = app;
    this.activeTab = 'guardias'; // 'guardias' | 'actividades'
    this.calendarView = 'month'; // 'month' | 'week'
    this.currentDate = new Date();
    this.filterResponsible = 'all';
    this.activityFilterStatus = 'all';
  }

  setTab(tab) {
    if (tab === 'actividades' || tab === 'guardias') {
      this.activeTab = tab;
    }
  }

  render(container) {
    container.innerHTML = `
      <div class="guardias-view animate-fade-in">
        <!-- Pestañas principales -->
        <div class="section-tabs-header">
          <div class="section-tabs">
            <button class="section-tab-btn ${this.activeTab === 'guardias' ? 'active' : ''}" id="tab-btn-guardias">
              ${getIcon('calendar')} <span>Calendario de Guardias</span>
            </button>
            <button class="section-tab-btn ${this.activeTab === 'actividades' ? 'active' : ''}" id="tab-btn-actividades">
              ${getIcon('flip')} <span>Tarjetas de Actividades</span>
            </button>
          </div>

          <div class="tab-action-area">
            <button class="btn btn-primary" id="btn-tab-action">
              ${getIcon('plus')} <span id="btn-tab-action-text">${this.activeTab === 'guardias' ? 'Nueva guardia' : 'Agregar actividad'}</span>
            </button>
          </div>
        </div>

        <!-- Contenedor del contenido según pestaña activa -->
        <div id="guardias-tab-content" class="tab-content-wrapper">
          <!-- Renderizado dinámicamente -->
        </div>

        <!-- Popover / Tooltip flotante para hover en guardias -->
        <div id="shift-popover-card" class="shift-popover card" style="display: none;"></div>
      </div>
    `;

    this.bindGlobalEvents(container);
    this.renderCurrentTab();
  }

  bindGlobalEvents(container) {
    const tabGuardias = container.querySelector('#tab-btn-guardias');
    const tabActividades = container.querySelector('#tab-btn-actividades');
    const btnAction = container.querySelector('#btn-tab-action');
    const btnActionText = container.querySelector('#btn-tab-action-text');

    tabGuardias.addEventListener('click', () => {
      this.activeTab = 'guardias';
      tabGuardias.classList.add('active');
      tabActividades.classList.remove('active');
      btnActionText.textContent = 'Nueva guardia';
      this.renderCurrentTab();
    });

    tabActividades.addEventListener('click', () => {
      this.activeTab = 'actividades';
      tabActividades.classList.add('active');
      tabGuardias.classList.remove('active');
      btnActionText.textContent = 'Agregar actividad';
      this.renderCurrentTab();
    });

    btnAction.addEventListener('click', () => {
      if (this.activeTab === 'guardias') {
        this.openShiftModal();
      } else {
        this.openActivityModal();
      }
    });
  }

  renderCurrentTab() {
    const wrapper = document.getElementById('guardias-tab-content');
    if (!wrapper) return;

    if (this.activeTab === 'guardias') {
      this.renderGuardiasSection(wrapper);
    } else {
      this.renderActividadesSection(wrapper);
    }
  }

  // ==========================================
  // SECCIÓN A: CALENDARIO DE GUARDIAS
  // ==========================================
  renderGuardiasSection(container) {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthName = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' }).format(this.currentDate);

    // Obtener lista única de responsables para el filtro
    const shifts = store.getShifts();
    const allResponsibles = [...new Set(shifts.map(s => s.responsible))].filter(Boolean);

    container.innerHTML = `
      <div class="calendar-section card">
        <!-- Barra de navegación del calendario -->
        <div class="calendar-toolbar">
          <div class="calendar-nav-left">
            <button class="btn btn-outline btn-sm" id="cal-prev-btn" aria-label="Mes anterior">${getIcon('chevronLeft')}</button>
            <button class="btn btn-outline btn-sm font-bold" id="cal-today-btn">Hoy</button>
            <button class="btn btn-outline btn-sm" id="cal-next-btn" aria-label="Mes siguiente">${getIcon('chevronRight')}</button>
            <h3 class="calendar-month-title">${monthName.toUpperCase()}</h3>
          </div>

          <div class="calendar-controls-right">
            <!-- Selector de vista: Mensual o Semanal -->
            <div class="view-switch-group">
              <button class="btn-switch ${this.calendarView === 'month' ? 'active' : ''}" id="switch-month-view">Mes</button>
              <button class="btn-switch ${this.calendarView === 'week' ? 'active' : ''}" id="switch-week-view">Semana</button>
            </div>

            <!-- Filtro por responsable -->
            <div class="calendar-filter">
              <label for="filter-shift-resp" class="sr-only">Filtrar por responsable</label>
              <select id="filter-shift-resp" class="input-select select-sm">
                <option value="all">Todos los responsables</option>
                ${allResponsibles.map(r => `<option value="${r}" ${this.filterResponsible === r ? 'selected' : ''}>${r}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Rejilla del calendario -->
        <div class="calendar-grid-container" id="calendar-grid-container">
          <!-- Calendario mensual o semanal inyectado -->
        </div>

        <!-- Pie explicativo de uso del calendario -->
        <div class="calendar-footer-hint">
          <span>${getIcon('clock')} Pasa el cursor o toca una guardia para ver detalles completos. Haz clic en un día para programar una nueva guardia.</span>
        </div>
      </div>
    `;

    this.bindCalendarEvents(container);
    this.renderCalendarGrid();
  }

  bindCalendarEvents(container) {
    const prevBtn = container.querySelector('#cal-prev-btn');
    const nextBtn = container.querySelector('#cal-next-btn');
    const todayBtn = container.querySelector('#cal-today-btn');
    const switchMonth = container.querySelector('#switch-month-view');
    const switchWeek = container.querySelector('#switch-week-view');
    const filterResp = container.querySelector('#filter-shift-resp');

    prevBtn.addEventListener('click', () => {
      if (this.calendarView === 'month') {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      } else {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
      }
      this.renderCurrentTab();
    });

    nextBtn.addEventListener('click', () => {
      if (this.calendarView === 'month') {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      } else {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
      }
      this.renderCurrentTab();
    });

    todayBtn.addEventListener('click', () => {
      this.currentDate = new Date();
      this.renderCurrentTab();
    });

    switchMonth.addEventListener('click', () => {
      this.calendarView = 'month';
      this.renderCurrentTab();
    });

    switchWeek.addEventListener('click', () => {
      this.calendarView = 'week';
      this.renderCurrentTab();
    });

    filterResp.addEventListener('change', (e) => {
      this.filterResponsible = e.target.value;
      this.renderCalendarGrid();
    });
  }

  renderCalendarGrid() {
    const gridContainer = document.getElementById('calendar-grid-container');
    if (!gridContainer) return;

    if (this.calendarView === 'month') {
      this.renderMonthCalendar(gridContainer);
    } else {
      this.renderWeekCalendar(gridContainer);
    }
  }

  renderMonthCalendar(container) {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Ajuste de inicio de semana a Lunes (0: Dom -> 6, 1: Lun -> 0)
    let startDayOfWeek = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const todayStr = getTodayISO();
    const shifts = store.getShifts();

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    let html = `
      <div class="calendar-month-table">
        <div class="calendar-header-row">
          ${daysOfWeek.map(d => `<div class="calendar-header-cell">${d}</div>`).join('')}
        </div>
        <div class="calendar-body-grid">
    `;

    // Celdas vacías del mes anterior
    for (let i = 0; i < startDayOfWeek; i++) {
      html += `<div class="calendar-day-cell empty-cell"></div>`;
    }

    // Celdas de los días del mes
    for (let day = 1; day <= totalDays; day++) {
      const monthPadded = String(month + 1).padStart(2, '0');
      const dayPadded = String(day).padStart(2, '0');
      const cellDateStr = `${year}-${monthPadded}-${dayPadded}`;
      const isToday = cellDateStr === todayStr;

      // Filtrar guardias correspondientes a este día
      let dayShifts = shifts.filter(s => s.date === cellDateStr);
      if (this.filterResponsible !== 'all') {
        dayShifts = dayShifts.filter(s => s.responsible === this.filterResponsible);
      }

      html += `
        <div class="calendar-day-cell ${isToday ? 'is-today' : ''}" data-date="${cellDateStr}" tabindex="0" role="button" aria-label="Día ${day}">
          <div class="day-number-row">
            <span class="day-number ${isToday ? 'today-pill' : ''}">${day}</span>
            ${isToday ? '<span class="today-tag">Hoy</span>' : ''}
          </div>
          <div class="day-shifts-list">
            ${dayShifts.map(s => {
              const initials = s.responsible.split(' ').map(n => n[0]).slice(0, 2).join('');
              return `
                <div class="shift-pill" data-shift-id="${s.id}" tabindex="0" role="button" style="border-left-color: ${s.color || '#ff8901'};">
                  <span class="shift-avatar" style="background-color: ${s.color || '#ff8901'}">${initials}</span>
                  <div class="shift-info">
                    <span class="shift-time">${s.startTime} - ${s.endTime}</span>
                    <span class="shift-name">${s.responsible}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.bindDayAndShiftInteractions(container);
  }

  renderWeekCalendar(container) {
    const today = new Date(this.currentDate);
    const dayOfWeek = (today.getDay() + 6) % 7; // Lunes = 0
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);

    const shifts = store.getShifts();
    const todayStr = getTodayISO();
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let dayShifts = shifts.filter(s => s.date === dateStr);
      if (this.filterResponsible !== 'all') {
        dayShifts = dayShifts.filter(s => s.responsible === this.filterResponsible);
      }

      days.push({
        name: new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(d),
        dateStr,
        dayNum: d.getDate(),
        isToday: dateStr === todayStr,
        shifts: dayShifts
      });
    }

    let html = `
      <div class="calendar-week-container">
    `;

    days.forEach(d => {
      html += `
        <div class="calendar-week-col ${d.isToday ? 'is-today' : ''}" data-date="${d.dateStr}" tabindex="0">
          <div class="week-col-header">
            <span class="week-day-name">${d.name}</span>
            <span class="week-day-number ${d.isToday ? 'today-pill' : ''}">${d.dayNum}</span>
          </div>
          <div class="week-col-body day-shifts-list">
            ${d.shifts.map(s => {
              const initials = s.responsible.split(' ').map(n => n[0]).slice(0, 2).join('');
              return `
                <div class="shift-pill shift-pill-week" data-shift-id="${s.id}" tabindex="0" role="button" style="border-left-color: ${s.color || '#ff8901'};">
                  <div class="shift-pill-header">
                    <span class="shift-avatar" style="background-color: ${s.color || '#ff8901'}">${initials}</span>
                    <span class="shift-time">${s.startTime} - ${s.endTime}</span>
                  </div>
                  <strong class="shift-name">${s.responsible}</strong>
                  <span class="shift-area-text">${s.area || 'Piso de venta'}</span>
                </div>
              `;
            }).join('')}
            ${d.shifts.length === 0 ? '<div class="no-shifts-hint">Sin guardias</div>' : ''}
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
    this.bindDayAndShiftInteractions(container);
  }

  // Interacción con las guardias (hover, click, teclado)
  bindDayAndShiftInteractions(container) {
    const popover = document.getElementById('shift-popover-card');

    // Click en celda de día para crear guardia
    const dayCells = container.querySelectorAll('.calendar-day-cell, .calendar-week-col');
    dayCells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        // Si se hizo click directamente en una guardia, no abrir crear guardia
        if (e.target.closest('.shift-pill')) return;
        const date = cell.getAttribute('data-date');
        if (date) {
          this.openShiftModal(null, date);
        }
      });
    });

    // Interacciones con cada píldora de guardia
    const shiftPills = container.querySelectorAll('.shift-pill');
    shiftPills.forEach(pill => {
      const shiftId = pill.getAttribute('data-shift-id');
      const shift = store.getShifts().find(s => s.id === shiftId);
      if (!shift) return;

      // Hover para mostrar popover con datos completos
      pill.addEventListener('mouseenter', (e) => {
        this.showShiftPopover(e, shift, popover);
      });

      pill.addEventListener('mouseleave', () => {
        popover.style.display = 'none';
      });

      // Click para consultar / editar
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        popover.style.display = 'none';
        this.openShiftModal(shift);
      });

      // Accesibilidad teclado
      pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          this.openShiftModal(shift);
        }
      });
    });
  }

  showShiftPopover(e, shift, popover) {
    popover.innerHTML = `
      <div class="popover-header" style="border-top: 3px solid ${shift.color || '#ff8901'}">
        <h4 class="popover-title">${shift.responsible}</h4>
        <span class="badge badge-primary">${shift.area || 'Guardia'}</span>
      </div>
      <div class="popover-body">
        <div class="popover-detail">
          <span class="popover-icon">${getIcon('calendar')}</span>
          <span>${formatDate(shift.date, 'long')}</span>
        </div>
        <div class="popover-detail">
          <span class="popover-icon">${getIcon('clock')}</span>
          <span><strong>${shift.startTime} - ${shift.endTime}</strong></span>
        </div>
        <div class="popover-detail">
          <span class="popover-icon">${getIcon('phone')}</span>
          <span>${shift.phone || 'No registrado'}</span>
        </div>
        <div class="popover-detail">
          <span class="popover-icon">${getIcon('mail')}</span>
          <span>${shift.email || 'No registrado'}</span>
        </div>
        ${shift.observations ? `
          <div class="popover-obs">
            <em>"${shift.observations}"</em>
          </div>
        ` : ''}
      </div>
      <div class="popover-footer">
        <small>Haz clic para editar guardia</small>
      </div>
    `;

    popover.style.display = 'block';
    const rect = e.target.getBoundingClientRect();
    const popoverWidth = 280;

    let left = rect.right + 10;
    if (left + popoverWidth > window.innerWidth) {
      left = rect.left - popoverWidth - 10;
    }
    let top = rect.top - 20;
    if (top + 250 > window.innerHeight) {
      top = window.innerHeight - 260;
    }

    popover.style.left = `${Math.max(left, 10)}px`;
    popover.style.top = `${Math.max(top, 10)}px`;
  }

  // Modal para crear o editar guardia
  openShiftModal(shift = null, defaultDate = null) {
    const isEdit = !!shift;
    const dateVal = shift ? shift.date : (defaultDate || getTodayISO());

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Editar Guardia' : 'Programar Nueva Guardia'}</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="shift-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label for="shift-date" class="form-label required">Fecha de guardia</label>
              <input type="date" id="shift-date" class="input-text" value="${dateVal}" required />
            </div>

            <div class="form-group full-width">
              <label for="shift-responsible" class="form-label required">Responsable</label>
              <input type="text" id="shift-responsible" class="input-text" value="${shift ? shift.responsible : ''}" placeholder="Ej. Carlos Morales" required />
            </div>

            <div class="form-group half-width">
              <label for="shift-start" class="form-label required">Horario de inicio</label>
              <input type="time" id="shift-start" class="input-text" value="${shift ? shift.startTime : '09:00'}" required />
            </div>

            <div class="form-group half-width">
              <label for="shift-end" class="form-label required">Horario de fin</label>
              <input type="time" id="shift-end" class="input-text" value="${shift ? shift.endTime : '15:00'}" required />
            </div>

            <div class="form-group half-width">
              <label for="shift-phone" class="form-label">Celular de contacto</label>
              <input type="tel" id="shift-phone" class="input-text" value="${shift ? (shift.phone || '') : ''}" placeholder="10 dígitos" />
            </div>

            <div class="form-group half-width">
              <label for="shift-email" class="form-label">Correo electrónico</label>
              <input type="email" id="shift-email" class="input-text" value="${shift ? (shift.email || '') : ''}" placeholder="correo@autocorp.mx" />
            </div>

            <div class="form-group full-width">
              <label for="shift-area" class="form-label">Área o función asignada</label>
              <select id="shift-area" class="input-select">
                <option value="Recepción y Piso de Ventas" ${shift && shift.area === 'Recepción y Piso de Ventas' ? 'selected' : ''}>Recepción y Piso de Ventas</option>
                <option value="Cierre y Supervisión de Patio" ${shift && shift.area === 'Cierre y Supervisión de Patio' ? 'selected' : ''}>Cierre y Supervisión de Patio</option>
                <option value="Valuación y Entregas VIP" ${shift && shift.area === 'Valuación y Entregas VIP' ? 'selected' : ''}>Valuación y Entregas VIP</option>
                <option value="Mesa de Control y Crédito" ${shift && shift.area === 'Mesa de Control y Crédito' ? 'selected' : ''}>Mesa de Control y Crédito</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="shift-obs" class="form-label">Observaciones</label>
              <textarea id="shift-obs" class="input-textarea input-italic" rows="3" placeholder="Instrucciones especiales o notas de la guardia">${shift ? (shift.observations || '') : ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            ${isEdit ? `<button type="button" class="btn btn-danger btn-sm" id="btn-delete-shift">${getIcon('trash')} Eliminar</button>` : '<div></div>'}
            <div class="footer-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Crear Guardia'}</button>
            </div>
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

    if (isEdit) {
      backdrop.querySelector('#btn-delete-shift').onclick = async () => {
        const confirmed = await confirmDialog({
          title: '¿Eliminar guardia?',
          message: `¿Estás seguro de que deseas eliminar la guardia de ${shift.responsible} del día ${formatDate(shift.date)}?`,
          confirmText: 'Sí, eliminar',
          isDestructive: true
        });

        if (confirmed) {
          store.deleteShift(shift.id);
          toast.success('Guardia eliminada correctamente');
          close();
          this.renderCalendarGrid();
        }
      };
    }

    const form = backdrop.querySelector('#shift-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const payload = {
        date: form.querySelector('#shift-date').value,
        responsible: form.querySelector('#shift-responsible').value.trim(),
        startTime: form.querySelector('#shift-start').value,
        endTime: form.querySelector('#shift-end').value,
        phone: form.querySelector('#shift-phone').value.trim(),
        email: form.querySelector('#shift-email').value.trim(),
        area: form.querySelector('#shift-area').value,
        observations: form.querySelector('#shift-obs').value.trim()
      };

      if (!payload.date || !payload.responsible) {
        toast.error('Por favor completa la fecha y el responsable.');
        return;
      }

      if (isEdit) {
        store.updateShift(shift.id, payload);
        toast.success('Guardia actualizada exitosamente');
      } else {
        store.addShift(payload);
        toast.success('Guardia programada exitosamente');
      }

      close();
      this.renderCalendarGrid();
    };
  }

  // ==========================================
  // SECCIÓN B: TARJETAS DE ACTIVIDADES (3D FLIP)
  // ==========================================
  renderActividadesSection(container) {
    const activities = store.getActivities();

    let filteredActivities = activities;
    if (this.activityFilterStatus !== 'all') {
      filteredActivities = activities.filter(a => a.status === this.activityFilterStatus);
    }

    container.innerHTML = `
      <div class="activities-section card">
        <div class="activities-toolbar">
          <div class="toolbar-info">
            <h3 class="activities-heading">Actividades Operativas de la Sucursal</h3>
            <p class="activities-sub">Acerca el puntero o toca una tarjeta para girarla y consultar su reverso con detalles y acciones.</p>
          </div>

          <div class="activities-filter-group">
            <label for="filter-act-status" class="sr-only">Filtrar por estado</label>
            <select id="filter-act-status" class="input-select select-sm">
              <option value="all" ${this.activityFilterStatus === 'all' ? 'selected' : ''}>Todos los estados</option>
              <option value="pendiente" ${this.activityFilterStatus === 'pendiente' ? 'selected' : ''}>Pendientes</option>
              <option value="en_proceso" ${this.activityFilterStatus === 'en_proceso' ? 'selected' : ''}>En proceso</option>
              <option value="completada" ${this.activityFilterStatus === 'completada' ? 'selected' : ''}>Completadas</option>
            </select>
          </div>
        </div>

        <!-- Cuadrícula de tarjetas con efecto de giro 3D -->
        <div class="activities-grid" id="activities-cards-grid">
          ${filteredActivities.map(act => this.renderFlipCard(act)).join('')}
        </div>

        ${filteredActivities.length === 0 ? `
          <div class="empty-state-box">
            <p>No se encontraron actividades con el estado seleccionado.</p>
            <button class="btn btn-outline btn-sm" id="btn-reset-act-filter">Ver todas las actividades</button>
          </div>
        ` : ''}
      </div>
    `;

    this.bindActivityCardsEvents(container);
  }

  renderFlipCard(act) {
    let statusClass = 'badge-warning';
    let statusLabel = 'Pendiente';
    let statusIcon = getIcon('clock');

    if (act.status === 'en_proceso') {
      statusClass = 'badge-info';
      statusLabel = 'En proceso';
      statusIcon = getIcon('refresh');
    } else if (act.status === 'completada') {
      statusClass = 'badge-success';
      statusLabel = 'Completada';
      statusIcon = getIcon('checkCircle');
    }

    const iconSvg = getIcon(act.iconType || 'gestion');

    return `
      <div class="flip-card-wrapper" data-act-id="${act.id}" tabindex="0" role="region" aria-label="Actividad: ${act.title}">
        <div class="flip-card-inner">
          <!-- FRENTE DE LA TARJETA -->
          <div class="flip-card-face flip-card-front">
            <div class="front-header">
              <div class="activity-icon-container">
                ${iconSvg}
              </div>
              <span class="badge ${statusClass}">
                ${statusIcon} <span>${statusLabel}</span>
              </span>
            </div>

            <div class="front-body">
              <h4 class="activity-title">${act.title}</h4>
            </div>

            <div class="front-footer">
              <div class="activity-schedule">
                <span class="icon-sm">${getIcon('clock')}</span>
                <span>${act.time || '09:00'} · ${formatDate(act.date, 'short')}</span>
              </div>
              <button class="btn-flip-hint" aria-label="Girar tarjeta">
                ${getIcon('flip')}
              </button>
            </div>
          </div>

          <!-- REVERSO DE LA TARJETA -->
          <div class="flip-card-face flip-card-back">
            <div class="back-header">
              <span class="back-responsable-label">Responsable</span>
              <h4 class="back-responsable-name">${act.responsible}</h4>
            </div>

            <div class="back-body">
              <p class="back-description">${act.description || 'Sin descripción detallada.'}</p>
              
              <div class="back-meta-item">
                <span class="meta-label">Fecha y horario:</span>
                <span class="meta-val">${formatDate(act.date, 'short')} a las ${act.time || '09:00'}</span>
              </div>

              ${act.observations ? `
                <div class="back-obs-box">
                  <span class="meta-label">Observaciones:</span>
                  <p class="back-obs-text input-italic">${act.observations}</p>
                </div>
              ` : ''}
            </div>

            <div class="back-footer">
              <!-- Selector rápido de estado -->
              <div class="status-quick-switch">
                <select class="select-act-status input-select select-xs" data-act-id="${act.id}">
                  <option value="pendiente" ${act.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                  <option value="en_proceso" ${act.status === 'en_proceso' ? 'selected' : ''}>En proceso</option>
                  <option value="completada" ${act.status === 'completada' ? 'selected' : ''}>Completada</option>
                </select>
              </div>

              <div class="back-actions">
                <button class="btn-icon-xs btn-edit-activity" data-act-id="${act.id}" title="Editar actividad">${getIcon('edit')}</button>
                <button class="btn-icon-xs btn-return-front" title="Volver al frente">${getIcon('arrowRight')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindActivityCardsEvents(container) {
    const filterSelect = container.querySelector('#filter-act-status');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.activityFilterStatus = e.target.value;
        this.renderActividadesSection(container);
      });
    }

    const resetFilterBtn = container.querySelector('#btn-reset-act-filter');
    if (resetFilterBtn) {
      resetFilterBtn.addEventListener('click', () => {
        this.activityFilterStatus = 'all';
        this.renderActividadesSection(container);
      });
    }

    const cards = container.querySelectorAll('.flip-card-wrapper');
    cards.forEach(card => {
      const actId = card.getAttribute('data-act-id');
      const inner = card.querySelector('.flip-card-inner');
      const flipBtn = card.querySelector('.btn-flip-hint');
      const returnBtn = card.querySelector('.btn-return-front');
      const statusSelect = card.querySelector('.select-act-status');
      const editBtn = card.querySelector('.btn-edit-activity');

      // Giro en mobile o clic en botón
      const toggleFlip = (force) => {
        if (typeof force === 'boolean') {
          inner.classList.toggle('is-flipped', force);
        } else {
          inner.classList.toggle('is-flipped');
        }
      };

      if (flipBtn) {
        flipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFlip(true);
        });
      }

      if (returnBtn) {
        returnBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFlip(false);
        });
      }

      // En dispositivos táctiles, tocar la tarjeta hace flip
      card.addEventListener('click', (e) => {
        if (e.target.closest('select') || e.target.closest('button')) return;
        toggleFlip();
      });

      // Accesibilidad con teclado (Enter o Espacio)
      card.addEventListener('keydown', (e) => {
        if (e.target.closest('select') || e.target.closest('button')) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFlip();
        }
      });

      // Cambio rápido de estado desde el reverso
      if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
          e.stopPropagation();
          const newStatus = e.target.value;
          store.updateActivity(actId, { status: newStatus });
          toast.success(`Estado actualizado a: ${newStatus}`);
          this.renderActividadesSection(container);
        });
      }

      // Botón editar
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const act = store.getActivities().find(a => a.id === actId);
          if (act) {
            this.openActivityModal(act);
          }
        });
      }
    });
  }

  // Modal para agregar o editar actividad
  openActivityModal(act = null) {
    const isEdit = !!act;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.innerHTML = `
      <div class="modal-box animate-scale-up" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Editar Actividad' : 'Nueva Actividad Operativa'}</h3>
          <button class="modal-close-btn" id="modal-close">${getIcon('close')}</button>
        </div>
        <form id="activity-form">
          <div class="modal-body form-grid">
            <div class="form-group full-width">
              <label for="act-title" class="form-label required">Nombre de la actividad</label>
              <input type="text" id="act-title" class="input-text" value="${act ? act.title : ''}" placeholder="Ej. Revisión técnica de autos en patio" required />
            </div>

            <div class="form-group half-width">
              <label for="act-icon" class="form-label required">Icono representativo</label>
              <select id="act-icon" class="input-select" required>
                <option value="apertura" ${act && act.iconType === 'apertura' ? 'selected' : ''}>Apertura (Llave)</option>
                <option value="seguridad" ${act && act.iconType === 'seguridad' ? 'selected' : ''}>Seguridad (Escudo)</option>
                <option value="limpieza" ${act && act.iconType === 'limpieza' ? 'selected' : ''}>Limpieza (Escoba)</option>
                <option value="cierre" ${act && act.iconType === 'cierre' ? 'selected' : ''}>Cierre (Candado)</option>
                <option value="revision" ${act && act.iconType === 'revision' ? 'selected' : ''}>Revisión de autos (Herramienta)</option>
                <option value="recepcion" ${act && act.iconType === 'recepcion' ? 'selected' : ''}>Recepción (Saludo / Clientes)</option>
                <option value="gestion" ${act && act.iconType === 'gestion' ? 'selected' : ''}>Gestión y Auditoría</option>
              </select>
            </div>

            <div class="form-group half-width">
              <label for="act-status" class="form-label required">Estado actual</label>
              <select id="act-status" class="input-select" required>
                <option value="pendiente" ${act && act.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="en_proceso" ${act && act.status === 'en_proceso' ? 'selected' : ''}>En proceso</option>
                <option value="completada" ${act && act.status === 'completada' ? 'selected' : ''}>Completada</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="act-responsible" class="form-label required">Responsable</label>
              <input type="text" id="act-responsible" class="input-text" value="${act ? act.responsible : ''}" placeholder="Ej. Carlos Morales" required />
            </div>

            <div class="form-group half-width">
              <label for="act-date" class="form-label required">Fecha asignada</label>
              <input type="date" id="act-date" class="input-text" value="${act ? act.date : getTodayISO()}" required />
            </div>

            <div class="form-group half-width">
              <label for="act-time" class="form-label required">Horario</label>
              <input type="time" id="act-time" class="input-text" value="${act ? act.time : '10:00'}" required />
            </div>

            <div class="form-group full-width">
              <label for="act-desc" class="form-label">Descripción</label>
              <textarea id="act-desc" class="input-textarea" rows="2" placeholder="Detalle de lo que involucra la actividad">${act ? (act.description || '') : ''}</textarea>
            </div>

            <div class="form-group full-width">
              <label for="act-obs" class="form-label">Observaciones</label>
              <textarea id="act-obs" class="input-textarea input-italic" rows="2" placeholder="Notas adicionales o seguimiento">${act ? (act.observations || '') : ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            ${isEdit ? `<button type="button" class="btn btn-danger btn-sm" id="btn-delete-act">${getIcon('trash')} Eliminar</button>` : '<div></div>'}
            <div class="footer-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel">Cancelar</button>
              <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar Cambios' : 'Agregar Actividad'}</button>
            </div>
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

    if (isEdit) {
      backdrop.querySelector('#btn-delete-act').onclick = async () => {
        const confirmed = await confirmDialog({
          title: '¿Eliminar actividad?',
          message: `¿Estás seguro de que deseas eliminar la actividad "${act.title}"?`,
          confirmText: 'Sí, eliminar',
          isDestructive: true
        });

        if (confirmed) {
          store.deleteActivity(act.id);
          toast.success('Actividad eliminada correctamente');
          close();
          const wrapper = document.getElementById('guardias-tab-content');
          if (wrapper) this.renderActividadesSection(wrapper);
        }
      };
    }

    const form = backdrop.querySelector('#activity-form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const payload = {
        title: form.querySelector('#act-title').value.trim(),
        iconType: form.querySelector('#act-icon').value,
        status: form.querySelector('#act-status').value,
        responsible: form.querySelector('#act-responsible').value.trim(),
        date: form.querySelector('#act-date').value,
        time: form.querySelector('#act-time').value,
        description: form.querySelector('#act-desc').value.trim(),
        observations: form.querySelector('#act-obs').value.trim()
      };

      if (!payload.title || !payload.responsible) {
        toast.error('Por favor completa el nombre de la actividad y el responsable.');
        return;
      }

      if (isEdit) {
        store.updateActivity(act.id, payload);
        toast.success('Actividad actualizada exitosamente');
      } else {
        store.addActivity(payload);
        toast.success('Actividad agregada exitosamente');
      }

      close();
      const wrapper = document.getElementById('guardias-tab-content');
      if (wrapper) this.renderActividadesSection(wrapper);
    };
  }
}
