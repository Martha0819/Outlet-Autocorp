/**
 * Bootstrap mínimo para producción: lo justo para poder entrar al sistema
 * por primera vez y empezar a operar — nada más.
 *
 * Crea (idempotente, se puede correr varias veces sin duplicar):
 *   - Los 4 tipo_usuario (Administrador, Gerente, Vendedor, Hostes)
 *   - La matriz completa de permisos (8 recursos x 4 acciones) — vacía de
 *     asignaciones; Administrador no la necesita (bypass), los demás roles
 *     se configuran después desde /usuarios → Permisos
 *   - Una marca y una unidad de negocio placeholder (ajustables por env var)
 *   - Un usuario Administrador real, con la unidad anterior
 *
 * No siembra Turno/Etapa/LineaNegocio/TipoSeguimiento ni ningún Vehiculo o
 * Cliente — eso es trabajo real del evento, no bootstrap.
 *
 * Uso:
 *   SEED_ADMIN_EMAIL=admin@tuevento.mx SEED_ADMIN_PASSWORD=cambia-esto \
 *     npx prisma db seed
 *
 * Variables opcionales:
 *   SEED_ADMIN_NOMBRE   (default: "Administrador")
 *   SEED_MARCA_NOMBRE   (default: "Corporativo")
 *   SEED_UNIDAD_NOMBRE  (default: "Coordinación General")
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TIPOS_USUARIO = ['Administrador', 'Gerente', 'Vendedor', 'Hostes'];

const RECURSOS = ['usuario', 'vehiculo', 'cliente', 'negocio', 'demo', 'guardia', 'actividad', 'catalogo'];
const ACCIONES = ['crear', 'leer', 'editar', 'eliminar'];

const RECURSO_LABELS = {
  usuario: 'Usuarios',
  vehiculo: 'Vehículos',
  cliente: 'Clientes',
  negocio: 'Negocios',
  demo: 'Demos',
  guardia: 'Guardias',
  actividad: 'Actividades',
  catalogo: 'Catálogos',
};
const ACCION_LABELS = { crear: 'Crear', leer: 'Leer', editar: 'Editar', eliminar: 'Eliminar' };

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Define SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD antes de correr el seed. Ej:\n' +
        '  SEED_ADMIN_EMAIL=admin@tuevento.mx SEED_ADMIN_PASSWORD=cambia-esto npx prisma db seed'
    );
  }
  if (password.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD debe tener al menos 8 caracteres.');
  }

  for (const nombre of TIPOS_USUARIO) {
    await prisma.tipoUsuario.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }
  console.log(`tipo_usuario: ${TIPOS_USUARIO.join(', ')}`);

  let permisosCreados = 0;
  for (const recurso of RECURSOS) {
    for (const accion of ACCIONES) {
      await prisma.permiso.upsert({
        where: { recurso_accion: { recurso, accion } },
        update: {},
        create: { nombre: `${ACCION_LABELS[accion]} ${RECURSO_LABELS[recurso]}`, recurso, accion },
      });
      permisosCreados += 1;
    }
  }
  console.log(`permiso: matriz completa (${permisosCreados} combinaciones recurso×acción)`);

  const marcaNombre = process.env.SEED_MARCA_NOMBRE || 'Corporativo';
  const marca = await prisma.marca.upsert({
    where: { nombre: marcaNombre },
    update: {},
    create: { nombre: marcaNombre },
  });
  console.log(`marca: "${marca.nombre}"`);

  const unidadNombre = process.env.SEED_UNIDAD_NOMBRE || 'Coordinación General';
  let unidad = await prisma.unidadNegocio.findFirst({ where: { nombre: unidadNombre } });
  if (!unidad) {
    unidad = await prisma.unidadNegocio.create({ data: { nombre: unidadNombre, marcaId: marca.id } });
  }
  console.log(`unidad_negocio: "${unidad.nombre}"`);

  const tipoAdministrador = await prisma.tipoUsuario.findUniqueOrThrow({ where: { nombre: 'Administrador' } });
  const nombreAdmin = process.env.SEED_ADMIN_NOMBRE || 'Administrador';
  const passwordHash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      nombre: nombreAdmin,
      email,
      passwordHash,
      tipoUsuarioId: tipoAdministrador.id,
      unidadNegocioId: unidad.id,
    },
  });
  console.log(`usuario Administrador: ${usuario.email}`);

  console.log('\nListo. Inicia sesión con ese email y la contraseña que diste en SEED_ADMIN_PASSWORD.');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
