import React, { useEffect, useRef } from "react";
import Sigma from "sigma";
import Graph from "graphology";
import * as gexf from "graphology-gexf";

interface GraphViewProps {
  gexfUrl: string;
  width?: string;
  height?: string;
  defaultNodeColor?: string;
  renderLabels?: boolean;
}

const GraphView: React.FC<GraphViewProps> = ({
  gexfUrl,
  width = "100%",
  height = "100%",
  defaultNodeColor = "#888",
  renderLabels = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaInstance = useRef<Sigma | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    fetch(gexfUrl)
      .then((res) => res.text())
      .then((gexfText) => {
        // Parse GEXF et créer le graphe
        const graph: Graph = gexf.parse(Graph, gexfText);

        // Détruire instance Sigma précédente si elle existe
        if (sigmaInstance.current) {
          sigmaInstance.current.kill();
          sigmaInstance.current = null;
        }

        // Créer Sigma
        sigmaInstance.current = new Sigma(graph, containerRef.current, {
          renderLabels,
          defaultNodeColor,
        });
      })
      .catch((err) => console.error("Erreur chargement GEXF :", err));

    // Cleanup
    return () => {
      if (sigmaInstance.current) {
        sigmaInstance.current.kill();
        sigmaInstance.current = null;
      }
    };
  }, [gexfUrl, defaultNodeColor, renderLabels]);

  return <div ref={containerRef} style={{ width, height }} />;
};

export default GraphView;
