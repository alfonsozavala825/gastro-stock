import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const useIngredientes = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth(); // <-- Get token from context

  const fetchIngredientes = useCallback(async () => {
    if (!token) return; // <-- Don't fetch if no token

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/ingredientes`, { // <-- Corrected URL
        headers: {
          'Authorization': `Bearer ${token}` // <-- Added token
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData.mensaje || res.statusText;
        throw new Error(`Error fetching ingredients: ${message}`);
      }
      const data = await res.json();
      setIngredientes(data);
    } catch (err) {
      console.error("Error cargando catálogo de ingredientes:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]); // <-- Dependency on token

  useEffect(() => {
    fetchIngredientes();
  }, [fetchIngredientes]);

  return { ingredientes, isLoading, error, fetchIngredientes };
};

export default useIngredientes;
