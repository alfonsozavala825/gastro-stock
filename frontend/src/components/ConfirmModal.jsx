import React from 'react';
import styles from './ConfirmModal.module.css';

function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          <button onClick={onConfirm} className={styles.confirmButton}>
            Confirmar
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
