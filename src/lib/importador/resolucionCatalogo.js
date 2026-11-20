import { prisma } from '@/lib/prisma';
import { normalizarTexto, aNumero, numeroOpcional } from './normalizar';

// "nombre" (descripción) NO es obligatorio: muchos archivos reales no traen
// una columna de descripción separada del modelo, así que si falta se usa el
// propio modelo como descripción (ver más abajo), en vez de bloquear la fila.
const CAMPOS_OBLIGATORIOS = ['modelo', 'anio', 'marca', 'precioLista'];

const ETIQUETA_CAMPO = {
  modelo: 'modelo',
  anio: 'año',
  marca: 'marca',
  precioLista: 'precio de lista',
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

// La unidad de negocio NO se resuelve por fila: todo el archivo pertenece a
// una sola unidad, elegida una vez en la pantalla de revisión (no varía
// fila por fila como marca o servicio).
export async function clasificarFilas({ filas, mapeo }) {
  const [marcas, servicios] = await Promise.all([
    prisma.marca.findMany(),
    prisma.lineaNegocio.findMany(),
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

    const anio = aNumero(valores.anio);
    if (!Number.isInteger(anio)) {
      resultado.push({ datosOriginales: filaCruda, estado: 'error', motivoError: 'año no numérico' });
      continue;
    }

    const precioLista = aNumero(valores.precioLista);
    if (!Number.isFinite(precioLista) || precioLista <= 0) {
      resultado.push({ datosOriginales: filaCruda, estado: 'error', motivoError: 'precio de lista no numérico' });
      continue;
    }

    const marca = encontrarPorNombre(marcas, valores.marca);

    if (!marca) {
      resultado.push({
        datosOriginales: filaCruda,
        estado: 'pendiente-marca',
        candidatosResolucion: marcas,
      });
      continue;
    }

    const servicio = valores.servicio?.trim() ? encontrarPorNombre(servicios, valores.servicio) : null;
    if (valores.servicio?.trim() && !servicio) {
      resultado.push({
        datosOriginales: filaCruda,
        estado: 'pendiente-servicio',
        candidatosResolucion: servicios,
        marcaIdResuelto: marca.id,
      });
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
        nombre: valores.nombre?.trim() || valores.modelo,
        modelo: valores.modelo,
        anio,
        km: numeroOpcional(valores.km) ?? 0,
        vin,
        transmision: valores.transmision?.trim() ? valores.transmision.trim() : null,
        colorExterior: valores.colorExterior?.trim() ? valores.colorExterior.trim() : null,
        colorInterior: valores.colorInterior?.trim() ? valores.colorInterior.trim() : null,
        precioSinIva: numeroOpcional(valores.precioSinIva),
        precioLista,
        precioRemate: numeroOpcional(valores.precioRemate),
        bono: numeroOpcional(valores.bono),
        diasInventario: numeroOpcional(valores.diasInventario),
        marcaId: marca.id,
        servicioId: servicio?.id ?? null,
      },
    });
  }

  return resultado;
}
