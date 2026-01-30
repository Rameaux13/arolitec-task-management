import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

// Décorateur @Entity : Indique que cette classe représente une table dans la base de données
// Le nom de la table sera "tasks"
@Entity('tasks')
export class Task {
  
  // @PrimaryGeneratedColumn : Clé primaire qui se génère automatiquement
  // 'uuid' : génère un identifiant unique (ex: "a3f2e1d4-...")
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column : Définit une colonne simple dans la table
  // title est obligatoire (pas de nullable)
  @Column()
  title: string;

  // nullable: true signifie que ce champ peut être vide
  // type: 'text' permet d'avoir un texte long
  @Column({ type: 'text', nullable: true })
  description: string;

  // default: 'pending' signifie que si on ne donne pas de valeur, ça sera "pending"
  // Les statuts possibles : pending, in-progress, completed
  @Column({ default: 'pending' })
  status: string;

  // Date limite de la tâche (facultative)
  // type: 'timestamp' stocke la date et l'heure
  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  // NOUVEAU : Relation avec l'utilisateur CRÉATEUR de la tâche
  // @ManyToOne : Plusieurs tâches peuvent être créées par un seul utilisateur
  // nullable: true : Pour les anciennes tâches sans créateur
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  // NOUVEAU : Stocke l'ID de l'utilisateur créateur
  @Column({ nullable: true })
  userId: string;

  // Relation avec l'utilisateur assigné à la tâche
  // @ManyToOne : Plusieurs tâches peuvent être assignées à un seul utilisateur
  // nullable: true : Une tâche peut ne pas être assignée à quelqu'un
  @ManyToOne(() => User, (user) => user.tasks, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  // Stocke l'ID de l'utilisateur assigné
  // Cette colonne sera créée automatiquement par @JoinColumn
  @Column({ nullable: true })
  assignedToId: string;

  // @CreateDateColumn : Se remplit automatiquement à la création
  @CreateDateColumn()
  createdAt: Date;

  // @UpdateDateColumn : Se met à jour automatiquement à chaque modification
  @UpdateDateColumn()
  updatedAt: Date;
}