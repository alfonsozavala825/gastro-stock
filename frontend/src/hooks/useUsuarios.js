import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const useUsuarios = () => {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo cargar la lista de usuarios.');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const updateUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rol: newRole }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar el usuario.');
      
      // Actualizar el estado local
      setUsuarios(usuarios.map(u => u._id === userId ? { ...u, rol: newRole } : u));

    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/usuarios/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No se pudo eliminar el usuario.');

      // Actualizar el estado local
      setUsuarios(usuarios.filter(u => u._id !== userId));
      
    } catch (err) {
      setError(err.message);
    }
  };

    const createUser = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensaje || 'No se pudo crear el usuario.');
      }
      
      // Volver a cargar la lista para incluir el nuevo usuario
      fetchUsuarios();

    } catch (err) {
      setError(err.message);
      // Es importante relanzar el error si queremos manejarlo en el componente
      throw err;
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return { usuarios, isLoading, error, fetchUsuarios, updateUserRole, deleteUser, createUser };
};

export default useUsuarios;
