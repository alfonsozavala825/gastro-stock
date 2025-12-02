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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    // Si no hay token, el hook no debe intentar cargar datos protegidos
    if (!token) {
        setIsLoading(false);
        setError("Autenticación requerida para cargar el Dashboard.");
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
        // ✅ CORRECCIÓN CRÍTICA: Se añade '/inventario' al path para coincidir
        // con la ruta configurada en el servidor de Express: app.use('/api/inventario', ...)
        const res = await fetch(`${API_URL}/inventario/dashboard`, { 
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

      if (!res.ok) {
        // Intenta parsear el JSON de error (si existe), si no, usa el statusText
        const errorData = await res.json().catch(() => ({})); 
        const message = errorData.mensaje || res.statusText;
        throw new Error(`Error fetching dashboard data: ${message}`);
      }

      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      // Muestra el mensaje de error de red o el mensaje lanzado desde el bloque 'if (!res.ok)'
      setError(err.message); 
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