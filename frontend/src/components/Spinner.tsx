import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message = 'Chargement...' }) => {
  return (
    <div className={styles.spinnerOverlay}>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default Spinner;