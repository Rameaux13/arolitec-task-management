import React from 'react';
import { Task } from '../types/task.types';
import TaskItem from './TaskItem';
import styles from './TaskListUser.module.css';

interface TaskListUserProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, taskTitle: string) => void;
  onCreateTask: () => void;
  filters: {
    status: string;
    search: string;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
}

const TaskListUser: React.FC<TaskListUserProps> = ({
  tasks,
  loading,
  onEdit,
  onDelete,
  onCreateTask,
  filters,
  currentPage,
  onPageChange
}) => {
  // Pagination - 10 tâches par page
  const tasksPerPage = 10;
  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        Chargement de vos tâches...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>Aucune tâche trouvée</h3>
        <p className={styles.emptyText}>
          {filters.search || filters.status
            ? 'Essayez de modifier vos filtres'
            : 'Commencez par créer votre première tâche'}
        </p>
        {!filters.search && !filters.status && (
          <button onClick={onCreateTask} className={styles.emptyButton}>
            Créer ma première tâche
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.taskListContainer}>
      {/* Liste des tâches en grille 3 colonnes */}
      <div className={styles.tasksList}>
        {currentTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={() => onDelete(task.id, task.title)}
            isAdmin={false}
          />
        ))}
      </div>

      {/* PAGINATION SIMPLE - SANS CHICHI */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            ←
          </button>

          <span className={styles.paginationInfo}>
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskListUser;