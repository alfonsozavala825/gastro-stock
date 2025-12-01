import React, { useState } from 'react';
import ModalAgregar from './ModalAgregar';
import useInventory from '../hooks/useInventory';
import styles from './ListaInventario.module.css'; // Import the CSS module

function ListaInventario({ area }) {
  const { productos, isLoading, error, fetchInventory, deleteItem, updateQuantity } = useInventory(area);
  const [mostrarModal, setMostrarModal] = useState(false);

  const handleDeleteItem = async (id) => {
    if (!confirm("¿Eliminar este registro del inventario?")) return;
    await deleteItem(id);
  };

  const handleEditQuantity = async (item) => {
    const nuevaCantidad = prompt(`Nueva cantidad para ${item.ingrediente?.nombre}:`, item.cantidad);
    if (nuevaCantidad !== null && !isNaN(nuevaCantidad)) {
      await updateQuantity(item._id, nuevaCantidad);
    }
  };

  if (isLoading) return <p>Cargando inventario...</p>;
  if (error) return <p className={styles.error}>Error: {error}</p>;

  return (
    <div>
      <div className={styles.header}>
        <h2>Inventario en: {area} 📦</h2>
        <button 
          onClick={() => setMostrarModal(true)} 
          className={styles.addButton}
        >
          + Agregar Stock
        </button>
      </div>

      {productos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay productos registrados aquí todavía.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.th}>Producto</th>
                <th className={styles.th}>Detalle</th>
                <th className={styles.th}>Cantidad</th>
                <th className={styles.th}>Valor Total</th>
                <th className={`${styles.th} ${styles.actionsCell}`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((item) => (
                <tr key={item._id} className={styles.tableRow}>
                  <td className={`${styles.td} ${styles.tdBold}`}>{item.ingrediente?.nombre || 'Desconocido'}</td>
                  <td className={`${styles.td} ${styles.tdSecondary}`}>{item.ingrediente?.detalle}</td>
                  <td className={styles.td}>{item.cantidad} {item.ingrediente?.unidad}</td>
                  <td className={`${styles.td} ${styles.tdSuccess}`}>${item.valorTotal.toFixed(2)}</td>
                  <td className={styles.actionsCell}>
                    <button 
                      onClick={() => handleEditQuantity(item)} 
                      title="Editar Cantidad"
                      className={styles.editButton}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item._id)} 
                      title="Eliminar"
                      className={styles.deleteButton}
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
        <ModalAgregar area={area} cerrarModal={() => setMostrarModal(false)} alGuardar={fetchInventory} />
      )}
    </div>
  );
}

export default ListaInventario;