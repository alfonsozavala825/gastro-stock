import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ListaInventario from './components/ListaInventario';
import Dashboard from './components/Dashboard';
import Ingredientes from './components/Ingredientes';
import Login from './components/Login';
import Historico from './components/Historico';

function App() {
  const [token, setToken] = useState(null);
  const [vistaActual, setVistaActual] = useState('DASHBOARD');
  // Nuevo Estado: Tema (leemos del localStorage o por defecto 'light')
  const [tema, setTema] = useState(localStorage.getItem('tema') || 'light');

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    if (tokenGuardado) setToken(tokenGuardado);
  }, []);

  // --- EFECTO CAMBIO DE TEMA ---
  useEffect(() => {
    // Esto le pone el atributo data-theme="dark" al cuerpo de la página HTML
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('tema', tema); // Guardamos preferencia
  }, [tema]);

  const toggleTema = () => {
    setTema(prev => prev === 'light' ? 'dark' : 'light');
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
  };

  if (!token) return <Login alIniciarSesion={() => setToken(localStorage.getItem('token'))} />;

  return (
    <div style={{ display: 'flex' }}>
      {/* Pasamos la función del tema y el estado actual al Sidebar */}
      <Sidebar 
        cambiarVista={setVistaActual} 
        onLogout={cerrarSesion} 
        temaActual={tema}
        toggleTema={toggleTema}
      />

      <div style={{ padding: '20px', flex: 1, minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Panel Principal</h1>
          <span style={{ color: 'var(--text-secondary)' }}>Usuario: Admin</span>
        </div>
        
        {vistaActual === 'DASHBOARD' && <Dashboard />}

        {['ALMACEN', 'COCINA', 'ENSALADA', 'ISLA'].includes(vistaActual) && (
           <ListaInventario area={vistaActual} />
        )}

        {vistaActual === 'INGREDIENTES' && <Ingredientes />}
        {vistaActual === 'HISTORICO' && <Historico />}
      </div>
    </div>
  );
}

export default App;