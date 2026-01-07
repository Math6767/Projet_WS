import { useState } from "react";
import { Network, ZoomIn, ZoomOut, Maximize2, Download, Filter, Settings, Users, Globe, Dumbbell } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

const Graphs = () => {
  const [selectedMetric, setSelectedMetric] = useState("pagerank");

  const metrics = [
    { id: "pagerank", label: "PageRank", description: "Importance relative dans le graphe" },
    { id: "betweenness", label: "Betweenness", description: "Centralité d'intermédiarité" },
    { id: "modularity", label: "Modularité", description: "Détection de communautés" },
  ];

  const graphStats = [
    { label: "Nœuds", value: "12,847", icon: Users },
    { label: "Arêtes", value: "45,320", icon: Network },
    { label: "Communautés", value: "23", icon: Globe },
  ];

  const communities = [
    { name: "Natation - Amérique du Nord", size: 1245, color: "bg-olympic-blue" },
    { name: "Athlétisme - Europe", size: 987, color: "bg-gold" },
    { name: "Gymnastique - Europe de l'Est", size: 756, color: "bg-silver" },
    { name: "Sports de combat - Asie", size: 654, color: "bg-bronze" },
    { name: "Sports collectifs - Global", size: 543, color: "bg-primary" },
  ];

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
                  Analyse par Graphes
                </h1>
                <p className="text-muted-foreground">
                  Visualisez les relations Athlète ↔ Sport ↔ Pays
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {graphStats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center">
                  <stat.icon className="mx-auto h-5 w-5 text-bronze mb-2" />
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Graph Visualization Area */}
        <section className="py-10">
          <div className="container">
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Sidebar Controls */}
              <div className="lg:col-span-1 space-y-6">
                {/* Metrics Selection */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Métriques
                  </h3>
                  <div className="space-y-2">
                    {metrics.map((metric) => (
                      <button
                        key={metric.id}
                        onClick={() => setSelectedMetric(metric.id)}
                        className={`w-full rounded-lg p-3 text-left transition-colors ${
                          selectedMetric === metric.id
                            ? "border border-bronze/50 bg-bronze/10"
                            : "border border-border hover:border-bronze/30"
                        }`}
                      >
                        <p className="font-medium text-sm">{metric.label}</p>
                        <p className="text-xs text-muted-foreground">{metric.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtres
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Users className="h-4 w-4" />
                      Athlètes
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Globe className="h-4 w-4" />
                      Nations
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Dumbbell className="h-4 w-4" />
                      Sports
                    </Button>
                  </div>
                </div>

                {/* Communities */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="font-display font-semibold mb-4">Communautés détectées</h3>
                  <div className="space-y-3">
                    {communities.map((community) => (
                      <div key={community.name} className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${community.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{community.name}</p>
                          <p className="text-xs text-muted-foreground">{community.size} nœuds</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Graph Canvas */}
              <div className="lg:col-span-3">
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exporter
                      </Button>
                    </div>
                  </div>

                  {/* Graph Placeholder */}
                  <div className="relative h-[500px] bg-secondary/20 flex items-center justify-center">
                    {/* Simulated graph nodes */}
                    <div className="absolute inset-0 overflow-hidden">
                      {/* Central node */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center animate-pulse-gold">
                        <span className="text-xs font-bold text-gold">USA</span>
                      </div>

                      {/* Connected nodes */}
                      <div className="absolute top-1/4 left-1/3 h-10 w-10 rounded-full bg-silver/20 border border-silver flex items-center justify-center">
                        <span className="text-[10px] font-medium text-silver">NAT</span>
                      </div>
                      <div className="absolute top-1/3 right-1/4 h-12 w-12 rounded-full bg-bronze/20 border border-bronze flex items-center justify-center">
                        <span className="text-[10px] font-medium text-bronze">ATH</span>
                      </div>
                      <div className="absolute bottom-1/3 left-1/4 h-8 w-8 rounded-full bg-olympic-blue/20 border border-olympic-blue flex items-center justify-center">
                        <span className="text-[8px] font-medium text-olympic-blue">GYM</span>
                      </div>
                      <div className="absolute bottom-1/4 right-1/3 h-14 w-14 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                        <span className="text-xs font-medium">FRA</span>
                      </div>
                      <div className="absolute top-2/3 left-1/2 h-10 w-10 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-gold">CHN</span>
                      </div>

                      {/* Edges (simplified) */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                        <line x1="50%" y1="50%" x2="33%" y2="25%" stroke="currentColor" strokeWidth="1" className="text-silver" />
                        <line x1="50%" y1="50%" x2="75%" y2="33%" stroke="currentColor" strokeWidth="1" className="text-bronze" />
                        <line x1="50%" y1="50%" x2="25%" y2="66%" stroke="currentColor" strokeWidth="1" className="text-olympic-blue" />
                        <line x1="50%" y1="50%" x2="66%" y2="75%" stroke="currentColor" strokeWidth="1" className="text-primary" />
                        <line x1="50%" y1="50%" x2="50%" y2="66%" stroke="currentColor" strokeWidth="1" className="text-gold" />
                      </svg>
                    </div>

                    {/* Overlay message */}
                    <div className="relative z-10 text-center p-8 rounded-xl bg-background/80 backdrop-blur-sm border border-border">
                      <Network className="h-12 w-12 mx-auto text-bronze mb-4" />
                      <h3 className="font-display text-lg font-semibold mb-2">Visualisation interactive</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Le graphe complet sera rendu avec D3.js ou react-force-graph
                      </p>
                      <Button variant="gold" size="sm">
                        Charger le graphe complet
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Graph Legend */}
                <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gold/30 border border-gold" />
                    <span className="text-muted-foreground">Nations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-silver/30 border border-silver" />
                    <span className="text-muted-foreground">Sports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-bronze/30 border border-bronze" />
                    <span className="text-muted-foreground">Athlètes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-6 bg-muted-foreground/50" />
                    <span className="text-muted-foreground">Relations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Export Options */}
        <section className="border-t border-border py-16">
          <div className="container">
            <h2 className="font-display text-2xl font-bold mb-8">Exports & Outils</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 hover:border-bronze/50 transition-colors cursor-pointer">
                <Download className="h-8 w-8 text-bronze mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Export Gephi</h3>
                <p className="text-sm text-muted-foreground">
                  Exportez le graphe au format GEXF pour une analyse approfondie dans Gephi.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 hover:border-bronze/50 transition-colors cursor-pointer">
                <Settings className="h-8 w-8 text-silver mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Paramètres avancés</h3>
                <p className="text-sm text-muted-foreground">
                  Configurez les algorithmes de layout et les seuils de filtrage.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 hover:border-bronze/50 transition-colors cursor-pointer">
                <Network className="h-8 w-8 text-gold mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Analyse IA</h3>
                <p className="text-sm text-muted-foreground">
                  Interprétation automatique des métriques et des communautés détectées.
                </p>
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

export default Graphs;
