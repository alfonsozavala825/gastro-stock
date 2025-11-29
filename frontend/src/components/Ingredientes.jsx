import React, { useState, useEffect } from 'react';
import API_URL from '../config'

function Ingredientes() {
  const [lista, setLista] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  
  // Estado para el archivo
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false); // Para mostrar "Subiendo..."

  const [formulario, setFormulario] = useState({
    nombre: '', detalle: '', unidad: 'PIEZA', costo: ''
  });

  const cargarIngredientes = () => {
    fetch(`${API_URL}/ingredientes`)
      .then(res => res.json())
      .then(data => setLista(data))
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => { cargarIngredientes(); }, []);

  const handleChange = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  // --- LÓGICA DE EXCEL ---
  const subirExcel = async () => {
    if (!archivo) return alert("Selecciona un archivo primero");

    const formData = new FormData();
    formData.append('archivoExcel', archivo); // El nombre debe coincidir con el backend

    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/ingredientes/importar`, {
        method: 'POST',
        body: formData // No ponemos Header Content-Type, el navegador lo pone solo
      });
      const data = await res.json();
      
      alert(data.mensaje);
      cargarIngredientes(); // Recargamos la lista
      setArchivo(null);     // Limpiamos
    } catch (_error) {
      alert("Error al subir archivo");
    }
    setCargando(false);
  };
  // -----------------------

  const guardarIngrediente = async (e) => {
    // ... (Tu código anterior de guardar/editar se mantiene igual)
    e.preventDefault();
    const metodo = modoEdicion ? 'PUT' : 'POST';
    const url = modoEdicion 
      ? `${API_URL}/ingredientes/${idEditando}`
      : `${API_URL}/ingredientes`;

    const res = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formulario)
    });

    if (res.ok) {
      alert(modoEdicion ? "¡Actualizado!" : "¡Creado!");
      limpiarFormulario();
      cargarIngredientes();
    }
  };

  const eliminar = async (id) => {
    if(confirm("¿Borrar?")) {
      await fetch(`${API_URL}/ingredientes/${id}`, { method: 'DELETE' });
      cargarIngredientes();
    }
  };

  const activarEdicion = (item) => {
    setModoEdicion(true);
    setIdEditando(item._id);
    setFormulario({ nombre: item.nombre, detalle: item.detalle, unidad: item.unidad, costo: item.costo });
  };

  const limpiarFormulario = () => {
    setModoEdicion(false);
    setIdEditando(null);
    setFormulario({ nombre: '', detalle: '', unidad: 'PIEZA', costo: '' });
  };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      
      <div className="card" style={{ flex: 1, minWidth: '300px', padding: '20px', borderRadius: '8px' }}>
        
        {/* --- SECCIÓN NUEVA: IMPORTAR EXCEL --- */}
        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
          <h3>📤 Carga Masiva (Excel)</h3>
          <p style={{ fontSize: '0.8em', color: 'gray' }}>
            Columnas requeridas: <b>Nombre, Costo</b><br/>
            Opcionales: <b>Detalle, Unidad</b>
          </p>
          <input 
            type="file" 
            accept=".xlsx, .xls"
            onChange={e => setArchivo(e.target.files[0])}
            style={{ marginBottom: '10px' }}
          />
          <button 
            onClick={subirExcel}
            disabled={cargando}
            style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '4px', width: '100%' }}
          >
            {cargando ? 'Subiendo...' : 'Importar Excel'}
          </button>
        </div>
        {/* ------------------------------------- */}

        <h3 style={{ color: modoEdicion ? '#e67e22' : 'inherit' }}>
          {modoEdicion ? '✏️ Editando' : '📝 Nuevo Manual'}
        </h3>
        
        <form onSubmit={guardarIngrediente}>
          <label>Nombre:</label>
          <input name="nombre" value={formulario.nombre} onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '5px' }} required />
          <label>Detalle:</label>
          <input name="detalle" value={formulario.detalle} onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '5px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label>Unidad:</label>
              <select name="unidad" value={formulario.unidad} onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '5px' }}>
                <option value="PIEZA">PIEZA</option><option value="PAQUETE">PAQUETE</option><option value="MILILITRO">MILILITRO</option>
                <option value="LITRO">LITRO</option><option value="GRAMO">GRAMO</option><option value="KILO">KILO</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Costo ($):</label>
              <input type="number" name="costo" value={formulario.costo} onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '5px' }} required />
            </div>
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: modoEdicion ? '#e67e22' : '#2ecc71', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
            {modoEdicion ? 'Actualizar' : 'Guardar'}
          </button>
          {modoEdicion && <button type="button" onClick={limpiarFormulario} style={{ width: '100%', marginTop: '5px', padding: '5px', background: '#95a5a6', color: 'white', border: 'none' }}>Cancelar</button>}
        </form>
      </div>

      <div className="card" style={{ flex: 2, minWidth: '300px', padding: '10px' }}>
        <h3>Catálogo ({lista.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
          {lista.map(item => (
            <div key={item._id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
              <h4 style={{ margin: '5px 0' }}>{item.nombre}</h4>
              <p style={{ fontSize: '0.8em' }}>{item.detalle}</p>
              <p style={{ fontWeight: 'bold' }}>${item.costo} / {item.unidad}</p>
              {item.codigoQR && <img src={item.codigoQR} alt="QR" style={{ width: '80px', height: '80px' }} />}
              <div style={{ marginTop: '5px' }}>
                <button onClick={() => activarEdicion(item)} style={{ cursor: 'pointer', marginRight: '5px' }}>✏️</button>
                <button onClick={() => eliminar(item._id)} style={{ cursor: 'pointer', color: 'red' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Ingredientes;