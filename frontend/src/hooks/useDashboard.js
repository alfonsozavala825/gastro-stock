import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalDinero: 0,
    totalProductos: 0,
    porArea: { ALMACEN: 0, COCINA: 0, ENSALADA: 0, ISLA: 0 },
    inventarioGlobal: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); // Intenta parsear JSON, si falla, devuelve objeto vacío
        const message = errorData.mensaje || res.statusText;
        throw new Error(`Error fetching dashboard data: ${message}`);
      }

      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message); // <-- Mostrar el mensaje de error real
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { dashboardData, isLoading, error, fetchDashboardData };
};

export default useDashboard;
