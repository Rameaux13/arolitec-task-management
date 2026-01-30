import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const goToMyTasks = () => {
    navigate('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <h1 className={styles.logo}>AROLITEC</h1>
          {user && (
            <nav className={styles.nav}>
              <button 
                onClick={goToMyTasks} 
                className={`${styles.navButton} ${location.pathname === '/' ? styles.active : ''}`}
              >
                Mes Tâches
              </button>
              {isAdmin() && (
                <button 
                  onClick={goToDashboard} 
                  className={`${styles.navButton} ${location.pathname === '/dashboard' ? styles.active : ''}`}
                >
                  Dashboard
                </button>
              )}
            </nav>
          )}
        </div>
        
        {user && (
          <div className={styles.rightSection}>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <svg className={styles.logoutIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;