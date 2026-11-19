'use client';

const cardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  border: '1px solid #eae7e5',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  padding: '20px',
};

function Stat({ valor, etiqueta, bg, color }) {
  return (
    <div style={{ flex: '1 1 140px', backgroundColor: bg, borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{valor}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color, opacity: 0.85 }}>{etiqueta}</div>
    </div>
  );
}

export function ImportadorResumen({ resumen }) {
  return (
    <div>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#251f1d', margin: '0 0 12px' }}>Resumen de la importación</h3>
      <div style={{ ...cardStyle, display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <Stat valor={resumen.importados.cuenta} etiqueta="Importados" bg="#dcfce7" color="#16a34a" />
        <Stat valor={resumen.conError.cuenta} etiqueta="Con error" bg="#fee2e2" color="#dc2626" />
        <Stat valor={resumen.resueltosManualmente} etiqueta="Resueltos manualmente" bg="#fef3c7" color="#d97706" />
      </div>

      {resumen.conError.cuenta > 0 && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', border: '1px solid #eae7e5', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #eae7e5', fontSize: 13, fontWeight: 800, color: '#251f1d' }}>
            Filas con error
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <tbody>
                {resumen.conError.lista.map((fila, indice) => (
                  <tr key={indice} style={{ borderBottom: '1px solid #eae7e5' }}>
                    <td style={{ padding: '10px 20px', fontSize: 12, color: '#8e8784' }}>{JSON.stringify(fila.datosOriginales)}</td>
                    <td style={{ padding: '10px 20px', fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{fila.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
