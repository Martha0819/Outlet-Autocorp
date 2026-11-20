-- condicion deja de ser obligatoria (el importador no siempre la trae)
ALTER TABLE "vehiculo" ALTER COLUMN "condicion" DROP NOT NULL;

-- Nueva relación opcional Vehiculo -> LineaNegocio (reutiliza el catálogo existente)
ALTER TABLE "vehiculo" ADD COLUMN "linea_negocio_id" INTEGER;
ALTER TABLE "vehiculo" ADD CONSTRAINT "vehiculo_linea_negocio_id_fkey"
  FOREIGN KEY ("linea_negocio_id") REFERENCES "linea_negocio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
