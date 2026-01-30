# Application de Gestion de Tâches - AROLITEC

Application web full-stack de gestion de tâches avec système de messagerie en temps réel.

## Table des matières

- [Aperçu](#aperçu)
- [Stack Technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation et Démarrage](#installation-et-démarrage)
- [Comptes de Test](#comptes-de-test)
- [Architecture](#architecture)
- [Documentation Détaillée](#documentation-détaillée)

## Aperçu

Système complet de gestion de tâches développé dans le cadre d'un test technique avec :
- Authentification JWT et gestion des rôles (Admin/User)
- Interface moderne avec pagination et filtres
- Cache Redis pour optimisation des performances
- Notifications RabbitMQ pour tâches en retard
- Tests unitaires frontend et backend
- Architecture containerisée avec Docker

## Stack Technique

### Backend
- NestJS avec TypeScript
- PostgreSQL
- Redis (Cache)
- RabbitMQ (Message Queue)
- TypeORM
- JWT & Bcrypt
- Jest (Tests unitaires)

### Frontend
- React avec TypeScript
- React Router
- Axios
- CSS Modules
- Jest & React Testing Library

### DevOps
- Docker & Docker Compose
- Multi-stage builds
- Nginx

## Prérequis

- Docker version 20.10 ou supérieure
- Docker Compose version 2.0 ou supérieure
- Git

## Installation et Démarrage

### 1. Cloner le repository
```bash
git clone <repository-url>
cd AROLITEC
```

### 2. Lancer avec Docker Compose
```bash
docker-compose up --build
```

Cette commande va :
- Construire les images Docker pour le backend et le frontend
- Démarrer PostgreSQL, Redis, RabbitMQ
- Démarrer le backend NestJS sur le port 3333
- Démarrer le frontend React sur le port 3000
- Créer automatiquement les utilisateurs de test

Le premier démarrage peut prendre 3 à 5 minutes.

### 3. Accéder à l'application

Une fois tous les services démarrés :

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3333
- **RabbitMQ Management** : http://localhost:15672
  - Username : guest
  - Password : guest

### 4. Arrêter l'application
```bash
docker-compose down
```

Pour supprimer également les volumes :
```bash
docker-compose down -v
```

## Comptes de Test

Deux comptes utilisateurs sont créés automatiquement au démarrage :

### Administrateur
- **Email** : admin@arolitec.com
- **Mot de passe** : admin123
- **Permissions** : Peut créer, modifier, supprimer et assigner toutes les tâches

### Utilisateur Standard
- **Email** : user@arolitec.com
- **Mot de passe** : user123
- **Permissions** : Peut uniquement gérer ses propres tâches assignées

## Architecture

### Structure du projet
```
AROLITEC/
├── README/
│   ├── README_PRINCIPAL.md   # Ce fichier
│   ├── README_BACKEND.md     # Documentation backend
│   └── README_FRONTEND.md    # Documentation frontend
├── backend/
│   ├── src/
│   │   ├── auth/            # Module authentification
│   │   ├── tasks/           # Module gestion des tâches
│   │   ├── users/           # Module gestion des utilisateurs
│   │   ├── notifications/   # Module RabbitMQ
│   │   ├── seeds/           # Données initiales
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/           # Pages principales
│   │   ├── services/        # Services API
│   │   ├── context/         # Context React
│   │   └── types/           # Types TypeScript
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── compose.yml              # Configuration Docker Compose
└── .gitignore
```

### Services Docker

Le fichier `compose.yml` définit les services suivants :

**postgres**
- Image : postgres:15-alpine
- Port : 5432
- Volume : postgres_data

**redis**
- Image : redis:7-alpine
- Port : 6379

**rabbitmq**
- Image : rabbitmq:3-management-alpine
- Ports : 5672 (AMQP), 15672 (Management UI)

**backend**
- Build : ./backend
- Port : 3333
- Dépend de : postgres, redis, rabbitmq

**frontend**
- Build : ./frontend
- Port : 3000 (mappé sur 80 interne)
- Dépend de : backend

## Fonctionnalités Principales

### Pour les Administrateurs
- Créer, modifier, supprimer toutes les tâches
- Assigner des tâches aux utilisateurs
- Voir toutes les tâches du système
- Gérer les utilisateurs
- Dashboard avec statistiques complètes

### Pour les Utilisateurs
- Voir uniquement les tâches assignées
- Modifier le statut de leurs tâches
- Filtrer et rechercher dans leurs tâches
- Voir les statistiques de leurs tâches

### Fonctionnalités Techniques
- Pagination (10 tâches par page)
- Recherche instantanée (filtrage côté client)
- Filtres par statut (En attente, En cours, Terminé)
- Cache Redis avec invalidation intelligente
- Notifications pour tâches en retard via RabbitMQ
- Authentification sécurisée avec JWT
- Responsive design

## Tests

### Tests Backend
```bash
cd backend
npm install
npm test
```

Résultats : 19 tests passent avec 100% de couverture

### Tests Frontend
```bash
cd frontend
npm install
npm test
```

Résultats : 7 tests passent

## Documentation Détaillée

Pour plus d'informations sur chaque partie du projet :

- [Documentation Backend](./README_BACKEND.md) - API, endpoints, architecture backend
- [Documentation Frontend](./README_FRONTEND.md) - Composants, pages, architecture frontend

## Dépannage

### Les containers ne démarrent pas
```bash
docker-compose down -v
docker system prune -a --volumes
docker-compose up --build
```

### Erreur de connexion à la base de données

Vérifier que PostgreSQL est bien démarré :
```bash
docker-compose logs postgres
```

### Le frontend ne se connecte pas au backend

Vérifier que le backend est accessible :
```bash
curl http://localhost:3333
```

## Auteur

**KEKE AXELLE**

Projet développé dans le cadre d'un test technique pour le poste de Full Stack Developer chez AROLITEC.

Date : Janvier 2026