# OlympicGraph - Web Sémantique

Projet d'analyse des Jeux Olympiques via DBpedia - IF INSA Lyon

## Architecture

- **Frontend** : React + TypeScript + Vite + shadcn-ui + Tailwind CSS
- **Backend** : Node.js + Express (proxy pour API LLM)
- **Base de données** : DBpedia (SPARQL endpoint)

## Installation et lancement

### Backend

```bash
cd backend
npm install
npm start
```

Le serveur backend sera accessible sur http://localhost:3001

### Frontend

```bash
cd front
npm install
npm run dev
```

Le serveur frontend sera accessible sur http://localhost:5173

## Fonctionnalités

- **NL2SPARQL** : Conversion de questions en langage naturel vers SPARQL
- **SPARQL Editor** : Éditeur de requêtes SPARQL avec exécution sur DBpedia
- **Analyse des données** : Visualisations des performances olympiques
- **Navigation** : Interface multi-pages (Vue d'ensemble, Nations, Athlètes, Graphes)

## Technologies utilisées

- React 18
- TypeScript
- Vite
- Express.js
- shadcn/ui
- Tailwind CSS
- React Router
- TanStack Query
