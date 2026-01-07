import { Flame, Database, BarChart3, Network, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "overview", label: "Vue d'ensemble", icon: Flame, path: "/" },
    { id: "nations", label: "Nations", icon: BarChart3, path: "/nations" },
    { id: "athletes", label: "Athlètes", icon: Sparkles, path: "/athletes" },
    { id: "graphs", label: "Graphes", icon: Network, path: "/graphs" },
    { id: "sparql", label: "SPARQL", icon: Database, path: "/sparql" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight">
              Olympic<span className="text-gold">Graph</span>
            </h1>
            <p className="text-xs text-muted-foreground">Web Sémantique</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={isActive(item.path) ? "secondary" : "nav"}
              size="sm"
              onClick={() => navigate(item.path)}
              className="gap-2"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        <Button variant="gold" size="sm" className="hidden sm:flex">
          Explorer DBpedia
        </Button>
      </div>
    </header>
  );
};

export default Header;
