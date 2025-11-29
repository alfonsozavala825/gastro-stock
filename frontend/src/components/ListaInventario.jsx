import React, { useEffect, useState, useCallback } from 'react';
import ModalAgregar from './ModalAgregar';
import API_URL from '../config'

function ListaInventario({ area }) {
  const [productos, setProductos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  const cargarDatos = useCallback(() => {
    if (area === 'DASHBOARD' || area === 'INGREDIENTES') return;
    fetch(`${API_URL}/listainventario/${area}`)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error("Error:", err));
  }, [area]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // --- ACCIONES ---
  const eliminarItem = async (id) => {
    if(!confirm("¿Eliminar este registro del inventario?")) return;
    await fetch(`${API_URL}/inventario/${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const editarCantidad = async (item) => {
    const nuevaCantidad = prompt(`Nueva cantidad para ${item.ingrediente?.nombre}:`, item.cantidad);
    if (nuevaCantidad !== null && !isNaN(nuevaCantidad)) {
      await fetch(`${API_URL}/inventario/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: nuevaCantidad })
      });
      cargarDatos();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Inventario en: {area} 📦</h2>
        <button 
          onClick={() => setMostrarModal(true)} 
          style={{ padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Agregar Stock
        </button>
      </div>

      {productos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p>No hay productos registrados aquí todavía.</p>
        </div>
      ) : (
        // --- TABLA CORREGIDA ---
        <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-main)', textAlign: 'left' }}>
                <th style={{ padding: '15px' }}>Producto</th>
                <th style={{ padding: '15px' }}>Detalle</th>
                <th style={{ padding: '15px' }}>Cantidad</th>
                <th style={{ padding: '15px' }}>Valor Total</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{item.ingrediente?.nombre || 'Desconocido'}</td>
                  <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>{item.ingrediente?.detalle}</td>
                  <td style={{ padding: '15px' }}>{item.cantidad} {item.ingrediente?.unidad}</td>
                  <td style={{ padding: '15px', color: '#2ecc71', fontWeight: 'bold' }}>${item.valorTotal.toFixed(2)}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button 
                      onClick={() => editarCantidad(item)} 
                      title="Editar Cantidad"
                      style={{ marginRight: '10px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--text-secondary)', borderRadius: '4px', padding: '5px', color: 'var(--text-primary)' }}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => eliminarItem(item._id)} 
                      title="Eliminar"
                      style={{ cursor: 'pointer', background: '#ffebee', border: '1px solid #ff4d4d', borderRadius: '4px', padding: '5px' }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mostrarModal && (
        <ModalAgregar area={area} cerrarModal={() => setMostrarModal(false)} alGuardar={cargarDatos} />
      )}
    </div>
  );
}

export default ListaInventario;