from SPARQLWrapper import SPARQLWrapper, JSON
import networkx as nx

# ==========================================
# 1. Requête SPARQL
# ==========================================

sparql = SPARQLWrapper("https://dbpedia.org/sparql")

query = """
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT DISTINCT ?athlete ?linkedAthlete
WHERE {
  ?athlete rdf:type dbo:Athlete ;
           dbo:wikiPageWikiLink ?linkedAthlete .
  ?linkedAthlete rdf:type dbo:Athlete .
}
LIMIT 10000
"""

sparql.setQuery(query)
sparql.setReturnFormat(JSON)
results = sparql.query().convert()

# ==========================================
# 2. Construction du graphe NetworkX
# ==========================================

G = nx.DiGraph()

for r in results["results"]["bindings"]:
    a = r["athlete"]["value"]
    b = r["linkedAthlete"]["value"]
    G.add_edge(a, b)

print("Nœuds :", G.number_of_nodes())
print("Arcs  :", G.number_of_edges())

# ==========================================
# 3. Export en GEXF pour Gephi
# ==========================================

output_file = "athletes_dbpedia.gexf"
nx.write_gexf(G, output_file)
print(f"Graphe exporté dans {output_file}")
