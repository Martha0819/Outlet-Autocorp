-- "condicion" (enum NUEVO/SEMINUEVO) se elimina: el campo "linea_negocio_id"
-- de hoy se renombra a "servicio_id" y pasa a cubrir esa clasificación
-- (sigue apuntando al mismo catálogo linea_negocio).
ALTER TABLE "vehiculo" DROP COLUMN "condicion";
DROP TYPE "CondicionVehiculo";
ALTER TABLE "vehiculo" RENAME COLUMN "linea_negocio_id" TO "servicio_id";
