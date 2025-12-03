import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const useSnapshots = () => {
  const { token } = useAuth();
  const [snapshots, setSnapshots] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener la lista de todos los snapshots
  const fetchSnapshots = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/snapshots`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cargar la lista de snapshots.');
      const data = await res.json();
      setSnapshots(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Obtener un snapshot específico por ID
  const fetchSnapshotById = useCallback(async (id) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/snapshots/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cargar el snapshot seleccionado.');
      const data = await res.json();
      setSelectedSnapshot(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Crear un nuevo snapshot
  const createSnapshot = async (snapshotName) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/inventario/snapshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre: snapshotName }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.mensaje || 'No se pudo crear el snapshot.');
      }
      // Actualizar la lista después de crear uno nuevo
      fetchSnapshots();
    } catch (err) {
      setError(err.message);
      throw err; // Relanzar para que el componente pueda manejarlo
    } finally {
      setIsLoading(false);
    }
  };

  return {
    snapshots,
    selectedSnapshot,
    isLoading,
    error,
    fetchSnapshots,
    fetchSnapshotById,
    createSnapshot,
    setSelectedSnapshot
  };
};

export default useSnapshots;
