-- Permiso pasa de {nombre, codigo} a {nombre, recurso, accion}.
-- La tabla está vacía en todo entorno hasta ahora (nunca se sembraron
-- permisos), así que no hay pérdida de datos real.

ALTER TABLE "permiso" DROP CONSTRAINT IF EXISTS "permiso_codigo_key";
ALTER TABLE "permiso" DROP COLUMN "codigo";
ALTER TABLE "permiso" ADD COLUMN "recurso" TEXT NOT NULL;
ALTER TABLE "permiso" ADD COLUMN "accion" TEXT NOT NULL;

CREATE UNIQUE INDEX "permiso_recurso_accion_key" ON "permiso"("recurso", "accion");
