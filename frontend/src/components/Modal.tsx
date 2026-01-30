import React, { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void; // ✅ AJOUT : Callback pour le bouton OK
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, // ✅ AJOUT
  title, 
  message, 
  type = 'info' 
}) => {
  // Fermer le modal avec la touche Echap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose(); // ✅ Echap = Annuler
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Fermer automatiquement après 5 secondes pour les succès
  useEffect(() => {
    if (isOpen && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, type, onClose]);

  if (!isOpen) return null;

  const getModalClass = () => {
    switch (type) {
      case 'success':
        return styles.modalSuccess;
      case 'error':
        return styles.modalError;
      case 'warning':
        return styles.modalWarning;
      default:
        return styles.modalInfo;
    }
  };

  // ✅ Gérer le clic sur OK
  const handleOkClick = () => {
    if (onConfirm) {
      onConfirm(); // Si onConfirm existe, l'appeler
    } else {
      onClose(); // Sinon, juste fermer
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modalContent} ${getModalClass()}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button 
            className={styles.closeButton} 
            onClick={onClose} // ✅ Croix = Annuler
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={handleOkClick} className={styles.okButton}>
            D'ACCORD
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;