-- Mismo bug de origen que las migraciones de hace unos días: el campo
-- "folio" se agregó a Negocio en el schema (commit f98328e, "fix.clientes")
-- pero nunca se generó su migración. Existía en dev porque alguien la
-- agregó por fuera de las migraciones; nunca llegó a producción, por eso
-- /api/negocios respondía 500 (P2022: la columna no existe).
ALTER TABLE "negocio" ADD COLUMN "folio" TEXT;
