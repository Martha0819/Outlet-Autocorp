'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  CarIcon,
  UsersIcon,
  DollarIcon,
  CalendarIcon,
  CloseIcon
} from '@/components/ui/Icons';

export default function LoginPage() {
  const router = useRouter();
  const { login, DEMO_USERS } = useStore();

  const [email, setEmail] = useState('carlos.morales@autocorp.mx');
  const [password, setPassword] = useState('autocorp2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Por favor ingresa tu correo corporativo.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Por favor ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login(email.trim(), password);
      router.push('/');
    }, 450);
  };

  const handleQuickLogin = (demoUser) => {
    setEmail(demoUser.email);
    setPassword('autocorp2026');
    setLoading(true);
    setTimeout(() => {
      login(demoUser.email, 'autocorp2026');
      router.push('/');
    }, 350);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Montserrat', sans-serif", backgroundColor: '#ffffff' }}>
      {/* =========================================================================
          PANEL IZQUIERDO: MARCA, PRESTIGIO AUTOMOTRIZ Y MÉTRICAS (50%)
          ========================================================================= */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#1c1715',
          background: 'linear-gradient(145deg, #181312 0%, #251e1c 50%, #15100f 100%)',
          color: '#ffffff',
          padding: '48px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Destellos sutiles de fondo ámbar */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,137,1,0.18) 0%, rgba(255,137,1,0) 70%)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-80px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,122,0,0.12) 0%, rgba(255,122,0,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Cabecera de Marca */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '28px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff8901', display: 'inline-block', boxShadow: '0 0 10px #ff8901' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#ffd5a8' }}>
              Plataforma Comercial Outlet Autocorp
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <span
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#ff8901',
                color: '#251f1d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(255,137,1,0.35)'
              }}
            >
              <CarIcon size={24} />
            </span>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, letterSpacing: '0.5px', color: '#ffffff' }}>
              OUTLET AUTOCORP
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#bfb5b0', maxWidth: '460px', lineHeight: 1.6 }}>
            Gestión integral de piso de venta, inventario certificado multimarca, prospección 360° y asignación de guardias comerciales.
          </p>
        </div>

        {/* Showcase Central: Tarjeta de Desempeño y Vehículo en exhibición */}
        <div style={{ position: 'relative', zIndex: 2, margin: '40px 0' }}>
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.09)',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#ff8901', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Unidad Destacada en Showroom
              </span>
              <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a' }}>
                Disponible
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                  KIA Seltos EX 2021
                </h3>
                <span style={{ fontSize: '12px', color: '#a39793' }}>
                  Automática • 32,000 km • Color Blanco
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: '#a39793', display: 'block' }}>Precio de Venta</span>
                <strong style={{ fontSize: '18px', fontWeight: 900, color: '#ff8901' }}>
                  $345,000 MXN
                </strong>
              </div>
            </div>

            {/* Mini KPIs de la Sucursal */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 12px' }}>
                <span style={{ fontSize: '10px', color: '#8e827e', display: 'block' }}>Visitas Hoy</span>
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>5 Clientes</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 12px' }}>
                <span style={{ fontSize: '10px', color: '#8e827e', display: 'block' }}>Inventario</span>
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>4 Disponibles</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 12px' }}>
                <span style={{ fontSize: '10px', color: '#8e827e', display: 'block' }}>Conversión</span>
                <strong style={{ fontSize: '15px', color: '#10b981' }}>20% Global</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de Página del Panel Izquierdo */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', fontSize: '11px', color: '#8e827e' }}>
          <span>© 2026 Outlet Autocorp de México S.A. de C.V.</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#ff8901' }}>🔒</span> Conexión Cifrada SSL 256-bit
          </span>
        </div>
      </div>

      {/* =========================================================================
          PANEL DERECHO: FORMULARIO DE ACCESO & DEMO EN 1 CLIC (50%)
          ========================================================================= */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#faf9f8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          overflowY: 'auto'
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Tarjeta de Formulario */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '36px 36px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
              border: '1px solid #eae7e5'
            }}
          >
            {/* Header del formulario */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ff8901', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff8901' }} />
                <span>Acceso Autorizado</span>
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 900, color: '#251f1d' }}>
                Iniciar Sesión
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#6e6764' }}>
                Ingresa tus credenciales comerciales para acceder al CRM.
              </p>
            </div>

            {/* Mensaje de error si aplica */}
            {errorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: '12px', fontWeight: 600, marginBottom: '18px' }}>
                {errorMsg}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Campo Correo */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#251f1d', marginBottom: '6px' }}>
                  Correo electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8e8784', display: 'flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="asesor@autocorp.mx"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '10px',
                      border: '1px solid #d5d0ce',
                      fontSize: '13px',
                      backgroundColor: '#ffffff',
                      color: '#251f1d',
                      outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ff8901';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255,137,1,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d5d0ce';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#251f1d' }}>
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '11px', color: '#ff8901', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8e8784', display: 'flex' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 40px',
                      borderRadius: '10px',
                      border: '1px solid #d5d0ce',
                      fontSize: '13px',
                      backgroundColor: '#ffffff',
                      color: '#251f1d',
                      outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ff8901';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255,137,1,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d5d0ce';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8e8784', display: 'flex' }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                        <line x1="2" x2="22" y1="2" y2="22"></line>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Recordar sesión */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0 6px 0' }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#ff8901', cursor: 'pointer', width: '15px', height: '15px' }}
                />
                <label htmlFor="remember" style={{ fontSize: '12px', color: '#554f4d', cursor: 'pointer', fontWeight: 600 }}>
                  Mantener sesión iniciada en este equipo
                </label>
              </div>

              {/* Botón de Iniciar Sesión */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: '#ff8901',
                  color: '#251f1d',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255,137,1,0.3)',
                  transition: 'background-color 0.15s, transform 0.1s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#e57b01';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#ff8901';
                }}
              >
                {loading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <span>Ingresar a la Plataforma</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divisor */}
            <div style={{ position: 'relative', margin: '26px 0 20px 0', textAlign: 'center' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: '#eae7e5' }} />
              <span style={{ position: 'relative', background: '#ffffff', padding: '0 12px', fontSize: '11px', fontWeight: 700, color: '#8e8784', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                O ingresa en 1 clic como
              </span>
            </div>

            {/* Accesos Rápidos de Demostración */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #eae7e5',
                    background: '#fcfbfa',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff5eb';
                    e.currentTarget.style.borderColor = '#ffd8b3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fcfbfa';
                    e.currentTarget.style.borderColor = '#eae7e5';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: u.color,
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {u.avatar}
                    </span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#251f1d', lineHeight: 1.2 }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#8e8784' }}>
                        {u.role}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff8901' }}>
                    Entrar →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: RECUPERACIÓN DE CONTRASEÑA
          ========================================================================= */}
      {showForgotModal && (
        <div className="modal-backdrop" onClick={() => setShowForgotModal(false)} style={{ zIndex: 9999 }}>
          <div
            className="modal-box animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid #eae7e5'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f0edeb', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#251f1d' }}>
                Recuperación de Contraseña
              </h3>
              <button onClick={() => setShowForgotModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, display: 'flex' }}>
                <CloseIcon size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#6e6764', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Para restablecer tus credenciales corporativas de Outlet Autocorp, contacta al administrador de sistemas o escribe a:
            </p>
            <div style={{ background: '#f8f7f6', padding: '12px', borderRadius: '8px', border: '1px solid #eae7e5', marginBottom: '18px' }}>
              <strong style={{ fontSize: '13px', color: '#251f1d', display: 'block' }}>Soporte de TI Outlet Autocorp:</strong>
              <span style={{ fontSize: '12px', color: '#ff8901', fontWeight: 700 }}>soporte.it@autocorp.mx</span>
              <div style={{ fontSize: '11px', color: '#8e8784', marginTop: '4px' }}>Extensión interna: 402 / 405 (Horario: 09:00 - 18:00)</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowForgotModal(false)}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#ff8901', color: '#251f1d', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
