import React, { useState } from 'react';
import { Task } from '../types/task.types';
import { User } from '../types/auth.types';
import TaskItem from './TaskItem';
import Modal from './Modal';
import apiService from '../services/api';
import styles from './TaskListAdmin.module.css';

interface TaskListAdminProps {
  tasks: Task[];
  users: User[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onCreateTask: () => void;
  onRefresh: () => void;
}

const TaskListAdmin: React.FC<TaskListAdminProps> = ({
  tasks,
  users,
  loading,
  onEdit,
  onDelete,
  onCreateTask,
  onRefresh
}) => {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTaskForAssign, setSelectedTaskForAssign] = useState<Task | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

  // Ouvrir le modal d'assignation
  const handleOpenAssignModal = (task: Task) => {
    setSelectedTaskForAssign(task);
    setSelectedUserId(task.assignedToId || '');
    setAssignModalOpen(true);
  };

  // Assigner une tâche à un utilisateur
  const handleAssignTask = async () => {
    if (!selectedTaskForAssign || !selectedUserId) {
      setModal({
        isOpen: true,
        title: 'Erreur',
        message: 'Veuillez sélectionner un utilisateur',
        type: 'error'
      });
      return;
    }

    try {
      await apiService.assignTask(selectedTaskForAssign.id, selectedUserId);
      setModal({
        isOpen: true,
        title: 'Succès',
        message: 'Tâche assignée avec succès',
        type: 'success'
      });
      setAssignModalOpen(false);
      onRefresh();
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: 'Erreur',
        message: 'Impossible d\'assigner la tâche',
        type: 'error'
      });
    }
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedTaskForAssign(null);
    setSelectedUserId('');
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        Chargement des tâches...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <h3 className={styles.emptyTitle}>Aucune tâche trouvée</h3>
        <p className={styles.emptyText}>
          Aucune tâche ne correspond à vos critères de recherche.
        </p>
        <button onClick={onCreateTask} className={styles.emptyButton}>
          Créer une nouvelle tâche
        </button>
      </div>
    );
  }

  return (
    <div className={styles.taskListContainer}>
      <div className={styles.tasksList}>
        {tasks.map(task => (
          <div key={task.id} className={styles.taskItemWrapper}>
            <TaskItem
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              isAdmin={true}
            />
            <button
              onClick={() => handleOpenAssignModal(task)}
              className={styles.assignButton}
            >
              {task.assignedToId ? 'Réassigner' : 'Assigner'}
            </button>
          </div>
        ))}
      </div>

      {assignModalOpen && selectedTaskForAssign && (
        <div className={styles.assignModalOverlay} onClick={closeAssignModal}>
          <div className={styles.assignModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.assignModalTitle}>
              Assigner la tâche: {selectedTaskForAssign.title}
            </h3>
            
            <div className={styles.assignFormGroup}>
              <label htmlFor="userSelect" className={styles.assignLabel}>
                Sélectionner un utilisateur
              </label>
              <select
                id="userSelect"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className={styles.assignSelect}
              >
                <option value="">Aucune assignation</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.assignModalActions}>
              <button onClick={closeAssignModal} className={styles.cancelButton}>
                Annuler
              </button>
              <button onClick={handleAssignTask} className={styles.confirmButton}>
                Assigner
              </button>
            </div>
          </div>
        </div>
      )}

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

export default TaskListAdmin;