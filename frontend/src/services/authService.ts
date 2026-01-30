import axios from 'axios';
import { LoginDto, RegisterDto, AuthResponse, User } from '../types/auth.types';

const API_URL = 'http://localhost:3333/auth';

// Clé pour stocker le token dans le localStorage
const TOKEN_KEY = 'access_token';

class AuthService {
  // Inscription d'un nouvel utilisateur
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/register`, data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  // Connexion d'un utilisateur
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, credentials);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Récupérer le profil de l'utilisateur connecté
  async getProfile(): Promise<User> {
    const token = this.getToken();
    const response = await axios.get<User>(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }

  // Récupérer la liste de tous les utilisateurs (ADMIN ONLY)
  async getUsers(): Promise<User[]> {
    const token = this.getToken();
    const response = await axios.get<User[]>(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }

  // Sauvegarder le token dans le localStorage
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Récupérer le token depuis le localStorage
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export default new AuthService();