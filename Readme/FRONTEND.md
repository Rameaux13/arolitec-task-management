# Documentation Frontend - Application AROLITEC

Documentation technique du frontend React de l'application de gestion de tâches.

## Table des matières

- [Architecture](#architecture)
- [Technologies](#technologies)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Pages](#pages)
- [Composants](#composants)
- [Services](#services)
- [Context et State Management](#context-et-state-management)
- [Routing](#routing)
- [Tests](#tests)
- [Styling](#styling)
- [Optimisations](#optimisations)

## Architecture

Le frontend est construit avec React en suivant une architecture component-based :

- **Pages** : Composants de niveau supérieur (Login, Dashboard, MyTasks)
- **Components** : Composants réutilisables (Header, TaskItem, Modal, etc.)
- **Services** : Couche d'abstraction pour les appels API
- **Context** : Gestion d'état global avec React Context API
- **Types** : Définitions TypeScript pour type safety

## Technologies

- **React 19** : Bibliothèque UI
- **TypeScript** : Langage
- **React Router 7** : Navigation
- **Axios** : Client HTTP
- **CSS Modules** : Styling avec isolation
- **JWT Decode** : Décodage des tokens JWT
- **Jest** : Framework de tests
- **React Testing Library** : Tests de composants
- **Nginx** : Serveur web en production

## Structure du projet
```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Header.module.css
│   │   ├── TaskItem.tsx
│   │   ├── TaskItem.module.css
│   │   ├── TaskListUser.tsx
│   │   ├── TaskListUser.module.css
│   │   ├── TaskForm.tsx
│   │   ├── TaskForm.module.css
│   │   ├── FormModal.tsx
│   │   ├── FormModal.module.css
│   │   ├── Modal.tsx
│   │   ├── Modal.module.css
│   │   ├── Spinner.tsx
│   │   ├── Spinner.module.css
│   │   ├── PrivateRoute.tsx
│   │   ├── AdminRoute.tsx
│   │   └── test/
│   │       ├── Modal.test.tsx
│   │       └── Spinner.test.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Login.module.css
│   │   ├── Register.tsx
│   │   ├── Register.module.css
│   │   ├── Dashboard.tsx
│   │   ├── Dashboard.module.css
│   │   ├── MyTasks.tsx
│   │   └── MyTasks.module.css
│   ├── services/
│   │   ├── api.ts
│   │   └── authService.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── types/
│   │   ├── task.types.ts
│   │   └── auth.types.ts
│   ├── App.tsx
│   ├── App.css
│   └── index.tsx
├── Dockerfile
├── nginx.conf
└── package.json
```

## Installation

### Avec Docker (Recommandé)
```bash
docker-compose up --build
```

### Sans Docker
```bash
cd frontend
npm install
npm start
```

Variables d'environnement :
```env
REACT_APP_API_URL=http://localhost:3333
```

L'application sera accessible sur http://localhost:3000

## Configuration

### Axios

Configuration du client HTTP dans `services/api.ts` :
```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Intercepteurs

Ajout automatique du token JWT dans les requêtes :
```typescript
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

Gestion des erreurs 401 (non autorisé) :
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Pages

### Login

Page de connexion avec formulaire email/password.

**Chemin** : `/login`

**Fonctionnalités** :
- Formulaire de connexion
- Validation des champs
- Gestion des erreurs
- Redirection après connexion réussie
- Lien vers inscription

**Fichiers** : `pages/Login.tsx`, `pages/Login.module.css`

### Register

Page d'inscription pour créer un nouveau compte.

**Chemin** : `/register`

**Fonctionnalités** :
- Formulaire d'inscription (email, password, firstName, lastName)
- Validation des champs
- Gestion des erreurs
- Redirection après inscription
- Lien vers connexion

**Fichiers** : `pages/Register.tsx`, `pages/Register.module.css`

### Dashboard (Admin)

Tableau de bord administrateur pour gérer toutes les tâches.

**Chemin** : `/dashboard`

**Accès** : Admin uniquement

**Fonctionnalités** :
- Affichage de toutes les tâches
- 5 cartes de statistiques (Total, En attente, En cours, Terminé, Assignées)
- Recherche instantanée
- Filtres par statut
- Pagination (10 tâches par page)
- Création de tâches
- Édition de tâches
- Suppression de tâches
- Assignation de tâches aux utilisateurs
- Affichage du créateur de chaque tâche

**Fichiers** : `pages/Dashboard.tsx`, `pages/Dashboard.module.css`

### MyTasks (User)

Page des tâches assignées à l'utilisateur connecté.

**Chemin** : `/my-tasks`

**Accès** : User et Admin

**Fonctionnalités** :
- Affichage des tâches assignées
- 4 cartes de statistiques (Total, En attente, En cours, Terminé)
- Recherche instantanée
- Filtres par statut
- Pagination (10 tâches par page)
- Création de tâches (si Admin)
- Édition de ses tâches
- Suppression de ses tâches
- Badge "EN RETARD" pour tâches dépassées

**Fichiers** : `pages/MyTasks.tsx`, `pages/MyTasks.module.css`

## Composants

### Header

En-tête de l'application avec navigation et déconnexion.

**Props** : Aucune (utilise AuthContext)

**Fonctionnalités** :
- Affichage du logo AROLITEC
- Navigation conditionnelle selon le rôle
- Bouton de déconnexion
- Design responsive

**Fichiers** : `components/Header.tsx`, `components/Header.module.css`

### TaskItem

Carte d'affichage d'une tâche avec actions.

**Props** :
- `task` : Objet tâche
- `onEdit` : Callback pour éditer
- `onDelete` : Callback pour supprimer
- `isAdmin` : Booléen pour affichage admin

**Fonctionnalités** :
- Affichage titre, description, statut
- Badge de statut avec couleurs
- Badge "EN RETARD" si dueDate dépassée
- Date d'échéance formatée
- Informations créateur (si admin)
- Informations assignation (si admin)
- Boutons Modifier/Supprimer

**Fichiers** : `components/TaskItem.tsx`, `components/TaskItem.module.css`

### TaskListUser

Liste de tâches avec pagination intégrée.

**Props** :
- `tasks` : Array de tâches
- `loading` : État de chargement
- `onEdit` : Callback pour éditer
- `onDelete` : Callback pour supprimer
- `onCreateTask` : Callback pour créer
- `filters` : Filtres actifs
- `currentPage` : Page actuelle
- `onPageChange` : Callback changement de page

**Fonctionnalités** :
- Grille 3 colonnes responsive
- Pagination simple (← Page X / Y →)
- État vide avec illustration
- État de chargement
- Message si aucun résultat

**Fichiers** : `components/TaskListUser.tsx`, `components/TaskListUser.module.css`

### TaskForm

Formulaire de création/édition de tâche.

**Props** :
- `task` : Tâche à éditer (optionnel)
- `users` : Liste des utilisateurs (si admin)
- `isAdmin` : Booléen
- `onSubmit` : Callback soumission
- `onCancel` : Callback annulation

**Fonctionnalités** :
- Champs : titre, description, statut, date d'échéance
- Select d'assignation (si admin)
- Validation des champs
- Mode création/édition
- Design moderne

**Fichiers** : `components/TaskForm.tsx`, `components/TaskForm.module.css`

### FormModal

Modal pour encapsuler le formulaire de tâche.

**Props** :
- `isOpen` : État d'ouverture
- `onClose` : Callback fermeture
- `children` : Contenu du modal

**Fonctionnalités** :
- Overlay avec blur
- Animation d'entrée
- Fermeture par clic sur overlay
- Fermeture par touche Échap
- Scroll interne si contenu long

**Fichiers** : `components/FormModal.tsx`, `components/FormModal.module.css`

### Modal

Modal de notification/confirmation.

**Props** :
- `isOpen` : État d'ouverture
- `onClose` : Callback fermeture
- `onConfirm` : Callback confirmation
- `title` : Titre du modal
- `message` : Message
- `type` : Type (success, error, warning, info)
- `showConfirmButtons` : Afficher 2 boutons
- `confirmText` : Texte bouton confirmer
- `cancelText` : Texte bouton annuler

**Fonctionnalités** :
- 4 types avec couleurs différentes
- Mode 1 bouton (notification)
- Mode 2 boutons (confirmation)
- Fermeture automatique après 5s (succès)
- Animation d'entrée

**Fichiers** : `components/Modal.tsx`, `components/Modal.module.css`

### Spinner

Indicateur de chargement.

**Props** :
- `message` : Message optionnel (défaut: "Chargement...")

**Fonctionnalités** :
- Animation de rotation
- Overlay plein écran
- Message personnalisable

**Fichiers** : `components/Spinner.tsx`, `components/Spinner.module.css`

### PrivateRoute

Route protégée nécessitant authentification.

**Props** :
- `children` : Composant à protéger

**Fonctionnalités** :
- Vérification du token JWT
- Redirection vers /login si non authentifié
- Affichage du composant si authentifié

**Fichier** : `components/PrivateRoute.tsx`

### AdminRoute

Route protégée nécessitant rôle Admin.

**Props** :
- `children` : Composant à protéger

**Fonctionnalités** :
- Vérification du token JWT
- Vérification du rôle admin
- Redirection vers /login ou /my-tasks si non autorisé

**Fichier** : `components/AdminRoute.tsx`

## Services

### API Service

Service centralisant tous les appels API.

**Fichier** : `services/api.ts`

**Méthodes disponibles** :
```typescript
// Authentification
register(data: RegisterDto): Promise<AuthResponse>
login(data: LoginDto): Promise<AuthResponse>

// Tâches
getAllTasks(page, limit, status?, search?): Promise<TasksResponse>
getMyTasks(page, limit): Promise<TasksResponse>
createTask(data: CreateTaskDto): Promise<Task>
updateTask(id, data: UpdateTaskDto): Promise<Task>
deleteTask(id): Promise<void>
assignTask(taskId, userId): Promise<Task>
```

### Auth Service

Service de gestion de l'authentification.

**Fichier** : `services/authService.ts`

**Méthodes disponibles** :
```typescript
register(data): Promise<AuthResponse>
login(data): Promise<AuthResponse>
logout(): void
getCurrentUser(): User | null
getToken(): string | null
isAuthenticated(): boolean
isAdmin(): boolean
getUsers(): Promise<User[]>
```

## Context et State Management

### AuthContext

Context React pour gérer l'état d'authentification global.

**Fichier** : `context/AuthContext.tsx`

**État géré** :
- `user` : Utilisateur connecté (null si non connecté)
- `isAuthenticated` : Booléen d'authentification
- `login` : Fonction de connexion
- `logout` : Fonction de déconnexion
- `isAdmin` : Fonction vérifiant si user est admin

**Utilisation** :
```typescript
const { user, isAuthenticated, login, logout, isAdmin } = useAuth();
```

## Routing

Configuration dans `App.tsx` :
```typescript
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  <Route path="/dashboard" element={
    <AdminRoute><Dashboard /></AdminRoute>
  } />
  
  <Route path="/my-tasks" element={
    <PrivateRoute><MyTasks /></PrivateRoute>
  } />
  
  <Route path="/" element={
    <Navigate to="/login" replace />
  } />
</Routes>
```

**Routes disponibles** :
- `/login` : Page de connexion (public)
- `/register` : Page d'inscription (public)
- `/dashboard` : Tableau de bord admin (admin uniquement)
- `/my-tasks` : Mes tâches (authentifié)
- `/` : Redirection vers /login

## Tests

### Lancer les tests
```bash
npm test
```

### Tests unitaires

7 tests couvrant :
- Modal (affichage, fermeture, types)
- Spinner (affichage, message)

**Fichiers de tests** :
- `components/test/Modal.test.tsx`
- `components/test/Spinner.test.tsx`

### Exemple de test
```typescript
describe('Modal Component', () => {
  test('affiche le modal quand isOpen est true', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
        message="Message de test"
        type="success"
      />
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Message de test')).toBeInTheDocument();
  });
});
```

### Scripts de tests
```bash
npm test              # Lancer les tests
npm test -- --watch   # Mode watch
npm test -- --coverage # Avec couverture
```

## Styling

### CSS Modules

Chaque composant a son propre fichier CSS Module pour isolation des styles.

**Avantages** :
- Pas de conflit de classes
- Scoping automatique
- Import simple

**Exemple** :
```typescript
import styles from './TaskItem.module.css';

<div className={styles.taskCard}>
  <h3 className={styles.taskTitle}>{task.title}</h3>
</div>
```

### Design System

**Couleurs principales** :
- Primary : #FF6B35 (Orange AROLITEC)
- Hover : #E55A2B
- Dark : #D84315
- Background : #F8FAFC
- Text : #1E293B
- Secondary : #64748B

**Couleurs de statut** :
- Pending : #F97316 (Orange)
- In Progress : #0EA5E9 (Bleu)
- Completed : #10B981 (Vert)
- Overdue : #EF4444 (Rouge)

**Espacement** :
- xs : 0.25rem (4px)
- sm : 0.5rem (8px)
- md : 1rem (16px)
- lg : 1.5rem (24px)
- xl : 2rem (32px)

### Responsive Design

**Breakpoints** :
- Mobile : < 480px
- Tablet : 480px - 768px
- Desktop : 768px - 1024px
- Large : > 1024px

**Grilles adaptatives** :
- Desktop : 3 colonnes
- Tablet : 2 colonnes
- Mobile : 1 colonne

## Optimisations

### Recherche instantanée

Filtrage côté client pour éviter les appels API répétés :
```typescript
const filteredTasks = allTasks.filter(task => {
  if (filters.status && task.status !== filters.status) return false;
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    const titleMatch = task.title.toLowerCase().includes(searchLower);
    const descMatch = task.description?.toLowerCase().includes(searchLower);
    if (!titleMatch && !descMatch) return false;
  }
  
  return true;
});
```

### Pagination

Pagination côté client pour éviter de recharger les données :
```typescript
const tasksPerPage = 10;
const indexOfLastTask = currentPage * tasksPerPage;
const indexOfFirstTask = indexOfLastTask - tasksPerPage;
const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
```

### Production Build

Configuration Nginx optimisée :
```nginx
# Cache des assets statiques
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# Pas de cache pour index.html
location = /index.html {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### Multi-stage Docker Build

Optimisation de l'image Docker :
```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

Résultat : Image finale < 50 MB

## Scripts disponibles
```bash
npm start       # Démarrer en mode développement
npm run build   # Compiler pour production
npm test        # Lancer les tests
npm run eject   # Éjecter la configuration (irréversible)
```

## Variables d'environnement
```env
REACT_APP_API_URL=http://localhost:3333
```

En production Docker, cette variable est configurée dans `compose.yml`.
