-- AlterTable
ALTER TABLE "cliente" ADD COLUMN     "unidad_negocio_id" INTEGER;

-- CreateTable
CREATE TABLE "bitacora" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "accion" TEXT NOT NULL,
    "recurso" TEXT NOT NULL,
    "recurso_id" INTEGER,
    "detalle" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_unidad_negocio_id_fkey" FOREIGN KEY ("unidad_negocio_id") REFERENCES "unidad_negocio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora" ADD CONSTRAINT "bitacora_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
