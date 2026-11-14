// Opt-in: sin ?page= en la URL, null — la ruta sigue devolviendo el arreglo
// plano de siempre (muchas vistas usan estas mismas queries para llenar
// <select>, y pedirles page/pageSize ahí rompería esos dropdowns en cuanto
// un catálogo pase de pageSize filas). Con ?page=, se activa el sobre
// paginado { items, page, pageSize, total, totalPages }.
export function parsePagination(request, defaultPageSize = 20) {
  const url = new URL(request.url);
  const pageParam = url.searchParams.get('page');
  if (!pageParam) return null;

  const page = Math.max(1, Number(pageParam) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize')) || defaultPageSize));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

// Lado cliente: construye el query string para un RTK Query `query()`.
// pagination es undefined/{} (sin paginar, arreglo plano) o {page, pageSize}.
export function toPaginationQueryString(pagination) {
  if (!pagination?.page) return '';
  return `?page=${pagination.page}&pageSize=${pagination.pageSize || 20}`;
}

// Igual, pero además serializa filtros extra (estatus, q, marcaId...),
// omitiendo valores vacíos o 'all' (el valor "sin filtrar" de los <select>).
export function toQueryString(params = {}) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === 'all') continue;
    usp.set(key, value);
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export function buildPaginatedResponse(items, total, pagination) {
  return {
    items,
    page: pagination.page,
    pageSize: pagination.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pagination.pageSize)),
  };
}
