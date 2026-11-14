'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useVerifyQuery } from '@/store/features/auth/authApiSlice';
import { setAuth, logout } from '@/store/features/auth/authSlice';

const VERIFY_POLL_MS = 5 * 60 * 1000;

export function AppLayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/login';

  const dispatch = useAppDispatch();
  // Redux es memoria del navegador: nada la invalida sola si el token
  // expira o se revoca mientras la pestaña sigue abierta sin navegar (y el
  // dashboard hoy no consume ningún endpoint de datos que dispare el 401 de
  // apiSlice). Por eso NO se usa skip:isAuthenticated: se re-verifica en
  // cada navegación a una vista protegida y además cada VERIFY_POLL_MS en
  // reposo, y un 401 aquí sí cierra la sesión de verdad.
  const { data, error, isFetching } = useVerifyQuery(undefined, {
    skip: isLoginPage,
    pollingInterval: VERIFY_POLL_MS,
  });

  useEffect(() => {
    if (data?.authenticated && data.usuario) {
      dispatch(setAuth(data.usuario));
    }
  }, [data, dispatch]);

  useEffect(() => {
    // OJO: no condicionar esto a isAuthenticated (ver comentario histórico:
    // apiSlice.js ya hace dispatch(logout()) antes de que este efecto corra
    // cuando el refresh también falla, así que exigir isAuthenticated===true
    // nunca se cumplía).
    //
    // OJO 2: tampoco reaccionar mientras isFetching===true. La query de
    // verify guarda su último `error` en caché bajo la misma key (siempre
    // undefined de args) entre montajes del componente. Al salir de /login
    // (donde esta query estaba skip) y entrar al dashboard tras un login
    // exitoso, el remount ve por un instante el `error` VIEJO (el 401 de
    // antes de loguearse) mientras la petición NUEVA todavía está en vuelo
    // — sin este chequeo, eso bastaba para disparar logout()+redirect de
    // vuelta a /login en loop, aunque la sesión nueva fuera válida.
    if (error && !isFetching) {
      dispatch(logout());
      router.replace('/login');
    }
  }, [error, isFetching, dispatch, router]);

  if (isLoginPage) {
    return <main style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}>{children}</main>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main-wrapper">
        <AppHeader />
        <main className="app-content-area">{children}</main>
      </div>
    </div>
  );
}
