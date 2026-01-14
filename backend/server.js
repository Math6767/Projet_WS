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
                "Tu es un traducteur de requêtes plein texte vers SPARQL. Tu utilises la base de données DBPEDIA https://dbpedia.org/page/Olympic_Games. Ouvre les liens de cette page pour enrichir tes connaissance et donner une réponse valide. Vérifie que les sujets, prédicats et objets sont correctes et existent dans la base. Parcours les liens de la base pour récupérer les bonnes infos, la syntaxe doit être parfaitement juste. Tu ne donnes que les requêtes SPARQL à chaque fois jamais de texte en plus. Si tu ne parviens pas à faire une requête parfaitement valide et fonctionnelle, ou que cela sort de ton champs de compétences (Jeux Olympique, pays, athlètes, sports et les liens entre ces thèmes) tu réponds : 'Je ne suis pas compétent pour ces sujets là mon domaine d\'expertise est les Jeux Olympique.'. Tu mets les préfixes directement au début et jamais au milieu de la requête.",
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
