import { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

const useInventory = (area) => {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInventory = useCallback(async () => {
    if (!area || area === 'DASHBOARD' || area === 'INGREDIENTES') return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/listainventario/${area}`);
      if (!res.ok) {
        throw new Error(`Error fetching inventory: ${res.statusText}`);
      }
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar inventario:", err);
      setError('Error al cargar el inventario.');
    } finally {
      setIsLoading(false);
    }
  }, [area]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const deleteItem = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/inventario/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(`Error deleting item: ${res.statusText}`);
      }
      await fetchInventory(); // Refresh the list after deletion
      return { success: true };
    } catch (err) {
      console.error("Error al eliminar item:", err);
      setError('Error al eliminar el item.');
      return { success: false, message: 'Error al eliminar el item.' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/inventario/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: newQuantity })
      });
      if (!res.ok) {
        throw new Error(`Error updating quantity: ${res.statusText}`);
      }
      await fetchInventory(); // Refresh the list after update
      return { success: true };
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      setError('Error al actualizar la cantidad.');
      return { success: false, message: 'Error al actualizar la cantidad.' };
    } finally {
      setIsLoading(false);
    }
  };

  return { productos, isLoading, error, fetchInventory, deleteItem, updateQuantity };
};

export default useInventory;
