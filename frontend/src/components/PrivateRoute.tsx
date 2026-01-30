import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './PrivateRoute.module.css';

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        Chargement...
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est connecté, afficher la page demandée
  return children;
};

export default PrivateRoute;