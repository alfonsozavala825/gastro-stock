import React, { useState } from 'react';
import API_URL from '../config'; 

function Login({ alIniciarSesion }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');

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
        alIniciarSesion();
      } else {
        setError(data.mensaje || 'Error al entrar');
      }
    }
    catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div style={{ 
      height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Gastro-Stock 🍽️</h2>
        
        {error && <p style={{ background: '#ffdddd', color: 'red', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={manejarLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correo:</label>
            <input 
              id="email"                   // <--- AGREGA ESTO
              name="email"                 // <--- AGREGA ESTO
              autoComplete="username"      // <--- AYUDA AL NAVEGADOR
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@admin.com"
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              required 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contraseña:</label>
            <input 
              id="password"                // <--- AGREGA ESTO
              name="password"              // <--- AGREGA ESTO
              autoComplete="current-password" // <--- AYUDA AL NAVEGADOR
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              required 
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
