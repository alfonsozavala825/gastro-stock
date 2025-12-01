import { useState, useEffect, useCallback } from 'react';
import API_URL from '../config';

const useIngredientes = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIngredientes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/modalagregar`);
      if (!res.ok) {
        throw new Error(`Error fetching ingredients: ${res.statusText}`);
      }
      const data = await res.json();
      setIngredientes(data);
    } catch (err) {
      console.error("Error cargando catálogo de ingredientes:", err);
      setError('Error al cargar los ingredientes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredientes();
  }, [fetchIngredientes]);

  return { ingredientes, isLoading, error, fetchIngredientes };
};

export default useIngredientes;
