import { useState, useEffect, useMemo } from "react";
import { Users, Medal, Search, Filter, ChevronDown, Star, Trophy, Globe, Activity, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Interface for Athlete data
interface Athlete {
  id: string;
  name: string;
  country: string;
  sport: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  editions: number; // Placeholder or calculated if possible
  years: string;    // Placeholder
}

const SPARQL_QUERY = `
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbp: <http://dbpedia.org/property/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?personne ?discipline ?nation ?anneeMin ?anneeMax
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
  
  # -------- Discipline --------
  {
    SELECT ?personne (SAMPLE(?disciplineExtract) AS ?discipline)
    WHERE {
      {
        ?evtDisc dbp:gold ?personne .
      }
      UNION
      {
        ?evtDisc dbp:silver ?personne .
      }
      UNION
      {
        ?evtDisc dbp:bronze ?personne .
      }
      
      ?evtDisc rdfs:label ?labelEvenement .
      FILTER (LANG(?labelEvenement) = "en")
      FILTER (CONTAINS(LCASE(STR(?labelEvenement)), " at "))
      
      BIND(STRBEFORE(STR(?labelEvenement), " at ") AS ?disciplineExtract)
    }
    GROUP BY ?personne
  }

  # -------- Nation --------
  {
    SELECT ?personne (SAMPLE(?nation0) AS ?nation)
    WHERE {
      {
        ?evtNat dbp:gold ?personne .
        ?evtNat dbp:goldnoc ?nation0 .
      }
      UNION
      {
        ?evtNat dbp:silver ?personne .
        ?evtNat dbp:silvernoc ?nation0 .
      }
      UNION
      {
        ?evtNat dbp:bronze ?personne .
        ?evtNat dbp:bronzenoc ?nation0 .
      }

      ?evtNat rdfs:label ?l .
      FILTER (CONTAINS(LCASE(STR(?l)), "olympics"))
      FILTER (!CONTAINS(LCASE(STR(?l)), "youth"))
    }
    GROUP BY ?personne
  }

  # -------- Années min / max --------
  {
    SELECT ?personne
           (MIN(?year) AS ?anneeMin)
           (MAX(?year) AS ?anneeMax)
    WHERE {
      {
        ?evtYear dbp:gold ?personne .
      }
      UNION
      {
        ?evtYear dbp:silver ?personne .
      }
      UNION
      {
        ?evtYear dbp:bronze ?personne .
      }

      ?evtYear dbp:games ?gamesStr .
      BIND(xsd:integer(SUBSTR(STR(?gamesStr), 1, 4)) AS ?year)

      ?evtYear rdfs:label ?lab .
      FILTER (CONTAINS(LCASE(STR(?lab)), "olympics"))
      FILTER (!CONTAINS(LCASE(STR(?lab)), "youth"))
    }
    GROUP BY ?personne
  }
 
  BIND(IF(?typeMedaille = "Or", 1, 0) AS ?or)
  BIND(IF(?typeMedaille = "Argent", 1, 0) AS ?argent)
  BIND(IF(?typeMedaille = "Bronze", 1, 0) AS ?bronze)
}
GROUP BY ?personne ?discipline ?nation ?anneeMin ?anneeMax
ORDER BY DESC(?total)
`;

const Athletes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allAthletes, setAllAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(6);

  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedNation, setSelectedNation] = useState("all");

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        setLoading(true);
        const encodedQuery = encodeURIComponent(SPARQL_QUERY);
        const url = `https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=${encodedQuery}&format=application%2Fsparql-results%2Bjson&timeout=120000`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const data = await response.json();
        const bindings = data.results.bindings;

        const parsedAthletes: Athlete[] = bindings.map((binding: any, index: number) => {
          // Extract name from URI and decode special characters
          const uri = binding.personne.value;
          const nameFromUri = decodeURIComponent(uri.split('/').pop() || "").replace(/_/g, ' ');

          // Calculate years
          const minYear = binding.anneeMin?.value;
          const maxYear = binding.anneeMax?.value;
          const yearsStr = (minYear && maxYear)
            ? (minYear === maxYear ? `${minYear}` : `${minYear} - ${maxYear}`)
            : "N/A";

          return {
            id: uri,
            name: nameFromUri,
            country: binding.nation?.value || "N/A",
            sport: binding.discipline?.value || "N/A",
            gold: parseInt(binding.nbOr?.value || "0"),
            silver: parseInt(binding.nbArgent?.value || "0"),
            bronze: parseInt(binding.nbBronze?.value || "0"),
            total: parseInt(binding.total?.value || "0"),
            editions: 1,      // Placeholder
            years: yearsStr
          };
        });

        setAllAthletes(parsedAthletes);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les athlètes.");
      } finally {
        setLoading(false);
      }
    };

    fetchAthletes();
  }, []);

  // Extract unique values for filters
  const uniqueSports = useMemo(() => {
    const sports = new Set(allAthletes.map(a => a.sport).filter(s => s !== "N/A"));
    return Array.from(sports).sort();
  }, [allAthletes]);

  const uniqueNations = useMemo(() => {
    const nations = new Set(allAthletes.map(a => a.country).filter(c => c !== "N/A"));
    return Array.from(nations).sort();
  }, [allAthletes]);

  // Filter athletes based on search and dropdowns
  const filteredAthletes = useMemo(() => {
    return allAthletes.filter(athlete => {
      const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSport = selectedSport === "all" || athlete.sport === selectedSport;
      const matchesNation = selectedNation === "all" || athlete.country === selectedNation;

      return matchesSearch && matchesSport && matchesNation;
    });
  }, [allAthletes, searchQuery, selectedSport, selectedNation]);

  // Apply pagination
  const displayedAthletes = filteredAthletes.slice(0, displayLimit);

  // Dynamic stats
  const stats = useMemo(() => {
    const uniqueDisciplines = new Set(allAthletes.map(a => a.sport)).size;
    return [
      { label: "Athlètes olympiques", value: `${(allAthletes.length / 1000).toFixed(1)}K+`, icon: Users }, // Approx
      { label: "Multi-médaillés", value: allAthletes.filter(a => a.total > 1).length.toLocaleString(), icon: Medal },
      { label: "Disciplines", value: uniqueDisciplines.toLocaleString(), icon: Activity },
    ];
  }, [allAthletes]);

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev * 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="border-b border-border py-16">
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-silver/30 bg-silver/5">
                <Users className="h-6 w-6 text-silver" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold md:text-4xl">
                  Analyse des Athlètes
                </h1>
                <p className="text-muted-foreground">
                  Explorez les légendes olympiques et leurs performances (Données DBpedia)
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center">
                  <stat.icon className="mx-auto h-5 w-5 text-silver mb-2" />
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="border-b border-border py-6">
          <div className="container">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un athlète..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sport Filter */}
              <div className="relative">
                <select
                  className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-8"
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                >
                  <option value="all">Tous les sports</option>
                  {uniqueSports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
              </div>

              {/* Nation Filter */}
              <div className="relative">
                <select
                  className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-8"
                  value={selectedNation}
                  onChange={(e) => setSelectedNation(e.target.value)}
                >
                  <option value="all">Toutes les nations</option>
                  {uniqueNations.map(nation => (
                    <option key={nation} value={nation}>{nation}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none" />
              </div>

            </div>
          </div>
        </section>

        {/* Athletes Grid */}
        <section className="py-10">
          <div className="container">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Chargement des données depuis DBpedia...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20 text-destructive">
                {error}
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {displayedAthletes.map((athlete) => (
                    <div
                      key={athlete.id}
                      className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-silver/50 hover:glow-subtle cursor-pointer"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary font-display font-bold text-lg select-none">
                            {athlete.name && athlete.name.length > 0 ? athlete.name[0].toUpperCase() : "?"}
                          </div>
                          <div>
                            <h3 className="font-display font-semibold line-clamp-1" title={athlete.name}>{athlete.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              {athlete.country}
                            </div>
                          </div>
                        </div>
                        <Star className="h-5 w-5 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Sport & Years */}
                      <div className="mb-4">
                        <span className="inline-flex rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs">
                          {athlete.sport}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">{athlete.years}</span>
                      </div>

                      {/* Medals */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-gold/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-gold">{athlete.gold}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Or</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-silver/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-silver">{athlete.silver}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Argent</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-bronze/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-bronze">{athlete.bronze}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Bronze</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="text-sm">
                          <span className="font-bold">{athlete.total}</span>
                          <span className="text-muted-foreground"> médailles totales</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {/* Editions removed */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load more */}
                {displayedAthletes.length < filteredAthletes.length && (
                  <div className="mt-8 text-center">
                    <Button variant="outline" className="gap-2" onClick={handleLoadMore}>
                      Charger plus d'athlètes ({filteredAthletes.length - displayedAthletes.length} restants)
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {filteredAthletes.length === 0 && (
                  <div className="mt-8 text-center text-muted-foreground">
                    Aucun athlète trouvé pour "{searchQuery}".
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Featured Analysis */}
        <section className="border-t border-border py-16">
          <div className="container">
            <h2 className="font-display text-2xl font-bold mb-8">Analyses d'athlètes</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 hover:border-silver/50 transition-colors cursor-pointer">
                <Trophy className="h-8 w-8 text-gold mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Athlètes multi-médaillés</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Découvrez les athlètes ayant remporté le plus de médailles dans l'histoire olympique.
                </p>
                <Button variant="outline" size="sm">Explorer</Button>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 hover:border-silver/50 transition-colors cursor-pointer">
                <Activity className="h-8 w-8 text-silver mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Contribution nationale</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Analysez l'impact des athlètes sur les performances globales de leur nation.
                </p>
                <Button variant="outline" size="sm">Explorer</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Projet Web Sémantique — Analyse des Jeux Olympiques via DBpedia</p>
        </div>
      </footer>
    </div>
  );
};

export default Athletes;
