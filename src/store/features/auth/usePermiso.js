import { useAppSelector } from '@/store/hooks';

// Solo para UI (ocultar/deshabilitar botones) — la autorización real la
// hace requirePermiso() en el servidor; esto nunca es la última palabra.
export function usePermiso() {
  const usuario = useAppSelector((state) => state.auth.usuario);

  const puede = (recurso, accion) => {
    if (!usuario) return false;
    if (usuario.esAdministrador) return true;
    return (usuario.permisos || []).includes(`${recurso}.${accion}`);
  };

  return { puede, esAdministrador: Boolean(usuario?.esAdministrador) };
}
