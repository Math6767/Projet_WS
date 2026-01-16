import xml.etree.ElementTree as ET
import csv

# Définir le namespace pour parser le XML GEXF
namespaces = {
    'gexf': 'http://gexf.net/1.3'
}

# Charger et parser le fichier GEXF
tree = ET.parse('athletes_clustered_colored.gexf')
root = tree.getroot()

# Liste pour stocker les données
pagerank_data = []

# Parcourir tous les nœuds
for node in root.findall('.//gexf:node', namespaces):
    # Récupérer l'ID du nœud (lien DBpedia)
    node_id = node.get('id')
    
    # Récupérer le PageRank dans les attributs
    pagerank = None
    attvalues = node.find('.//gexf:attvalues', namespaces)
    if attvalues is not None:
        for attvalue in attvalues.findall('gexf:attvalue', namespaces):
            if attvalue.get('for') == 'pageranks':
                pagerank = float(attvalue.get('value'))
                break
    
    # Ajouter à la liste si PageRank existe
    if pagerank is not None:
        pagerank_data.append({
            'dbpedia_url': node_id,
            'pagerank': pagerank
        })

# Trier par PageRank décroissant
pagerank_data.sort(key=lambda x: x['pagerank'], reverse=True)

# Écrire dans un fichier CSV
with open('pagerank_output.csv', 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['dbpedia_url', 'pagerank']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    writer.writerows(pagerank_data)

print(f"CSV généré avec succès ! {len(pagerank_data)} nœuds exportés.")
print(f"Fichier sauvegardé : pagerank_output.csv")

# Afficher les 5 premiers résultats
print("\n5 premiers résultats :")
for i, item in enumerate(pagerank_data[:5], 1):
    print(f"{i}. {item['dbpedia_url']}: {item['pagerank']:.2e}")