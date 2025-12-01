import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const useInventory = (area) => {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchInventory = useCallback(async () => {
    if (!area || area === 'DASHBOARD' || area === 'INGREDIENTES' || !token) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/inventario/${area}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData.mensaje || res.statusText;
        throw new Error(`Error fetching inventory: ${message}`);
      }
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar inventario:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [area, token]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const deleteItem = async (id) => {
    if (!token) return { success: false, message: 'No autenticado' };
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/inventario/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData.mensaje || res.statusText;
        throw new Error(`Error deleting item: ${message}`);
      }
      await fetchInventory(); // Refresh the list after deletion
      return { success: true };
    } catch (err) {
      console.error("Error al eliminar item:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (!token) return { success: false, message: 'No autenticado' };

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/inventario/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ cantidad: newQuantity })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData.mensaje || res.statusText;
        throw new Error(`Error updating quantity: ${message}`);
      }
      await fetchInventory(); // Refresh the list after update
      return { success: true };
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { productos, isLoading, error, fetchInventory, deleteItem, updateQuantity };
};

export default useInventory;
