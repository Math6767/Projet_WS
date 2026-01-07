# Backend NL2SPARQL

Backend minimal pour gérer les requêtes vers l'API LLM Ollama.

## Installation

```bash
npm install
```

## Démarrage

```bash
npm start
```

Le serveur sera accessible sur http://localhost:3001

## Endpoints

- `POST /api/nl2sparql` - Convertit une question en SPARQL
- `GET /health` - Vérification de l'état du serveur
