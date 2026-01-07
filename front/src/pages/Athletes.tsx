import { useState } from "react";
import { Users, Medal, Search, Filter, ChevronDown, Star, Trophy, Globe, Activity } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Athletes = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const athletes = [
    { id: 1, name: "Michael Phelps", country: "USA", sport: "Natation", gold: 23, silver: 3, bronze: 2, editions: 5, years: "2000-2016" },
    { id: 2, name: "Larisa Latynina", country: "URS", sport: "Gymnastique", gold: 9, silver: 5, bronze: 4, editions: 3, years: "1956-1964" },
    { id: 3, name: "Paavo Nurmi", country: "FIN", sport: "Athlétisme", gold: 9, silver: 3, bronze: 0, editions: 3, years: "1920-1928" },
    { id: 4, name: "Mark Spitz", country: "USA", sport: "Natation", gold: 9, silver: 1, bronze: 1, editions: 2, years: "1968-1972" },
    { id: 5, name: "Carl Lewis", country: "USA", sport: "Athlétisme", gold: 9, silver: 1, bronze: 0, editions: 4, years: "1984-1996" },
    { id: 6, name: "Usain Bolt", country: "JAM", sport: "Athlétisme", gold: 8, silver: 0, bronze: 0, editions: 3, years: "2008-2016" },
  ];

  const stats = [
    { label: "Athlètes olympiques", value: "11K+", icon: Users },
    { label: "Multi-médaillés", value: "2.3K", icon: Medal },
    { label: "Disciplines", value: "46", icon: Activity },
  ];

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
                  Explorez les légendes olympiques et leurs performances
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
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Sport
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2">
                Nation
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2">
                Période
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Athletes Grid */}
        <section className="py-10">
          <div className="container">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {athletes.map((athlete) => (
                <div
                  key={athlete.id}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-silver/50 hover:glow-subtle cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary font-display font-bold text-lg">
                        {athlete.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold">{athlete.name}</h3>
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
                      <span className="font-bold">{athlete.gold + athlete.silver + athlete.bronze}</span>
                      <span className="text-muted-foreground"> médailles totales</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {athlete.editions} éditions
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more */}
            <div className="mt-8 text-center">
              <Button variant="outline" className="gap-2">
                Charger plus d'athlètes
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
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
