import { LucideIcon, ArrowUpRight } from "lucide-react";

interface AnalysisCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  accentColor: "gold" | "silver" | "bronze";
  onClick: () => void;
}

const AnalysisCard = ({
  title,
  description,
  icon: Icon,
  features,
  accentColor,
  onClick,
}: AnalysisCardProps) => {
  const accentClasses = {
    gold: "text-gold border-gold/30 bg-gold/5",
    silver: "text-silver border-silver/30 bg-silver/5",
    bronze: "text-bronze border-bronze/30 bg-bronze/5",
  };

  return (
    <button
      onClick={onClick}
      className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-6 text-left transition-all duration-300 hover:border-primary/50 hover:glow-subtle"
    >
      {/* Icon */}
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg border ${accentClasses[accentColor]}`}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{description}</p>

      {/* Features */}
      <ul className="mt-4 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${accentColor === "gold" ? "bg-gold" : accentColor === "silver" ? "bg-silver" : "bg-bronze"}`} />
            <span className="text-secondary-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Arrow */}
      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary transition-transform group-hover:translate-x-1">
        Explorer
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </button>
  );
};

export default AnalysisCard;
