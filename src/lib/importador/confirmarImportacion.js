import { prisma } from '@/lib/prisma';
import { registrarBitacora } from '@/lib/auth/bitacora';

const CAMPOS_OBLIGATORIOS = ['modelo', 'nombre', 'anio', 'transmision', 'condicion', 'precioLista'];
const CONDICIONES_VALIDAS = ['NUEVO', 'SEMINUEVO'];

const ETIQUETA_CAMPO = {
  modelo: 'modelo',
  nombre: 'descripción',
  anio: 'año',
  transmision: 'transmisión',
  condicion: 'condición',
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

export async function confirmarFilas({ mapeoFinal, filasDecididas, usuarioActual }) {
  const importados = [];
  const conError = [];
  let resueltosManualmente = 0;

  for (const fila of filasDecididas) {
    if (fila.decision !== 'importar') {
      if (fila.motivoDescartado) {
        conError.push({ datosOriginales: fila.datosOriginales, motivo: fila.motivoDescartado });
      }
      continue;
    }
    if (fila.resueltoManualmente) resueltosManualmente += 1;

    const valores = valoresPorCampo(fila.datosOriginales, mapeoFinal);

    const faltante = campoFaltante(valores);
    if (faltante) {
      conError.push({ datosOriginales: fila.datosOriginales, motivo: `campo obligatorio faltante: ${ETIQUETA_CAMPO[faltante]}` });
      continue;
    }

    const anio = Number(valores.anio);
    if (!Number.isInteger(anio)) {
      conError.push({ datosOriginales: fila.datosOriginales, motivo: 'año no numérico' });
      continue;
    }

    if (!CONDICIONES_VALIDAS.includes(String(valores.condicion ?? '').toUpperCase())) {
      conError.push({ datosOriginales: fila.datosOriginales, motivo: `condición inválida: debe ser ${CONDICIONES_VALIDAS.join(' o ')}` });
      continue;
    }

    const precioLista = Number(valores.precioLista);
    if (!Number.isFinite(precioLista) || precioLista <= 0) {
      conError.push({ datosOriginales: fila.datosOriginales, motivo: 'precio de lista no numérico' });
      continue;
    }

    if (!fila.marcaId || !fila.unidadNegocioId) {
      conError.push({ datosOriginales: fila.datosOriginales, motivo: 'marca o unidad de negocio sin resolver' });
      continue;
    }

    if (!usuarioActual.esAdministrador && fila.unidadNegocioId !== usuarioActual.unidadNegocioId) {
      conError.push({ datosOriginales: fila.datosOriginales, motivo: 'unidad de negocio no permitida para este usuario' });
      continue;
    }

    const vin = valores.vin?.trim() || null;
    if (vin) {
      const yaExiste = await prisma.vehiculo.findUnique({ where: { vin } });
      if (yaExiste) {
        conError.push({ datosOriginales: fila.datosOriginales, motivo: 'VIN duplicado' });
        continue;
      }
    }

    try {
      const vehiculo = await prisma.vehiculo.create({
        data: {
          nombre: valores.nombre,
          modelo: valores.modelo,
          anio,
          km: valores.km ? Number(valores.km) : 0,
          vin,
          transmision: valores.transmision,
          condicion: String(valores.condicion).toUpperCase(),
          marcaId: fila.marcaId,
          unidadNegocioId: fila.unidadNegocioId,
          precioSinIva: valores.precioSinIva ? Number(valores.precioSinIva) : null,
          precioLista,
          precioRemate: valores.precioRemate ? Number(valores.precioRemate) : null,
          bono: valores.bono ? Number(valores.bono) : null,
        },
      });
      await registrarBitacora({
        usuarioId: usuarioActual.id,
        accion: 'crear',
        recurso: 'vehiculo',
        recursoId: vehiculo.id,
        detalle: `${vehiculo.nombre} ${vehiculo.modelo} (importado)`,
      });
      importados.push(vehiculo);
    } catch (error) {
      // Cualquier fallo al crear esta fila se reporta como error de esa fila
      // y nunca interrumpe el lote: las filas ya creadas antes deben quedar
      // guardadas, y las que faltan deben seguir intentándose (spec: una
      // fila mala nunca bloquea a las demás).
      const motivo = error.code === 'P2002' ? 'VIN duplicado' : 'no se pudo crear el vehículo con los datos dados';
      conError.push({ datosOriginales: fila.datosOriginales, motivo });
      continue;
    }
  }

  return {
    importados: { cuenta: importados.length, lista: importados },
    conError: { cuenta: conError.length, lista: conError },
    resueltosManualmente,
  };
}
