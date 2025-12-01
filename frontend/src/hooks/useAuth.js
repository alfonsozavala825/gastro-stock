import { useState } from 'react';
import API_URL from '../config';

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        setIsLoading(false);
        return { success: true };
      } else {
        setError(data.mensaje || 'Error al iniciar sesión');
        setIsLoading(false);
        return { success: false, message: data.mensaje };
      }
    } catch (err) {
      console.error("Error de red/petición:", err);
      setError('Error de conexión con el servidor');
      setIsLoading(false);
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return { login, logout, isLoading, error };
};

export default useAuth;
