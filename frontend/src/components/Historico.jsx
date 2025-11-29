import React, { useEffect, useState } from 'react';
import API_URL from '../config'

function Historico() {
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/historico`)
      .then(res => res.json())
      .then(data => setMovimientos(data))
      .catch(err => console.error(err));
  }, []);

  // Función para formatear fecha bonita
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-MX');
  };

  return (
    <div className="card" style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
      <h3>📜 Historial de Movimientos</h3>
      <p style={{ color: 'var(--text-secondary)' }}>Últimas transacciones registradas en el sistema.</p>

      {movimientos.length === 0 ? (
        <p>No hay movimientos registrados aún.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Fecha</th>
                <th style={{ padding: '10px' }}>Área</th>
                <th style={{ padding: '10px' }}>Producto</th>
                <th style={{ padding: '10px' }}>Acción</th>
                <th style={{ padding: '10px' }}>Cambio</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px', fontSize: '0.85em' }}>{formatearFecha(m.fecha)}</td>
                  <td style={{ padding: '10px' }}>{m.area}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>
                    {m.ingrediente?.nombre || 'Producto borrado'}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em', fontWeight: 'bold',
                      background: m.tipoMovimiento === 'ENTRADA' ? '#2ecc7133' : m.tipoMovimiento === 'ELIMINADO' ? '#e74c3c33' : '#f1c40f33',
                      color: m.tipoMovimiento === 'ENTRADA' ? '#27ae60' : m.tipoMovimiento === 'ELIMINADO' ? '#c0392b' : '#d35400'
                    }}>
                      {m.tipoMovimiento}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    {m.cantidadAnterior} ➝ <b>{m.cantidadNueva}</b>
                    <span style={{ marginLeft: '5px', fontSize: '0.8em', color: 'gray' }}>
                       ({m.diferencia > 0 ? '+' : ''}{m.diferencia})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Historico;
