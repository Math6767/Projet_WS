import { Database, Cpu, BarChart3, MessageSquare } from "lucide-react";

const TechStack = () => {
  const technologies = [
    {
      icon: Database,
      name: "DBpedia",
      description: "Base de connaissances extraite de Wikipedia",
    },
    {
      icon: Cpu,
      name: "SPARQL",
      description: "Langage de requête pour le Web sémantique",
    },
    {
      icon: BarChart3,
      name: "Gephi",
      description: "Visualisation et analyse de graphes",
    },
    {
      icon: MessageSquare,
      name: "llama3 (70b)",
      description: "NL2SPARQL via un modèle de langage avancé",
    },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold">Stack Technique</h2>
          <p className="mt-4 text-muted-foreground">
            Technologies du Web sémantique au service de l'analyse olympique
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {technologies.map((tech, index) => (
            <div
              key={tech.name}
              className="animate-fade-in rounded-xl border border-border bg-card p-6 text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-secondary">
                <tech.icon className="h-7 w-7 text-gold" />
              </div>
              <h3 className="font-display font-semibold">{tech.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
