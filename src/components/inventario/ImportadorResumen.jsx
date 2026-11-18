'use client';

export function ImportadorResumen({ resumen }) {
  return (
    <div>
      <h3>Resumen de la importación</h3>
      <dl>
        <dt>Importados</dt>
        <dd>{resumen.importados.cuenta}</dd>
        <dt>Con error</dt>
        <dd>{resumen.conError.cuenta}</dd>
        <dt>Resueltos manualmente</dt>
        <dd>{resumen.resueltosManualmente}</dd>
      </dl>

      {resumen.conError.cuenta > 0 ? (
        <table>
          <tbody>
            {resumen.conError.lista.map((fila, indice) => (
              <tr key={indice}>
                <td>{JSON.stringify(fila.datosOriginales)}</td>
                <td>{fila.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
