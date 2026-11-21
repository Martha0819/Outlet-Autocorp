-- Mismo bug de origen que la migración de guardia/actividad: el commit
-- 28179e2 agregó numeroAcompanantes a Cliente en el schema pero nunca generó
-- la migración, así que la columna nunca llegó a la base y /api/clientes
-- (y el registro de huéspedes en el dashboard) respondían 500. También
-- alinea la FK renombrada de vehiculo (servicio reemplazó linea_negocio) y
-- el onDelete de guardia.usuario_id (SET NULL, no RESTRICT) con el schema.

-- DropForeignKey
ALTER TABLE "guardia" DROP CONSTRAINT "guardia_usuario_id_fkey";

-- AlterTable
ALTER TABLE "cliente" ADD COLUMN     "numero_acompanantes" INTEGER NOT NULL DEFAULT 0;

-- RenameForeignKey
ALTER TABLE "vehiculo" RENAME CONSTRAINT "vehiculo_linea_negocio_id_fkey" TO "vehiculo_servicio_id_fkey";

-- AddForeignKey
ALTER TABLE "guardia" ADD CONSTRAINT "guardia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

