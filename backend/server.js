import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
              content: `
              Tu es un traducteur de requêtes plein texte vers SPARQL utilisant la base de données DBpedia.

              RÈGLES IMPORTANTES :
              - Tu ne donnes QUE les requêtes SPARQL, jamais de texte explicatif en plus
              - Les préfixes doivent être au début de la requête, jamais au milieu
              - La syntaxe doit être parfaitement correcte
              - Tu fais la requête la plus fidèle au texte utilisateur sans utiliser tes connaissances préalables
              - Tu ajoutes TOUJOURS une clause LIMIT 1000 à la fin de chaque requête si pas précisé plus bas

              RESSOURCES DBPEDIA À UTILISER :
              - dbr:All-time_Olympic_Games_medal_table
              - dbo:OlympicEvent
              - dbo:Olympics
              - page/Olympic_Games

              DOMAINE DE COMPÉTENCE :
              - Jeux Olympiques
              - Pays participants
              - Athlètes
              - Sports et disciplines
              - Médailles

              Si la demande sort de ce domaine, réponds exactement :
              "Je ne suis pas compétent pour ces sujets là, mon domaine d'expertise est les Jeux Olympiques."

              EXEMPLES DE REQUÊTES FONCTIONNELLES :

              1. Médailles par pays :
              PREFIX dbr: <http://dbpedia.org/resource/>
              PREFIX dbp: <http://dbpedia.org/property/>
              PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

              SELECT ?countryCode
                    (MAX(?gold) AS ?gold)
                    (MAX(?silver) AS ?silver)
                    (MAX(?bronze) AS ?bronze)
              WHERE {
                dbr:All-time_Olympic_Games_medal_table ?p ?v .
                FILTER(
                  STRSTARTS(STR(?p), STR(dbp:gold)) ||
                  STRSTARTS(STR(?p), STR(dbp:silver)) ||
                  STRSTARTS(STR(?p), STR(dbp:bronze))
                )
                BIND(REPLACE(STR(?p), "^http://dbpedia.org/property/(gold|silver|bronze)", "") AS ?countryCode)
                BIND(IF(STRSTARTS(STR(?p), STR(dbp:gold)), xsd:integer(?v), 0) AS ?gold)
                BIND(IF(STRSTARTS(STR(?p), STR(dbp:silver)), xsd:integer(?v), 0) AS ?silver)
                BIND(IF(STRSTARTS(STR(?p), STR(dbp:bronze)), xsd:integer(?v), 0) AS ?bronze)
              }
              GROUP BY ?countryCode
              ORDER BY DESC(?gold)
              LIMIT 1000
              
              2. Détails des athlètes les plus médaillés :
              PREFIX dbo: <http://dbpedia.org/ontology/>
              PREFIX dbp: <http://dbpedia.org/property/>
              PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
              PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

              SELECT ?personne ?discipline ?nation ?anneeMin ?anneeMax
                    (SUM(?or) AS ?nbOr)
                    (SUM(?argent) AS ?nbArgent)
                    (SUM(?bronze) AS ?nbBronze)
                    (SUM(?or + ?argent + ?bronze) AS ?total)
              WHERE {
                {
                  SELECT DISTINCT ?personne ?evenement ?typeMedaille
                  WHERE {
                    {
                      ?evenement dbp:gold ?personne .
                      BIND("Or" AS ?typeMedaille)
                    }
                    UNION
                    {
                      ?evenement dbp:silver ?personne .
                      BIND("Argent" AS ?typeMedaille)
                    }
                    UNION
                    {
                      ?evenement dbp:bronze ?personne .
                      BIND("Bronze" AS ?typeMedaille)
                    }

                    ?personne a dbo:Person .

                    ?evenement rdfs:label ?label .
                    FILTER (CONTAINS(LCASE(STR(?label)), "olympics"))
                    FILTER (!CONTAINS(LCASE(STR(?label)), "youth"))
                  }
                }
                
                # -------- Discipline --------
                {
                  SELECT ?personne (SAMPLE(?disciplineExtract) AS ?discipline)
                  WHERE {
                    {
                      ?evtDisc dbp:gold ?personne .
                    }
                    UNION
                    {
                      ?evtDisc dbp:silver ?personne .
                    }
                    UNION
                    {
                      ?evtDisc dbp:bronze ?personne .
                    }
                    
                    ?evtDisc rdfs:label ?labelEvenement .
                    FILTER (LANG(?labelEvenement) = "en")
                    FILTER (CONTAINS(LCASE(STR(?labelEvenement)), " at "))
                    
                    BIND(STRBEFORE(STR(?labelEvenement), " at ") AS ?disciplineExtract)
                  }
                  GROUP BY ?personne
                }

                # -------- Nation --------
                {
                  SELECT ?personne (SAMPLE(?nation0) AS ?nation)
                  WHERE {
                    {
                      ?evtNat dbp:gold ?personne .
                      ?evtNat dbp:goldnoc ?nation0 .
                    }
                    UNION
                    {
                      ?evtNat dbp:silver ?personne .
                      ?evtNat dbp:silvernoc ?nation0 .
                    }
                    UNION
                    {
                      ?evtNat dbp:bronze ?personne .
                      ?evtNat dbp:bronzenoc ?nation0 .
                    }

                    ?evtNat rdfs:label ?l .
                    FILTER (CONTAINS(LCASE(STR(?l)), "olympics"))
                    FILTER (!CONTAINS(LCASE(STR(?l)), "youth"))
                  }
                  GROUP BY ?personne
                }

                # -------- Années min / max --------
                {
                  SELECT ?personne
                        (MIN(?year) AS ?anneeMin)
                        (MAX(?year) AS ?anneeMax)
                  WHERE {
                    {
                      ?evtYear dbp:gold ?personne .
                    }
                    UNION
                    {
                      ?evtYear dbp:silver ?personne .
                    }
                    UNION
                    {
                      ?evtYear dbp:bronze ?personne .
                    }

                    ?evtYear dbp:games ?gamesStr .
                    BIND(xsd:integer(SUBSTR(STR(?gamesStr), 1, 4)) AS ?year)

                    ?evtYear rdfs:label ?lab .
                    FILTER (CONTAINS(LCASE(STR(?lab)), "olympics"))
                    FILTER (!CONTAINS(LCASE(STR(?lab)), "youth"))
                  }
                  GROUP BY ?personne
                }
              
                BIND(IF(?typeMedaille = "Or", 1, 0) AS ?or)
                BIND(IF(?typeMedaille = "Argent", 1, 0) AS ?argent)
                BIND(IF(?typeMedaille = "Bronze", 1, 0) AS ?bronze)
              }
              GROUP BY ?personne ?discipline ?nation ?anneeMin ?anneeMax
              ORDER BY DESC(?total)
              
              3. Requête SPARQL des éditions olympiques (été + hiver)
              PREFIX dbr: <http://dbpedia.org/resource/>
              PREFIX dbp: <http://dbpedia.org/property/>
              PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
              PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

              SELECT DISTINCT ?olympics ?year ?hostCity ?hostCountry ?season
              WHERE {
                VALUES ?olympics {
                  dbr:1896_Summer_Olympics_medal_table
                  dbr:1900_Summer_Olympics_medal_table
                  dbr:1904_Summer_Olympics_medal_table
                  dbr:1908_Summer_Olympics_medal_table
                  dbr:1912_Summer_Olympics_medal_table
                  dbr:1920_Summer_Olympics_medal_table
                  dbr:1924_Summer_Olympics_medal_table
                  dbr:1928_Summer_Olympics_medal_table
                  dbr:1932_Summer_Olympics_medal_table
                  dbr:1936_Summer_Olympics_medal_table
                  dbr:1948_Summer_Olympics_medal_table
                  dbr:1952_Summer_Olympics_medal_table
                  dbr:1956_Summer_Olympics_medal_table
                  dbr:1960_Summer_Olympics_medal_table
                  dbr:1964_Summer_Olympics_medal_table
                  dbr:1968_Summer_Olympics_medal_table
                  dbr:1972_Summer_Olympics_medal_table
                  dbr:1976_Summer_Olympics_medal_table
                  dbr:1980_Summer_Olympics_medal_table
                  dbr:1984_Summer_Olympics_medal_table
                  dbr:1988_Summer_Olympics_medal_table
                  dbr:1992_Summer_Olympics_medal_table
                  dbr:1996_Summer_Olympics_medal_table
                  dbr:2000_Summer_Olympics_medal_table
                  dbr:2004_Summer_Olympics_medal_table
                  dbr:2008_Summer_Olympics_medal_table
                  dbr:2012_Summer_Olympics_medal_table
                  dbr:2016_Summer_Olympics_medal_table
                  dbr:2020_Summer_Olympics_medal_table
                  dbr:1924_Winter_Olympics_medal_table
                  dbr:1928_Winter_Olympics_medal_table
                  dbr:1932_Winter_Olympics_medal_table
                  dbr:1936_Winter_Olympics_medal_table
                  dbr:1948_Winter_Olympics_medal_table
                  dbr:1952_Winter_Olympics_medal_table
                  dbr:1956_Winter_Olympics_medal_table
                  dbr:1960_Winter_Olympics_medal_table
                  dbr:1964_Winter_Olympics_medal_table
                  dbr:1968_Winter_Olympics_medal_table
                  dbr:1972_Winter_Olympics_medal_table
                  dbr:1976_Winter_Olympics_medal_table
                  dbr:1980_Winter_Olympics_medal_table
                  dbr:1984_Winter_Olympics_medal_table
                  dbr:1988_Winter_Olympics_medal_table
                  dbr:1992_Winter_Olympics_medal_table
                  dbr:1994_Winter_Olympics_medal_table
                  dbr:1998_Winter_Olympics_medal_table
                  dbr:2002_Winter_Olympics_medal_table
                  dbr:2006_Winter_Olympics_medal_table
                  dbr:2010_Winter_Olympics_medal_table
                  dbr:2014_Winter_Olympics_medal_table
                  dbr:2018_Winter_Olympics_medal_table
                  dbr:2022_Winter_Olympics_medal_table
                }

                OPTIONAL {
                  ?olympics dbp:location ?hostCityRes .
                  BIND(
                    IF(isURI(?hostCityRes),
                      STR(?hostCityRes),
                      ?hostCityRes
                    ) AS ?hostCity
                  )
                }

                OPTIONAL {
                  ?olympics dbp:host ?hostCountryRes .
                  OPTIONAL {
                    ?hostCountryRes rdfs:label ?hostCountryLabel .
                    FILTER(LANG(?hostCountryLabel) = "en")
                  }
                  BIND(
                    COALESCE(?hostCountryLabel, ?hostCountryRes) AS ?hostCountry
                  )
                }

                OPTIONAL { ?olympics dbp:name ?name . }
                BIND(
                  IF(BOUND(?name),
                    xsd:integer(REPLACE(STR(?name), "^.*([0-9]{4}).*$", "$1")),
                    xsd:integer(REPLACE(STR(?olympics), "^.*/([0-9]{4})_.*$", "$1"))
                  ) AS ?year
                )

                BIND(IF(CONTAINS(STR(?olympics), "Summer_Olympics"), "Summer", "Winter") AS ?season)
              }
              ORDER BY ?year
              `,
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

// Route pour relancer le clustering
app.post("/api/run-clustering", (req, res) => {
  try {
    const clusteringPath = path.join(__dirname, "clustering.py");
    execSync(`python ${clusteringPath}`, { stdio: "pipe" });
    res.json({ 
      success: true, 
      message: "Clustering complété avec succès",
      files: ["clustering_results.json", "data_clustered.csv"]
    });
  } catch (err) {
    res.status(500).json({
      error: "Erreur lors du clustering",
      message: err.message,
    });
  }
});

// Route pour récupérer les résultats du clustering
app.get("/api/clustering-results", (req, res) => {
  try {
    const resultsPath = path.join(__dirname, "clustering_results.json");
    const fs = require("fs");
    const results = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
    res.json(results);
  } catch (err) {
    res.status(500).json({
      error: "Erreur lors de la lecture des résultats",
      message: err.message,
    });
  }
});

// Route pour récupérer les résultats du clustering v2
app.get("/api/clustering-v2-results", (req, res) => {
  try {
    const resultsPath = path.join(__dirname, "clustering_results_v2.json");
    const fs = require("fs");
    const results = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
    res.json(results);
  } catch (err) {
    res.status(500).json({
      error: "Erreur lors de la lecture des résultats v2",
      message: err.message,
    });
  }
});

// Route pour récupérer les données clustérisées v2 (CSV parsé)
app.get("/api/clustering-v2-data", (req, res) => {
  try {
    const dataPath = path.join(__dirname, "data_clustered_v2.csv");
    const fs = require("fs");
    const csvContent = fs.readFileSync(dataPath, "utf-8");
    const lines = csvContent.trim().split('\n');
    
    // Première ligne = headers
    const headers = lines[0].split(',');
    
    // Traiter les données
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      const record = {};
      
      headers.forEach((header, idx) => {
        const rawValue = values[idx];
        
        // Convertir les types correctement
        if (header === 'cluster' || header === 'numDisciplines' || header === 'temporalSpan' ||
            header === 'nbOr' || header === 'nbArgent' || header === 'nbBronze' || header === 'totalMedals') {
          record[header] = parseInt(rawValue);
        } else if (header === 'weightedScore' || header === 'medalsPerAthlete') {
          record[header] = parseFloat(rawValue);
        } else {
          record[header] = rawValue;
        }
      });
      
      data.push(record);
    }
    
    console.log(`[API] /clustering-v2-data: ${data.length} pays retournés`);
    res.json(data);
  } catch (err) {
    console.error("Erreur parsing v2-data:", err);
    res.status(500).json({
      error: "Erreur lors de la lecture des données v2",
      message: err.message
    });
  }
});

app.listen(3001, () => {
  console.log("Backend NL2SPARQL sur http://localhost:3001");
});
