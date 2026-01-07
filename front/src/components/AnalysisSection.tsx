import { Globe, Users, Network } from "lucide-react";
import AnalysisCard from "./AnalysisCard";

interface AnalysisSectionProps {
  onSectionChange: (section: string) => void;
}

const AnalysisSection = ({ onSectionChange }: AnalysisSectionProps) => {
  const analyses = [
    {
      id: "nations",
      title: "Analyse des Nations",
      description:
        "Identifiez les sports de spécialisation par pays, comparez les performances et suivez l'évolution au fil des éditions.",
      icon: Globe,
      features: [
        "Spécialisation sportive",
        "Nations polyvalentes vs spécialisées",
        "Évolution temporelle",
      ],
      accentColor: "gold" as const,
    },
    {
      id: "athletes",
      title: "Analyse des Athlètes",
      description:
        "Explorez les athlètes multi-médaillés, leur contribution nationale et leur position dans le graphe olympique.",
      icon: Users,
      features: [
        "Multi-médaillés",
        "Contribution nationale",
        "Centralité dans le graphe",
      ],
      accentColor: "silver" as const,
    },
    {
      id: "graphs",
      title: "Analyse par Graphes",
      description:
        "Visualisez les relations Athlète ↔ Sport ↔ Pays avec des métriques avancées et la détection de communautés.",
      icon: Network,
      features: [
        "PageRank & Betweenness",
        "Détection de communautés",
        "Clusters sport-nation",
      ],
      accentColor: "bronze" as const,
    },
  ];

  return (
    <section className="border-b border-border py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Trois axes d'analyse
          </h2>
          <p className="mt-4 text-muted-foreground">
            Une exploration multi-dimensionnelle des performances olympiques
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {analyses.map((analysis, index) => (
            <div
              key={analysis.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <AnalysisCard
                title={analysis.title}
                description={analysis.description}
                icon={analysis.icon}
                features={analysis.features}
                accentColor={analysis.accentColor}
                onClick={() => onSectionChange(analysis.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnalysisSection;
