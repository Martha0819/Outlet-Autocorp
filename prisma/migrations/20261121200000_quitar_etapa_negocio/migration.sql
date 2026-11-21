-- `etapa` era un catálogo de texto libre que terminó duplicando a `tipo`
-- (Solicitudes/Apartados/Venta) y mezclando ahí etapas que ni son del
-- negocio (Cliente, Pruebas de manejo). La etapa real del cliente ahora se
-- calcula sola a partir de sus datos (demos, negocios) — ver
-- src/lib/clientes/etapaCliente.js — así que esta columna y su catálogo
-- dejan de hacer falta.
ALTER TABLE "negocio" DROP CONSTRAINT "negocio_etapa_id_fkey";
ALTER TABLE "negocio" DROP COLUMN "etapa_id";
DROP TABLE "etapa";
