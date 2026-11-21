import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { useNotify } from '@/store/features/ui/useNotify';
import { useLoginMutation, useLoginGuestMutation } from './authApiSlice';
import { setAuth } from './authSlice';

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notify = useNotify();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [loginGuest, { isLoading: isGuestLoading }] = useLoginGuestMutation();

  const doLogin = async ({ email, password }) => {
    try {
      const usuario = await login({ email, password }).unwrap();
      dispatch(setAuth(usuario));
      notify(`Bienvenido, ${usuario.nombre}`);
      router.replace('/');
      return { ok: true };
    } catch (error) {
      const message = error?.data?.error || 'Credenciales inválidas';
      notify(message, 'error');
      return { ok: false, message };
    }
  };

  const doLoginGuest = async () => {
    try {
      const usuario = await loginGuest().unwrap();
      dispatch(setAuth(usuario));
      notify('Accediendo como Invitado (Modo Solo Lectura)');
      router.replace('/');
      return { ok: true };
    } catch (error) {
      const message = error?.data?.error || 'No se pudo acceder como invitado';
      notify(message, 'error');
      return { ok: false, message };
    }
  };

  return { login: doLogin, loginGuest: doLoginGuest, isLoading: isLoginLoading || isGuestLoading };
}
