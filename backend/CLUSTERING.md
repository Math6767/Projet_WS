# Clustering Olympique

Ce dossier contient un système de **clustering** pour grouper les pays olympiques selon leurs performances médaillées.

## Qu'est-ce que le clustering ?

Le clustering regroupe les pays qui ont des **performances similaires** aux Jeux Olympiques. Par exemple :
- **Cluster 0** : Les élites (USA, Russie, Allemagne...)
- **Cluster 1** : Les petits performeurs
- **Cluster 2** : Les performeurs moyens
- **Cluster 3** : Les moins performants

**Important :** Les médailles sont **pondérées** pour le clustering:
- Or = **3 points**
- Argent = **2 points**
- Bronze = **1 point**

Cela reflète l'importance réelle des médailles dans le classement olympique.



## Comment lancer le clustering

### Option 1 : Via npm (recommandé)
```bash
npm run cluster
```

### Option 2 : Directement en Python
```bash
..\.venv\Scripts\python.exe clustering.py
```

---

## Les fichiers

### `clustering.py`
**Le script principal de clustering en Python.**

- **Entrée** : `data_pour_clustering.csv` (données des pays, récupérées avec requête)
- **Sortie** : 
  - `clustering_results.json` (résultats détaillés)
  - `data_clustered.csv` (données enrichies avec clusters)

**Code :**
1. Charge les données des médailles (or, argent, bronze)
2. Pondère les médailles (or×3, argent×2, bronze×1)
3. Normalise les données
4. Applique l'algorithme KMeans avec 4 clusters
5. Identifie les outliers (pays exceptionnels)
6. Génère les résultats

---

### `data_pour_clustering.csv`
**Données brutes des médailles olympiques.**

Format :
```
countryCode,"gold","silver","bronze"
Usa,1219,1000,876
Urs,473,376,355
...
```

Contient les performances des pays.

---

### `clustering_results.json`
**Résultats du clustering en JSON.**

Structure :
```json
{
  "clustering_summary": {
    "cluster_0": {
      "count": 6,
      "avg_gold": 240.0,
      "avg_weighted_score": 1428.3,
      "countries": [...]
    },
    ...
  },
  "outliers": {
    "description": "Pays qui sortent du lot",
    "count": 8,
    "countries": [
      {
        "countryCode": "Usa",
        "gold": 1219,
        "weighted_score": 6433,
        "cluster": 2
      },
      ...
    ]
  },
  "cluster_interpretation": {
    "cluster_0": "Élites olympiques",
    "cluster_1": "Bons performeurs",
    ...
  }
}
```

---

### `data_clustered.csv`
**Version enrichie du CSV avec les clusters.**

Format :
```
countryCode,gold,silver,bronze,total_medals,weighted_score,cluster
Usa,1219,1000,876,3095,6433,2
Urs,473,376,355,1204,2358,0
...
```

**Colonnes :**
- `countryCode` : Code du pays
- `gold`, `silver`, `bronze` : Nombre de médailles
- `total_medals` : Total non-pondéré
- `weighted_score` : Score pondéré (or×3 + argent×2 + bronze×1)
- `cluster` : Numéro du cluster (0-3)

---

## Configuration

### Dépendances Python requises
```
pandas
scikit-learn
numpy
```

Elles sont déjà installées dans le venv du projet.

### Réinstaller les dépendances
```bash
pip install pandas scikit-learn
```

---

## API Backend

Le fichier `server.js` expose deux routes pour le clustering :

### `POST /api/run-clustering`
Relance le clustering.

**Réponse :**
```json
{
  "success": true,
  "message": "Clustering complété avec succès",
  "files": ["clustering_results.json", "data_clustered.csv"]
}
```

### `GET /api/clustering-results`
Récupère les résultats du clustering.

**Réponse :** Le contenu complet de `clustering_results.json`

---

## Exemples d'utilisation

### Depuis le terminal
```bash
cd backend
npm run cluster
```

### Depuis le frontend
```javascript
// Relancer le clustering
fetch('http://localhost:3001/api/run-clustering', {
  method: 'POST'
})

// Récupérer les résultats
fetch('http://localhost:3001/api/clustering-results')
  .then(res => res.json())
  .then(data => console.log(data.outliers.countries))
```

---

## Résultats typiques

Après un clustering :
```
Clustering complété!

Résumé des clusters:
  cluster_0: 6 pays (avg: 955.0 médailles)
  cluster_1: 140 pays (avg: 36.2 médailles)
  cluster_2: 1 pays (avg: 3095.0 médailles)
  cluster_3: 15 pays (avg: 496.5 médailles)

Pays exceptionnels (outliers): 8 pays
   Top 5: Usa, Urs, Gbr, Ger, Fra
```

---

## Pour comprendre l'algorithme

**KMeans** est un algorithme de machine learning qui :
1. **Initialise** 4 centroïdes aléatoires
2. **Assigne** chaque point au centroïde le plus proche
3. **Recalcule** les centroïdes comme moyenne des points
4. **Répète** jusqu'à convergence

Le résultat : 4 groupes de pays avec des performances similaires.

---

## Personnalisation

Si tu veux changer le nombre de clusters, modifie dans `clustering.py` :
```python
kmeans = KMeans(n_clusters=4, ...)  # Changer 4 à un autre nombre
```

---

**Besoin d'aide ?** Consulte le code ou relance le clustering !
