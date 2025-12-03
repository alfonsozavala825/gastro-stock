import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSnapshots from '../../hooks/useSnapshots';
import { useAuth } from '../../context/AuthContext';
import styles from './HistorialSnapshots.module.css';

const HistorialSnapshots = () => {
  const { user } = useAuth();
  const { snapshots, isLoading, error, fetchSnapshots, createSnapshot } = useSnapshots();
  const [snapshotName, setSnapshotName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    fetchSnapshots();
  }, []); // Cargar al montar el componente

  const handleCreateSnapshot = async () => {
    if (isCreating) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      await createSnapshot(snapshotName);
      setSnapshotName(''); // Limpiar input
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

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

  return (
    <div className={styles.container}>
      <h2>Historial de Inventarios (Snapshots)</h2>
      
      {/* Sección para crear snapshot (solo admins) */}
      {user?.rol === 'admin' && (
        <div className={styles.card}>
          <h3>Crear Nuevo Snapshot</h3>
          <p>Esto guardará una "foto" del inventario actual para consulta futura.</p>
          <div className={styles.createForm}>
            <input
              type="text"
              placeholder="Nombre descriptivo (ej. Cierre de Octubre)"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
            />
            <button onClick={handleCreateSnapshot} disabled={isCreating}>
              {isCreating ? 'Creando...' : 'Crear Snapshot'}
            </button>
          </div>
          {createError && <p className={styles.error}>{createError}</p>}
        </div>
      )}

      {/* Lista de snapshots existentes */}
      <div className={styles.card}>
        <h3>Snapshots Guardados</h3>
        {isLoading && <p>Cargando snapshots...</p>}
        {error && <p className={styles.error}>{error}</p>}
        
        {!isLoading && snapshots.length === 0 && (
          <p>No hay snapshots guardados todavía.</p>
        )}

        <ul className={styles.snapshotList}>
          {snapshots.map(snap => (
            <li key={snap._id} className={styles.snapshotItem}>
              <div className={styles.snapshotInfo}>
                <span className={styles.snapshotDate}>{formatDate(snap.fecha)}</span>
                <span className={styles.snapshotName}>{snap.nombre || 'Snapshot sin nombre'}</span>
                <span className={styles.snapshotTotal}>{formatCurrency(snap.valorTotalInventario)}</span>
              </div>
              <Link to={`/snapshots/${snap._id}`} className={styles.viewButton}>
                Ver Detalles
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HistorialSnapshots;
