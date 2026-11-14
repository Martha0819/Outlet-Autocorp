import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { useNotify } from '@/store/features/ui/useNotify';
import { useLogoutMutation } from './authApiSlice';
import { logout } from './authSlice';

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notify = useNotify();
  const [logoutRequest, { isLoading }] = useLogoutMutation();

  const doLogout = async () => {
    try {
      await logoutRequest().unwrap();
    } catch {
      // Si la llamada falla (red, sesión ya expirada), igual limpiamos el
      // estado local y mandamos a /login — no tiene sentido dejar al usuario
      // atrapado en una página protegida por un error de red.
    }
    dispatch(logout());
    notify('Sesión cerrada');
    router.push('/login');
  };

  return { logout: doLogout, isLoading };
}
