import React, { useState } from 'react';
import { FaBoxOpen, FaCube, FaSearch, FaPrint, FaFileExcel, FaInbox } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useDashboard from '../hooks/useDashboard'; // <-- Importar el nuevo hook

function Dashboard() {
  const { dashboardData, isLoading, error } = useDashboard(); // <-- Usar el hook
  const [filtro, setFiltro] = useState(""); // Para el buscador de la tabla

  // Los datos ahora vienen del hook: dashboardData
  const datos = dashboardData;

  const dataGrafica = [
    { name: 'Almacén', valor: datos.porArea.ALMACEN, color: '#3498db' },
    { name: 'Cocina', valor: datos.porArea.COCINA, color: '#e74c3c' },
    { name: 'Ensaladas', valor: datos.porArea.ENSALADA, color: '#2ecc71' },
    { name: 'Isla', valor: datos.porArea.ISLA, color: '#f1c40f' },
  ];

  const imprimir = () => window.print();

  const descargarExcel = () => {
    const filas = [["Ingrediente", "Ubicacion", "Cantidad", "Unidad", "Valor Total"]];
    datos.inventarioGlobal.forEach(item => {
      filas.push([
        item.ingrediente?.nombre || '?',
        item.area,
        item.cantidad,
        item.ingrediente?.unidad || '?',
        item.valorTotal
      ]);
    });

    let csvContent = "data:text/csv;charset=utf-8," + filas.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventario_global.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Filtrar productos para la tabla
  const productosFiltrados = datos.inventarioGlobal.filter(item => 
    item.ingrediente?.nombre.toLowerCase().includes(filtro.toLowerCase())
  );
  
  if (isLoading) return <p>Cargando dashboard...</p>;
  if (error) return <p>Error al cargar el dashboard: {error}</p>;

  return (
    <div>
      {/* BARRA SUPERIOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0 }}>Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '10px', color: 'gray' }} />
            <input 
              type="text" 
              placeholder="Buscar en tabla..." 
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              style={{ padding: '8px 8px 8px 35px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} 
            />
          </div>
          <button onClick={imprimir} className="btn-action" style={btnStyle}><FaPrint /> Imprimir</button>
          <button onClick={descargarExcel} className="btn-action" style={btnStyle}><FaFileExcel /> Excel</button>
        </div>
      </div>

      {/* TARJETAS SUPERIORES */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>Valor Total</h4>
              <span style={{ fontSize: '2em', fontWeight: 'bold' }}>${datos.totalDinero.toFixed(2)}</span>
            </div>
            <FaBoxOpen size={24} color="var(--text-secondary)" />
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>Artículos Totales</h4>
              <span style={{ fontSize: '2em', fontWeight: 'bold' }}>{datos.totalProductos}</span>
            </div>
            <FaCube size={24} color="var(--text-secondary)" />
          </div>
        </div>
      </div>

      {/* GRÁFICA */}
     {/* GRÁFICA */}
      <div className="card" style={{ marginBottom: '20px', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <h3 style={{ marginTop: 0 }}>Valor del Inventario por Ubicación 📊</h3>
        <div style={{ width: '100%', height: '350px', minHeight: '350px', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataGrafica} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-primary)" />
              <YAxis stroke="var(--text-primary)" tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                formatter={(value) => [`$${value}`, 'Valor']}
              />
              <Bar dataKey="valor" radius={[5, 5, 0, 0]}>
                {dataGrafica.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- TABLA DE INVENTARIO GLOBAL --- */}
      <div className="card" style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <h3 style={{ marginTop: 0 }}>Inventario Global 🌎</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em', marginBottom: '15px' }}>
          Un resumen detallado de cada artículo con stock en tu inventario.
        </p>

        {productosFiltrados.length === 0 ? (
          // ESTADO VACÍO (Como tu imagen)
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <FaInbox size={50} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <h4>No hay inventario</h4>
            <p>Parece que no hay artículos o no coinciden con tu búsqueda.</p>
          </div>
        ) : (
          // TABLA DE DATOS
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px' }}>Ingrediente</th>
                  <th style={{ padding: '10px' }}>Ubicación</th>
                  <th style={{ padding: '10px' }}>Unidad</th>
                  <th style={{ padding: '10px' }}>Cantidad</th>
                  <th style={{ padding: '10px' }}>Costo Total</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>{item.ingrediente?.nombre || 'Eliminado'}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 'bold',
                        backgroundColor: item.area === 'COCINA' ? '#e74c3c22' : item.area === 'ALMACEN' ? '#3498db22' : '#f1c40f22',
                        color: item.area === 'COCINA' ? '#e74c3c' : item.area === 'ALMACEN' ? '#3498db' : '#f1c40f'
                      }}>
                        {item.area}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>{item.ingrediente?.unidad}</td>
                    <td style={{ padding: '12px 10px' }}>{item.cantidad}</td>
                    <td style={{ padding: '12px 10px' }}>${item.valorTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// Estilos auxiliares
const cardStyle = {
  background: 'var(--bg-card)',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  flex: 1,
  minWidth: '200px'
};

const btnStyle = {
  padding: '8px 15px',
  borderRadius: '5px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.9em'
};

export default Dashboard;