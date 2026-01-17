from SPARQLWrapper import SPARQLWrapper, JSON
import networkx as nx
import time


def fetch_edges(limit=5000, first_page = 0, last_page=250, retries=5, sleep_time=5):
    G = nx.DiGraph()
    sparql = SPARQLWrapper("https://dbpedia.org/sparql")
    sparql.setReturnFormat(JSON)

    for page in range(first_page, last_page):
        offset = page * limit
        success = False

        query = f"""
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

        SELECT DISTINCT ?athlete ?linkedAthlete
        WHERE {{
          ?athlete rdf:type dbo:Athlete ;
                   dbo:wikiPageWikiLink ?linkedAthlete .
          ?linkedAthlete rdf:type dbo:Athlete .
        }}
        LIMIT {limit}
        OFFSET {offset}
        """

        for attempt in range(retries):
            try:
                sparql.setQuery(query)
                results = sparql.query().convert()
                bindings = results["results"]["bindings"]

                if not bindings:
                    print("Fin des résultats.")
                    return G

                for r in bindings:
                    G.add_edge(
                        r["athlete"]["value"],
                        r["linkedAthlete"]["value"]
                    )

                print(f"Page {page+1} → {len(bindings)} arcs")
                success = True
                break

            except Exception as e:
                print(
                    f"⚠️ Erreur page {page+1}, tentative {attempt+1}/{retries} : {e}"
                )
                time.sleep(sleep_time)

        if not success:
            print("❌ Serveur DBpedia indisponible. Arrêt propre.")
            break


    return G

G = fetch_edges(10000, 0, 250)
# ==========================================
# 3. Export en GEXF pour Gephi
# ==========================================

output_file = "athletes_dbpedia.gexf"
nx.write_gexf(G, output_file)
print(f"Graphe exporté dans {output_file}")
