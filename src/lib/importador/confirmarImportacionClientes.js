import { prisma } from '@/lib/prisma';
import { registrarBitacora } from '@/lib/auth/bitacora';
import { numeroOpcional, aBooleanoOpcional } from './normalizar';

const CAMPOS_OBLIGATORIOS = ['nombre', 'telefono'];

const ETIQUETA_CAMPO = {
  nombre: 'nombre',
  telefono: 'teléfono',
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

export async function confirmarFilasClientes({ mapeoFinal, filasDecididas, usuarioActual }) {
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

    const marcaId = fila.marcaId ?? null;

    try {
      const cliente = await prisma.cliente.create({
        data: {
          nombre: valores.nombre.trim(),
          telefono: valores.telefono.trim(),
          correo: valores.correo?.trim() || null,
          numeroAcompanantes: numeroOpcional(valores.numeroAcompanantes) ?? 0,
          visitaMarcaEspecifica: Boolean(marcaId) || aBooleanoOpcional(valores.visitaMarcaEspecifica) === true,
          marcaId,
          // Igual que el alta manual: siempre la unidad de quien importa.
          unidadNegocioId: usuarioActual.unidadNegocioId,
          observaciones: valores.observaciones?.trim() || null,
        },
      });
      await registrarBitacora({
        usuarioId: usuarioActual.id,
        accion: 'crear',
        recurso: 'cliente',
        recursoId: cliente.id,
        detalle: `${cliente.nombre} (importado)`,
      });
      importados.push(cliente);
    } catch (error) {
      // Una fila mala nunca bloquea a las demás: se reporta y se sigue.
      if (error.code !== 'P2002') {
        console.error('Error al crear cliente durante importación:', error);
      }
      const motivo = error.code === 'P2003' ? 'marca inválida' : `no se pudo crear el cliente: ${error.message || error.code || 'error desconocido'}`;
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
