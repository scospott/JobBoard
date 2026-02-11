# 💼 Job Board — Application Web Full-Stack

## 📖 Présentation générale

**Job Board** est une application web full-stack permettant :
- de consulter des offres d’emploi,
- de visualiser les détails d’une annonce sans rechargement de page,
- de postuler à une offre d’emploi,
- de gérer les annonces, les candidatures et les utilisateurs via une interface administrateur sécurisée.

Ce projet a été réalisé dans le cadre d’un **travail noté**, en respectant une architecture MVC, une API REST et de bonnes pratiques de développement web.

---

## 🎯 Objectifs pédagogiques

- Concevoir une **base de données SQL relationnelle**
- Développer une **API REST sécurisée**
- Mettre en place une **authentification avec rôles**
- Créer une **interface utilisateur dynamique**
- Implémenter une **interface d’administration protégée**
- Fournir une **documentation claire et professionnelle**

---

## 🏗️ Architecture du projet

Architecture **MVC (Model – View – Controller)** :

JobBoard/
├── api/
│ ├── Config/ # Configuration DB et variables d’environnement
│ ├── Controllers/ # Logique métier
│ ├── Middlewares/ # Authentification & rôles
│ ├── Models/ # Modèles Sequelize (MySQL)
│ ├── Routes/ # Routes API REST
│ ├── Services/ # Services métier
│ ├── public/ # Front-end (HTML / CSS / JS)
│ │ ├── index.html # Page annonces
│ │ ├── admin.html # Dashboard admin
│ │ ├── login.html # Connexion
│ │ ├── register.html # Inscription
│ │ ├── styles.css # Styles
│ │ ├── app.js # Logique front utilisateur
│ │ └── admin.js # Logique front admin
│ ├── server.js # Point d’entrée serveur
│ └── reset_admin.js # Script création / reset admin
├── package.json
└── README.md


---

## 🗄️ Base de données (MySQL)

### Tables principales

- **companies** : entreprises
- **advertisements** : offres d’emploi
- **people** : utilisateurs (candidats / admin)
- **applications** : candidatures

### Relations

- Une entreprise possède plusieurs annonces  
- Une annonce possède plusieurs candidatures  
- Une candidature est liée à une personne et à une annonce  

---

## 🔐 Authentification & rôles

### Authentification
- Authentification via **JWT (JSON Web Token)**
- Token stocké côté client (`localStorage`)
- Vérification côté backend via middleware

### Rôles utilisateurs

| Rôle | Droits |
|----|----|
| `user` | Consulter les annonces, postuler |
| `admin` | Accès dashboard admin + gestion complète |

### Sécurité
- `authRequired` : vérifie la validité du token
- `adminOnly` : autorise uniquement les administrateurs
- Protection **backend ET frontend**

---

## 🌐 API REST (principales routes)

### Authentification
POST /api/auth/register
POST /api/auth/login


### Annonces
GET /api/advertisements
GET /api/advertisements/:id


### Candidatures
POST /api/applications


### Administration (routes protégées)
GET /api/admin/companies
POST /api/admin/companies
PUT /api/admin/companies/:id
DELETE /api/admin/companies/:id

GET /api/admin/advertisements
POST /api/admin/advertisements
PUT /api/admin/advertisements/:id
DELETE /api/admin/advertisements/:id

GET /api/admin/people
GET /api/admin/applications


---

## 🖥️ Front-end

- HTML / CSS / JavaScript vanilla
- Chargement dynamique des données via `fetch`
- Aucun rechargement de page pour :
  - affichage des détails
  - candidature
- Interface administrateur dédiée (`/admin.html`)

### Gestion de l’interface utilisateur
- Boutons **Connexion / Inscription** visibles uniquement si non connecté
- Interface adaptée selon le rôle (`user` / `admin`)
- Déconnexion sécurisée

---

## 🚀 Lancement du projet en local

### 1️⃣ Installation des dépendances
```bash
cd api
npm install
2️⃣ Configuration des variables d’environnement (.env)
PORT=3001
DB_HOST=localhost
DB_USER=jobboard_user
DB_PASSWORD=********
DB_NAME=jobboard
JWT_SECRET=super_secret_key
3️⃣ Lancer le serveur
npm run start
👑 Compte administrateur (test)
Création ou réinitialisation de l’admin :

node reset_admin.js
Identifiants :

Email : admin@jobboard.test

Mot de passe : Admin2026!

Accès admin :

http://localhost:3001/admin.html
