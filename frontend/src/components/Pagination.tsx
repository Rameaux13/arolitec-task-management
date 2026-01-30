import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Créer ou récupérer le div portal
    let portalDiv = document.getElementById('pagination-portal');
    
    if (!portalDiv) {
      portalDiv = document.createElement('div');
      portalDiv.id = 'pagination-portal';
      // Forcer le style inline pour garantir le positionnement
      portalDiv.style.position = 'fixed';
      portalDiv.style.bottom = '0';
      portalDiv.style.left = '0';
      portalDiv.style.right = '0';
      portalDiv.style.zIndex = '9999';
      portalDiv.style.pointerEvents = 'none';
      document.body.appendChild(portalDiv);
    }

    setPortalRoot(portalDiv);

    // Fonction pour détecter le scroll
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      // Calculer la distance du bas (en pixels)
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      
      // Afficher la pagination si on est à moins de 500px du bas
      if (distanceFromBottom < 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Écouter le scroll
    window.addEventListener('scroll', handleScroll);
    
    // Vérifier immédiatement au chargement
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (portalDiv && document.body.contains(portalDiv)) {
        document.body.removeChild(portalDiv);
      }
    };
  }, []);

  if (!portalRoot || !isVisible) {
    return null;
  }

  return ReactDOM.createPortal(
    <div 
      className={`${styles.paginationContainer} ${styles.interactive}`}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.paginationButton}
        aria-label="Page précédente"
      >
        ←
      </button>

      <span className={styles.paginationInfo}>
        Page {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.paginationButton}
        aria-label="Page suivante"
      >
        →
      </button>
    </div>,
    portalRoot
  );
};

export default Pagination;