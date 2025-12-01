import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const useHistorico = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchHistorico = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/historico`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`Error fetching historical data: ${res.statusText}`);
      }
      const data = await res.json();
      setMovimientos(data);
    } catch (err) {
      console.error("Error al cargar histórico:", err);
      setError('Error al cargar el histórico.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  return { movimientos, isLoading, error, fetchHistorico };
};

export default useHistorico;