import { useState } from "react";
import { Globe, Medal, TrendingUp, Filter, Search, ChevronDown, Trophy, Target } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Nations = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const nations = [
    { rank: 1, name: "États-Unis", code: "USA", gold: 1022, silver: 795, bronze: 706, total: 2523, specialty: "Athlétisme, Natation" },
    { rank: 2, name: "Russie", code: "RUS", gold: 440, silver: 357, bronze: 355, total: 1152, specialty: "Gymnastique, Lutte" },
    { rank: 3, name: "Allemagne", code: "GER", gold: 428, silver: 444, bronze: 475, total: 1347, specialty: "Équitation, Aviron" },
    { rank: 4, name: "Royaume-Uni", code: "GBR", gold: 285, silver: 316, bronze: 320, total: 921, specialty: "Cyclisme, Aviron" },
    { rank: 5, name: "France", code: "FRA", gold: 248, silver: 276, bronze: 316, total: 840, specialty: "Escrime, Judo" },
    { rank: 6, name: "Italie", code: "ITA", gold: 246, silver: 214, bronze: 241, total: 701, specialty: "Escrime, Cyclisme" },
    { rank: 7, name: "Chine", code: "CHN", gold: 237, silver: 195, bronze: 176, total: 608, specialty: "Plongeon, Haltérophilie" },
    { rank: 8, name: "Australie", code: "AUS", gold: 162, silver: 173, bronze: 210, total: 545, specialty: "Natation" },
  ];

  const stats = [
    { label: "Nations analysées", value: "206", icon: Globe },
    { label: "Médailles totales", value: "15K+", icon: Medal },
    { label: "Disciplines", value: "46", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="border-b border-border py-16">
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gold/30 bg-gold/5">
                <Globe className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold md:text-4xl">
                  Analyse des Nations
                </h1>
                <p className="text-muted-foreground">
                  Performance et spécialisation olympique par pays
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center">
                  <stat.icon className="mx-auto h-5 w-5 text-gold mb-2" />
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
                  placeholder="Rechercher une nation..."
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
                Période
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2">
                Type de médaille
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Rankings Table */}
        <section className="py-10">
          <div className="container">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Rang</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Nation</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gold">Or</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-silver">Argent</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-bronze">Bronze</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-muted-foreground">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Spécialité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nations.map((nation) => (
                      <tr
                        key={nation.code}
                        className="border-b border-border last:border-0 transition-colors hover:bg-secondary/20 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {nation.rank <= 3 ? (
                              <Trophy className={`h-4 w-4 ${nation.rank === 1 ? "text-gold" : nation.rank === 2 ? "text-silver" : "text-bronze"}`} />
                            ) : (
                              <span className="text-muted-foreground">{nation.rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                              {nation.code}
                            </div>
                            <span className="font-medium">{nation.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gold">{nation.gold}</td>
                        <td className="px-6 py-4 text-center font-semibold text-silver">{nation.silver}</td>
                        <td className="px-6 py-4 text-center font-semibold text-bronze">{nation.bronze}</td>
                        <td className="px-6 py-4 text-center font-bold">{nation.total}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">{nation.specialty}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Load more */}
            <div className="mt-6 text-center">
              <Button variant="outline" className="gap-2">
                Charger plus de nations
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Analysis Cards */}
        <section className="border-t border-border py-16">
          <div className="container">
            <h2 className="font-display text-2xl font-bold mb-8">Analyses disponibles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 hover:border-gold/50 transition-colors cursor-pointer">
                <TrendingUp className="h-8 w-8 text-gold mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Évolution temporelle</h3>
                <p className="text-sm text-muted-foreground">
                  Suivez l'évolution des performances d'une nation au fil des éditions olympiques.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 hover:border-silver/50 transition-colors cursor-pointer">
                <Target className="h-8 w-8 text-silver mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Spécialisation sportive</h3>
                <p className="text-sm text-muted-foreground">
                  Identifiez les sports où chaque nation excelle et sa stratégie olympique.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 hover:border-bronze/50 transition-colors cursor-pointer">
                <Globe className="h-8 w-8 text-bronze mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Comparaison nations</h3>
                <p className="text-sm text-muted-foreground">
                  Comparez deux nations sur leurs performances respectives par discipline.
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

export default Nations;
