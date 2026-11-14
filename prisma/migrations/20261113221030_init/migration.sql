-- CreateEnum
CREATE TYPE "CondicionVehiculo" AS ENUM ('NUEVO', 'SEMINUEVO');

-- CreateEnum
CREATE TYPE "EstatusVehiculo" AS ENUM ('DISPONIBLE', 'APARTADO', 'VENDIDO', 'NO_DISPONIBLE');

-- CreateTable
CREATE TABLE "marca" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "marca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linea_negocio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "linea_negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidad_negocio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "unidad_negocio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependencia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "dependencia_padre_id" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "dependencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipo_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_usuario_permiso" (
    "tipo_usuario_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,

    CONSTRAINT "tipo_usuario_permiso_pkey" PRIMARY KEY ("tipo_usuario_id","permiso_id")
);

-- CreateTable
CREATE TABLE "turno" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapa" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "etapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_seguimiento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "tipo_seguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "unidad_negocio_id" INTEGER NOT NULL,
    "tipo_usuario_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardia" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "horario_inicio" TIME,
    "horario_fin" TIME,
    "turno_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guardia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "horario" TIME NOT NULL,
    "unidad_negocio_id" INTEGER,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "km" INTEGER NOT NULL,
    "vin" TEXT,
    "transmision" TEXT NOT NULL,
    "condicion" "CondicionVehiculo" NOT NULL,
    "marca_id" INTEGER NOT NULL,
    "unidad_negocio_id" INTEGER NOT NULL,
    "estatus" "EstatusVehiculo" NOT NULL DEFAULT 'DISPONIBLE',
    "precio" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT,
    "visita_marca_especifica" BOOLEAN NOT NULL DEFAULT false,
    "marca_id" INTEGER,
    "observaciones" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "vehiculo_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negocio" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "unidad_negocio_id" INTEGER NOT NULL,
    "linea_negocio_id" INTEGER NOT NULL,
    "tipo_seguimiento_id" INTEGER,
    "etapa_id" INTEGER NOT NULL,
    "vehiculo_id" INTEGER,
    "dio_enganche" BOOLEAN NOT NULL DEFAULT false,
    "enganche" DECIMAL(12,2),
    "total_unidad" DECIMAL(12,2),
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "negocio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marca_nombre_key" ON "marca"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "linea_negocio_nombre_key" ON "linea_negocio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_usuario_nombre_key" ON "tipo_usuario"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_codigo_key" ON "permiso"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "turno_nombre_key" ON "turno"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "etapa_nombre_key" ON "etapa"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_seguimiento_nombre_key" ON "tipo_seguimiento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculo_vin_key" ON "vehiculo"("vin");

-- AddForeignKey
ALTER TABLE "unidad_negocio" ADD CONSTRAINT "unidad_negocio_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependencia" ADD CONSTRAINT "dependencia_dependencia_padre_id_fkey" FOREIGN KEY ("dependencia_padre_id") REFERENCES "dependencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_usuario_permiso" ADD CONSTRAINT "tipo_usuario_permiso_tipo_usuario_id_fkey" FOREIGN KEY ("tipo_usuario_id") REFERENCES "tipo_usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_usuario_permiso" ADD CONSTRAINT "tipo_usuario_permiso_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permiso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_unidad_negocio_id_fkey" FOREIGN KEY ("unidad_negocio_id") REFERENCES "unidad_negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_tipo_usuario_id_fkey" FOREIGN KEY ("tipo_usuario_id") REFERENCES "tipo_usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardia" ADD CONSTRAINT "guardia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardia" ADD CONSTRAINT "guardia_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad" ADD CONSTRAINT "actividad_unidad_negocio_id_fkey" FOREIGN KEY ("unidad_negocio_id") REFERENCES "unidad_negocio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculo" ADD CONSTRAINT "vehiculo_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculo" ADD CONSTRAINT "vehiculo_unidad_negocio_id_fkey" FOREIGN KEY ("unidad_negocio_id") REFERENCES "unidad_negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo" ADD CONSTRAINT "demo_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo" ADD CONSTRAINT "demo_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo" ADD CONSTRAINT "demo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocio" ADD CONSTRAINT "negocio_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocio" ADD CONSTRAINT "negocio_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocio" ADD CONSTRAINT "negocio_unidad_negocio_id_fkey" FOREIGN KEY ("unidad_negocio_id") REFERENCES "unidad_negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocio" ADD CONSTRAINT "negocio_linea_negocio_id_fkey" FOREIGN KEY ("linea_negocio_id") REFERENCES "linea_negocio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocio" ADD CONSTRAINT "negocio_tipo_seguimiento_id_fkey" FOREIGN KEY ("tipo_seguimiento_id") REFERENCES "tipo_seguimiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocio" ADD CONSTRAINT "negocio_etapa_id_fkey" FOREIGN KEY ("etapa_id") REFERENCES "etapa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negocio" ADD CONSTRAINT "negocio_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
