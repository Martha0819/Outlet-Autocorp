'use client';

import React, { useState } from 'react';
import { useLogin } from '@/store/features/auth/useLogin';

export default function LoginPage() {
  const { login, loginGuest, isLoading } = useLogin();

  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Por favor ingresa tu usuario o correo.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Por favor ingresa tu contraseña.');
      return;
    }

    const result = await login({ email: email.trim(), password });
    if (!result.ok) {
      setErrorMsg(result.message);
    }
  };

  const handleGuestLogin = async () => {
    setErrorMsg('');
    const result = await loginGuest();
    if (!result.ok) {
      setErrorMsg(result.message);
    }
  };

  // Fondo fotográfico automotriz de alta resolución en carretera
  const carFullBgUrl = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        fontFamily: "'Montserrat', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        overflow: 'hidden',
        backgroundColor: '#121110',
        backgroundImage: `linear-gradient(135deg, rgba(18, 17, 16, 0.78) 0%, rgba(37, 31, 29, 0.85) 100%), url("${carFullBgUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Sutil difuminado ambiental en el fondo para realzar la tarjeta central */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          pointerEvents: 'none'
        }}
      />

      {/* =========================================================================
          TARJETA PRINCIPAL DE LOGIN
          ========================================================================= */}
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          minHeight: '500px',
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.45), 0 8px 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* =======================================================================
            LADO IZQUIERDO: CÁPSULA CURVA SÓLIDA NARANJA CON LOGO OFICIAL
            ======================================================================= */}
        <div
          style={{
            flex: '1.05',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '48px 40px',
            textAlign: 'center',
            color: '#ffffff',
            borderTopLeftRadius: '28px',
            borderBottomLeftRadius: '28px',
            borderTopRightRadius: '140px',
            borderBottomRightRadius: '140px',
            overflow: 'hidden',
            backgroundColor: '#ff8901',
            backgroundImage: 'linear-gradient(145deg, #ff941a 0%, #ff8901 60%, #e07200 100%)',
            boxShadow: 'inset -15px 0 30px rgba(0,0,0,0.08), 8px 0 25px rgba(255,137,1,0.25)'
          }}
        >
          {/* LOGO OFICIAL: OUTLET FARRERA GRAN REMATE */}
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <img
              src="/logo-outlet-farrera.png"
              alt="Outlet Farrera Gran Remate"
              style={{
                width: '100%',
                maxWidth: '240px',
                height: 'auto',
                filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.32))',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Título: ¡Hola, Bienvenido! */}
          <h2
            style={{
              fontSize: '34px',
              fontWeight: 900,
              margin: '0',
              letterSpacing: '-0.3px',
              lineHeight: 1.15,
              textShadow: '0 2px 8px rgba(0,0,0,0.18)'
            }}
          >
            ¡Hola, Bienvenido!
          </h2>
        </div>

        {/* =======================================================================
            LADO DERECHO: FORMULARIO "Iniciar Sesión" (EN ESPAÑOL)
            ======================================================================= */}
        <div
          style={{
            flex: '1.15',
            padding: '46px 50px 38px 46px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#ffffff'
          }}
        >
          {/* Título en Español: Iniciar Sesión */}
          <h1
            style={{
              margin: '0 0 28px 0',
              fontSize: '32px',
              fontWeight: 900,
              color: '#251f1d',
              textAlign: 'center',
              letterSpacing: '-0.5px'
            }}
          >
            Iniciar Sesión
          </h1>

          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px',
                textAlign: 'center'
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Input Usuario o Correo con icono a la derecha */}
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuario o correo"
                required
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#edeef2',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#251f1d',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'background 0.2s'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </span>
            </div>

            {/* Input Contraseña con icono de candado a la derecha */}
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#edeef2',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#251f1d',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'background 0.2s'
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </span>
            </div>

            {/* ¿Olvidaste tu contraseña? */}
            <div style={{ textAlign: 'center', margin: '2px 0 6px 0' }}>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón Iniciar Sesión Naranja Sólido */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: '#ff8901',
                color: '#251f1d',
                border: 'none',
                padding: '13px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 900,
                letterSpacing: '0.4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 22px rgba(255, 137, 1, 0.4)',
                marginTop: '2px',
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? 'Accediendo...' : 'Iniciar Sesión'}
            </button>

            {/* Separador */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0 8px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>O</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            </div>

            {/* Botón Acceder como Invitado */}
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: '#f8fafc',
                color: '#1e293b',
                border: '1.5px solid #cbd5e1',
                padding: '11px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>Entrar como invitado</span>
            </button>
          </form>
        </div>
      </div>

      {/* =========================================================================
          MODAL RECUPERAR CONTRASEÑA
          ========================================================================= */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '26px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 800, color: '#251f1d' }}>
              Recuperar Contraseña
            </h3>
            <p style={{ fontSize: '13px', color: '#6e6764', margin: '0 0 18px 0', lineHeight: 1.5 }}>
              Para restablecer tu contraseña comunícate con la administración de sistemas de Outlet Farrera.
            </p>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                width: '100%',
                backgroundColor: '#ff8901',
                color: '#251f1d',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
