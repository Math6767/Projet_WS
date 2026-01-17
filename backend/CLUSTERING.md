# Clustering Olympique - V1 et V2

## Vue d'ensemble

Ce projet propose deux approches complémentaires de clustering pour les pays olympiques :

- **V1 (Simple)** : Clustering basé sur les médailles pondérées (or/argent/bronze) uniquement
- **V2 (Avancé)** : Clustering multidimensionnel (performance, diversité, durée, efficacité)

Les deux versions sont implémentées en Python et disponibles côté backend.

---

# Version 1 : Clustering Simple (V1)

## Caractéristiques V1

**Approche directe et classique** : regroupe les pays uniquement selon leur performance en médailles pondérées.

### Méthodologie V1

#### Source de données V1

Données brutes des **médailles olympiques par pays**. Format simple :
```
countryCode,gold,silver,bronze
USA,1219,1000,876
URS,473,376,355
...
```

#### Processus V1

1. **Pondération** : `(or × 3) + (argent × 2) + (bronze × 1)`
2. **Normalisation** : RobustScaler (adapté aux outliers comme USA)
3. **K-Means** : 6 clusters avec seed=42
4. **Outliers** : Identification explicite des pays exceptionnels

#### La pondération V1

- Or = 3 points (1er)
- Argent = 2 points (2e)
- Bronze = 1 point (3e)

Exemple USA : (1219 × 3) + (1000 × 2) + (876 × 1) = **6433 points**

#### Avantages V1

1. **Simplicité** : Une dimension unique (puissance olympique globale)
2. **RobustScaler** : Gère bien les extrêmes (USA isolé vs petits pays)
3. **Outliers explicites** : Montre clairement les pays "qui sortent du lot"
4. **Rapide à comprendre** : Directement lié à la hiérarchie olympique

#### Limitations V1

1. **Unidimensionnel** : N'explique pas WHY les pays performent
2. **Cache les stratégies** : USA généraliste et Jamaïque spécialiste se confondent
3. **Ignore l'historique** : 1 an = 128 ans de participation valent pareil
4. **Ignore l'efficacité** : Un grand pays inefficace = petit pays très efficace

### Fichiers V1

#### `clustering.py`

**Entrée** : `data_pour_clustering.csv`

**Sortie** :
- `clustering_results.json` - Résumés des clusters et outliers
- `data_clustered.csv` - Données avec assignations cluster

#### Exemple `data_clustered.csv` (V1)

```
countryCode,gold,silver,bronze,total_medals,weighted_score,cluster
USA,1219,1000,876,3095,6433,2
URS,473,376,355,1204,2358,0
GBR,283,369,397,1049,1918,0
FRA,280,316,353,949,1671,0
```

---

# Version 2 : Clustering Multidimensionnel (V2)

## Caractéristiques V2

**Approche analytique et avancée** : regroupe les pays selon 4 dimensions qui capturent différentes facettes de la performance olympique.

### Méthodologie V2

#### Source de données V2

**9 969 athlètes individuels** agrégés au niveau national. Chaque athlète inclut :
- Disciplines (sport spécifique)
- Années de participation (min et max)
- Médailles obtenues (or, argent, bronze)

#### Les 4 dimensions V2

**1. Performance pondérée (weightedScore)**

Formule : `(nbOr × 3) + (nbArgent × 2) + (nbBronze × 1)`

Exemple USA : 1180 ors + 810 argents + 659 bronzes = **5819 points**

**2. Diversité (numDisciplines)**

Nombre de sports/disciplines différents avec médailles.

- Basse (3-5) : Pays spécialiste (ex: Jamaïque sprint)
- Haute (40+) : Pays généraliste (ex: USA dans tous les sports)

Exemple : USA 43 disciplines vs Jamaïque 3

**3. Durée de participation (temporalSpan)**

Années entre première et dernière médaille : `anneeMax - anneeMin`

- Courte (0-20 ans) : Succès récent
- Longue (100-128 ans) : Tradition établie

Exemple : Norvège (NOR) 128 ans (présence ininterrompue)

**4. Efficacité (medalsPerAthlete)**

Ratio : `totalMedailles / nombreAthletes`

- Faible (0.5-1.0) : Beaucoup d'athlètes, peu de médailles
- Élevé (2.0-3.0+) : Peu d'athlètes, beaucoup de médailles

Exemple : Zimbabwe ~7 médailles/athlète (ultra-sélectif)

#### Traitement des données V2

**Étape 1 : Agrégation athlète → pays**

9 969 athlètes → 142 pays avec calcul de :
- Sommes des médailles
- Score pondéré
- Disciplines uniques
- Année min/max
- Nombre d'athlètes

**Étape 2 : Normalisation (StandardScaler)**

Les 4 features ont des échelles différentes :
- weightedScore : 1 à 5819
- numDisciplines : 1 à 43
- temporalSpan : 0 à 128
- medalsPerAthlete : 0.5 à 7

StandardScaler transforme en (moyenne=0, écart-type=1) pour équilibrer l'importance.

**Important** : Sans normalisation, performance écrase tout. Avec, chaque dimension compte.

**Étape 3 : K-Means avec 6 clusters**

1. Initialise 6 centroïdes aléatoires (seed=42)
2. Assigne pays au centroïde le plus proche
3. Recalcule centroïdes comme moyenne des points
4. Répète jusqu'à convergence

#### Distribution des 6 clusters V2

**Cluster 0 : Participants mineurs**
- 52 pays, score moyen 10.9
- Peu de médailles, peu de disciplines
- Pays en développement, petites nations

**Cluster 1 : Bons compétiteurs régionaux**
- 38 pays, score moyen 156.8
- Présence établie, quelques disciplines
- Nations européennes moyennes, émergents asiatiques

**Cluster 2 : Grandes puissances olympiques**
- 20 pays, score moyen 1191.0
- Dominants, diversifiés, historique long
- Allemagne, France, Italie, Chine, Japon

**Cluster 3 : Cas isolé (outlier positif)**
- 1 pays (Zimbabwe)
- Score 7.0 mais efficacité extraordinaire (6.9 med/athlète)
- Peu d'athlètes, résultats concentrés

**Cluster 4 : Superpuissance absolue**
- 1 pays (USA)
- Score 5819 (surpasse tous les autres)
- Domination incontestée toutes dimensions

**Cluster 5 : Participants modérés durables**
- 30 pays, score moyen 45.6
- Participation longue mais performance modérée
- Tradition olympique ancienne, ressources limitées

#### Avantages V2

1. **Multidimensionnel** : Captures POURQUOI les pays performent
2. **Révèle stratégies** : USA (puissance totale) vs Norvège (durabilité) vs Zimbabwe (efficacité)
3. **Normalisation équitable** : Toutes les dimensions ont du poids
4. **Granularité améliorée** : Distinct profils d'excellence captés

#### Limitations V2

1. **Complexité** : Plus difficile à expliquer qu'une simple pondération
2. **StandardScaler** : Moins adapté aux extrêmes isolés que RobustScaler
3. **Choix arbitraires** : k=6 et features reflètent des décisions de design
4. **Données requises** : Besoin des athlètes individuels, pas juste agrégats

### Fichiers V2

#### `clustering_v2.py`

**Entrée** : `data_pour_clustering_v2.csv` (9 969 athlètes)

**Sortie** :
- `clustering_results_v2.json` - Résumés des clusters
- `data_clustered_v2.csv` - Données avec clusters (142 pays)
- `clustering_data_v2.json` - Format statique frontend

#### Exemple `data_clustered_v2.csv` (V2)

```
countryCode,nbOr,nbArgent,nbBronze,totalMedals,weightedScore,numDisciplines,temporalSpan,medalsPerAthlete,cluster
USA,1180,810,659,2649,5819,43,128,1.947,4
URS,473,376,355,1204,2358,40,68,2.055,2
NOR,148,149,198,495,742,30,128,5.488,2
ZIM,4,7,7,18,39,4,20,6.857,3
```

Colonnes : countryCode, nbOr, nbArgent, nbBronze, totalMedals, weightedScore, numDisciplines, temporalSpan, medalsPerAthlete, cluster

#### `clustering_data_v2.json`

Version statique pour le frontend (chargement direct `/front/public/clustering_data_v2.json`).

Structure identique au CSV V2 en JSON pour faciliter l'accès.

---

# Comparaison V1 vs V2

## Tableau comparatif

| Aspect | V1 | V2 |
|--------|-----|-----|
| **Entrée** | Médailles par pays | Athlètes individuels (9 969) |
| **Dimensions** | 1 (perf pondérée) | 4 (perf, diversité, durée, efficacité) |
| **Normalisation** | RobustScaler | StandardScaler |
| **Clusters** | 6 | 6 |
| **Outliers** | Explicites (formula) | Isolés automatiquement |
| **Complexité** | Simple, direct | Analytique, nuancé |
| **Cas d'usage** | Classement rapide | Analyse profonde |
| **Fichiers** | clustering_results.json, data_clustered.csv | clustering_results_v2.json, data_clustered_v2.csv, clustering_data_v2.json |

## Quand utiliser V1 ?

- Classement simple par puissance olympique
- "Qui est le plus fort ?"
- Visualisations monovariatiques
- Analyse rapide sans contexte

## Quand utiliser V2 ?

- Comprendre profils olympiques différents
- Analyser stratégies (généraliste vs spécialiste)
- Capturer durabilité et efficacité
- Exploration analytique approfondie
- Frontend Graphs.tsx (actuellement utilisée)

---

# Utilisation

## Relancer V1

```bash
cd backend
python clustering.py
```

## Relancer V2

```bash
cd backend
python clustering_v2.py
```

## Mettre à jour frontend avec V2

```bash
python clustering_v2.py
python fix_csv_v2.py
Copy-Item clustering_data_v2.json ../front/public/clustering_data_v2.json
```

## Accès frontend V2

Graphs.tsx charge `/clustering_data_v2.json` et affiche :
- Graphique de dispersion (Performance vs Disciplines)
- Graphique radar (Profils multidimensionnels)
- Tableau (Top 30 pays)
- Cartes (statistiques par cluster)

---

# Analyse de pertinence

## Points forts

**V1 :**
- Simplicité et clarté
- Directement lié à la hiérarchie olympique
- Outliers explicites et compréhensibles

**V2 :**
- Pondération 3-2-1 exacte à la hiérarchie
- Révèle stratégies réelles (performance, diversité, durée, efficacité)
- Captures réelles : Zimbabwe ultra-efficace, USA superpuissance, Norvège durable
- Normalisation équitable (aucune variable écrase les autres)
- k=6 : Assez nuancé sans fragmentation excessive

## Améliorations possibles V2

1. **Historique** : URS → Russie, pénaliser "héritages" ?
2. **Récence** : Amplifier performances récentes (2000-2024) vs anciennes
3. **Validation k** : Elbow method ou silhouette score pour k=6
4. **Taille délégation** : Nouveau feature "athletes_per_capita" ?

## Verdict

**V1 et V2 sont complémentaires.**

V2 est **pertinent et bien pensé** car elle :
- Respecte structure réelle (pondération 3-2-1)
- Capture multiples réalités (4 dimensions)
- Évite fragmentation (k=6)
- Normalisée correctement
- Reproductible (seed=42)

C'est un système **robuste** et **explicable** qui dépasse un simple classement par médailles.
