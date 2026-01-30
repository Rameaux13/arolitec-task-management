import React, { useState, useEffect } from 'react';
import { Task, CreateTaskDto, TaskStatus } from '../types/task.types';
import { User } from '../types/auth.types';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  task?: Task;
  users?: User[];
  isAdmin?: boolean;
  onSubmit: (data: CreateTaskDto) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  task, 
  users = [], 
  isAdmin = false, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    assignedToId: task?.assignedToId || undefined
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }

    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'La date limite ne peut pas être dans le passé';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Préparer les données à envoyer
      const dataToSubmit: CreateTaskDto = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        status: formData.status,
        dueDate: formData.dueDate || undefined,
        assignedToId: formData.assignedToId || undefined
      };

      onSubmit(dataToSubmit);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.formTitle}>
        {task ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
      </h2>

      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Titre <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
          placeholder="Entrez le titre de la tâche"
        />
        {errors.title && <span className={styles.errorMessage}>{errors.title}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={styles.textarea}
          placeholder="Entrez une description (optionnel)"
          rows={4}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="status" className={styles.label}>
            Statut
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="pending">En attente</option>
            <option value="in-progress">En cours</option>
            <option value="completed">Terminé</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dueDate" className={styles.label}>
            Date limite
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`${styles.input} ${errors.dueDate ? styles.inputError : ''}`}
          />
          {errors.dueDate && <span className={styles.errorMessage}>{errors.dueDate}</span>}
        </div>
      </div>

      {isAdmin && users.length > 0 && (
        <div className={styles.formGroup}>
          <label htmlFor="assignedToId" className={styles.label}>
            Assigner à
          </label>
          <select
            id="assignedToId"
            name="assignedToId"
            value={formData.assignedToId || ''}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="">Aucune assignation</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Annuler
        </button>
        <button type="submit" className={styles.submitButton}>
          {task ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;