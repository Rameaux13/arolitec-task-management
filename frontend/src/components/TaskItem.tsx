import React from 'react';
import { Task } from '../types/task.types';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, taskTitle: string) => void;  // CHANGÉ ICI : ajouté taskTitle
  isAdmin?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, isAdmin = false }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'in-progress':
        return styles.statusInProgress;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusPending;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in-progress':
        return 'En cours';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  return (
    <div className={styles.taskCard}>
      <div className={styles.taskHeader}>
        <div className={styles.taskTitleSection}>
          <h3 className={styles.taskTitle}>{task.title}</h3>
          {task.description && (
            <p className={styles.taskDescription}>{task.description}</p>
          )}
        </div>
        <span className={`${styles.statusBadge} ${getStatusClass(task.status)}`}>
          {getStatusText(task.status)}
        </span>
      </div>

      <div className={styles.taskFooter}>
        <div className={styles.taskMeta}>
          {task.dueDate && (
            <div className={styles.dueDate}>
              Date limite: {formatDate(task.dueDate)}
            </div>
          )}
        </div>

        <div className={styles.taskActions}>
          <button 
            onClick={() => onEdit(task)} 
            className={styles.editButton}
          >
            Modifier
          </button>
          <button 
            onClick={() => onDelete(task.id, task.title)}  // CHANGÉ ICI : ajouté task.title
            className={styles.deleteButton}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;