# Documentation Backend - Application AROLITEC

Documentation technique du backend NestJS de l'application de gestion de tâches.

## Table des matières

- [Architecture](#architecture)
- [Technologies](#technologies)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Base de données](#base-de-données)
- [Cache Redis](#cache-redis)
- [RabbitMQ](#rabbitmq)
- [Tests](#tests)
- [Sécurité](#sécurité)

## Architecture

Le backend est construit avec NestJS en suivant les principes SOLID et une architecture modulaire :

- **Modules** : auth, users, tasks, notifications
- **Services** : Logique métier
- **Controllers** : Gestion des routes HTTP
- **Entities** : Modèles TypeORM
- **DTOs** : Validation des données
- **Guards** : Authentification et autorisation
- **Decorators** : Extraction des données utilisateur

## Technologies

- **NestJS 10** : Framework backend
- **TypeScript** : Langage
- **TypeORM** : ORM pour PostgreSQL
- **PostgreSQL 15** : Base de données
- **Redis 7** : Cache
- **RabbitMQ 3** : Message broker
- **JWT** : Authentification
- **Bcrypt** : Hachage des mots de passe
- **Class-validator** : Validation des DTOs
- **Jest** : Tests unitaires

## Structure du projet
```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── tasks/
│   │   ├── task.entity.ts
│   │   ├── tasks.controller.ts
│   │   ├── tasks.service.ts
│   │   ├── tasks.module.ts
│   │   ├── create-task.dto.ts
│   │   └── update-task.dto.ts
│   ├── users/
│   │   ├── user.entity.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── create-user.dto.ts
│   ├── notifications/
│   │   ├── notifications.service.ts
│   │   └── notifications.module.ts
│   ├── seeds/
│   │   └── seed.service.ts
│   ├── redis.module.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
│   └── app.e2e-spec.ts
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Installation

### Avec Docker (Recommandé)
```bash
docker-compose up --build
```

### Sans Docker
```bash
cd backend
npm install
npm run start:dev
```

Variables d'environnement requises :
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=task_management
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
JWT_SECRET=your-secret-key
PORT=3333
```

## Configuration

### TypeORM

Configuré dans `app.module.ts` avec synchronize activé pour le développement.
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
})
```

### JWT

Configuré dans `auth.module.ts` avec une durée de validité de 24 heures.
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '24h' },
})
```

## API Endpoints

### Authentification

**POST /auth/register**

Créer un nouveau compte utilisateur.

Request body :
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response :
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

**POST /auth/login**

Se connecter avec un compte existant.

Request body :
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response : Identique à /auth/register

**GET /auth/profile**

Obtenir les informations de l'utilisateur connecté.

Headers : `Authorization: Bearer <token>`

Response :
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

**GET /auth/users**

Obtenir la liste de tous les utilisateurs (Admin uniquement).

Headers : `Authorization: Bearer <token>`

Response :
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
]
```

### Tâches

**GET /tasks**

Obtenir toutes les tâches (Admin) ou les tâches assignées (User).

Headers : `Authorization: Bearer <token>`

Query parameters :
- `page` : Numéro de page (défaut: 1)
- `limit` : Nombre d'éléments par page (défaut: 10)
- `status` : Filtrer par statut (pending, in-progress, completed)
- `search` : Rechercher dans titre et description

Response :
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Titre de la tâche",
      "description": "Description détaillée",
      "status": "pending",
      "dueDate": "2026-02-15T00:00:00.000Z",
      "assignedTo": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2026-01-30T10:00:00.000Z",
      "updatedAt": "2026-01-30T10:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

**GET /tasks/my-tasks**

Obtenir uniquement les tâches assignées à l'utilisateur connecté.

Headers : `Authorization: Bearer <token>`

Query parameters : Identiques à GET /tasks

Response : Identique à GET /tasks

**POST /tasks**

Créer une nouvelle tâche.

Headers : `Authorization: Bearer <token>`

Request body :
```json
{
  "title": "Nouvelle tâche",
  "description": "Description",
  "status": "pending",
  "dueDate": "2026-02-15",
  "assignedToId": "uuid-optionnel"
}
```

Response : Objet tâche créée

**PATCH /tasks/:id**

Modifier une tâche existante.

Headers : `Authorization: Bearer <token>`

Request body :
```json
{
  "title": "Titre modifié",
  "status": "in-progress"
}
```

Response : Objet tâche modifiée

**DELETE /tasks/:id**

Supprimer une tâche.

Headers : `Authorization: Bearer <token>`

Response : 204 No Content

**POST /tasks/:id/assign/:userId**

Assigner une tâche à un utilisateur (Admin uniquement).

Headers : `Authorization: Bearer <token>`

Response : Objet tâche avec assignation mise à jour

## Base de données

### Schéma

**Table : users**

| Colonne    | Type      | Description                  |
|------------|-----------|------------------------------|
| id         | UUID      | Clé primaire                 |
| email      | VARCHAR   | Email unique                 |
| password   | VARCHAR   | Mot de passe haché           |
| firstName  | VARCHAR   | Prénom                       |
| lastName   | VARCHAR   | Nom                          |
| role       | ENUM      | admin ou user                |
| createdAt  | TIMESTAMP | Date de création             |
| updatedAt  | TIMESTAMP | Date de modification         |

**Table : tasks**

| Colonne      | Type      | Description                  |
|--------------|-----------|------------------------------|
| id           | UUID      | Clé primaire                 |
| title        | VARCHAR   | Titre de la tâche            |
| description  | TEXT      | Description détaillée        |
| status       | ENUM      | pending, in-progress, completed |
| dueDate      | DATE      | Date d'échéance              |
| assignedToId | UUID      | FK vers users (nullable)     |
| createdAt    | TIMESTAMP | Date de création             |
| updatedAt    | TIMESTAMP | Date de modification         |

### Relations

- Un utilisateur peut avoir plusieurs tâches assignées (OneToMany)
- Une tâche peut être assignée à un seul utilisateur (ManyToOne)

## Cache Redis

Le cache Redis est utilisé pour optimiser les performances :

### Stratégie de cache

- **Clé** : `tasks:all` pour toutes les tâches
- **TTL** : 5 minutes (300 secondes)
- **Invalidation** : Lors de CREATE, UPDATE, DELETE

### Implémentation
```typescript
async getAllTasks() {
  const cachedTasks = await this.cacheManager.get('tasks:all');
  if (cachedTasks) {
    return cachedTasks;
  }
  
  const tasks = await this.taskRepository.find();
  await this.cacheManager.set('tasks:all', tasks, 300);
  return tasks;
}
```

### Invalidation
```typescript
async invalidateCache() {
  await this.cacheManager.del('tasks:all');
}
```

## RabbitMQ

RabbitMQ est utilisé pour les notifications asynchrones des tâches en retard.

### Architecture

- **Queue** : `overdue-tasks`
- **Producer** : NotificationsService (vérifie toutes les heures)
- **Consumer** : NotificationsService (traite les messages)

### Vérification des tâches en retard
```typescript
@Cron('0 * * * *') // Toutes les heures
async checkOverdueTasks() {
  const overdueTasks = await this.tasksService.findOverdueTasks();
  
  for (const task of overdueTasks) {
    await this.sendNotification({
      taskId: task.id,
      title: task.title,
      assignedTo: task.assignedTo?.email,
    });
  }
}
```

### Format des messages
```json
{
  "taskId": "uuid",
  "title": "Titre de la tâche",
  "assignedTo": "user@example.com",
  "dueDate": "2026-01-30"
}
```

## Tests

### Lancer les tests
```bash
npm test
```

### Tests unitaires

19 tests couvrant :
- Authentification (register, login, JWT)
- Gestion des tâches (CRUD, assignation)
- Gestion des utilisateurs
- Guards (JWT, Roles)
- Services (Tasks, Users, Auth)

### Exemple de test
```typescript
describe('TasksService', () => {
  it('should create a task', async () => {
    const createTaskDto = {
      title: 'Test Task',
      description: 'Description',
      status: 'pending',
      dueDate: new Date(),
    };
    
    const result = await service.create(createTaskDto, userId);
    
    expect(result).toBeDefined();
    expect(result.title).toBe('Test Task');
  });
});
```

### Couverture
```bash
npm run test:cov
```

Résultats : 100% de couverture sur les services critiques

## Sécurité

### Authentification

- JWT avec expiration de 24 heures
- Tokens stockés côté client uniquement
- Refresh automatique non implémenté (à ajouter en production)

### Hachage des mots de passe

- Bcrypt avec salt rounds = 10
- Les mots de passe ne sont jamais stockés en clair

### Validation des données

- Class-validator sur tous les DTOs
- ValidationPipe global activé

### Protection des routes

- JwtAuthGuard pour authentification
- RolesGuard pour autorisation
- Decorators @Roles() pour définir les rôles autorisés

### CORS

Configuré pour accepter uniquement http://localhost:3000 en développement.
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

## Variables d'environnement

Liste complète des variables requises :
```env
NODE_ENV=production
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=task_management
REDIS_HOST=redis
REDIS_PORT=6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
JWT_SECRET=your-super-secret-jwt-key
PORT=3333
```

## Scripts disponibles
```bash
npm run start        # Démarrer en mode production
npm run start:dev    # Démarrer en mode développement
npm run start:debug  # Démarrer en mode debug
npm run build        # Compiler le projet
npm run test         # Lancer les tests
npm run test:watch   # Lancer les tests en mode watch
npm run test:cov     # Générer la couverture de tests
npm run lint         # Vérifier le code avec ESLint
```
