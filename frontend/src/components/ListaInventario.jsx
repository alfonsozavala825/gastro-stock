import React, { useState } from 'react';
import ModalAgregar from './ModalAgregar';
import ConfirmModal from './ConfirmModal';
import useInventory from '../hooks/useInventory';
import styles from './ListaInventario.module.css';

function ListaInventario({ area }) {
  const { productos, isLoading, error, fetchInventory, deleteItem, updateQuantity } = useInventory(area);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setNewQuantity(item.cantidad);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewQuantity('');
  };

  const handleUpdateQuantity = async (id) => {
    if (newQuantity !== null && !isNaN(newQuantity)) {
      await updateQuantity(id, newQuantity);
      handleCancelEdit(); // Salir del modo edición
    }
  };

  if (isLoading) return <p>Cargando inventario...</p>;
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>Error: {error}</p>
        <button onClick={() => fetchInventory()} className={styles.retryButton}>
          Reintentar
        </button>
      </div>
    );
  }

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
                  <td className={styles.td}>
                    {editingId === item._id ? (
                      <input
                        type="number"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        className={styles.quantityInput}
                      />
                    ) : (
                      `${item.cantidad} ${item.ingrediente?.unidad}`
                    )}
                  </td>
                  <td className={`${styles.td} ${styles.tdSuccess}`}>${item.valorTotal.toFixed(2)}</td>
                  <td className={styles.actionsCell}>
                    {editingId === item._id ? (
                      <>
                        <button onClick={() => handleUpdateQuantity(item._id)} className={styles.saveButton}>✓</button>
                        <button onClick={handleCancelEdit} className={styles.cancelButton}>✗</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(item)} title="Editar Cantidad" className={styles.editButton}>✏️</button>
                        <button onClick={() => handleDeleteClick(item._id)} title="Eliminar" className={styles.deleteButton}>🗑️</button>
                      </>
                    )}
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="¿Estás seguro de que quieres eliminar este registro del inventario?"
      />
    </div>
  );
}

export default ListaInventario;