import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { useNotify } from '@/store/features/ui/useNotify';
import { useLoginMutation } from './authApiSlice';
import { setAuth } from './authSlice';

export function useLogin() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notify = useNotify();
  const [login, { isLoading }] = useLoginMutation();

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

  return { login: doLogin, isLoading };
}
