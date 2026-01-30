import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginDto } from '../types/auth.types';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAdmin } = useAuth();

  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await login(formData);

      setTimeout(() => {
        if (isAdmin()) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }, 800);

    } catch (error: any) {
      setModal({
        isOpen: true,
        title: 'Erreur de connexion',
        message: error.response?.data?.message || 'Email ou mot de passe incorrect',
        type: 'error'
      });
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className={styles.loginContainer}>
      {/* Partie gauche - Branding AROLITEC */}
      <div className={styles.brandingSection}>
        <div className={styles.brandingContent}>
          <h1 className={styles.logo}>AROLITEC</h1>
          <h2 className={styles.brandingTitle}>
            Gérez vos tâches avec efficacité
          </h2>
          <p className={styles.brandingSubtitle}>
            Une plateforme moderne pour organiser, suivre et collaborer sur vos projets en toute simplicité.
          </p>
        </div>
      </div>

      {/* Partie droite - Formulaire de connexion */}
      <div className={styles.formSection}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h2 className={styles.title}>Connexion</h2>
            <p className={styles.subtitle}>Accédez à votre espace de travail</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="votre.email@example.com"
                disabled={loading}
                autoComplete="email"
              />
              {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="Votre mot de passe"
                disabled={loading}
                autoComplete="current-password"
              />
              {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className={styles.link}>
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Spinner de chargement */}
      {loading && <Spinner message="Connexion en cours..." />}

      {/* Modal uniquement pour les erreurs */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default Login;