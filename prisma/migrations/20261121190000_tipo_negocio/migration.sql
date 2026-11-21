-- El tipo de negocio (solicitud/apartado/venta) deja de vivir solo en la UI
-- (prop `modo`) y se vuelve un campo propio: fuente única de verdad.
CREATE TYPE "TipoNegocio" AS ENUM ('SOLICITUD', 'APARTADO', 'VENTA');
ALTER TABLE "negocio" ADD COLUMN "tipo" "TipoNegocio" NOT NULL DEFAULT 'SOLICITUD';

-- Backfill determinista de los negocios existentes con la misma regla que
-- ya usaba estatusVehiculoParaNegocio: venta gana sobre enganche.
UPDATE "negocio" SET "tipo" = 'VENTA' WHERE "total_unidad" IS NOT NULL;
UPDATE "negocio" SET "tipo" = 'APARTADO' WHERE "total_unidad" IS NULL AND "dio_enganche" = true;
