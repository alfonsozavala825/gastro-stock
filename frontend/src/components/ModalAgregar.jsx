import React, { useState } from 'react';
import Escaner from './Escaner';
import useIngredientes from '../hooks/useIngredientes';
import useInventoryActions from '../hooks/useInventoryActions';
import styles from './ModalAgregar.module.css';

function ModalAgregar({ area, cerrarModal, alGuardar }) {
  const { ingredientes, isLoading: isLoadingIngredientes, error: errorIngredientes } = useIngredientes();
  const { addInventoryItem, isLoading: isLoadingAdd, error: errorAdd } = useInventoryActions();

  const [seleccion, setSeleccion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [usandoCamara, setUsandoCamara] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const manejarEscaneo = (textoQR) => {
    setErrorMessage('');
    try {
      const datos = JSON.parse(textoQR);
      
      const encontrado = ingredientes.find(ing => 
        ing._id === datos.id || 
        ing.nombre.toLowerCase() === datos.nombre.toLowerCase()
      );

      if (encontrado) {
        setSeleccion(encontrado._id);
        alert(`¡Encontrado: ${encontrado.nombre}!`);
        setUsandoCamara(false);
      } else {
        alert("Producto no encontrado en el catálogo.");
        setUsandoCamara(false);
      }
    } catch (_e) {
      alert("Código QR no válido para este sistema.");
      setUsandoCamara(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!seleccion || !cantidad) {
      setErrorMessage("Faltan datos");
      return;
    }

    const result = await addInventoryItem(seleccion, area, cantidad);
    if (result.success) {
      alGuardar();
      cerrarModal();
    } else {
      setErrorMessage(result.message || "Error al guardar ❌");
    }
  };

  if (isLoadingIngredientes) return <p>Cargando ingredientes...</p>;
  if (errorIngredientes) return <p className={styles.error}>Error: {errorIngredientes}</p>;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <button onClick={cerrarModal} className={styles.closeButton}>✖️</button>

        <h3 className={styles.title}>Agregar a {area}</h3>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        {errorAdd && <p className={styles.error}>{errorAdd}</p>}

        {usandoCamara ? (
          <div>
             <Escaner alEscanear={manejarEscaneo} />
             <button onClick={() => setUsandoCamara(false)} className={styles.cancelScanButton}>Cancelar Cámara</button>
          </div>
        ) : (
          <form onSubmit={manejarEnvio}>
            
            <button 
              type="button" 
              onClick={() => setUsandoCamara(true)}
              className={styles.scanButton}
            >
              📷 Escanear Producto
            </button>

            <label className={styles.label}>O selecciona manual:</label>
            <select 
              value={seleccion} 
              onChange={e => setSeleccion(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">-- Buscar en lista --</option>
              {ingredientes.map(ing => (
                <option key={ing._id} value={ing._id}>
                  {ing.nombre} ({ing.unidad})
                </option>
              ))}
            </select>

            <label className={styles.label}>Cantidad a sumar:</label>
            <input 
              type="number" 
              step="0.01"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              className={styles.input}
              required
              placeholder="0.00"
            />

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.submitButton} disabled={isLoadingAdd}>GUARDAR</button>
              <button type="button" onClick={cerrarModal} className={styles.cancelButton}>CANCELAR</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ModalAgregar;