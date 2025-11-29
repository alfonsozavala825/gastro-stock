import React, { useState, useEffect } from 'react';
// Importamos iconos para el menú
import { FaChartPie, FaBox, FaHistory, FaUtensils, FaLeaf, FaStore, FaClipboardList, FaBars, FaChevronLeft } from 'react-icons/fa';

function Sidebar({ cambiarVista, onLogout, temaActual, toggleTema }) {
  // Estado: ¿Está abierta la barra?
  // Truco: Si la pantalla es menor a 768px (celular), inicia cerrada (false). Si es PC, inicia abierta (true).
  const [abierto, setAbierto] = useState(window.innerWidth > 768);

  // Detectar cambio de tamaño de pantalla para auto-ocultar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setAbierto(false);
      else setAbierto(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Estilos dinámicos
  const sidebarStyle = {
    width: abierto ? '250px' : '70px', // Cambia el ancho
    background: 'var(--bg-sidebar)',
    padding: '20px 10px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--border-color)',
    transition: 'width 0.3s ease', // Animación suave
    overflow: 'hidden', // Para que el texto no se desborde al cerrar
    position: 'sticky', // Para que se quede fija al hacer scroll
    top: 0
  };

  const btnMenuStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    background: 'transparent',
    color: 'var(--text-primary)',
    border: 'none',
    borderRadius: '8px',
    width: '100%',
    fontSize: '1em',
    whiteSpace: 'nowrap', // Evita que el texto salte de línea
    transition: 'background 0.2s'
  };

  // Función auxiliar para renderizar botones con icono
  const BotonMenu = ({ vista, icono, etiqueta }) => (
    <button 
      onClick={() => cambiarVista(vista)}
      style={btnMenuStyle}
      className="btn-hover" // Clase para efecto hover (opcional)
      title={etiqueta} // Muestra el nombre al pasar el mouse si está cerrado
    >
      <span style={{ fontSize: '1.2em', minWidth: '25px' }}>{icono}</span>
      {/* Si está abierto, mostramos el texto. Si no, lo ocultamos */}
      <span style={{ opacity: abierto ? 1 : 0, transition: 'opacity 0.2s', marginLeft: '10px' }}>
        {etiqueta}
      </span>
    </button>
  );

  return (
    <div className="sidebar" style={sidebarStyle}>
      
      {/* ENCABEZADO Y BOTÓN DE COLAPSAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: abierto ? 'space-between' : 'center', marginBottom: '30px', paddingLeft: '5px' }}>
        {abierto && <h3 style={{ margin: 0, color: '#3498db' }}>GastroApp</h3>}
        
        <button 
          onClick={() => setAbierto(!abierto)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2em' }}
        >
          {abierto ? <FaChevronLeft /> : <FaBars />}
        </button>
      </div>
      
      {/* MENÚ DE NAVEGACIÓN */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <BotonMenu vista="DASHBOARD" icono={<FaChartPie />} etiqueta="Dashboard" />
        <BotonMenu vista="ALMACEN" icono={<FaBox />} etiqueta="Almacén" />
        <BotonMenu vista="COCINA" icono={<FaUtensils />} etiqueta="Cocina" />
        <BotonMenu vista="ENSALADA" icono={<FaLeaf />} etiqueta="Ensalada" />
        <BotonMenu vista="ISLA" icono={<FaStore />} etiqueta="Isla" />
        <BotonMenu vista="HISTORICO" icono={<FaHistory />} etiqueta="Historial" />
        
        <hr style={{ width: '100%', borderColor: 'var(--border-color)', margin: '10px 0' }} />
        
        <BotonMenu vista="INGREDIENTES" icono={<FaClipboardList />} etiqueta="Configuración" />
      </div>

      {/* PIE DE PÁGINA (TEMA Y SALIR) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        
        {/* Botón Tema */}
        <button 
          onClick={toggleTema} 
          style={{ ...btnMenuStyle, justifyContent: abierto ? 'flex-start' : 'center' }}
          title="Cambiar Tema"
        >
          <span style={{ fontSize: '1.2em' }}>{temaActual === 'light' ? '🌙' : '☀️'}</span>
          {abierto && <span>{temaActual === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>}
        </button>

        {/* Botón Salir */}
        <button 
          onClick={onLogout} 
          style={{ ...btnMenuStyle, background: '#ff4d4d22', color: '#ff4d4d', justifyContent: abierto ? 'flex-start' : 'center' }}
          title="Cerrar Sesión"
        >
          {/* Usamos un icono de puerta si quieres, o solo texto */}
          <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>✖</span> 
          {abierto && <span>Salir</span>}
        </button>
      </div>

    </div>
  );
}

export default Sidebar;