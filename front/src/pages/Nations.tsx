import { useState, useEffect, useMemo } from "react";
import { Globe, Medal, TrendingUp, Filter, Search, ChevronDown, Trophy, Target, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Type pour les données des nations
interface Nation {
  rank: number;
  name: string;
  code: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  specialty: string;
}

// Requête SPARQL placeholder - À REMPLACER par la vraie requête
const SPARQL_QUERY = `
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX dbp: <http://dbpedia.org/property/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?countryCode
       (SUM(?gold)   AS ?gold)
       (SUM(?silver) AS ?silver)
       (SUM(?bronze) AS ?bronze)
WHERE {
  dbr:All-time_Olympic_Games_medal_table ?p ?v .

  # On ne garde que les prédicats gold / silver / bronze
  FILTER(
    STRSTARTS(STR(?p), STR(dbp:gold)) ||
    STRSTARTS(STR(?p), STR(dbp:silver)) ||
    STRSTARTS(STR(?p), STR(dbp:bronze))
  )

  # Extraction propre du code pays (après gold/silver/bronze)
  BIND(
    REPLACE(
      STR(?p),
      "^http://dbpedia.org/property/(gold|silver|bronze)",
      ""
    ) AS ?countryCode
  )

  # Attribution des valeurs
  BIND(IF(STRSTARTS(STR(?p), STR(dbp:gold)),   xsd:integer(?v), 0) AS ?gold)
  BIND(IF(STRSTARTS(STR(?p), STR(dbp:silver)), xsd:integer(?v), 0) AS ?silver)
  BIND(IF(STRSTARTS(STR(?p), STR(dbp:bronze)), xsd:integer(?v), 0) AS ?bronze)
}
GROUP BY ?countryCode
ORDER BY DESC(?gold)
`;

// Mapping des codes pays IOC vers les noms complets (liste officielle complète)
const COUNTRY_NAMES: Record<string, string> = {
  // A
  "Afg": "Afghanistan",
  "Alb": "Albanie",
  "Alg": "Algérie",
  "And": "Andorre",
  "Ang": "Angola",
  "Ant": "Antigua-et-Barbuda",
  "Arg": "Argentine",
  "Arm": "Arménie",
  "Aru": "Aruba",
  "Asa": "Samoa américaines",
  "Aus": "Australie",
  "Aut": "Autriche",
  "Aze": "Azerbaïdjan",
  
  // B
  "Bah": "Bahamas",
  "Ban": "Bangladesh",
  "Bar": "Barbade",
  "Bdi": "Burundi",
  "Bel": "Belgique",
  "Ben": "Bénin",
  "Ber": "Bermudes",
  "Bhu": "Bhoutan",
  "Bih": "Bosnie-Herzégovine",
  "Biz": "Belize",
  "Blr": "Biélorussie",
  "Bol": "Bolivie",
  "Bot": "Botswana",
  "Bra": "Brésil",
  "Brn": "Bahreïn",
  "Bru": "Brunei",
  "Bul": "Bulgarie",
  "Bur": "Burkina Faso",
  
  // C
  "Caf": "Centrafrique",
  "Cam": "Cambodge",
  "Can": "Canada",
  "Cay": "Îles Caïmans",
  "Cgo": "République du Congo",
  "Cha": "Tchad",
  "Chi": "Chili",
  "Chn": "Chine",
  "Civ": "Côte d'Ivoire",
  "Cmr": "Cameroun",
  "Cod": "RD Congo",
  "Cok": "Îles Cook",
  "Col": "Colombie",
  "Com": "Comores",
  "Cpv": "Cap-Vert",
  "Crc": "Costa Rica",
  "Cro": "Croatie",
  "Cub": "Cuba",
  "Cyp": "Chypre",
  "Cze": "Tchéquie",
  
  // D
  "Den": "Danemark",
  "Dji": "Djibouti",
  "Dma": "Dominique",
  "Dom": "République Dominicaine",
  
  // E
  "Ecu": "Équateur",
  "Egy": "Égypte",
  "Eri": "Érythrée",
  "Esa": "Salvador",
  "Esp": "Espagne",
  "Est": "Estonie",
  "Eth": "Éthiopie",
  
  // F
  "Fij": "Fidji",
  "Fin": "Finlande",
  "Fra": "France",
  "Fsm": "Micronésie",
  
  // G
  "Gab": "Gabon",
  "Gam": "Gambie",
  "Gbr": "Royaume-Uni",
  "Gbs": "Guinée-Bissau",
  "Geo": "Géorgie",
  "Geq": "Guinée équatoriale",
  "Ger": "Allemagne",
  "Gha": "Ghana",
  "Gre": "Grèce",
  "Grn": "Grenade",
  "Gua": "Guatemala",
  "Gui": "Guinée",
  "Gum": "Guam",
  "Guy": "Guyana",
  
  // H
  "Hai": "Haïti",
  "Hkg": "Hong Kong",
  "Hon": "Honduras",
  "Hun": "Hongrie",
  
  // I
  "Ina": "Indonésie",
  "Ind": "Inde",
  "Iri": "Iran",
  "Irl": "Irlande",
  "Irq": "Irak",
  "Isl": "Islande",
  "Isr": "Israël",
  "Isv": "Îles Vierges américaines",
  "Ita": "Italie",
  "Ivb": "Îles Vierges britanniques",
  
  // J
  "Jam": "Jamaïque",
  "Jor": "Jordanie",
  "Jpn": "Japon",
  
  // K
  "Kaz": "Kazakhstan",
  "Ken": "Kenya",
  "Kgz": "Kirghizistan",
  "Kir": "Kiribati",
  "Kor": "Corée du Sud",
  "Kos": "Kosovo",
  "Ksa": "Arabie Saoudite",
  "Kuw": "Koweït",
  
  // L
  "Lao": "Laos",
  "Lat": "Lettonie",
  "Lba": "Libye",
  "Lbn": "Liban",
  "Lib": "Liban Français",
  "Lbr": "Liberia",
  "Lca": "Sainte-Lucie",
  "Les": "Lesotho",
  "Lie": "Liechtenstein",
  "Ltu": "Lituanie",
  "Lux": "Luxembourg",
  
  // M
  "Mad": "Madagascar",
  "Mar": "Maroc",
  "Mas": "Malaisie",
  "Maw": "Malawi",
  "Mda": "Moldavie",
  "Mdv": "Maldives",
  "Mex": "Mexique",
  "Mgl": "Mongolie",
  "Mhl": "Îles Marshall",
  "Mkd": "Macédoine du Nord",
  "Mli": "Mali",
  "Mlt": "Malte",
  "Mne": "Monténégro",
  "Mon": "Monaco",
  "Moz": "Mozambique",
  "Mri": "Maurice",
  "Mtn": "Mauritanie",
  "Mya": "Myanmar",
  
  // N
  "Nam": "Namibie",
  "Nca": "Nicaragua",
  "Ned": "Pays-Bas",
  "Nep": "Népal",
  "Ngr": "Nigeria",
  "Nig": "Niger",
  "Nor": "Norvège",
  "Nru": "Nauru",
  "Nzl": "Nouvelle-Zélande",
  
  // O
  "Oma": "Oman",
  
  // P
  "Pak": "Pakistan",
  "Pan": "Panama",
  "Par": "Paraguay",
  "Per": "Pérou",
  "Phi": "Philippines",
  "Ple": "Palestine",
  "Plw": "Palaos",
  "Png": "Papouasie-Nouvelle-Guinée",
  "Pol": "Pologne",
  "Por": "Portugal",
  "Prk": "Corée du Nord",
  "Pur": "Porto Rico",
  
  // Q
  "Qat": "Qatar",
  
  // R
  "Rou": "Roumanie",
  "Rsa": "Afrique du Sud",
  "Rus": "Russie",
  "Rwa": "Rwanda",
  
  // S
  "Sam": "Samoa",
  "Sen": "Sénégal",
  "Sey": "Seychelles",
  "Sgp": "Singapour",
  "Sin": "Singapour",
  "Skn": "Saint-Kitts-et-Nevis",
  "Sle": "Sierra Leone",
  "Slo": "Slovénie",
  "Smr": "Saint-Marin",
  "Sol": "Îles Salomon",
  "Som": "Somalie",
  "Srb": "Serbie",
  "Sri": "Sri Lanka",
  "Ssd": "Soudan du Sud",
  "Stp": "Sao Tomé-et-Príncipe",
  "Sud": "Soudan",
  "Sui": "Suisse",
  "Sur": "Suriname",
  "Svk": "Slovaquie",
  "Swe": "Suède",
  "Swz": "Eswatini",
  "Syr": "Syrie",
  
  // T
  "Tan": "Tanzanie",
  "Tga": "Tonga",
  "Tha": "Thaïlande",
  "Tjk": "Tadjikistan",
  "Tkm": "Turkménistan",
  "Tls": "Timor oriental",
  "Tog": "Togo",
  "Tpe": "Taïwan",
  "Tto": "Trinité-et-Tobago",
  "Tun": "Tunisie",
  "Tur": "Turquie",
  "Tuv": "Tuvalu",
  
  // U
  "Uae": "Émirats Arabes Unis",
  "Uga": "Ouganda",
  "Ukr": "Ukraine",
  "Uru": "Uruguay",
  "Usa": "États-Unis",
  "Uzb": "Ouzbékistan",
  
  // V
  "Van": "Vanuatu",
  "Ven": "Venezuela",
  "Vie": "Viêt Nam",
  "Vin": "Saint-Vincent-et-les-Grenadines",
  
  // Y
  "Yem": "Yémen",
  
  // Z
  "Zam": "Zambie",
  "Zim": "Zimbabwe",
  "Zzx": "Équipe mixte aux Jeux olympiques",
  
  // === CODES HISTORIQUES ===
  "Aho": "Antilles néerlandaises",
  "Anz": "Australasie",
  "Boh": "Bohême",
  "Bwi": "Indes occidentales britanniques",
  "Eua": "Équipe unifiée d'Allemagne",
  "Eun": "Équipe Unifiée",
  "Frg": "Allemagne de l'Ouest",
  "Gdr": "Allemagne de l'Est",
  "Ddr": "Allemagne de l'Est",
  "Scg": "Serbie-et-Monténégro",
  "Tch": "Tchécoslovaquie",
  "Urs": "Union Soviétique",
  "Yug": "Yougoslavie",
  "Vnm": "Sud-Vietnam",
  
  // === CODES SPÉCIAUX ===
  "Ain": "Athlètes Individuels Neutres",
  "Cor": "Corée (équipe unifiée)",
  "Eor": "Équipe Olympique des Réfugiés",
  "Iop": "Participants Olympiques Indépendants",
  "Ioa": "Athlètes Olympiques Indépendants",
  "Oar": "Athlètes Olympiques de Russie",
  "Roc": "Comité Olympique de Russie",
  "Ror": "Équipe Olympique des Réfugiés",
  
  // === CODES OBSOLÈTES ===
  "Bir": "Birmanie",
  "Cey": "Ceylan",
  "Dah": "Dahomey",
  "Hbr": "Honduras britannique",
  "Iho": "Indes orientales néerlandaises",
  "Khm": "République khmère",
  "Mal": "Malaisie",
  "Nbo": "Bornéo du Nord",
  "Nrh": "Rhodésie du Nord",
  "Rau": "République arabe unie",
  "Rho": "Rhodésie",
  "Ru1": "Empire russe",
  "Saa": "Sarre",
  "Uar": "République arabe unie",
  "Vol": "Haute-Volta",
  "Wsm": "Samoa occidentales",
  "Yar": "Yémen du Nord",
  "Ymd": "Yémen du Sud",
  "Zai": "Zaïre",
  
  // Codes alternatifs utilisés historiquement
  "Irn": "Iran",
  "Idn": "Indonésie",
  "Rom": "Roumanie",
  "Hol": "Pays-Bas",
  "Sau": "Arabie Saoudite",
};

// Fonction pour obtenir le nom du pays à partir du code
const getCountryName = (code: string): string => {
  // Normaliser le code (première lettre majuscule, reste minuscule)
  const normalizedCode = code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
  return COUNTRY_NAMES[normalizedCode] || code;
};

// Fonction pour exécuter une requête SPARQL sur DBpedia
const executeSparqlQuery = async (query: string): Promise<any> => {
  const endpoint = "https://dbpedia.org/sparql";
  const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/sparql-results+json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Erreur SPARQL: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fonction pour transformer les résultats SPARQL en données de nations
const transformSparqlResults = (results: any): Nation[] => {
  const bindings = results?.results?.bindings || [];
  
  return bindings
    .filter((binding: any) => binding.countryCode?.value) // Filtrer les entrées sans code pays
    .map((binding: any, index: number) => {
      const gold = parseInt(binding.gold?.value || "0", 10);
      const silver = parseInt(binding.silver?.value || "0", 10);
      const bronze = parseInt(binding.bronze?.value || "0", 10);
      const code = binding.countryCode?.value || "???";
      
      return {
        rank: index + 1,
        name: getCountryName(code),
        code: code.substring(0, 3).toUpperCase(),
        gold,
        silver,
        bronze,
        total: gold + silver + bronze,
        specialty: "-",
      };
    });
};

const INITIAL_DISPLAY_COUNT = 10;

const Nations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [nations, setNations] = useState<Nation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Charger les données depuis DBpedia au montage du composant
  useEffect(() => {
    const fetchNations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const results = await executeSparqlQuery(SPARQL_QUERY);
        const transformedData = transformSparqlResults(results);
        setNations(transformedData);
      } catch (err) {
        console.error("Erreur lors de la requête SPARQL:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchNations();
  }, []);

  // Calculer les statistiques dynamiquement
  const totalMedals = useMemo(() => {
    return nations.reduce((acc, nation) => acc + nation.total, 0);
  }, [nations]);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K+`;
    }
    return num.toString();
  };

  const stats = [
    { label: "Nations analysées", value: loading ? "..." : nations.length.toString(), icon: Globe },
    { label: "Médailles totales", value: loading ? "..." : formatNumber(totalMedals), icon: Medal },
    { label: "Disciplines", value: "46", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero */}
        <section className="border-b border-border py-16">
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gold/30 bg-gold/5">
                <Globe className="h-6 w-6 text-gold" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold md:text-4xl">
                  Analyse des Nations
                </h1>
                <p className="text-muted-foreground">
                  Performance et spécialisation olympique par pays
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center">
                  <stat.icon className="mx-auto h-5 w-5 text-gold mb-2" />
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="border-b border-border py-6">
          <div className="container">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une nation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Sport
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2">
                Période
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2">
                Type de médaille
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Rankings Table */}
        <section className="py-10">
          <div className="container">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Rang</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Nation</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-gold">Or</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-silver">Argent</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-bronze">Bronze</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-muted-foreground">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Spécialité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-gold" />
                            <p className="text-muted-foreground">Chargement des données depuis DBpedia...</p>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <p className="text-red-500 font-medium">Erreur lors du chargement</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                          </div>
                        </td>
                      </tr>
                    ) : nations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <p className="text-muted-foreground">Aucune nation trouvée</p>
                        </td>
                      </tr>
                    ) : (
                      (showAll ? nations : nations.slice(0, INITIAL_DISPLAY_COUNT)).map((nation) => (
                        <tr
                          key={nation.code}
                          className="border-b border-border last:border-0 transition-colors hover:bg-secondary/20 cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {nation.rank <= 3 ? (
                                <Trophy className={`h-4 w-4 ${nation.rank === 1 ? "text-gold" : nation.rank === 2 ? "text-silver" : "text-bronze"}`} />
                              ) : (
                                <span className="text-muted-foreground">{nation.rank}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                                {nation.code}
                              </div>
                              <span className="font-medium">{nation.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-gold">{nation.gold}</td>
                          <td className="px-6 py-4 text-center font-semibold text-silver">{nation.silver}</td>
                          <td className="px-6 py-4 text-center font-semibold text-bronze">{nation.bronze}</td>
                          <td className="px-6 py-4 text-center font-bold">{nation.total}</td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-muted-foreground">{nation.specialty}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Afficher plus */}
            {!loading && !error && nations.length > INITIAL_DISPLAY_COUNT && (
              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Afficher moins" : `Afficher plus (${nations.length - INITIAL_DISPLAY_COUNT} restants)`}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Analysis Cards */}
        <section className="border-t border-border py-16">
          <div className="container">
            <h2 className="font-display text-2xl font-bold mb-8">Analyses disponibles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 hover:border-gold/50 transition-colors cursor-pointer">
                <TrendingUp className="h-8 w-8 text-gold mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Évolution temporelle</h3>
                <p className="text-sm text-muted-foreground">
                  Suivez l'évolution des performances d'une nation au fil des éditions olympiques.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 hover:border-silver/50 transition-colors cursor-pointer">
                <Target className="h-8 w-8 text-silver mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Spécialisation sportive</h3>
                <p className="text-sm text-muted-foreground">
                  Identifiez les sports où chaque nation excelle et sa stratégie olympique.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 hover:border-bronze/50 transition-colors cursor-pointer">
                <Globe className="h-8 w-8 text-bronze mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">Comparaison nations</h3>
                <p className="text-sm text-muted-foreground">
                  Comparez deux nations sur leurs performances respectives par discipline.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Projet Web Sémantique — Analyse des Jeux Olympiques via DBpedia</p>
        </div>
      </footer>
    </div>
  );
};

export default Nations;
