// Aplicación Principal Outlet Autocorp Mini CRM
import { store } from './store.js';
import { getIcon } from './components/icons.js';
import { formatDate } from './utils.js';
import { toast, confirmDialog } from './components/toast.js';
import { DashboardView } from './views/dashboard.js';
import { GuardiasView } from './views/guardias.js';
import { ClientesView } from './views/clientes.js';
import { InventarioView } from './views/inventario.js';
import { ModalManager } from './components/modals.js';

class App {
  constructor() {
    this.currentViewId = 'general';
    this.modals = new ModalManager(this);
    this.dashboardView = new DashboardView(this);
    this.guardiasView = new GuardiasView(this);
    this.clientesView = new ClientesView(this);
    this.inventarioView = new InventarioView(this);

    this.init();
  }

  init() {
    this.renderLayout();
    this.bindNavigation();
    this.navigate('general');

    // Suscribirse a cambios en el store para actualizar la vista activa si cambia algo
    store.subscribe(() => {
      this.refreshCurrentView();
    });
  }

  renderLayout() {
    const appEl = document.getElementById('app');
    const todayFormatted = formatDate(new Date().toISOString().split('T')[0], 'long');

    appEl.innerHTML = `
      <div class="app-layout">
        <!-- MENÚ LATERAL (DESKTOP) Y DRAWER (MÓVIL) -->
        <aside class="app-sidebar" id="app-sidebar">
          <div class="sidebar-brand">
            <div class="brand-logo-icon">
              ${getIcon('car')}
            </div>
            <div class="brand-text">
              <span class="brand-title">OUTLET AUTOCORP</span>
              <span class="brand-subtitle">Mini CRM Seminuevos</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <button class="nav-item active" data-view="general">
              <span class="nav-icon">${getIcon('dashboard')}</span>
              <span class="nav-label">General</span>
            </button>
            <button class="nav-item" data-view="guardias">
              <span class="nav-icon">${getIcon('calendar')}</span>
              <span class="nav-label">Guardias y actividades</span>
            </button>
            <button class="nav-item" data-view="clientes">
              <span class="nav-icon">${getIcon('users')}</span>
              <span class="nav-label">Clientes</span>
            </button>
            <button class="nav-item" data-view="inventario">
              <span class="nav-icon">${getIcon('car')}</span>
              <span class="nav-label">Inventario</span>
            </button>
          </nav>

          <div class="sidebar-footer">
            <div class="demo-mode-indicator">
              <span class="demo-dot"></span>
              <span class="demo-text">Datos de demostración</span>
            </div>
            <button class="btn btn-outline-light btn-xs" id="btn-reset-demo" title="Recargar lote con datos iniciales">
              ${getIcon('refresh')} <span>Restablecer demo</span>
            </button>
          </div>
        </aside>

        <!-- Sombra de fondo para menú móvil -->
        <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

        <!-- CONTENEDOR PRINCIPAL -->
        <div class="app-main-wrapper">
          <!-- ENCABEZADO SUPERIOR -->
          <header class="app-header">
            <div class="header-left">
              <button class="btn-menu-mobile" id="btn-toggle-menu" aria-label="Abrir menú">
                ${getIcon('menu')}
              </button>
              <div class="header-titles">
                <span class="header-outlet-name">Outlet Autocorp</span>
                <h1 class="header-view-title" id="header-view-title">Vista General — Dashboard</h1>
              </div>
            </div>

            <div class="header-right">
              <a href="diseno2/index.html" class="btn btn-outline btn-xs" style="border-radius: 20px; text-decoration: none; font-weight: 700; color: #ff8901; border-color: #ff8901;" title="Conocer el Diseño Alternativo (Showroom Studio)">
                <span>Ver Diseño 2 (Executive) →</span>
              </a>
              <div class="header-date">
                <span class="date-icon">${getIcon('calendar')}</span>
                <span class="date-text">${todayFormatted}</span>
              </div>
            </div>
          </header>

          <!-- ÁREA DE CONTENIDO DE LA VISTA -->
          <main class="app-content-area" id="view-container">
            <!-- Vistas inyectadas aquí -->
          </main>
        </div>
      </div>
    `;
  }

  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const btnToggleMenu = document.getElementById('btn-toggle-menu');
    const btnResetDemo = document.getElementById('btn-reset-demo');

    // Cambiar de vista
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const viewId = item.getAttribute('data-view');
        this.navigate(viewId);
        // Cerrar menú móvil al navegar
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
      });
    });

    // Menú móvil
    if (btnToggleMenu) {
      btnToggleMenu.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('open');
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('open');
      });
    }

    // Botón restablecer demo
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', async () => {
        const confirmed = await confirmDialog({
          title: '¿Restablecer datos de demostración?',
          message: 'Se reiniciarán todos los clientes, inventario de vehículos, guardias y ventas a sus valores originales de prueba.',
          confirmText: 'Sí, restablecer',
          isDestructive: false
        });

        if (confirmed) {
          store.resetDemoData();
          toast.success('Datos de demostración restablecidos correctamente.');
          this.refreshCurrentView();
        }
      });
    }
  }

  navigate(viewId, subParam = null) {
    this.currentViewId = viewId;

    // Actualizar nav activa
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Actualizar título en encabezado
    const headerTitle = document.getElementById('header-view-title');
    const titles = {
      general: 'Vista General — Dashboard',
      guardias: 'Guardias y Actividades',
      clientes: 'Directorio de Clientes',
      inventario: 'Inventario de Vehículos'
    };
    if (headerTitle) {
      headerTitle.textContent = titles[viewId] || 'Outlet Autocorp';
    }

    const container = document.getElementById('view-container');
    if (!container) return;

    if (viewId === 'general') {
      this.dashboardView.render(container);
    } else if (viewId === 'guardias') {
      if (subParam) this.guardiasView.setTab(subParam);
      this.guardiasView.render(container);
    } else if (viewId === 'clientes') {
      this.clientesView.render(container);
    } else if (viewId === 'inventario') {
      this.inventarioView.render(container);
    }

    // Scroll arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  refreshCurrentView() {
    const container = document.getElementById('view-container');
    if (!container) return;

    if (this.currentViewId === 'general') {
      this.dashboardView.update();
    } else if (this.currentViewId === 'guardias') {
      this.guardiasView.renderCurrentTab();
    } else if (this.currentViewId === 'clientes') {
      this.clientesView.renderClientsTable();
    } else if (this.currentViewId === 'inventario') {
      this.inventarioView.renderInventory();
    }
  }
}

// Iniciar aplicación al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  window.outletApp = new App();
});
