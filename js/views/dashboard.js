// Vista General — Dashboard
import { store } from '../store.js';
import { getIcon } from '../components/icons.js';
import { formatCurrency, formatNumber, formatDate, isDateInPeriod, isDateInPreviousPeriod } from '../utils.js';
import { renderSalesChart, renderFunnelChart } from '../components/charts.js';

export class DashboardView {
  constructor(app) {
    this.app = app;
    this.currentPeriod = 'month'; // 'today', 'week', 'month', 'custom'
    this.customStart = '';
    this.customEnd = '';
  }

  render(container) {
    container.innerHTML = `
      <div class="dashboard-view animate-fade-in">
        <!-- Barra de herramientas: Filtros de fecha y Accesos rápidos -->
        <div class="dashboard-toolbar">
          <div class="period-filter-group">
            <span class="filter-label">Periodo:</span>
            <div class="period-buttons">
              <button class="btn-period ${this.currentPeriod === 'today' ? 'active' : ''}" data-period="today">Hoy</button>
              <button class="btn-period ${this.currentPeriod === 'week' ? 'active' : ''}" data-period="week">Esta semana</button>
              <button class="btn-period ${this.currentPeriod === 'month' ? 'active' : ''}" data-period="month">Este mes</button>
              <button class="btn-period ${this.currentPeriod === 'custom' ? 'active' : ''}" data-period="custom">Personalizado</button>
            </div>
            <div class="custom-date-range ${this.currentPeriod === 'custom' ? 'show' : ''}" id="custom-date-controls">
              <input type="date" id="dash-date-start" value="${this.customStart}" class="input-date" />
              <span>a</span>
              <input type="date" id="dash-date-end" value="${this.customEnd}" class="input-date" />
              <button class="btn btn-sm btn-outline" id="btn-apply-custom-date">Aplicar</button>
            </div>
          </div>

          <div class="quick-actions-group">
            <button class="btn btn-primary" id="btn-quick-guest">
              ${getIcon('plus')} <span>Registrar invitado</span>
            </button>
            <button class="btn btn-outline" id="btn-quick-testdrive">
              ${getIcon('testDrive')} <span>Programar prueba</span>
            </button>
            <button class="btn btn-outline" id="btn-quick-request">
              ${getIcon('fileText')} <span>Crear solicitud</span>
            </button>
            <button class="btn btn-dark" id="btn-quick-sale">
              ${getIcon('dollarSign')} <span>Registrar venta</span>
            </button>
          </div>
        </div>

        <!-- 6 Tarjetas de KPIs -->
        <div class="kpi-grid" id="kpi-cards-container">
          <!-- Inyectado dinámicamente -->
        </div>

        <!-- Sección de Gráficas -->
        <div class="dashboard-charts-grid">
          <div class="card chart-card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Ventas por Periodo</h3>
                <p class="card-subtitle">Evolución de ventas confirmadas en MXN y volumen de unidades</p>
              </div>
              <span class="badge badge-primary" id="sales-chart-total-badge">$0 MXN</span>
            </div>
            <div class="card-body">
              <div id="dashboard-sales-chart"></div>
            </div>
          </div>

          <div class="card chart-card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Seguimiento Comercial</h3>
                <p class="card-subtitle">Embudo de conversión: Invitados → Pruebas → Solicitudes → Ventas</p>
              </div>
            </div>
            <div class="card-body">
              <div id="dashboard-funnel-chart"></div>
            </div>
          </div>
        </div>

        <!-- Próximas Actividades y Pruebas de Manejo -->
        <div class="dashboard-upcoming-grid">
          <!-- Pruebas de manejo próximas -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Pruebas de Manejo Próximas</h3>
                <p class="card-subtitle">Citas agendadas para evaluación de vehículos</p>
              </div>
              <button class="btn-link" id="link-all-testdrives">Ver todas</button>
            </div>
            <div class="card-body p-0">
              <div class="upcoming-list" id="upcoming-testdrives-list">
                <!-- Inyectado -->
              </div>
            </div>
          </div>

          <!-- Actividades operativas del día -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Actividades Operativas</h3>
                <p class="card-subtitle">Responsabilidades y tareas de la sucursal</p>
              </div>
              <button class="btn-link" id="link-all-activities">Ir a actividades</button>
            </div>
            <div class="card-body p-0">
              <div class="upcoming-list" id="upcoming-activities-list">
                <!-- Inyectado -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.update();
  }

  bindEvents(container) {
    // Filtros de fecha
    const periodButtons = container.querySelectorAll('.btn-period');
    const customControls = container.querySelector('#custom-date-controls');

    periodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        periodButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const period = btn.getAttribute('data-period');
        this.currentPeriod = period;

        if (period === 'custom') {
          customControls.classList.add('show');
        } else {
          customControls.classList.remove('show');
          this.update();
        }
      });
    });

    const applyCustomBtn = container.querySelector('#btn-apply-custom-date');
    if (applyCustomBtn) {
      applyCustomBtn.addEventListener('click', () => {
        this.customStart = container.querySelector('#dash-date-start').value;
        this.customEnd = container.querySelector('#dash-date-end').value;
        this.update();
      });
    }

    // Accesos rápidos
    container.querySelector('#btn-quick-guest').addEventListener('click', () => this.app.modals.openAddGuestModal());
    container.querySelector('#btn-quick-testdrive').addEventListener('click', () => this.app.modals.openAddTestDriveModal());
    container.querySelector('#btn-quick-request').addEventListener('click', () => this.app.modals.openAddRequestModal());
    container.querySelector('#btn-quick-sale').addEventListener('click', () => this.app.modals.openAddSaleModal());

    // Enlaces de navegación
    container.querySelector('#link-all-testdrives').addEventListener('click', () => this.app.navigate('guardias', 'actividades'));
    container.querySelector('#link-all-activities').addEventListener('click', () => this.app.navigate('guardias', 'actividades'));
  }

  update() {
    this.renderKPIs();
    this.renderCharts();
    this.renderUpcoming();
  }

  // Cálculo y renderizado de los 6 KPIs
  renderKPIs() {
    const kpiContainer = document.getElementById('kpi-cards-container');
    if (!kpiContainer) return;

    const vehicles = store.getVehicles();
    const clients = store.getClients();
    const testDrives = store.getTestDrives();
    const requests = store.getRequests();
    const downPayments = store.getDownPayments();
    const sales = store.getSales();

    // 1. Invitados en el periodo (visitas registradas en periodo actual vs anterior)
    let invitadosCount = 0;
    let prevInvitadosCount = 0;
    clients.forEach(c => {
      (c.visits || []).forEach(v => {
        if (isDateInPeriod(v.date, this.currentPeriod, this.customStart, this.customEnd)) {
          invitadosCount++;
        }
        if (isDateInPreviousPeriod(v.date, this.currentPeriod)) {
          prevInvitadosCount++;
        }
      });
    });

    // 2. Inventario disponible (refleja disponibilidad ACTUAL estricta)
    const availableVehicles = vehicles.filter(v => v.status === 'disponible');
    const reservedVehicles = vehicles.filter(v => v.status === 'apartado');
    const totalVehicles = vehicles.length;

    // 3. Pruebas de manejo en el periodo
    const periodTestDrives = testDrives.filter(td => isDateInPeriod(td.date, this.currentPeriod, this.customStart, this.customEnd));
    const completedTestDrives = periodTestDrives.filter(td => td.status === 'Realizada').length;
    const scheduledTestDrives = periodTestDrives.filter(td => td.status === 'Programada').length;
    const prevTestDrivesCount = testDrives.filter(td => isDateInPreviousPeriod(td.date, this.currentPeriod)).length;

    // 4. Solicitudes en el periodo
    const periodRequests = requests.filter(r => isDateInPeriod(r.date, this.currentPeriod, this.customStart, this.customEnd));
    const pendingRequests = periodRequests.filter(r => r.status === 'Pendiente').length;
    const prevRequestsCount = requests.filter(r => isDateInPreviousPeriod(r.date, this.currentPeriod)).length;

    // 5. Enganche acumulado RECIBIDO en el periodo (importes efectivamente cobrados)
    const periodDownPayments = downPayments.filter(dp => isDateInPeriod(dp.date, this.currentPeriod, this.customStart, this.customEnd));
    const totalDownPaymentAmount = periodDownPayments.reduce((sum, dp) => sum + Number(dp.amount || 0), 0);
    const prevDownPayments = downPayments.filter(dp => isDateInPreviousPeriod(dp.date, this.currentPeriod));
    const prevDownPaymentAmount = prevDownPayments.reduce((sum, dp) => sum + Number(dp.amount || 0), 0);

    // 6. Ventas en el periodo
    const periodSales = sales.filter(s => isDateInPeriod(s.date, this.currentPeriod, this.customStart, this.customEnd));
    const totalSalesCount = periodSales.length;
    const totalSalesAmount = periodSales.reduce((sum, s) => sum + Number(s.finalAmount || 0), 0);
    const prevSales = sales.filter(s => isDateInPreviousPeriod(s.date, this.currentPeriod));
    const prevSalesAmount = prevSales.reduce((sum, s) => sum + Number(s.finalAmount || 0), 0);

    // Función de comparación
    const getComparisonBadge = (current, prev, isCurrency = false) => {
      if (prev === 0) {
        if (current > 0) return `<span class="kpi-compare positive">${getIcon('trendingUp')} +100% vs anterior</span>`;
        return `<span class="kpi-compare neutral">Sin datos previos</span>`;
      }
      const diff = current - prev;
      const pct = Math.round((diff / prev) * 100);
      const isPositive = pct >= 0;
      return `
        <span class="kpi-compare ${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? getIcon('trendingUp') : getIcon('trendingDown')}
          ${isPositive ? '+' : ''}${pct}% vs anterior
        </span>
      `;
    };

    kpiContainer.innerHTML = `
      <!-- KPI 1: Invitados -->
      <div class="kpi-card card" data-view="clientes" tabindex="0" role="button" aria-label="Ver detalle de Invitados">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-orange">${getIcon('users')}</div>
          ${getComparisonBadge(invitadosCount, prevInvitadosCount)}
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Invitados</span>
          <h2 class="kpi-value">${formatNumber(invitadosCount)}</h2>
          <span class="kpi-subtext">Visitas registradas en el periodo</span>
        </div>
      </div>

      <!-- KPI 2: Inventario -->
      <div class="kpi-card card" data-view="inventario" tabindex="0" role="button" aria-label="Ver detalle de Inventario">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-dark">${getIcon('car')}</div>
          <span class="kpi-badge-live">En tiempo real</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Inventario</span>
          <h2 class="kpi-value">${formatNumber(availableVehicles.length)} <span class="kpi-unit">disponibles</span></h2>
          <span class="kpi-subtext">${reservedVehicles.length} apartados · ${totalVehicles} totales</span>
        </div>
      </div>

      <!-- KPI 3: Pruebas de manejo -->
      <div class="kpi-card card" data-view="guardias" data-tab="actividades" tabindex="0" role="button" aria-label="Ver detalle de Pruebas de manejo">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-blue">${getIcon('testDrive')}</div>
          ${getComparisonBadge(periodTestDrives.length, prevTestDrivesCount)}
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Pruebas de manejo</span>
          <h2 class="kpi-value">${formatNumber(periodTestDrives.length)}</h2>
          <span class="kpi-subtext">${completedTestDrives} realizadas · ${scheduledTestDrives} programadas</span>
        </div>
      </div>

      <!-- KPI 4: Solicitudes -->
      <div class="kpi-card card" data-view="clientes" tabindex="0" role="button" aria-label="Ver detalle de Solicitudes">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-amber">${getIcon('fileText')}</div>
          ${getComparisonBadge(periodRequests.length, prevRequestsCount)}
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Solicitudes</span>
          <h2 class="kpi-value">${formatNumber(periodRequests.length)}</h2>
          <span class="kpi-subtext">${pendingRequests} pendientes de aprobación</span>
        </div>
      </div>

      <!-- KPI 5: Enganche Recibido -->
      <div class="kpi-card card" data-view="inventario" tabindex="0" role="button" aria-label="Ver detalle de Enganches">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-green">${getIcon('dollarSign')}</div>
          ${getComparisonBadge(totalDownPaymentAmount, prevDownPaymentAmount, true)}
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Enganche</span>
          <h2 class="kpi-value">${formatCurrency(totalDownPaymentAmount)}</h2>
          <span class="kpi-subtext">${periodDownPayments.length} enganches recibidos en caja</span>
        </div>
      </div>

      <!-- KPI 6: Ventas -->
      <div class="kpi-card card" data-view="inventario" tabindex="0" role="button" aria-label="Ver detalle de Ventas">
        <div class="kpi-top">
          <div class="kpi-icon-wrapper color-orange-dark">${getIcon('tag')}</div>
          ${getComparisonBadge(totalSalesAmount, prevSalesAmount, true)}
        </div>
        <div class="kpi-body">
          <span class="kpi-label">Ventas</span>
          <h2 class="kpi-value">${formatCurrency(totalSalesAmount)}</h2>
          <span class="kpi-subtext">${totalSalesCount} vehículos vendidos en el periodo</span>
        </div>
      </div>
    `;

    // Click en tarjetas de KPI para navegar al detalle
    kpiContainer.querySelectorAll('.kpi-card').forEach(card => {
      const handleAction = () => {
        const view = card.getAttribute('data-view');
        const tab = card.getAttribute('data-tab');
        if (view) {
          this.app.navigate(view, tab);
        }
      };

      card.addEventListener('click', handleAction);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAction();
        }
      });
    });

    // Guardar referencia a stats para funnel
    this.currentStats = {
      invitados: invitadosCount,
      pruebasManejo: periodTestDrives.length,
      solicitudes: periodRequests.length,
      ventas: totalSalesCount,
      totalSalesAmount
    };
  }

  renderCharts() {
    const sales = store.getSales();
    const periodSales = sales.filter(s => isDateInPeriod(s.date, this.currentPeriod, this.customStart, this.customEnd));

    const totalBadge = document.getElementById('sales-chart-total-badge');
    if (totalBadge && this.currentStats) {
      totalBadge.textContent = formatCurrency(this.currentStats.totalSalesAmount);
    }

    renderSalesChart('dashboard-sales-chart', periodSales.length > 0 ? periodSales : sales.slice(0, 6));
    if (this.currentStats) {
      renderFunnelChart('dashboard-funnel-chart', this.currentStats);
    }
  }

  renderUpcoming() {
    // 1. Pruebas de manejo próximas
    const tdContainer = document.getElementById('upcoming-testdrives-list');
    if (tdContainer) {
      const testDrives = store.getTestDrives();
      const clients = store.getClients();
      const vehicles = store.getVehicles();

      const upcoming = testDrives
        .filter(td => td.status === 'Programada' || td.status === 'Realizada')
        .slice(0, 4);

      if (upcoming.length === 0) {
        tdContainer.innerHTML = `<div class="empty-list-msg">No hay pruebas de manejo programadas próximamente.</div>`;
      } else {
        tdContainer.innerHTML = upcoming.map(td => {
          const client = clients.find(c => c.id === td.clientId) || { name: 'Cliente registrado' };
          const vehicle = vehicles.find(v => v.id === td.vehicleId) || { brand: 'Auto', model: 'En catálogo', year: '' };
          const isDone = td.status === 'Realizada';

          return `
            <div class="upcoming-item">
              <div class="upcoming-time-col">
                <span class="upcoming-time">${td.time || '12:00'}</span>
                <span class="upcoming-date">${formatDate(td.date, 'short')}</span>
              </div>
              <div class="upcoming-main-col">
                <h4 class="upcoming-title">${vehicle.brand} ${vehicle.model} ${vehicle.year}</h4>
                <p class="upcoming-subtitle">Cliente: <strong>${client.name}</strong> · Asesor: ${td.responsible || 'De guardia'}</p>
              </div>
              <div class="upcoming-status-col">
                <span class="badge ${isDone ? 'badge-success' : 'badge-primary'}">${td.status}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 2. Actividades próximas del día
    const actContainer = document.getElementById('upcoming-activities-list');
    if (actContainer) {
      const activities = store.getActivities().slice(0, 4);
      if (activities.length === 0) {
        actContainer.innerHTML = `<div class="empty-list-msg">No hay actividades registradas para hoy.</div>`;
      } else {
        actContainer.innerHTML = activities.map(act => {
          let badgeClass = 'badge-warning';
          let statusText = 'Pendiente';
          if (act.status === 'en_proceso') {
            badgeClass = 'badge-info';
            statusText = 'En proceso';
          } else if (act.status === 'completada') {
            badgeClass = 'badge-success';
            statusText = 'Completada';
          }

          return `
            <div class="upcoming-item">
              <div class="upcoming-time-col">
                <span class="upcoming-time">${act.time || '09:00'}</span>
                <span class="upcoming-date">${formatDate(act.date, 'short')}</span>
              </div>
              <div class="upcoming-main-col">
                <h4 class="upcoming-title">${act.title}</h4>
                <p class="upcoming-subtitle">Responsable: <strong>${act.responsible}</strong></p>
              </div>
              <div class="upcoming-status-col">
                <span class="badge ${badgeClass}">${statusText}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }
}
