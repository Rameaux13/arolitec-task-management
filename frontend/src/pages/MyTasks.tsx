import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Task, CreateTaskDto, UpdateTaskDto } from '../types/task.types';
import apiService from '../services/api';
import Header from '../components/Header';
import TaskListUser from '../components/TaskListUser';
import TaskForm from '../components/TaskForm';
import FormModal from '../components/FormModal';
import Modal from '../components/Modal';
// ❌ SUPPRIMÉ : import Pagination from '../components/Pagination';
import styles from './MyTasks.module.css';

const MyTasks: React.FC = () => {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);

  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

  // Filtrage instantané côté frontend
  const filteredTasks = allTasks.filter(task => {
    if (filters.status && task.status !== filters.status) {
      return false;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descMatch = task.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) {
        return false;
      }
    }

    return true;
  });

  // Calculer les statistiques
  const stats = {
    total: allTasks.length,
    pending: allTasks.filter(t => t.status === 'pending').length,
    inProgress: allTasks.filter(t => t.status === 'in-progress').length,
    completed: allTasks.filter(t => t.status === 'completed').length
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Charger toutes les tâches une seule fois
  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyTasks(1, 100);
      setAllTasks(response.data);
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: 'Erreur',
        message: 'Impossible de charger vos tâches',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyTasks();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleCreateTask = () => {
    setSelectedTask(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormModalOpen(true);
  };

  const handleSubmitTask = async (data: CreateTaskDto) => {
    try {
      if (selectedTask) {
        await apiService.updateTask(selectedTask.id, data);
        setModal({
          isOpen: true,
          title: 'Succès',
          message: 'Tâche modifiée avec succès',
          type: 'success'
        });
      } else {
        await apiService.createTask(data);
        setModal({
          isOpen: true,
          title: 'Succès',
          message: 'Tâche créée avec succès',
          type: 'success'
        });
      }
      setIsFormModalOpen(false);
      loadMyTasks();
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: 'Erreur',
        message: error.response?.data?.message || 'Une erreur est survenue',
        type: 'error'
      });
    }
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    setTaskToDelete({ id: taskId, title: taskTitle });
    setModal({
      isOpen: true,
      title: 'Confirmation',
      message: `Êtes-vous sûr de vouloir supprimer la tâche "${taskTitle}" ?`,
      type: 'warning'
    });
  };

  const handleModalClose = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
    setTaskToDelete(null);
  };

  const handleModalConfirm = async () => {
    if (modal.type === 'warning' && taskToDelete) {
      try {
        await apiService.deleteTask(taskToDelete.id);
        setModal({
          isOpen: true,
          title: 'Succès',
          message: 'Tâche supprimée avec succès',
          type: 'success'
        });
        setTaskToDelete(null);
        loadMyTasks();
      } catch (error: any) {
        setModal({
          isOpen: true,
          title: 'Erreur',
          message: 'Impossible de supprimer la tâche',
          type: 'error'
        });
        setTaskToDelete(null);
      }
    } else {
      handleModalClose();
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? '' : status
    }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.heroSection}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Mes Tâches</h1>
              <p className={styles.heroSubtitle}>
                Bonjour {user?.name} ! Gérez vos tâches efficacement
              </p>
            </div>
            <button onClick={handleCreateTask} className={styles.createButton}>
              Nouvelle Tâche
            </button>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}></div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Total</span>
                <span className={styles.statValue}>{stats.total}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.pending}`}></div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>En attente</span>
                <span className={`${styles.statValue} ${styles.pending}`}>
                  {stats.pending}
                </span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.inProgress}`}></div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>En cours</span>
                <span className={`${styles.statValue} ${styles.inProgress}`}>
                  {stats.inProgress}
                </span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.completed}`}></div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Terminé</span>
                <span className={`${styles.statValue} ${styles.completed}`}>
                  {stats.completed}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Rechercher une tâche..."
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterChips}>
              <button
                onClick={() => handleStatusFilter('')}
                className={`${styles.filterChip} ${filters.status === '' ? styles.filterChipActive : ''}`}
              >
                Tous
              </button>
              <button
                onClick={() => handleStatusFilter('pending')}
                className={`${styles.filterChip} ${styles.filterChipPending} ${filters.status === 'pending' ? styles.filterChipActive : ''}`}
              >
                En attente
              </button>
              <button
                onClick={() => handleStatusFilter('in-progress')}
                className={`${styles.filterChip} ${styles.filterChipInProgress} ${filters.status === 'in-progress' ? styles.filterChipActive : ''}`}
              >
                En cours
              </button>
              <button
                onClick={() => handleStatusFilter('completed')}
                className={`${styles.filterChip} ${styles.filterChipCompleted} ${filters.status === 'completed' ? styles.filterChipActive : ''}`}
              >
                Terminées
              </button>
            </div>
          </div>

          <TaskListUser
            tasks={filteredTasks}
            loading={loading}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onCreateTask={handleCreateTask}
            filters={filters}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </main>

      {/* ❌ SUPPRIMÉ : Tout ce bloc Pagination */}

      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
      >
        <TaskForm
          task={selectedTask}
          isAdmin={false}
          onSubmit={handleSubmitTask}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </FormModal>

      <Modal
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default MyTasks;