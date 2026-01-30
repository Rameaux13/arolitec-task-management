import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginDto, RegisterDto } from '../types/auth.types';
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Interface pour le payload du token JWT
interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

// Props du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Récupérer le profil de l'utilisateur
          const profile = await authService.getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Fonction de connexion
  const login = async (credentials: LoginDto): Promise<void> => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  // Fonction d'inscription
  const register = async (data: RegisterDto): Promise<void> => {
    try {
      const response = await authService.register(data);
      setUser(response.user);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  // Vérifier si l'utilisateur est admin EN LISANT DIRECTEMENT LE TOKEN
  const isAdmin = (): boolean => {
    try {
      const token = authService.getToken();
      if (!token) return false;
      
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.role === 'admin';
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};