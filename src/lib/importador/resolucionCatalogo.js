import { prisma } from '@/lib/prisma';
import { normalizarTexto } from './normalizar';

const CAMPOS_OBLIGATORIOS = ['modelo', 'nombre', 'anio', 'transmision', 'condicion', 'marca', 'unidadNegocio'];

const ETIQUETA_CAMPO = {
  modelo: 'modelo',
  nombre: 'descripción',
  anio: 'año',
  transmision: 'transmisión',
  condicion: 'condición',
  marca: 'marca',
  unidadNegocio: 'unidad de negocio',
};

function valoresPorCampo(filaCruda, mapeo) {
  const valores = {};
  for (const { columna, campo } of mapeo) {
    if (campo) valores[campo] = filaCruda[columna];
  }
  return valores;
}

function campoFaltante(valores) {
  return CAMPOS_OBLIGATORIOS.find((campo) => !String(valores[campo] ?? '').trim());
}

function encontrarPorNombre(entradas, nombreBuscado) {
  const normalizado = normalizarTexto(nombreBuscado);
  return entradas.find((entrada) => normalizarTexto(entrada.nombre) === normalizado);
}

export async function clasificarFilas({ filas, mapeo, usuarioActual }) {
  const [marcas, unidadesNegocio] = await Promise.all([
    prisma.marca.findMany(),
    prisma.unidadNegocio.findMany(),
  ]);

  // Un solo viaje a la base para todos los VIN del archivo, en vez de uno por
  // fila: con archivos grandes (la spec no impone límite de filas), N
  // consultas secuenciales sería el costo dominante de analizar.
  const vinsDelArchivo = filas
    .map((filaCruda) => valoresPorCampo(filaCruda, mapeo).vin?.trim())
    .filter(Boolean);
  const vinsExistentes = vinsDelArchivo.length
    ? new Set((await prisma.vehiculo.findMany({ where: { vin: { in: vinsDelArchivo } }, select: { vin: true } })).map((v) => v.vin))
    : new Set();

  const resultado = [];
  for (const filaCruda of filas) {
    const valores = valoresPorCampo(filaCruda, mapeo);

    const faltante = campoFaltante(valores);
    if (faltante) {
      resultado.push({ datosOriginales: filaCruda, estado: 'error', motivoError: `campo obligatorio faltante: ${ETIQUETA_CAMPO[faltante]}` });
      continue;
    }

    const anio = Number(valores.anio);
    if (!Number.isInteger(anio)) {
      resultado.push({ datosOriginales: filaCruda, estado: 'error', motivoError: 'año no numérico' });
      continue;
    }

    const marca = encontrarPorNombre(marcas, valores.marca);
    const unidadNegocio = encontrarPorNombre(unidadesNegocio, valores.unidadNegocio);

    if (!marca) {
      resultado.push({
        datosOriginales: filaCruda,
        estado: 'pendiente-marca',
        candidatosResolucion: marcas,
        unidadNegocioIdResuelto: unidadNegocio?.id ?? null,
      });
      continue;
    }

    if (!unidadNegocio) {
      resultado.push({
        datosOriginales: filaCruda,
        estado: 'pendiente-unidadNegocio',
        candidatosResolucion: unidadesNegocio,
        marcaIdResuelto: marca.id,
      });
      continue;
    }

    if (!usuarioActual.esAdministrador && unidadNegocio.id !== usuarioActual.unidadNegocioId) {
      resultado.push({ datosOriginales: filaCruda, estado: 'error', motivoError: 'unidad de negocio no permitida para este usuario' });
      continue;
    }

    const vin = valores.vin?.trim() || null;
    if (vin && vinsExistentes.has(vin)) {
      resultado.push({ datosOriginales: filaCruda, estado: 'error', motivoError: 'VIN duplicado' });
      continue;
    }

    resultado.push({
      datosOriginales: filaCruda,
      estado: 'lista',
      valoresResueltos: {
        nombre: valores.nombre,
        modelo: valores.modelo,
        anio,
        km: valores.km ? Number(valores.km) : 0,
        vin,
        transmision: valores.transmision,
        condicion: valores.condicion,
        precio: valores.precio ? Number(valores.precio) : null,
        marcaId: marca.id,
        unidadNegocioId: unidadNegocio.id,
      },
    });
  }

  return resultado;
}
