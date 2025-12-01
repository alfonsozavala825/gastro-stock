import React, { useState, useEffect } from 'react';
import { FaChartPie, FaBox, FaHistory, FaUtensils, FaLeaf, FaStore, FaClipboardList, FaBars, FaChevronLeft, FaQrcode } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Sidebar.module.css'; // Import the CSS module

// Función auxiliar para renderizar botones con icono
const BotonMenu = ({ to, icono, etiqueta, abierto }) => (
  <Link
    to={to}
    className={`${styles.btnMenu} ${styles.btnHover}`}
    title={etiqueta}
  >
    <span className={styles.btnMenuIcon}>{icono}</span>
    <span className={abierto ? styles.btnMenuEtiquetaAbierto : styles.btnMenuEtiquetaCerrado}>
      {etiqueta}
    </span>
  </Link>
);

function Sidebar({ onLogout, temaActual, toggleTema }) {
  const { user } = useAuth();
  const [abierto, setAbierto] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setAbierto(false);
      else setAbierto(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`${styles.sidebar} ${abierto ? styles.sidebarAbierto : styles.sidebarCerrado}`}>
      
      {/* ENCABEZADO Y BOTÓN DE COLAPSAR */}
      <div className={`${styles.header} ${abierto ? styles.headerAbierto : styles.headerCerrado}`}>
        {abierto && <h3 className={styles.title}>GastroApp</h3>}
        
        <button 
          onClick={() => setAbierto(!abierto)}
          className={styles.toggleButton}
        >
          {abierto ? <FaChevronLeft /> : <FaBars />}
        </button>
      </div>
      
      {/* MENÚ DE NAVEGACIÓN */}
      <div className={styles.navMenu}>
        <BotonMenu to="/dashboard" icono={<FaChartPie />} etiqueta="Dashboard" abierto={abierto} />
        <BotonMenu to="/almacen" icono={<FaBox />} etiqueta="Almacén" abierto={abierto} />
        <BotonMenu to="/cocina" icono={<FaUtensils />} etiqueta="Cocina" abierto={abierto} />
        <BotonMenu to="/ensalada" icono={<FaLeaf />} etiqueta="Ensalada" abierto={abierto} />
        <BotonMenu to="/isla" icono={<FaStore />} etiqueta="Isla" abierto={abierto} />
        <BotonMenu to="/historico" icono={<FaHistory />} etiqueta="Historial" abierto={abierto} />
        
        <hr className={styles.divider} />
        
        <BotonMenu to="/ingredientes" icono={<FaClipboardList />} etiqueta="Configuración" abierto={abierto} />
        <BotonMenu to="/escaner" icono={<FaQrcode />} etiqueta="Escaner" abierto={abierto} />
      </div>

      {/* PIE DE PÁGINA (TEMA Y SALIR) */}
      <div className={styles.footer}>
        
        {/* Botón Tema */}
        <button 
          onClick={toggleTema} 
          className={`${styles.btnMenu} ${abierto ? styles.themeButton : styles.themeButtonCerrado}`}
          title="Cambiar Tema"
        >
          <span className={styles.footerButtonIcon}>{temaActual === 'light' ? '🌙' : '☀️'}</span>
          {abierto && <span>{temaActual === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>}
        </button>

        {/* Botón Salir */}
        <button 
          onClick={onLogout} 
          className={`${styles.btnMenu} ${styles.logoutButton} ${abierto ? styles.logoutButtonAbierto : styles.logoutButtonCerrado}`}
          title="Cerrar Sesión"
        >
          <span className={styles.footerButtonIcon}>✖</span> 
          {abierto && <span className={styles.footerButtonText}>Salir</span>}
        </button>
      </div>

    </div>
  );
}

export default Sidebar;