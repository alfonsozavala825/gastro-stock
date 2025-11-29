import React, { useState, useEffect } from 'react';
import Escaner from './Escaner'; // <--- Importamos la cámara
import API_URL from '../config'

function ModalAgregar({ area, cerrarModal, alGuardar }) {
  const [ingredientes, setIngredientes] = useState([]);
  const [seleccion, setSeleccion] = useState('');
  const [cantidad, setCantidad] = useState('');
  
  // Estado para saber si mostramos la cámara o el formulario
  const [usandoCamara, setUsandoCamara] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/modalagregar`) // Ajusta la URL según tu configuración
      .then(res => res.json())
      .then(data => setIngredientes(data))
      .catch(err => console.error("Error cargando catálogo", err));
  }, []);

  // --- LÓGICA INTELIGENTE DE BÚSQUEDA ---
  const manejarEscaneo = (textoQR) => {
    try {
      // El QR es un texto JSON, intentamos leerlo
      const datos = JSON.parse(textoQR);
      
      // Buscamos coincidencia en nuestra lista
      // 1. Intentamos por ID (QR Manual)
      // 2. Intentamos por Nombre (QR Excel)
      const encontrado = ingredientes.find(ing => 
        ing._id === datos.id || 
        ing.nombre.toLowerCase() === datos.nombre.toLowerCase()
      );

      if (encontrado) {
        setSeleccion(encontrado._id); // Seleccionamos el producto en el menú
        alert(`¡Encontrado: ${encontrado.nombre}!`);
        setUsandoCamara(false); // Cerramos cámara
      } else {
        alert("Producto no encontrado en el catálogo.");
        setUsandoCamara(false);
      }
    } catch (e) {
      alert("Código QR no válido para este sistema.");
      setUsandoCamara(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!seleccion || !cantidad) return alert("Faltan datos");

    const respuesta = await fetch('http://localhost:5000/api/inventario/agregar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingrediente: seleccion,
        area: area,
        cantidad: parseFloat(cantidad)
      })
    });

    if (respuesta.ok) {
      alGuardar();
      cerrarModal();
    } else {
      alert("Error al guardar ❌");
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="card" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px', position: 'relative' }}>
        
        {/* Botón X para cerrar */}
        <button onClick={cerrarModal} style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: 'var(--text-primary)' }}>✖️</button>

        <h3 style={{ marginTop: 0 }}>Agregar a {area}</h3>

        {/* DECISIÓN: ¿CÁMARA O FORMULARIO? */}
        {usandoCamara ? (
          <div>
             <Escaner alEscanear={manejarEscaneo} />
             <button onClick={() => setUsandoCamara(false)} style={{ width: '100%', marginTop: '10px', padding: '10px', background: '#e74c3c', color: 'white', border: 'none' }}>Cancelar Cámara</button>
          </div>
        ) : (
          <form onSubmit={manejarEnvio}>
            
            {/* BOTÓN GRANDE PARA ACTIVAR CÁMARA */}
            <button 
              type="button" 
              onClick={() => setUsandoCamara(true)}
              style={{ width: '100%', padding: '15px', marginBottom: '20px', background: '#8e44ad', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              📷 Escanear Producto
            </button>

            <label style={{display:'block', marginBottom:'5px'}}>O selecciona manual:</label>
            <select 
              value={seleccion} 
              onChange={e => setSeleccion(e.target.value)}
              style={{ width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            >
              <option value="">-- Buscar en lista --</option>
              {ingredientes.map(ing => (
                <option key={ing._id} value={ing._id}>
                  {ing.nombre} ({ing.unidad})
                </option>
              ))}
            </select>

            <label style={{display:'block', marginBottom:'5px'}}>Cantidad a sumar:</label>
            <input 
              type="number" 
              step="0.01"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              style={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              required
              placeholder="0.00"
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>GUARDAR</button>
              <button type="button" onClick={cerrarModal} style={{ flex: 1, padding: '12px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>CANCELAR</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ModalAgregar;