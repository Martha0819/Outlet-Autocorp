import { prisma } from '@/lib/prisma';

export async function limpiarBaseDePrueba() {
  await prisma.bitacora.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.vehiculo.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.tipoUsuarioPermiso.deleteMany();
  await prisma.permiso.deleteMany();
  await prisma.tipoUsuario.deleteMany();
  await prisma.unidadNegocio.deleteMany();
  await prisma.marca.deleteMany();
  await prisma.lineaNegocio.deleteMany();
}

export async function sembrarCatalogo() {
  const nissan = await prisma.marca.create({ data: { nombre: 'Nissan' } });
  const honda = await prisma.marca.create({ data: { nombre: 'Honda' } });
  const matriz = await prisma.unidadNegocio.create({ data: { nombre: 'Matriz', marcaId: nissan.id } });
  const sucursalNorte = await prisma.unidadNegocio.create({ data: { nombre: 'Sucursal Norte', marcaId: honda.id } });
  const nuevos = await prisma.lineaNegocio.create({ data: { nombre: 'Nuevos' } });
  const seminuevos = await prisma.lineaNegocio.create({ data: { nombre: 'Seminuevos' } });
  return { nissan, honda, matriz, sucursalNorte, nuevos, seminuevos };
}
