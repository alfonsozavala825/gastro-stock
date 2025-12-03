import React, { useState } from 'react';
import useUsuarios from '../../hooks/useUsuarios';
import styles from './GestionUsuarios.module.css';

const GestionUsuarios = () => {
  const { usuarios, isLoading, error, updateUserRole, deleteUser, createUser } = useUsuarios();
  
  // Estado para el formulario de nuevo usuario
  const [newUser, setNewUser] = useState({ nombre: '', email: '', password: '', rol: 'empleado' });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);
    try {
      await createUser(newUser);
      // Resetear el formulario
      setNewUser({ nombre: '', email: '', password: '', rol: 'empleado' });
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) return <p>Cargando usuarios...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;

  return (
    <div className={styles.container}>
      <h2>Gestión de Usuarios</h2>
      
      {/* Formulario para crear nuevo usuario */}
      <div className={styles.card}>
        <h3>Crear Nuevo Usuario</h3>
        <form onSubmit={handleCreateUser} className={styles.form}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={newUser.nombre}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={newUser.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={newUser.password}
            onChange={handleInputChange}
            required
          />
          <select name="rol" value={newUser.rol} onChange={handleInputChange}>
            <option value="empleado">Empleado</option>
            <option value="admin">Administrador</option>
          </select>
          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Creando...' : 'Crear Usuario'}
          </button>
        </form>
        {createError && <p className={styles.error}>{createError}</p>}
      </div>

      {/* Tabla de usuarios existentes */}
      <div className={styles.card}>
        <h3>Usuarios Existentes</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user._id}>
                <td>{user.nombre}</td>
                <td>{user.email}</td>
                <td>
                  <select 
                    value={user.rol} 
                    onChange={(e) => updateUserRole(user._id, e.target.value)}
                  >
                    <option value="empleado">Empleado</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button 
                    className={styles.deleteButton} 
                    onClick={() => deleteUser(user._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionUsuarios;
