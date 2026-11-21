import { prisma } from '@/lib/prisma';
import { normalizarTexto, numeroOpcional, aBooleanoOpcional } from './normalizar';

// unidadNegocioId NO se mapea ni se resuelve aquí: igual que el alta manual
// (POST /api/clientes), siempre es la del usuario que importa — nunca se
// elige por archivo ni por fila.
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

function encontrarPorNombre(entradas, nombreBuscado) {
  const normalizado = normalizarTexto(nombreBuscado);
  return entradas.find((entrada) => normalizarTexto(entrada.nombre) === normalizado);
}

// Deriva si la fila trae intención de marca específica: una columna
// explícita manda; si no hay columna (o está vacía), se infiere de si
// trajeron algún texto en la columna de marca.
function resolverIntencionMarca(valores) {
  const explicita = aBooleanoOpcional(valores.visitaMarcaEspecifica);
  if (explicita !== undefined) return explicita;
  return Boolean(valores.marca?.trim());
}

export async function clasificarFilasClientes({ filas, mapeo }) {
  const marcas = await prisma.marca.findMany();

  const resultado = [];
  for (const filaCruda of filas) {
    const valores = valoresPorCampo(filaCruda, mapeo);

    const faltante = campoFaltante(valores);
    if (faltante) {
      resultado.push({ datosOriginales: filaCruda, estado: 'error', motivoError: `campo obligatorio faltante: ${ETIQUETA_CAMPO[faltante]}` });
      continue;
    }

    const visitaMarcaEspecifica = resolverIntencionMarca(valores);
    let marcaId = null;
    if (visitaMarcaEspecifica) {
      const marca = valores.marca?.trim() ? encontrarPorNombre(marcas, valores.marca) : null;
      if (!marca) {
        resultado.push({
          datosOriginales: filaCruda,
          estado: 'pendiente-marca',
          candidatosResolucion: marcas,
        });
        continue;
      }
      marcaId = marca.id;
    }

    resultado.push({
      datosOriginales: filaCruda,
      estado: 'lista',
      valoresResueltos: {
        nombre: valores.nombre.trim(),
        telefono: valores.telefono.trim(),
        correo: valores.correo?.trim() || null,
        numeroAcompanantes: numeroOpcional(valores.numeroAcompanantes) ?? 0,
        visitaMarcaEspecifica,
        marcaId,
        observaciones: valores.observaciones?.trim() || null,
      },
    });
  }

  return resultado;
}
