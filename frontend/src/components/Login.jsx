import React, { useState } from 'react';
import useAuthHook from '../hooks/useAuth';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css'; // Import the CSS module

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login: performLogin, isLoading, error: authError } = useAuthHook();
  const { login: contextLogin } = useAuth();

  const manejarLogin = async (e) => {
    e.preventDefault();
    const result = await performLogin(email, password);
    if (result.success) {
      const newToken = localStorage.getItem('token');
      const newUser = JSON.parse(localStorage.getItem('usuario'));
      contextLogin(newToken, newUser);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Gastro-Stock 🍽️</h2>
        
        {authError && <p className={styles.error}>{authError}</p>}

        <form onSubmit={manejarLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Correo:</label>
            <input 
              id="email"
              name="email"
              autoComplete="username"
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@admin.com"
              className={styles.input}
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Contraseña:</label>
            <input 
              id="password"
              name="password"
              autoComplete="current-password"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className={styles.input}
              required 
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

