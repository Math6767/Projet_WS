"""
Clustering v2 - Groupement de pays par profil olympique
Basé sur les disciplines, les médailles obtenues, la durée de participation, et la performance

Ce script agrège les données au niveau PAYS et crée des features pertinentes:
- Performance: nombre total de médailles pondérées (or=3, argent=2, bronze=1)
- Diversité: nombre de disciplines différentes dans lesquelles le pays a gagné des médailles
- Durée: span temporel entre première et dernière participation
- Activité: nombre d'athlètes médaillés du pays
- Densité: ratio de médailles par athlète
"""

import pandas as pd
import json
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import numpy as np
import csv
import io


# 1. LECTURE ET PARSING DU CSV


# csv obtenu avec requête sur dbpedia, export des res
with open('data_pour_clustering_v2.csv', 'r', encoding='utf-8') as f:
    content = f.read()

# Le format est spécial: chaque ligne est entre guillemets simples
# et utilise "" pour les guillemets échappés
# On traite ça manuellement

lines = content.strip().split('\n')
data = []

# Ignorer la première ligne (headers)
for line in lines[1:]:
    if line.strip():
        # Supprimer les guillemets externes
        line = line.strip()
        if line.startswith('"') and line.endswith('"'):
            line = line[1:-1]
        
        # Remplacer les guillemets doubles par un placeholder temporaire
        line = line.replace('""', '\x00')  # Utiliser un caractère spécial
        
        # Splitter par virgule
        parts = line.split(',')
        
        # Remplacer le placeholder back par des guillemets simples
        parts = [p.replace('\x00', '"') for p in parts]
        
        # Valider et ajouter
        if len(parts) >= 9: # vérifier qu'il y a au moins 9 colonnes
            try:
                data.append({
                    'personne': parts[0].strip(),
                    'discipline': parts[1].strip(),
                    'nation': parts[2].strip(),
                    'anneeMin': int(parts[3].strip()),
                    'anneeMax': int(parts[4].strip()),
                    'nbOr': int(parts[5].strip()),
                    'nbArgent': int(parts[6].strip()),
                    'nbBronze': int(parts[7].strip()),
                    'total': int(parts[8].strip())
                })
            except (ValueError, IndexError):
                # Ignorer les lignes mal formées
                pass

df_athletes = pd.DataFrame(data) # conversion en dataframe panda
print(f"[log] {len(df_athletes)} athlètes chargés")


# 2. AGRÉGATION PAR PAYS


print("\nAgrégation des données par pays...")

countries_data = []

for nation in df_athletes['nation'].unique(): # boucler sur les pays
    nation_df = df_athletes[df_athletes['nation'] == nation]
    
    # Compter les médailles totales (pondérées)
    total_or = nation_df['nbOr'].sum()
    total_argent = nation_df['nbArgent'].sum()
    total_bronze = nation_df['nbBronze'].sum()
    weighted_score = total_or * 3 + total_argent * 2 + total_bronze * 1
    
    # Nombre de disciplines différentes
    num_disciplines = nation_df['discipline'].nunique()# compte les valeurs distinctes -> diversité
    
    # Span temporel: années de participation
    year_min = nation_df['anneeMin'].min()
    year_max = nation_df['anneeMax'].max()
    temporal_span = year_max - year_min
    
    # Nombre d'athlètes médaillés
    num_athletes = len(nation_df)
    
    # Densité: médailles par athlète
    medals_per_athlete = (total_or + total_argent + total_bronze) / num_athletes if num_athletes > 0 else 0
    
    # création du dico pays
    countries_data.append({
        'countryCode': nation,
        'nbOr': total_or,
        'nbArgent': total_argent,
        'nbBronze': total_bronze,
        'totalMedals': total_or + total_argent + total_bronze,
        'weightedScore': weighted_score,
        'numDisciplines': num_disciplines,
        'temporalSpan': temporal_span,
        'numAthletes': num_athletes,
        'medalsPerAthlete': medals_per_athlete,
        'yearMin': year_min,
        'yearMax': year_max
    })

df_countries = pd.DataFrame(countries_data)
print(f"[OK] {len(df_countries)} pays traités")


# 3. SÉLECTION DES FEATURES POUR LE CLUSTERING


print("\nPréparation des features...")

# Features choisies:
# - weightedScore: performance globale pondérée
# - numDisciplines: diversité (variété de sports)
# - temporalSpan: durée de participation
# - medalsPerAthlete: efficacité (ratio médailles/athlètes)

X = df_countries[[
    'weightedScore', 
    'numDisciplines', 
    'temporalSpan', 
    'medalsPerAthlete'
]].values

# Normalisation des features (StandardScaler pour une distribution homogène)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print(f"[OK] {X_scaled.shape[0]} pays x {X_scaled.shape[1]} features")


# 4. CLUSTERING K-MEANS


print("\nExécution du clustering K-Means (6 clusters)...")

#clustering ici !!
kmeans = KMeans(n_clusters=6, random_state=42, n_init=10)
df_countries['cluster'] = kmeans.fit_predict(X_scaled)

print("[OK] Clustering complété")


# 5. GÉNÉRATION DES RÉSULTATS


print("\nGénération des résultats...")

# Résumé des clusters
clusters_info = {}
for cluster_id in range(6):
    cluster_data = df_countries[df_countries['cluster'] == cluster_id]
    
    clusters_info[f'cluster_{cluster_id}'] = {
        'count': len(cluster_data),
        'avg_weighted_score': float(cluster_data['weightedScore'].mean()),
        'avg_disciplines': float(cluster_data['numDisciplines'].mean()),
        'avg_temporal_span': float(cluster_data['temporalSpan'].mean()),
        'avg_medals_per_athlete': float(cluster_data['medalsPerAthlete'].mean()),
        'countries': cluster_data.sort_values('weightedScore', ascending=False)[
            ['countryCode', 'nbOr', 'nbArgent', 'nbBronze', 'totalMedals', 
             'weightedScore', 'numDisciplines', 'temporalSpan', 'medalsPerAthlete']
        ].head(10).to_dict('records')
    }

# Interprétation des clusters (basée sur les caractéristiques moyennes)
cluster_interpretation = {
    'cluster_0': 'Superpuissances multidisciplinaires - Performance élevée, nombreuses disciplines',
    'cluster_1': 'Spécialistes régionaux - Bon score mais moins de disciplines',
    'cluster_2': 'Participants modérés - Performance modérée, participation variée',
    'cluster_3': 'Participants occasionnels - Faible performance, peu de disciplines',
    'cluster_4': 'Nouveaux venus - Très peu de médailles, participation récente',
    'cluster_5': 'Historiques stables - Longue tradition, peu d\'athlètes mais réguliers'
}

# Résumé final
results = {
    'clustering_summary': clusters_info,
    'cluster_interpretation': cluster_interpretation,
    'features_used': [
        'weightedScore (or*3 + argent*2 + bronze*1)',
        'numDisciplines (nombre de sports différents)',
        'temporalSpan (max_année - min_année)',
        'medalsPerAthlete (total_médailles / nb_athlètes)'
    ]
}

# ============================================================================
# 6. SAUVEGARDE DES RÉSULTATS
# ============================================================================

print("\nSauvegarde des fichiers...")

# Sauvegarder le JSON avec les résumés
with open('clustering_results_v2.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print("   clustering_results_v2.json")

# Sauvegarder le CSV enrichi avec les clusters
df_output = df_countries[[
    'countryCode', 'nbOr', 'nbArgent', 'nbBronze', 'totalMedals', 
    'weightedScore', 'numDisciplines', 'temporalSpan', 'medalsPerAthlete', 'cluster'
]]
df_output.to_csv('data_clustered_v2.csv', index=False, quoting=False)
print("   data_clustered_v2.csv")

# ============================================================================
# 7. AFFICHAGE DES RÉSULTATS CONSOLE
# ============================================================================

print("\n" + "="*70)
print("RÉSUMÉ DU CLUSTERING")
print("="*70)

for cluster_id in range(6):
    cluster_data = df_countries[df_countries['cluster'] == cluster_id]
    count = len(cluster_data)
    avg_score = cluster_data['weightedScore'].mean()
    avg_disciplines = cluster_data['numDisciplines'].mean()
    
    print(f"\nCluster {cluster_id}: {count} pays")
    print(f"   -Score pondéré moyen: {avg_score:.1f}")
    print(f"   - Disciplines moyennes: {avg_disciplines:.1f}")
    print(f"   - Top 3 pays: {', '.join(cluster_data.nlargest(3, 'weightedScore')['countryCode'].tolist())}")

print("\n" + "="*70)
print("Clustering v2 complété avec succès!")
print("="*70)
