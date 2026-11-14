'use client';

import React from 'react';

export function Pager({ page, totalPages, total, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px', fontSize: 12, color: '#8e8784' }}>
      <span>{total} en total · página {page} de {totalPages}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #d5d0ce', background: '#ffffff', color: '#251f1d', fontSize: 12, fontWeight: 700, cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1 }}
        >
          ← Anterior
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #d5d0ce', background: '#ffffff', color: '#251f1d', fontSize: 12, fontWeight: 700, cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1 }}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
