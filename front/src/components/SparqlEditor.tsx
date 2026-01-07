import { useState } from "react";
import { Play, Copy, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const exampleQueries = [
  {
    name: "Top 10 nations par médailles",
    query: `SELECT ?country ?countryLabel (COUNT(?medal) AS ?medalCount)
WHERE {
  ?athlete dbo:olympicGames ?games .
  ?athlete dbo:country ?country .
  ?athlete dbo:medal ?medal .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
}
GROUP BY ?country ?countryLabel
ORDER BY DESC(?medalCount)
LIMIT 10`,
  },
  {
    name: "Athlètes français multi-médaillés",
    query: `SELECT ?athlete ?athleteLabel (COUNT(?medal) AS ?medalCount)
WHERE {
  ?athlete dbo:country dbr:France .
  ?athlete dbo:medal ?medal .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
}
GROUP BY ?athlete ?athleteLabel
HAVING (COUNT(?medal) > 2)
ORDER BY DESC(?medalCount)`,
  },
  {
    name: "Sports les plus disputés",
    query: `SELECT ?sport ?sportLabel (COUNT(?event) AS ?eventCount)
WHERE {
  ?event dbo:sport ?sport .
  ?event rdf:type dbo:OlympicEvent .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". }
}
GROUP BY ?sport ?sportLabel
ORDER BY DESC(?eventCount)
LIMIT 20`,
  },
];

const SparqlEditor = () => {
  const [query, setQuery] = useState(exampleQueries[0].query);
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <section className="border-b border-border py-20">
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

            {/* Results placeholder */}
            <div className="mt-4 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-center text-muted-foreground">
                <p className="text-sm">
                  Les résultats de la requête apparaîtront ici
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SparqlEditor;
