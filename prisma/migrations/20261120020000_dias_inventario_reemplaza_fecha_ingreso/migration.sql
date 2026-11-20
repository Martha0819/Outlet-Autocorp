ALTER TABLE "vehiculo" ADD COLUMN "dias_inventario" INTEGER;
UPDATE "vehiculo" SET "dias_inventario" = GREATEST(0, (EXTRACT(DAY FROM (now() - "fecha_ingreso")))::int);
ALTER TABLE "vehiculo" DROP COLUMN "fecha_ingreso";
