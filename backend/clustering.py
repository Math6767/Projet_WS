import pandas as pd
import json
from sklearn.cluster import KMeans
from sklearn.preprocessing import RobustScaler
import numpy as np
import re

# Lire et parser le CSV manuellement (format bizarre)
with open('data_pour_clustering.csv', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Parser la première ligne pour obtenir les headers
header_line = lines[0].strip()
# Extraire les noms entre guillemets
headers = re.findall(r'(\w+|"[^"]*")', header_line)
headers = [h.strip('"') for h in headers if h]

# Parser les données
data = []
for line in lines[1:]:
    if line.strip():
        parts = line.strip().split(',')
        if len(parts) >= 4:
            data.append({
                'countryCode': parts[0].strip(),
                'gold': int(parts[1].strip()),
                'silver': int(parts[2].strip()),
                'bronze': int(parts[3].strip())
            })

df = pd.DataFrame(data)

# Préparer les features avec pondération
# Pondération : or=3, argent=2, bronze=1
weights = [3, 2, 1]  # [or, argent, bronze]

X = df[['gold', 'silver', 'bronze']].values
X_weighted = X * weights  # Appliquer la pondération

# Normaliser les données pondérées avec RobustScaler (meilleur pour les outliers)
scaler = RobustScaler()
X_scaled = scaler.fit_transform(X_weighted)

# Appliquer KMeans avec 6 clusters pour mieux séparer les groupes
kmeans = KMeans(n_clusters=6, random_state=42, n_init=10)
df['cluster'] = kmeans.fit_predict(X_scaled)

# Calculer le score pondéré pour chaque pays
df['weighted_score'] = df['gold'] * 3 + df['silver'] * 2 + df['bronze'] * 1
df['total_medals'] = df['gold'] + df['silver'] + df['bronze']

# Créer un résumé des clusters
clusters_info = {}
for cluster_id in range(6):
    cluster_data = df[df['cluster'] == cluster_id]
    clusters_info[f'cluster_{cluster_id}'] = {
        'count': len(cluster_data),
        'avg_gold': float(cluster_data['gold'].mean()),
        'avg_silver': float(cluster_data['silver'].mean()),
        'avg_bronze': float(cluster_data['bronze'].mean()),
        'avg_total': float(cluster_data['total_medals'].mean()),
        'avg_weighted_score': float(cluster_data['weighted_score'].mean()),
        'countries': cluster_data.sort_values('weighted_score', ascending=False)[
            ['countryCode', 'gold', 'silver', 'bronze', 'total_medals', 'weighted_score']
        ].head(10).to_dict('records')
    }

# Identifier les outliers (pays exceptionnels)
mean_score = df['weighted_score'].mean()
std_score = df['weighted_score'].std()
threshold = mean_score + 1.5 * std_score

outliers = df[df['weighted_score'] > threshold].sort_values('weighted_score', ascending=False)
outliers_data = outliers[['countryCode', 'gold', 'silver', 'bronze', 'total_medals', 'weighted_score', 'cluster']].to_dict('records')

# Créer le résumé final
results = {
    'clustering_summary': clusters_info,
    'outliers': {
        'description': 'Pays qui sortent du lot (pays exceptionnels)',
        'count': len(outliers),
        'countries': outliers_data
    },
    'cluster_interpretation': {
        'cluster_0': 'Super élites (USA, URSS...)',
        'cluster_1': 'Élites solides',
        'cluster_2': 'Bons performeurs',
        'cluster_3': 'Performeurs moyens',
        'cluster_4': 'Petits performeurs',
        'cluster_5': 'Très peu de médailles'
    }
}

# Sauvegarder en JSON
with open('clustering_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

# Sauvegarder aussi la version CSV enrichie avec les clusters
df_output = df[['countryCode', 'gold', 'silver', 'bronze', 'total_medals', 'weighted_score', 'cluster']]
df_output.to_csv('data_clustered.csv', index=False)

# Affichage console
print('Clustering complété!')
print('\nRésumé des clusters:')
for cluster_id in range(6):
    count = len(df[df['cluster'] == cluster_id])
    avg = df[df['cluster'] == cluster_id]['total_medals'].mean()
    print(f'  cluster_{cluster_id}: {count} pays (avg: {avg:.1f} médailles)')

print(f'\nPays exceptionnels (outliers): {len(outliers)} pays')
print(f'   Top 5: {", ".join(outliers.head(5)["countryCode"].tolist())}')
print('\nFichiers générés:')
print('   - clustering_results.json')
print('   - data_clustered.csv')
