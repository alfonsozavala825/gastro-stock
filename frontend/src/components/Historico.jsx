import React from 'react';
import useHistorico from '../hooks/useHistorico';
import styles from './Historico.module.css'; // Import the CSS module

function Historico() {
  const { movimientos, isLoading, error } = useHistorico();

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-MX');
  };

  const getStatusClass = (tipoMovimiento) => {
    switch (tipoMovimiento) {
      case 'ENTRADA':
        return styles.statusEntrada;
      case 'ELIMINADO':
        return styles.statusEliminado;
      default:
        return styles.statusOtro;
    }
  };

  if (isLoading) return <p>Cargando historial...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;

  return (
    <div className={styles.card}>
      <h3>📜 Historial de Movimientos</h3>
      <p className={styles.subtitle}>Últimas transacciones registradas en el sistema.</p>

      {movimientos.length === 0 ? (
        <p>No hay movimientos registrados aún.</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.th}>Fecha</th>
                <th className={styles.th}>Área</th>
                <th className={styles.th}>Producto</th>
                <th className={styles.th}>Acción</th>
                <th className={styles.th}>Cambio</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m._id} className={styles.tableRow}>
                  <td className={`${styles.td} ${styles.tdSmall}`}>{formatearFecha(m.fecha)}</td>
                  <td className={styles.td}>{m.area}</td>
                  <td className={`${styles.td} ${styles.tdBold}`}>
                    {m.ingrediente?.nombre || 'Producto borrado'}
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.status} ${getStatusClass(m.tipoMovimiento)}`}>
                      {m.tipoMovimiento}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {m.cantidadAnterior} ➝ <b>{m.cantidadNueva}</b>
                    <span className={styles.cambioDetalle}>
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
