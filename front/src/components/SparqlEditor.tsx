import { useState, useEffect } from "react";
import { Play, Copy, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSparql } from "@/context/SparqlContext";

const exampleQueries = [
  {
    name: "Top 30 des meilleures nations par médailles",
    query: `PREFIX dbr: <http://dbpedia.org/resource/>
            PREFIX dbp: <http://dbpedia.org/property/>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

            SELECT ?countryCode
                  (MAX(?gold)   AS ?gold)
                  (MAX(?silver) AS ?silver)
                  (MAX(?bronze) AS ?bronze)
            WHERE {
              dbr:All-time_Olympic_Games_medal_table ?p ?v .

              FILTER(
                STRSTARTS(STR(?p), STR(dbp:gold)) ||
                STRSTARTS(STR(?p), STR(dbp:silver)) ||
                STRSTARTS(STR(?p), STR(dbp:bronze))
              )

              BIND(REPLACE(STR(?p), "^http://dbpedia.org/property/(gold|silver|bronze)", "") AS ?countryCode)
              BIND(IF(STRSTARTS(STR(?p), STR(dbp:gold)),   xsd:integer(?v), 0) AS ?gold)
              BIND(IF(STRSTARTS(STR(?p), STR(dbp:silver)), xsd:integer(?v), 0) AS ?silver)
              BIND(IF(STRSTARTS(STR(?p), STR(dbp:bronze)), xsd:integer(?v), 0) AS ?bronze)
            }
            GROUP BY ?countryCode
            ORDER BY DESC(?gold)
            LIMIT 30`,
  },
  {
    name: "Top 20 des athlètes les plus médaillés",
    query: `PREFIX dbo: <http://dbpedia.org/ontology/>
              PREFIX dbp: <http://dbpedia.org/property/>
              PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
              PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

              SELECT ?personne
                    (SUM(?or) AS ?nbOr)
                    (SUM(?argent) AS ?nbArgent)
                    (SUM(?bronze) AS ?nbBronze)
                    (SUM(?or + ?argent + ?bronze) AS ?total)
              WHERE {
                {
                  SELECT DISTINCT ?personne ?evenement ?typeMedaille
                  WHERE {
                    {
                      ?evenement dbp:gold ?personne .
                      BIND("Or" AS ?typeMedaille)
                    }
                    UNION
                    {
                      ?evenement dbp:silver ?personne .
                      BIND("Argent" AS ?typeMedaille)
                    }
                    UNION
                    {
                      ?evenement dbp:bronze ?personne .
                      BIND("Bronze" AS ?typeMedaille)
                    }

                    ?personne a dbo:Person .

                    ?evenement rdfs:label ?label .
                    FILTER (CONTAINS(LCASE(STR(?label)), "olympics"))
                    FILTER (!CONTAINS(LCASE(STR(?label)), "youth"))
                  }
                }
                BIND(IF(?typeMedaille = "Or", 1, 0) AS ?or)
                BIND(IF(?typeMedaille = "Argent", 1, 0) AS ?argent)
                BIND(IF(?typeMedaille = "Bronze", 1, 0) AS ?bronze)
              }
              GROUP BY ?personne 
              ORDER BY DESC(?total)
              LIMIT 20`,
  },
  {
    name: "Disciplines autour de l'athlétisme et le cyclisme aux JO",
    query: `PREFIX dbp: <http://dbpedia.org/property/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?e ?nom
WHERE {
  ?e dbp:gold ?x .
  ?e rdfs:label ?nom .

  # On filtre pour ne garder que les épreuves, pas les pays
  FILTER (CONTAINS(LCASE(STR(?nom)), "olympics"))
  FILTER (REGEX(STR(?nom), "Athletics|Cycling", "i"))
}
LIMIT 30

`,
  },
];

const SparqlEditor = () => {
  const [query, setQuery] = useState(exampleQueries[0].query);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    head: { vars: string[] };
    results: { bindings: any[] };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { sparqlQuery, executeQuery, setExecuteQuery } = useSparql();

  // Quand une requête vient de NL2Sparql, mets à jour et exécute
  useEffect(() => {
    if (sparqlQuery) {
      setQuery(sparqlQuery);
    }
  }, [sparqlQuery]);

  useEffect(() => {
    if (executeQuery && sparqlQuery) {
      handleExecute();
      setExecuteQuery(false);
    }
  }, [executeQuery]);

  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=${encodedQuery}&format=application%2Fsparql-results%2Bjson&timeout=30000`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="border-b border-border py-20" data-sparql-editor>
      <div className="container">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold">Interface SPARQL</h2>
          <p className="mt-2 text-muted-foreground">
            Interrogez DBpedia directement avec vos requêtes SPARQL
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Query examples sidebar */}
          <div className="space-y-2">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Exemples de requêtes
            </p>
            {exampleQueries.map((example) => (
              <button
                key={example.name}
                onClick={() => setQuery(example.query)}
                className="w-full rounded-lg border border-border bg-card p-3 text-left text-sm transition-all hover:border-primary/50 hover:bg-secondary"
              >
                <span className="font-medium">{example.name}</span>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-gold/60" />
                  <div className="h-3 w-3 rounded-full bg-green-500/60" />
                  <span className="ml-3 text-xs text-muted-foreground">
                    sparql-editor.rq
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Editor area */}
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[280px] w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground focus:outline-none"
                spellCheck={false}
              />

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <span>NL2SPARQL disponible</span>
                </div>
                <Button
                  variant="gold"
                  onClick={handleExecute}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Exécuter
                </Button>
              </div>
            </div>

            {/* Results placeholder or Table */}
            <div className="mt-4 rounded-xl border border-border bg-card p-6 overflow-x-auto">
              {error ? (
                <div className="text-destructive font-medium p-4 border border-destructive/20 rounded bg-destructive/10">
                  {error}
                </div>
              ) : results ? (
                results.results.bindings.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        {results.head.vars.map((variable) => (
                          <th key={variable} className="p-2 font-medium text-muted-foreground">
                            {variable}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.bindings.map((binding, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-secondary/20">
                          {results.head.vars.map((variable) => (
                            <td key={variable} className="p-2 truncate max-w-[200px]" title={binding[variable]?.value}>
                              {binding[variable]?.value || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-center justify-center text-muted-foreground p-8">
                    Aucun résultat trouvé pour cette requête.
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center text-muted-foreground p-8">
                  <p className="text-sm">
                    Les résultats de la requête apparaîtront ici
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SparqlEditor;
