'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeToast } from '@/store/features/ui/toastSlice';
import { CloseIcon, CheckIcon } from './Icons';

export function ToastContainer() {
  const toasts = useAppSelector((state) => state.toasts.items);
  const dispatch = useAppDispatch();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type} animate-slide-in`}
          style={{
            minWidth: 280,
            maxWidth: 420,
            padding: '14px 18px',
            borderRadius: 12,
            background: t.type === 'error' ? '#ef4444' : '#251f1d',
            color: '#ffffff',
            borderLeft: '4px solid #ff8901',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#ff8901' }}><CheckIcon size={18} /></span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t.message}</span>
          </div>
          <button
            onClick={() => dispatch(removeToast(t.id))}
            style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.7, cursor: 'pointer', padding: 4 }}
          >
            <CloseIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
