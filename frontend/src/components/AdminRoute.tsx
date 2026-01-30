import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AdminRoute.module.css';

interface AdminRouteProps {
  children: React.ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

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

  // Si l'utilisateur n'est pas admin, rediriger vers la page d'accueil
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // Si l'utilisateur est admin, afficher la page demandée
  return children;
};

export default AdminRoute;