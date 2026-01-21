import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import NL2Sparql from "@/components/NL2Sparql";
import SparqlEditor from "@/components/SparqlEditor";
import TechStack from "@/components/TechStack";

const Index = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "nations") {
      navigate("/nations");
    } else if (sectionId === "athletes") {
      navigate("/athletes");
    } else if (sectionId === "graphs") {
      navigate("/graphs");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection onExplore={() => scrollToSection("nations")} />
        <NL2Sparql />
        <SparqlEditor />
        <TechStack />
      </main>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Projet Web Sémantique — Analyse des Jeux Olympiques via DBpedia
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
