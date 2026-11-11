// Gráficas vectoriales interactivas para el Dashboard
import { formatCurrency, formatNumber } from '../utils.js';

/**
 * Renderiza la gráfica de ventas en SVG
 * Muestra el volumen monetario ($ MXN) y las unidades vendidas
 */
export function renderSalesChart(containerId, salesData) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!salesData || salesData.length === 0) {
    container.innerHTML = `
      <div class="chart-empty-state">
        <p>No hay ventas registradas en el periodo seleccionado.</p>
      </div>
    `;
    return;
  }

  // Agrupar ventas por etiqueta (ej. día o semana o periodo)
  const sorted = [...salesData].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Agrupar por fecha
  const groups = {};
  sorted.forEach(s => {
    const key = s.date;
    if (!groups[key]) {
      groups[key] = { date: key, amount: 0, count: 0 };
    }
    groups[key].amount += Number(s.finalAmount || 0);
    groups[key].count += 1;
  });

  const dataPoints = Object.values(groups);
  const maxAmount = Math.max(...dataPoints.map(d => d.amount), 500000);

  const width = container.clientWidth || 540;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 45, left: 75 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Escalas
  const getX = (index) => padding.left + (chartW / Math.max(dataPoints.length - 1, 1)) * index;
  const getY = (val) => padding.top + chartH - (val / maxAmount) * chartH;

  // Puntos de la línea
  const points = dataPoints.map((d, i) => `${getX(i)},${getY(d.amount)}`).join(' ');
  const areaPoints = `${padding.left},${padding.top + chartH} ${points} ${getX(dataPoints.length - 1)},${padding.top + chartH}`;

  // Líneas de referencia horizontales (Grid)
  let gridLines = '';
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const val = (maxAmount / steps) * i;
    const y = getY(val);
    gridLines += `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e8e6e5" stroke-dasharray="3,3" stroke-width="1" />
      <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="#6b6360" font-family="Montserrat, Gotham, sans-serif">
        $${(val / 1000).toFixed(0)}k
      </text>
    `;
  }

  // Etiquetas del eje X
  let xLabels = '';
  dataPoints.forEach((d, i) => {
    const x = getX(i);
    const dateObj = new Date(d.date + 'T00:00:00');
    const label = `${dateObj.getDate()} ${dateObj.toLocaleDateString('es-MX', { month: 'short' })}`;
    xLabels += `
      <text x="${x}" y="${height - 12}" text-anchor="middle" font-size="11" fill="#251f1d" font-family="Montserrat, Gotham, sans-serif">
        ${label}
      </text>
      <circle cx="${x}" cy="${getY(d.amount)}" r="5" fill="#ff8901" stroke="#ffffff" stroke-width="2" class="chart-point" data-amount="${d.amount}" data-count="${d.count}" data-date="${label}"/>
    `;
  });

  container.innerHTML = `
    <div class="chart-wrapper" style="position: relative; width: 100%; height: ${height}px;">
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="salesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff8901" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#ff8901" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        ${gridLines}
        ${dataPoints.length > 1 ? `<polygon points="${areaPoints}" fill="url(#salesGrad)" />` : ''}
        ${dataPoints.length > 1 ? `<polyline points="${points}" fill="none" stroke="#ff8901" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />` : ''}
        ${xLabels}
      </svg>
      <div class="chart-tooltip" id="sales-chart-tooltip" style="display: none;"></div>
    </div>
  `;

  // Interacción de tooltips
  const tooltip = container.querySelector('#sales-chart-tooltip');
  const circles = container.querySelectorAll('.chart-point');

  circles.forEach(circle => {
    circle.addEventListener('mouseenter', (e) => {
      const amount = Number(circle.getAttribute('data-amount'));
      const count = circle.getAttribute('data-count');
      const date = circle.getAttribute('data-date');
      const cx = parseFloat(circle.getAttribute('cx'));
      const cy = parseFloat(circle.getAttribute('cy'));

      tooltip.innerHTML = `
        <div class="tooltip-title">${date}</div>
        <div class="tooltip-val"><strong>${formatCurrency(amount)}</strong></div>
        <div class="tooltip-sub">${count} unidad(es) vendida(s)</div>
      `;
      tooltip.style.left = `${cx}px`;
      tooltip.style.top = `${cy - 50}px`;
      tooltip.style.display = 'block';
    });

    circle.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });
}

/**
 * Renderiza la gráfica de embudo y seguimiento comercial
 * Invitados -> Pruebas de manejo -> Solicitudes -> Ventas
 */
export function renderFunnelChart(containerId, stats) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const steps = [
    { name: 'Invitados / Visitas', value: stats.invitados || 0, color: '#251f1d' },
    { name: 'Pruebas de manejo', value: stats.pruebasManejo || 0, color: '#0284c7' },
    { name: 'Solicitudes creadas', value: stats.solicitudes || 0, color: '#f59e0b' },
    { name: 'Ventas cerradas', value: stats.ventas || 0, color: '#ff8901' }
  ];

  const maxVal = Math.max(...steps.map(s => s.value), 1);

  let html = `
    <div class="funnel-container">
      <div class="funnel-bars">
  `;

  steps.forEach((step, idx) => {
    const percentOfMax = Math.max(Math.round((step.value / maxVal) * 100), 4);
    const prevVal = idx > 0 ? steps[idx - 1].value : null;
    const conversionRate = prevVal && prevVal > 0 
      ? Math.round((step.value / prevVal) * 100) 
      : (idx === 0 ? 100 : 0);

    html += `
      <div class="funnel-row">
        <div class="funnel-meta">
          <span class="funnel-step-name">${step.name}</span>
          <span class="funnel-step-val">${formatNumber(step.value)}</span>
        </div>
        <div class="funnel-bar-track">
          <div class="funnel-bar-fill" style="width: ${percentOfMax}%; background-color: ${step.color};"></div>
        </div>
        <div class="funnel-conversion">
          ${idx === 0 
            ? '<span class="conversion-pill">Inicio</span>' 
            : `<span class="conversion-pill font-bold">${conversionRate}% conv.</span>`
          }
        </div>
      </div>
    `;
  });

  html += `
      </div>
      <div class="funnel-summary">
        <div class="funnel-stat-box">
          <div class="stat-number">${stats.invitados > 0 ? Math.round((stats.ventas / stats.invitados) * 100) : 0}%</div>
          <div class="stat-label">Conversión Global (Visita a Venta)</div>
        </div>
        <div class="funnel-stat-box">
          <div class="stat-number">${stats.pruebasManejo > 0 ? Math.round((stats.ventas / stats.pruebasManejo) * 100) : 0}%</div>
          <div class="stat-label">Efectividad de Pruebas de Manejo</div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}
