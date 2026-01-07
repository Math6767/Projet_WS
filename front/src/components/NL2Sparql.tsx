import { useState } from "react";
import { Sparkles, ArrowRight, Copy, Check, Wand2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NL2Sparql = () => {
  const [query, setQuery] = useState("");
  const [generatedSparql, setGeneratedSparql] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const exampleQueries = [
    "Quels athlètes français ont gagné le plus de médailles d'or en athlétisme ?",
    "Quels pays dominent la natation depuis 2000 ?",
    "Qui sont les athlètes ayant participé à plus de 4 éditions des JO ?",
  ];

  const handleGenerate = async () => {
    if (!query.trim()) return;
    setIsGenerating(true);
    setError("");
    
    try {
      // Appel au backend local (plus de CORS, clé API côté serveur)
      const response = await fetch("http://localhost:3001/api/nl2sparql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Réponse d'erreur:", errorData);
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log("Réponse de l'API:", data);
      
      const sparqlQuery = data.choices?.[0]?.message?.content?.trim() || "";
      
      if (!sparqlQuery) {
        throw new Error("La réponse de l'API est vide. Réessayez.");
      }

      setGeneratedSparql(sparqlQuery);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la génération";
      setError(errorMessage);
      console.error("Erreur complète:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSparql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="border-b border-border py-20">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-sm text-gold">
              <Sparkles className="h-4 w-4" />
              <span>NL2SPARQL — Propulsé par IA</span>
            </div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Interrogez en langage naturel
            </h2>
            <p className="mt-4 text-muted-foreground">
              Posez votre question en français, l'IA génère la requête SPARQL correspondante
            </p>
          </div>

          {/* Input area */}
          <div className="rounded-xl border border-border bg-card p-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Votre question
              </label>
              <Textarea
                placeholder="Ex: Quels athlètes ont le plus contribué aux médailles françaises en athlétisme ?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[100px] resize-none bg-background"
              />
            </div>

            {/* Example queries */}
            <div className="mb-6">
              <p className="mb-2 text-xs text-muted-foreground">Exemples de questions :</p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example) => (
                  <button
                    key={example}
                    onClick={() => setQuery(example)}
                    className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="gold"
              onClick={handleGenerate}
              disabled={!query.trim() || isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Générer la requête SPARQL
                </>
              )}
            </Button>
          </div>

          {/* Generated SPARQL */}
          {generatedSparql && (
            <div className="mt-6 animate-fade-in rounded-xl border border-gold/30 bg-gold/5 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gold" />
                  <span className="text-sm font-medium text-gold">Requête SPARQL générée</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copier
                    </>
                  )}
                </Button>
              </div>

              <pre className="overflow-x-auto rounded-lg bg-background p-4 text-sm">
                <code className="text-muted-foreground">{generatedSparql}</code>
              </pre>

              <div className="mt-4 flex gap-3">
                <Button variant="outline" className="flex-1 gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Exécuter sur DBpedia
                </Button>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NL2Sparql;
