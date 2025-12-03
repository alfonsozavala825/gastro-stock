import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useSnapshots from '../../hooks/useSnapshots';
import styles from './VistaSnapshot.module.css';

const VistaSnapshot = () => {
  const { id } = useParams();
  const { selectedSnapshot, isLoading, error, fetchSnapshotById } = useSnapshots();

  useEffect(() => {
    if (id) {
      fetchSnapshotById(id);
    }
  }, [id, fetchSnapshotById]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) return <p className={styles.loading}>Cargando datos del snapshot...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!selectedSnapshot) return <p>No se ha encontrado el snapshot.</p>;

  return (
    <div className={styles.container}>
      <Link to="/snapshots" className={styles.backLink}>
        &larr; Volver a la lista de snapshots
      </Link>

      <div className={styles.header}>
        <h1>{selectedSnapshot.nombre || 'Snapshot'}</h1>
        <div className={styles.headerDetails}>
          <span>
            <strong>Fecha de Captura:</strong> {formatDate(selectedSnapshot.fecha)}
          </span>
          <span>
            <strong>Valor Total:</strong> {formatCurrency(selectedSnapshot.valorTotalInventario)}
          </span>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Área</th>
              <th>Producto</th>
              <th>Unidad</th>
              <th>Costo Unitario</th>
              <th>Cantidad</th>
              <th>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {selectedSnapshot.inventario.map((item, index) => (
              <tr key={index}>
                <td>{item.area}</td>
                <td>{item.nombreIngrediente}</td>
                <td>{item.unidad}</td>
                <td>{formatCurrency(item.costo)}</td>
                <td>{item.cantidad}</td>
                <td>{formatCurrency(item.valorTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VistaSnapshot;
