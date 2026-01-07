import { useState } from "react";
import { Network, Users, Globe, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

const Graphs = () => {
  const [athleteRankData] = useState([]);

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
            <div className="mt-8 rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-display font-semibold">Visualisation du graphe PageRank</h3>
              </div>
              <div className="relative h-[500px] bg-secondary/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-bronze mb-4 opacity-50" />
                  <p className="text-muted-foreground">Graphe interactif à charger</p>
                </div>
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
              <h2 className="font-display text-2xl font-bold">Clustering : Profils Olympiques Similaires</h2>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-6 py-4 text-left font-display font-semibold text-sm">Pays</th>
                      {sportColumns.map((sport) => (
                        <th
                          key={sport}
                          className="px-6 py-4 text-center font-display font-semibold text-sm"
                        >
                          {sport}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {countryProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={sportColumns.length + 1} className="px-6 py-8 text-center text-muted-foreground">
                          Données à charger...
                        </td>
                      </tr>
                    ) : (
                      countryProfiles.map((country) => (
                        <tr
                          key={country.code}
                          className="border-b border-border hover:bg-secondary/10 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium">{country.name}</td>
                          {sportColumns.map((sport) => (
                            <td
                              key={`${country.code}-${sport}`}
                              className="px-6 py-4 text-center text-sm"
                            >
                              {country[sport] || 0}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Le clustering détecte les groupes de pays ayant des profils olympiques similaires basés sur leur diversité sportive, leurs performances historiques et leurs patterns de participation.
            </p>

            {/* Clustering Graph Visualization */}
            <div className="mt-8 rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-display font-semibold">Visualisation du clustering</h3>
              </div>
              <div className="relative h-[500px] bg-secondary/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <Globe className="h-12 w-12 mx-auto text-silver mb-4 opacity-50" />
                  <p className="text-muted-foreground">Graphe de clustering interactif à charger</p>
                </div>
              </div>
            </div>
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
