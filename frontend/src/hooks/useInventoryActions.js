import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const useInventoryActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const addInventoryItem = async (ingrediente, area, cantidad) => {
    if (!token) return { success: false, message: 'No autenticado' };

    setIsLoading(true);
    setError(null);
    try {
      const respuesta = await fetch(`${API_URL}/inventario/agregar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ingrediente,
          area,
          cantidad: parseFloat(cantidad)
        })
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        const message = errorData.mensaje || 'Error al guardar el item en inventario.';
        throw new Error(message);
      }
      return { success: true };
    } catch (err) {
      console.error("Error al agregar item al inventario:", err);
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { addInventoryItem, isLoading, error };
};

export default useInventoryActions;
