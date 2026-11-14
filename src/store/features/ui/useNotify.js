import { useAppDispatch } from '@/store/hooks';
import { addToast, removeToast } from './toastSlice';

const AUTO_DISMISS_MS = 3600;

export function useNotify() {
  const dispatch = useAppDispatch();

  return (message, type = 'success') => {
    const action = addToast(message, type);
    dispatch(action);
    setTimeout(() => dispatch(removeToast(action.payload.id)), AUTO_DISMISS_MS);
  };
}
