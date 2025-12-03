import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ListaInventario from './components/ListaInventario';
import Dashboard from './components/Dashboard';
import Ingredientes from './components/Ingredientes';
import Login from './components/Login';
import Historico from './components/Historico';
import Escaner from './components/Escaner';
import AdminRoute from './components/AdminRoute'; // <-- Importar ruta protegida
import GestionUsuarios from './components/Admin/GestionUsuarios'; // <-- Importar componente admin
import HistorialSnapshots from './components/Snapshots/HistorialSnapshots'; // <-- Importar snapshots
import VistaSnapshot from './components/Snapshots/VistaSnapshot'; // <-- Importar vista de snapshot
import { useAuth } from './context/AuthContext';


function App() {
  const { token, logout, user } = useAuth(); // Use token, logout and user from AuthContext
  // Nuevo Estado: Tema (leemos del localStorage o por defecto 'light')
  const [tema, setTema] = useState(localStorage.getItem('tema') || 'light');

  // --- EFECTO CAMBIO DE TEMA ---
  useEffect(() => {
    // Esto le pone el atributo data-theme="dark" al cuerpo de la página HTML
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('tema', tema); // Guardamos preferencia
  }, [tema]);

  const toggleTema = () => {
    setTema(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (!token) return <Login />; // Login component will now handle setting token via context

  return (
    <div style={{ display: 'flex' }}>
      {/* Pasamos la función del tema y el estado actual al Sidebar */}
      <Sidebar 
        onLogout={logout} // Use logout from AuthContext
        temaActual={tema}
        toggleTema={toggleTema}
      />

      <div style={{ padding: '20px', flex: 1, minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Panel Principal</h1>
          <span style={{ color: 'var(--text-secondary)' }}>Usuario: {user ? user.nombre : 'Guest'}</span>
        </div>
        
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/almacen" element={<ListaInventario area="ALMACEN" />} />
          <Route path="/cocina" element={<ListaInventario area="COCINA" />} />
          <Route path="/ensalada" element={<ListaInventario area="ENSALADA" />} />
          <Route path="/isla" element={<ListaInventario area="ISLA" />} />
          <Route path="/ingredientes" element={<Ingredientes />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/escaner" element={<Escaner />} />
          <Route path="/snapshots" element={<HistorialSnapshots />} />
          <Route path="/snapshots/:id" element={<VistaSnapshot />} />

          {/* Rutas de Administrador */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/usuarios" element={<GestionUsuarios />} />
          </Route>

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;