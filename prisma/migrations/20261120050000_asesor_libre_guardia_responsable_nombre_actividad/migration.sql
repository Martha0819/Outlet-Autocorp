-- El commit 28179e2 agregó asesorNombre/asesorCorreo/asesorTelefono y volvió
-- opcional usuarioId en el schema de Guardia, y responsableNombre en
-- Actividad, pero nunca generó la migración: las columnas nunca llegaron a
-- la base real, por eso /api/guardias y /api/actividades respondían 500.
ALTER TABLE "guardia" ALTER COLUMN "usuario_id" DROP NOT NULL;
ALTER TABLE "guardia" ADD COLUMN "asesor_nombre" TEXT;
ALTER TABLE "guardia" ADD COLUMN "asesor_correo" TEXT;
ALTER TABLE "guardia" ADD COLUMN "asesor_telefono" TEXT;

ALTER TABLE "actividad" ADD COLUMN "responsable_nombre" TEXT;
