import { useState, useEffect } from "react";
import { Network, Users, Globe, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import GraphView from "@/components/GraphView";
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const Graphs = () => {
  const [athleteRankData] = useState([]);
  const [clusteringData, setClusteringData] = useState<any>(null);
  const [clusterCountries, setClusterCountries] = useState<any[]>([]);
  const [clusterStats, setClusterStats] = useState<any[]>([]);

  useEffect(() => {
    // Charger les données de clustering depuis le fichier JSON
    fetch("/clustering-data.json")
      .then((res) => res.json())
      .then((data) => {
        setClusteringData(data);
        
        // Utiliser directement les données du CSV
        setClusterCountries(data.clustering_data);
        
        // Préparer les stats par cluster
        const statsMap = new Map<number, any>();
        
        data.clustering_data.forEach((country: any) => {
          if (!statsMap.has(country.cluster)) {
            statsMap.set(country.cluster, {
              cluster: country.cluster,
              count: 0,
              total_medals_sum: 0,
              weighted_score_sum: 0
            });
          }
          const stat = statsMap.get(country.cluster);
          stat.count += 1;
          stat.total_medals_sum += country.total_medals;
          stat.weighted_score_sum += country.weighted_score;
        });
        
        const stats = Array.from(statsMap.values())
          .map(stat => ({
            cluster: stat.cluster,
            name: clusterNames[stat.cluster]?.name || `Cluster ${stat.cluster}`,
            description: clusterNames[stat.cluster]?.description || "",
            examples: clusterNames[stat.cluster]?.examples || [],
            count: stat.count,
            avg_total: Math.round(stat.total_medals_sum / stat.count),
            avg_weighted_score: Math.round(stat.weighted_score_sum / stat.count)
          }))
          .sort((a, b) => a.cluster - b.cluster);
        
        setClusterStats(stats);
      })
      .catch((err) => console.error("Erreur chargement clustering:", err));
  }, []);

  const [sportColumns] = useState([
    "Athlétisme",
    "Natation",
    "Judo",
    "Gymnastique",
    "Tennis",
    "Boxe",
    "Voile",
    "Tir",
    "Équitation",
    "Cyclisme",
    "Escrime",
    "Aviron",
    "Haltérophilie",
    "Badminton",
  ]);
  const [countryProfiles] = useState([]);

  const clusterColors = [
    "#ef4444", // cluster 0 - red
    "#f97316", // cluster 1 - orange
    "#eab308", // cluster 2 - yellow
    "#22c55e", // cluster 3 - green
    "#3b82f6", // cluster 4 - blue
    "#8b5cf6", // cluster 5 - purple
  ];

  const clusterNames: Record<number, { name: string; description: string; examples: string[] }> = {
    0: { 
      name: "Élites solides", 
      description: "Pays avec une présence olympique forte et régulière",
      examples: ["Swe", "Nor", "Jpn", "Rus", "Can", "Aus"]
    },
    1: { 
      name: "Participation minimale", 
      description: "Pays avec très peu de médailles historiques",
      examples: ["Eth", "Irl", "Est", "Mex", "Ind", "...+109 pays"]
    },
    2: { 
      name: "Superpuissance absolue", 
      description: "Pays avec une domination exceptionnelle (>3000 médailles)",
      examples: ["Usa"]
    },
    3: { 
      name: "Grandes puissances", 
      description: "Pays avec une très forte présence olympique",
      examples: ["Urs", "Chn", "Ger", "Gbr", "Fra", "Ita"]
    },
    4: { 
      name: "Pays performeurs", 
      description: "Pays avec une bonne présence olympique",
      examples: ["Esp", "Den", "Bel", "Bra", "Arg", "...+17 pays"]
    },
    5: { 
      name: "Bons concurrents", 
      description: "Pays avec une présence olympique modérée mais solide",
      examples: ["Kor", "Sui", "Aut", "Rou", "Cub", "Pol"]
    },
  };

  // Composant de tooltip personnalisé
  const CustomClusterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-xs text-muted-foreground mb-2">{data.description}</p>
          <p className="text-xs font-medium mb-1">Pays représentés: {data.count}</p>
          <p className="text-xs text-muted-foreground">Exemples: {data.examples.join(", ")}</p>
          <p className="text-xs text-gold mt-1">Moy. médailles: {data.avg_total}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="border-b border-border py-16">
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-bronze/30 bg-bronze/5">
                <Network className="h-6 w-6 text-bronze" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold md:text-4xl">
                  Analyses supplémentaires
                </h1>
                <p className="text-muted-foreground">
                  PageRank des athlètes & Clustering des profils olympiques
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PageRank Section */}
        <section className="border-b border-border py-16">
          <div className="container">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-bronze/30 bg-bronze/5">
                <BarChart3 className="h-5 w-5 text-bronze" />
              </div>
              <h2 className="font-display text-2xl font-bold">PageRank athlètes</h2>
            </div>

            {/* PageRank Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-6 py-4 text-left font-display font-semibold text-sm">Rang</th>
                      <th className="px-6 py-4 text-left font-display font-semibold text-sm">Athlète</th>
                      <th className="px-6 py-4 text-left font-display font-semibold text-sm">Sport</th>
                      <th className="px-6 py-4 text-left font-display font-semibold text-sm">Pays</th>
                      <th className="px-6 py-4 text-left font-display font-semibold text-sm">PageRank Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {athleteRankData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Données à charger...
                        </td>
                      </tr>
                    ) : (
                      athleteRankData.map((athlete) => (
                        <tr
                          key={athlete.rank}
                          className="border-b border-border hover:bg-secondary/10 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-bronze">{athlete.rank}</td>
                          <td className="px-6 py-4 text-sm font-medium">{athlete.name}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{athlete.sport}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{athlete.country}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gold">{athlete.pagerank.toFixed(4)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Le PageRank mesure l'importance relative de chaque athlète dans le graphe basé sur leurs connections aux sports et aux pays.
            </p>

            {/* PageRank Graph Visualization */}
            {/* <div className="mt-8 rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-display font-semibold">Visualisation du graphe PageRank</h3>
              </div>
              <div className="relative h-[500px] bg-secondary/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-bronze mb-4 opacity-50" />
                  <p className="text-muted-foreground">Graphe interactif à charger</p>
                </div>
              </div>
            </div> */}
            <div className="mt-8 rounded-xl border border-border bg-card overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-display font-semibold">Visualisation du graphe PageRank</h3>
              </div>

              {/* Graphe interactif */}
              <div className="relative h-[500px] bg-secondary/20">
                <GraphView
                  gexfUrl="/athletes_clustered.gexf"
                  width="100%"
                  height="100%"
                  defaultNodeColor="#1f77b4"
                  renderLabels={false}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Clustering Section */}
        <section className="border-b border-border py-16">
          <div className="container">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-silver/30 bg-silver/5">
                <Globe className="h-5 w-5 text-silver" />
              </div>
              <h2 className="font-display text-2xl font-bold">Clustering : Profils olympiques similaires</h2>
            </div>

            {/* Graphique de distribution des clusters */}
            {clusterStats.length > 0 && (
              <div className="mb-8 rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border p-4">
                  <h3 className="font-display font-semibold">Distribution des clusters</h3>
                  <p className="text-xs text-muted-foreground mt-1">Hover pour voir les pays et détails de chaque cluster</p>
                </div>
                <div className="p-6 flex justify-center">
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={clusterStats.sort((a, b) => {
                      const order = [2, 3, 0, 5, 4, 1];
                      return order.indexOf(a.cluster) - order.indexOf(b.cluster);
                    })} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={90} />
                      <YAxis />
                      <Tooltip content={<CustomClusterTooltip />} />
                      <Bar dataKey="count" fill="#3b82f6" name="" radius={[8, 8, 0, 0]}>
                        {clusterStats.map((stat, idx) => (
                          <Cell key={`cell-${idx}`} fill={clusterColors[stat.cluster]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Tableau des pays par cluster */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="border-b border-border p-4">
                <h3 className="font-display font-semibold">Pays et leur cluster</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-6 py-4 text-left font-display font-semibold text-sm">Pays</th>
                      <th className="px-6 py-4 text-right font-display font-semibold text-sm">Or</th>
                      <th className="px-6 py-4 text-right font-display font-semibold text-sm">Argent</th>
                      <th className="px-6 py-4 text-right font-display font-semibold text-sm">Bronze</th>
                      <th className="px-6 py-4 text-right font-display font-semibold text-sm">Total</th>
                      <th className="px-6 py-4 text-right font-display font-semibold text-sm">Score Pondéré</th>
                      <th className="px-6 py-4 text-left font-display font-semibold text-sm">Cluster</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clusterCountries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                          Données à charger...
                        </td>
                      </tr>
                    ) : (
                      clusterCountries.slice(0, 50).map((country, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-secondary/10 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium">{country.countryCode}</td>
                          <td className="px-6 py-4 text-sm text-right">{country.gold}</td>
                          <td className="px-6 py-4 text-sm text-right">{country.silver}</td>
                          <td className="px-6 py-4 text-sm text-right">{country.bronze}</td>
                          <td className="px-6 py-4 text-sm text-right text-muted-foreground">{country.total_medals}</td>
                          <td className="px-6 py-4 text-sm text-right font-semibold">{country.weighted_score}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className="px-3 py-1 rounded-full text-white text-xs font-semibold"
                              style={{ backgroundColor: clusterColors[country.cluster] }}
                            >
                              {country.clusterName}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {clusterCountries.length > 50 && (
                <div className="px-6 py-4 border-t border-border text-center text-sm text-muted-foreground">
                  Affichage des 50 premiers pays
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Le clustering détecte les groupes de pays ayant des profils olympiques similaires basés sur leurs performances en médailles d'or, d'argent et de bronze. Les pays sont répartis en 6 clusters selon leur niveau de performance pondéré.
            </p>
          </div>
        </section>

        {/* Statistics Section */}
        {/* <section className="border-b border-border py-16">
          <div className="container">
            <h2 className="font-display text-2xl font-bold mb-8">Statistiques du Graphe</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <Users className="mx-auto h-6 w-6 text-bronze mb-3" />
                <p className="font-display text-3xl font-bold">12,847</p>
                <p className="text-sm text-muted-foreground">Athlètes</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <Network className="mx-auto h-6 w-6 text-silver mb-3" />
                <p className="font-display text-3xl font-bold">45,320</p>
                <p className="text-sm text-muted-foreground">Relations</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center">
                <Globe className="mx-auto h-6 w-6 text-gold mb-3" />
                <p className="font-display text-3xl font-bold">206</p>
                <p className="text-sm text-muted-foreground">Pays</p>
              </div>
            </div>
          </div>
        </section> */}
      </main>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Projet Web Sémantique — Analyse des Jeux Olympiques via DBpedia</p>
        </div>
      </footer>
    </div>
  );
};

export default Graphs;
