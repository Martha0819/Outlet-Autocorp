-- Renombra "precio" a "precio_sin_iva" y agrega precio_lista, precio_remate y bono
ALTER TABLE "vehiculo" RENAME COLUMN "precio" TO "precio_sin_iva";
ALTER TABLE "vehiculo" ADD COLUMN "precio_lista" DECIMAL(12,2);
ALTER TABLE "vehiculo" ADD COLUMN "precio_remate" DECIMAL(12,2);
ALTER TABLE "vehiculo" ADD COLUMN "bono" DECIMAL(12,2);
