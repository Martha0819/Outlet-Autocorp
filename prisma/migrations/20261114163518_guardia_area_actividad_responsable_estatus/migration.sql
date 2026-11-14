-- CreateEnum
CREATE TYPE "EstatusActividad" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA');

-- AlterTable
ALTER TABLE "actividad" ADD COLUMN     "estatus" "EstatusActividad" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "responsable_id" INTEGER;

-- AlterTable
ALTER TABLE "guardia" ADD COLUMN     "area" TEXT;

-- AddForeignKey
ALTER TABLE "actividad" ADD CONSTRAINT "actividad_responsable_id_fkey" FOREIGN KEY ("responsable_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
