import axios, { AxiosInstance } from 'axios';
import { Task, CreateTaskDto, UpdateTaskDto, TasksResponse } from '../types/task.types';
import authService from './authService';

const API_URL = 'http://localhost:3333';

// Créer une instance Axios avec configuration de base
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token JWT à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide, rediriger vers login
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class ApiService {
  // Récupérer toutes les tâches (ADMIN ONLY)
  async getAllTasks(page: number = 1, limit: number = 10, status?: string, search?: string): Promise<TasksResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const response = await apiClient.get<any>(`/tasks?${params.toString()}`);
    
    // Transformer la réponse backend en format attendu
    return {
      data: response.data.tasks || [],
      total: response.data.total || 0,
      page: response.data.page || 1,
      limit: limit
    };
  }

  // Récupérer MES tâches (USER)
  async getMyTasks(page: number = 1, limit: number = 10, status?: string, search?: string): Promise<TasksResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const response = await apiClient.get<any>(`/tasks/my-tasks?${params.toString()}`);
    
    // Transformer la réponse backend en format attendu
    return {
      data: response.data.tasks || [],
      total: response.data.total || 0,
      page: response.data.page || 1,
      limit: limit
    };
  }

  // Récupérer une tâche par ID
  async getTaskById(id: string): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  }

  // Créer une nouvelle tâche
  async createTask(data: CreateTaskDto): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  }

  // Mettre à jour une tâche
  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  }

  // Supprimer une tâche
  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  }

  // Assigner une tâche à un utilisateur (ADMIN ONLY)
  async assignTask(taskId: string, userId: string): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${taskId}/assign/${userId}`);
    return response.data;
  }
}

export default new ApiService();