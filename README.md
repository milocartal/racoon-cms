# Racoon CMS

Racoon CMS est un système de gestion de contenu moderne, extensible et rapide, construit avec Next.js, Prisma et MinIO. Il permet la gestion des utilisateurs, des pages, des médias et des paramètres via une interface d'administration sécurisée.

## Fonctionnalités principales

- **Gestion des utilisateurs** : création, modification, suppression, rôles et permissions.
- **Gestion des pages** : création, édition, affichage, organisation par segments et slug.
- **Gestion des médias** : upload, affichage, modification, suppression, stockage via MinIO.
- **Authentification** : NextAuth pour la gestion sécurisée des sessions et de l'accès.
- **Interface d'administration** : dashboard, gestion des utilisateurs, pages, médias et paramètres.
- **API TRPC** : endpoints pour les opérations CRUD et l'intégration front-end/back-end.
- **Base de données** : Prisma ORM, migrations et seed.
- **Docker** : configuration pour le déploiement et le développement local.

## Structure du projet

```text
├── prisma/                # Schéma de la base de données et scripts de seed
├── public/                # Fichiers statiques (logos, icônes, manifestes)
├── src/
│   ├── app/               # Pages Next.js, layouts, composants admin
│   ├── hooks/             # Hooks React personnalisés
│   ├── lib/               # Utilitaires, intégration MinIO, modèles Prisma
│   ├── server/            # API, routes TRPC, authentification
│   ├── styles/            # Feuilles de style globales
│   ├── trpc/              # Client et serveur TRPC
│   └── utils/             # Fonctions utilitaires
├── components.json        # Configuration des composants
├── docker-compose.yaml    # Configuration Docker
├── package.json           # Dépendances et scripts npm
├── tsconfig.json          # Configuration TypeScript
├── ...
```

## Installation

### Prérequis

- Node.js >= 18
- pnpm (ou npm/yarn)
- Docker (optionnel pour le développement local)

### Étapes

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/milocartal/racoon-cms.git
   cd racoon-cms
   ```

2. **Installer les dépendances**

   ```bash
   pnpm install
   # ou npm install
   ```

3. **Configurer les variables d'environnement**

   Créez un fichier `.env` à la racine et renseignez les variables nécessaires (voir `src/env.js`).

4. **Démarrer la base de données (optionnel)**

   ```bash
   ./start-database.sh
   # ou via Docker
   docker-compose up -d
   ```

5. **Lancer les migrations Prisma**

   ```bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   ```

6. **Démarrer le serveur de développement**

   ```bash
   pnpm dev
   # ou npm run dev
   ```

## Utilisation

- Accédez à l'interface d'administration via `http://localhost:3000/admin`.
- Gérez les utilisateurs, pages, médias et paramètres depuis le dashboard.

## Scripts utiles

- `pnpm dev` : démarre le serveur Next.js en mode développement
- `pnpm build` : build de l'application pour la production
- `pnpm prisma migrate dev` : lance les migrations Prisma
- `pnpm prisma db seed` : seed la base de données
- `pnpm lint` : vérifie la qualité du code

## Technologies

- **Next.js** : framework React pour le front-end et l'API
- **Prisma** : ORM pour la base de données
- **MinIO** : stockage d'objets compatible S3
- **TRPC** : API typesafe entre front et back
- **NextAuth** : gestion de l'authentification
- **Docker** : conteneurisation pour le développement et la production

## Contribution

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commitez vos modifications
4. Poussez la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

## Licence

Ce dépôt est public **mais n’est pas open source**.  
Sauf accord écrit, **tous droits sont réservés**. Aucune réutilisation,
modification, redistribution ou exploitation commerciale n’est autorisée.

- **But du dépôt** : transparence et démonstration du projet `Racoon-CMS`.
- **Contributions** : ouvrez une *issue* pour les bugs/retours. Les *pull
  requests* externes peuvent être fermées sans examen.
- **Composants tiers** : les dépendances sont couvertes par leurs propres
  licences (voir chaque paquet).

### Ce qui est autorisé

- Lire le code et consulter l’historique des commits.
- Ouvrir des issues pour signaler un problème ou proposer une idée.

### Ce qui est interdit sans accord écrit

- Réutiliser le code dans un autre projet, public ou privé.
- Redistribuer, publier des copies ou proposer des builds.
- Déployer ce code en production ou vendre un service basé dessus.

Pour toute demande de licence ou d’exception : <ton.email@domaine.tld>.

Référence : voir le fichier [LICENSE](./LICENSE).

## Auteur

- [milocartal](https://github.com/milocartal)
