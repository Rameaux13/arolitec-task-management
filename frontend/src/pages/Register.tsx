import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterDto } from '../types/auth.types';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import styles from './Register.module.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAdmin } = useAuth();

  const [formData, setFormData] = useState<RegisterDto>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est obligatoire';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom de famille est obligatoire';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Le nom de famille doit contenir au moins 2 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register(formData);

      setTimeout(() => {
        if (isAdmin()) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }, 800);

    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        } else if (typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        }
      }
      
      setModal({
        isOpen: true,
        title: 'Erreur d\'inscription',
        message: errorMessage,
        type: 'error'
      });
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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
    <div className={styles.registerContainer}>
      {/* Partie gauche - Branding AROLITEC */}
      <div className={styles.brandingSection}>
        <div className={styles.brandingContent}>
          <h1 className={styles.logo}>AROLITEC</h1>
          <h2 className={styles.brandingTitle}>
            Rejoignez notre plateforme
          </h2>
          <p className={styles.brandingSubtitle}>
            Créez votre compte et commencez à gérer vos projets efficacement dès aujourd'hui.
          </p>
        </div>
      </div>

      {/* Partie droite - Formulaire d'inscription */}
      <div className={styles.formSection}>
        <div className={styles.registerCard}>
          <div className={styles.registerHeader}>
            <h2 className={styles.title}>Inscription</h2>
            <p className={styles.subtitle}>Créez votre compte pour commencer</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Grille 2 colonnes pour Prénom + Nom */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName" className={styles.label}>
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                  placeholder="Votre prénom"
                  disabled={loading}
                  autoComplete="given-name"
                />
                {errors.firstName && <span className={styles.errorMessage}>{errors.firstName}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.label}>
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                  placeholder="Votre nom"
                  disabled={loading}
                  autoComplete="family-name"
                />
                {errors.lastName && <span className={styles.errorMessage}>{errors.lastName}</span>}
              </div>
            </div>

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
                placeholder="Minimum 6 caractères"
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmer
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                placeholder="Retapez votre mot de passe"
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className={styles.link}>
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Spinner de chargement */}
      {loading && <Spinner message="Création de votre compte..." />}

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

export default Register;