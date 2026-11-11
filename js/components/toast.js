// Sistema de Notificaciones Toast y Modales de Confirmación
import { getIcon } from './icons.js';

class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;
    
    let iconSvg = getIcon('alertCircle');
    if (type === 'success') iconSvg = getIcon('checkCircle');
    if (type === 'error') iconSvg = getIcon('alertCircle');
    if (type === 'warning') iconSvg = getIcon('alertCircle');

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" aria-label="Cerrar notificación">${getIcon('close')}</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }
  }

  dismiss(toast) {
    toast.classList.add('animate-fade-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }

  success(msg) { this.show(msg, 'success'); }
  error(msg) { this.show(msg, 'error', 4500); }
  warning(msg) { this.show(msg, 'warning', 4000); }
  info(msg) { this.show(msg, 'info'); }
}

export const toast = new ToastManager();

// Modal de confirmación accesible y estilizado
export function confirmDialog({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDestructive = false }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop animate-fade-in';
    backdrop.id = 'confirm-dialog-backdrop';

    const modal = document.createElement('div');
    modal.className = 'modal-box modal-confirm animate-scale-up';
    modal.setAttribute('role', 'alertdialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title ${isDestructive ? 'text-danger' : ''}">${title}</h3>
        <button class="modal-close-btn" aria-label="Cerrar">${getIcon('close')}</button>
      </div>
      <div class="modal-body">
        <p class="modal-desc">${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="confirm-cancel-btn">${cancelText}</button>
        <button class="btn ${isDestructive ? 'btn-danger' : 'btn-primary'}" id="confirm-ok-btn">${confirmText}</button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const close = (result) => {
      backdrop.classList.add('animate-fade-out');
      setTimeout(() => {
        backdrop.remove();
        resolve(result);
      }, 180);
    };

    modal.querySelector('.modal-close-btn').onclick = () => close(false);
    modal.querySelector('#confirm-cancel-btn').onclick = () => close(false);
    modal.querySelector('#confirm-ok-btn').onclick = () => close(true);
    backdrop.onclick = (e) => {
      if (e.target === backdrop) close(false);
    };

    // Soporte para tecla Esc
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', escHandler);
        close(false);
      }
    };
    window.addEventListener('keydown', escHandler);
  });
}
