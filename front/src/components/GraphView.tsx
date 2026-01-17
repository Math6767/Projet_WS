import React, { useEffect, useRef } from "react";
import Sigma from "sigma";
import Graph from "graphology";
import * as gexf from "graphology-gexf";

interface GraphViewProps {
  gexfUrl: string;
  width?: string;
  height?: string;
  renderLabels?: boolean;
  scale?: number; // facteur de scaling
}

const fetchPrimaryTopic = async (uri: string): Promise<string | null> => {
  const query = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?primary_topic
    WHERE {
      OPTIONAL { ?primary_topic foaf:primaryTopic <${uri}> }
    }
    LIMIT 1
  `;

  const url =
    "https://dbpedia.org/sparql?query=" + encodeURIComponent(query) + "&format=json";

  try {
    const res = await fetch(url);
    const json = await res.json();
    const binding = json.results.bindings[0];
    console.log(binding)
    if (!binding || !binding.primary_topic) return null;

    return binding.primary_topic.value;
  } catch (err) {
    console.error("Erreur SPARQL :", err);
    return null;
  }
};

const GraphView: React.FC<GraphViewProps> = ({
  gexfUrl,
  width = "100%",
  height = "100%",
  renderLabels = false,
  scale = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaInstance = useRef<Sigma | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    fetch(gexfUrl)
      .then((res) => res.text())
      .then((gexfText) => {
        const graph: Graph = gexf.parse(Graph, gexfText);

        // 🔹 Appliquer le scale sur les positions des noeuds
        graph.forEachNode((node, attrs) => {
          if ("x" in attrs && "y" in attrs) {
            graph.setNodeAttribute(node, "x", attrs.x * scale);
            graph.setNodeAttribute(node, "y", attrs.y * scale);
          }
        });

        // Détruire ancienne instance
        if (sigmaInstance.current) {
          sigmaInstance.current.kill();
          sigmaInstance.current = null;
        }

        sigmaInstance.current = new Sigma(graph, containerRef.current, {
          renderLabels,
          zIndex: true,

          // 🔹 Arêtes
          edgeReducer: (edge, data) => ({
            ...data,
            color: "#c0c0c0",
            size: 0.1 / scale,
          }),

          // 🔹 Noeuds
          nodeReducer: (node, data) => ({
            ...data,
            size: 1 / scale,
            borderSize: 0.5 / scale,
            borderColor: "#000000",
          }),
        });

        // 🔹 Clic sur un nœud → récupérer foaf:primaryTopic et ouvrir
        sigmaInstance.current.on("clickNode", async ({ node }) => {
          const uri = graph.getNodeAttribute(node, "label") || node;
          const primaryTopic = await fetchPrimaryTopic(uri);

          if (primaryTopic) {
            window.open(primaryTopic, "_blank");
          } else {
            console.warn("foaf:primaryTopic non trouvé pour", uri);
          }
        });
      })
      .catch((err) => console.error("Erreur chargement GEXF :", err));

    return () => {
      if (sigmaInstance.current) {
        sigmaInstance.current.kill();
        sigmaInstance.current = null;
      }
    };
  }, [gexfUrl, renderLabels, scale]);

  return <div ref={containerRef} style={{ width, height }} />;
};

export default GraphView;
