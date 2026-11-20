ALTER TABLE "vehiculo" ADD COLUMN "fecha_ingreso" TIMESTAMP(3);
UPDATE "vehiculo" SET "fecha_ingreso" = "created_at" WHERE "fecha_ingreso" IS NULL;
ALTER TABLE "vehiculo" ALTER COLUMN "fecha_ingreso" SET NOT NULL;
ALTER TABLE "vehiculo" ALTER COLUMN "fecha_ingreso" SET DEFAULT now();
