import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/nl2sparql", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const response = await fetch(
      "https://ollama-ui.pagoda.liris.cnrs.fr/api/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3:70b",
          messages: [
            {
              role: "system",
              content:
                "Tu es un traducteur de requêtes plein texte vers SPARQL tu utilises la base de données DBPEDIA.  Tu ne donnes que les requêtes SPARQL à chaque fois jamais de texte en plus. N'invente pas des attributs inexistants sur la base. Tu fais la requête la plus fidèle au texte que l'utilisateur te fait en ne prenant en compte que les données qu'il te donne et pas les résultats que tu connais déjà. Les requêtes sont en lien avec les Jeux Olympique, les pays, les athlètes et les sports. Si tu ne parviens pas à faire de requêtes ou que cela sort de ton champs de compétences (Jeux Olympique, pays, athlètes, sports et les liens entre ces thèmes) tu réponds : 'Je ne suis pas compétent pour ces sujets là mon domaine d\'expertise est les Jeux Olympique.'. Tu mets les préfixes directement au début et jamais au milieu de la requête.",
            },
            {
              role: "user",
              content: query,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: "Erreur LLM",
        details: text,
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({
      error: "Erreur serveur",
      message: err.message,
    });
  }
});

app.listen(3001, () => {
  console.log("Backend NL2SPARQL sur http://localhost:3001");
});
