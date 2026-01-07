import { ArrowRight, Globe, Database, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onExplore: () => void;
}

const HeroSection = ({ onExplore }: HeroSectionProps) => {
  const stats = [
    { value: "206", label: "Nations", icon: Globe },
    { value: "11K+", label: "Athlètes", icon: Database },
    { value: "∞", label: "Relations", icon: Network },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border py-20 md:py-32">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-olympic-blue blur-3xl" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
            <span className="text-muted-foreground">Propulsé par DBpedia, SPARQL et les 4IF</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Analyse Sémantique des{" "}
            <span className="text-gold">Jeux Olympiques</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Explorez les relations entre athlètes, nations et disciplines à travers 
            le prisme du Web de données. Visualisez les performances olympiques 
            comme jamais auparavant.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="gold" size="xl" onClick={onExplore} className="group">
              Commencer l'exploration
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            {/*<Button variant="outline" size="xl">
              Voir la documentation
            </Button>*/}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-10">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="animate-fade-in text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-center gap-2">
                  <stat.icon className="h-5 w-5 text-gold" />
                  <span className="font-display text-3xl font-bold md:text-4xl">
                    {stat.value}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
