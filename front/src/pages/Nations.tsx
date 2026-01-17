import { useState, useEffect, useMemo } from "react";
import { Globe, Medal, TrendingUp, Search, ChevronDown, Trophy, Target, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Type pour les données des nations
interface Nation {
  rank: number;
  name: string;
  code: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

// Type pour les éditions olympiques
interface OlympicsEdition {
  resource: string;
  year: number;
  hostCity: string;
  hostCountry: string;
  season: string; // "Summer" | "Winter"
}

// Données détaillées pour une édition (table des médailles)
interface EditionMedalRow {
  code: string;
  name: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

// Requête SPARQL placeholder - À REMPLACER par la vraie requête
const SPARQL_QUERY = `
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX dbp: <http://dbpedia.org/property/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?countryCode
       (MAX(?gold)   AS ?gold)
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
  BIND(IF(STRSTARTS(STR(?p), STR(dbp:gold)),   xsd:integer(?v), 0) AS ?gold)
  BIND(IF(STRSTARTS(STR(?p), STR(dbp:silver)), xsd:integer(?v), 0) AS ?silver)
  BIND(IF(STRSTARTS(STR(?p), STR(dbp:bronze)), xsd:integer(?v), 0) AS ?bronze)
}
GROUP BY ?countryCode
ORDER BY DESC(?gold)
`;

// Requête SPARQL des éditions olympiques (été + hiver)
const OLYMPICS_QUERY = `
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX dbp: <http://dbpedia.org/property/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?olympics ?year ?hostCity ?hostCountry ?season
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

// Traductions des noms de pays en anglais -> français (pour les éditions)
const HOST_COUNTRY_EN_TO_FR: Record<string, string> = {
  France: "France",
  Brazil: "Brésil",
  "South Korea": "Corée du Sud",
  Japan: "Japon",
  China: "Chine",
  Russia: "Russie",
  "Soviet Union": "URSS",
  "United States": "États-Unis",
  USA: "États-Unis",
  US: "États-Unis",
  Canada: "Canada",
  Italy: "Italie",
  Germany: "Allemagne",
  "West Germany": "Allemagne de l'Ouest",
  Mexico: "Mexique",
  Spain: "Espagne",
  Netherlands: "Pays-Bas",
  Switzerland: "Suisse",
  Norway: "Norvège",
  Sweden: "Suède",
  Greece: "Grèce",
  Australia: "Australie",
  Austria: "Autriche",
  Japanes: "Japon",
};

// Normalise la valeur de pays hôte provenant de DBpedia (codes IOC, noms anglais, valeurs manquantes)
const normalizeHostCountry = (
  hostCountryRaw: string | undefined,
  hostCity: string,
  year: number,
  season: string
): string => {
  const raw = (hostCountryRaw || "").toString().trim();

  // Traitement des cas spéciaux/vides
  if (!raw || raw === "-" || raw.toLowerCase() === "host nation") {
    // Heuristiques basées sur la ville
    const city = hostCity.toLowerCase();
    if (city.includes("calgary")) return "Canada"; // 1988 Hiver
    if (city.includes("salt lake city")) return "États-Unis"; // 2002 Hiver
    return raw || "-";
  }

  // Si c'est une URI, ne garder que le label final si possible
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    const last = raw.split("/").pop() || raw;
    // Tenter une conversion basique de code (ex: GBR)
    if (/^[A-Z]{2,3}$/.test(last)) {
      return getCountryName(last);
    }
    return decodeURIComponent(last).replace(/_/g, " ");
  }

  // Si c'est un code IOC en majuscules (ex: USA, GBR, GRE, URS, FRG, YUG...)
  if (/^[A-Z]{2,3}$/.test(raw)) {
    return getCountryName(raw);
  }

  // Tenter une traduction des libellés anglais courants
  if (HOST_COUNTRY_EN_TO_FR[raw]) return HOST_COUNTRY_EN_TO_FR[raw];

  // Dernier recours: retourner tel quel
  return raw;
};

// Mapping IOC -> Continent (simplifié pour KPI)
const IOC_TO_CONTINENT: Record<string, "Europe" | "Asie" | "Afrique" | "Amériques" | "Océanie"> = {
  USA: "Amériques", CAN: "Amériques", MEX: "Amériques", BRA: "Amériques", ARG: "Amériques", COL: "Amériques", CUB: "Amériques", JAM: "Amériques", PER: "Amériques", CHI: "Amériques", GUA: "Amériques", URU: "Amériques", VEN: "Amériques",
  FRA: "Europe", GER: "Europe", GBR: "Europe", ITA: "Europe", ESP: "Europe", NED: "Europe", SWE: "Europe", NOR: "Europe", SUI: "Europe", AUT: "Europe", BEL: "Europe", DEN: "Europe", FIN: "Europe", POL: "Europe", UKR: "Europe", CZE: "Europe", ROU: "Europe", GRE: "Europe", HUN: "Europe", POR: "Europe", TUR: "Europe", SRB: "Europe", CRO: "Europe",
  RUS: "Europe",
  CHN: "Asie", JPN: "Asie", KOR: "Asie", IND: "Asie", IRI: "Asie", KAZ: "Asie", UZB: "Asie", INA: "Asie", THA: "Asie", MAS: "Asie", TPE: "Asie", HKG: "Asie", SGP: "Asie", UAE: "Asie", QAT: "Asie", KUW: "Asie", KSA: "Asie",
  AUS: "Océanie", NZL: "Océanie", FIJ: "Océanie", VAN: "Océanie", SAM: "Océanie", TGA: "Océanie",
  RSA: "Afrique", MAR: "Afrique", EGY: "Afrique", ALG: "Afrique", TUN: "Afrique", KEN: "Afrique", ETH: "Afrique", NGR: "Afrique", CIV: "Afrique", GHA: "Afrique", SEN: "Afrique", ZIM: "Afrique", ZAM: "Afrique", RWA: "Afrique",
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

  // Construire la liste des nations à partir des résultats SPARQL
  const rawNations = bindings
    .filter((binding: any) => binding.countryCode?.value)
    .map((binding: any) => {
      const gold = parseInt(binding.gold?.value || "0", 10);
      const silver = parseInt(binding.silver?.value || "0", 10);
      const bronze = parseInt(binding.bronze?.value || "0", 10);
      const code = binding.countryCode?.value || "???";

      return {
        name: getCountryName(code),
        code: code.substring(0, 3).toUpperCase(),
        gold,
        silver,
        bronze,
        total: gold + silver + bronze,
      } as Omit<Nation, "rank">;
    });

  // Trier par nombre total décroissant
  rawNations.sort((a, b) => b.total - a.total);

  // Assigner les rangs après tri
  return rawNations.map((nation, index) => ({
    ...nation,
    rank: index + 1,
  }));
};

// Transformer les résultats des éditions olympiques
const transformOlympicsResults = (results: any): OlympicsEdition[] => {
  const bindings = results?.results?.bindings || [];
  return bindings.map((b: any) => {
    const resource = b.olympics?.value || "";
    const year = parseInt(b.year?.value || "0", 10);
    const hostCityRaw = b.hostCity?.value || "-";
    const hostCity = String(hostCityRaw).replace(/,\s*$/, "").trim();
    const hostCountryRaw = b.hostCountry?.value || "-";
    const hostCountryInput = typeof hostCountryRaw === "string" ? hostCountryRaw : String(hostCountryRaw);
    const season = b.season?.value || "";
    const hostCountry = normalizeHostCountry(hostCountryInput, hostCity, year, season);
    return { resource, year, hostCity, hostCountry, season };
  });
};

const INITIAL_DISPLAY_COUNT = 10;

const Nations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [nations, setNations] = useState<Nation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [medalFilter, setMedalFilter] = useState<"all" | "gold" | "silver" | "bronze">("all");
  const [olympics, setOlympics] = useState<OlympicsEdition[]>([]);
  const [olympicsLoading, setOlympicsLoading] = useState<boolean>(true);
  const [olympicsError, setOlympicsError] = useState<string | null>(null);
  const [olyYearFrom, setOlyYearFrom] = useState<number | "">("");
  const [olyYearTo, setOlyYearTo] = useState<number | "">("");
  const [olyCityQuery, setOlyCityQuery] = useState<string>("");
  const [olySeason, setOlySeason] = useState<"all" | "Summer" | "Winter">("all");

  // État du détail d'une édition
  const [editionOpen, setEditionOpen] = useState(false);
  const [editionMeta, setEditionMeta] = useState<{ year: number; season: string; hostCity: string; resource: string } | null>(null);
  const [editionRows, setEditionRows] = useState<EditionMedalRow[]>([]);
  const [editionLoading, setEditionLoading] = useState(false);
  const [editionError, setEditionError] = useState<string | null>(null);

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

  // Charger les éditions olympiques
  useEffect(() => {
    const fetchOlympics = async () => {
      setOlympicsLoading(true);
      setOlympicsError(null);
      try {
        const res = await executeSparqlQuery(OLYMPICS_QUERY);
        const transformed = transformOlympicsResults(res);
        setOlympics(transformed);
      } catch (err) {
        console.error("Erreur lors de la requête SPARQL (éditions)", err);
        setOlympicsError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setOlympicsLoading(false);
      }
    };
    fetchOlympics();
  }, []);

  // Construit la requête SPARQL pour une édition donnée (ressource DBpedia)
  const buildEditionMedalsQuery = (resourceUrl: string): string => `
PREFIX dbp: <http://dbpedia.org/property/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?countryCode
       (SUM(?gold)   AS ?goldMedals)
       (SUM(?silver) AS ?silverMedals)
       (SUM(?bronze) AS ?bronzeMedals)
WHERE {
  <${resourceUrl}> ?p ?v .

  FILTER(
       STRSTARTS(STR(?p), STR(dbp:gold))   ||
       STRSTARTS(STR(?p), STR(dbp:silver)) ||
       STRSTARTS(STR(?p), STR(dbp:bronze))
  )

  BIND(
    REPLACE(STR(?p), "^http://dbpedia.org/property/(gold|silver|bronze)", "") 
    AS ?countryCode
  )

  BIND(IF(STRSTARTS(STR(?p), STR(dbp:gold)),   xsd:integer(?v), 0) AS ?gold)
  BIND(IF(STRSTARTS(STR(?p), STR(dbp:silver)), xsd:integer(?v), 0) AS ?silver)
  BIND(IF(STRSTARTS(STR(?p), STR(dbp:bronze)), xsd:integer(?v), 0) AS ?bronze)
}
GROUP BY ?countryCode
ORDER BY DESC(?goldMedals)
`;

  const transformEditionMedalsResults = (results: any): EditionMedalRow[] => {
    const bindings = results?.results?.bindings || [];
    const rows: EditionMedalRow[] = bindings.map((b: any) => {
      const code = (b.countryCode?.value || "???").substring(0, 3).toUpperCase();
      const gold = parseInt(b.goldMedals?.value || "0", 10);
      const silver = parseInt(b.silverMedals?.value || "0", 10);
      const bronze = parseInt(b.bronzeMedals?.value || "0", 10);
      const name = getCountryName(code);
      return { code, name, gold, silver, bronze, total: gold + silver + bronze };
    });
    // Trier par total décroissant
    rows.sort((a, b) => b.total - a.total);
    return rows;
  };

  const handleEditionClick = async (ed: OlympicsEdition) => {
    setEditionOpen(true);
    setEditionMeta({ year: ed.year, season: ed.season, hostCity: ed.hostCity, resource: ed.resource });
    setEditionLoading(true);
    setEditionError(null);
    setEditionRows([]);
    try {
      const q = buildEditionMedalsQuery(ed.resource);
      const res = await executeSparqlQuery(q);
      const rows = transformEditionMedalsResults(res);
      setEditionRows(rows);
    } catch (err) {
      console.error("Erreur requête SPARQL (édition)", err);
      setEditionError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setEditionLoading(false);
    }
  };

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
  ];

  // Filtrer les nations selon la requête de recherche
  const displayedNations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    // Base list: either paginated or full list depending on showAll
    let list = q
      ? nations.filter((n) => n.name.toLowerCase().includes(q) || n.code.toLowerCase().includes(q))
      : (showAll ? nations : nations.slice(0, INITIAL_DISPLAY_COUNT));

    // Apply medal filter
    if (medalFilter === "gold") list = list.filter((n) => n.gold > 0);
    else if (medalFilter === "silver") list = list.filter((n) => n.silver > 0);
    else if (medalFilter === "bronze") list = list.filter((n) => n.bronze > 0);

    return list;
  }, [searchQuery, nations, showAll, medalFilter]);

  // KPI calculés une seule fois à partir de toutes les nations (indépendants de l'affichage)
  const { avgGold, avgSilver, avgBronze, medianTotal, bestByContinent } = useMemo(() => {
    const count = nations.length || 0;
    const sumGold = nations.reduce((a, n) => a + n.gold, 0);
    const sumSilver = nations.reduce((a, n) => a + n.silver, 0);
    const sumBronze = nations.reduce((a, n) => a + n.bronze, 0);
    const totals = nations.map((n) => n.total).sort((a, b) => a - b);
    const median = count === 0 ? 0 : (count % 2 === 1 ? totals[Math.floor(count / 2)] : Math.round((totals[count / 2 - 1] + totals[count / 2]) / 2));

    // Top par continent basé sur toutes les nations
    const tops: Record<string, { code: string; name: string; total: number }> = {};
    for (const n of nations) {
      const continent = IOC_TO_CONTINENT[n.code] as string | undefined;
      if (!continent) continue;
      const current = tops[continent];
      if (!current || n.total > current.total) {
        tops[continent] = { code: n.code, name: n.name, total: n.total };
      }
    }

    return {
      avgGold: count ? (sumGold / count) : 0,
      avgSilver: count ? (sumSilver / count) : 0,
      avgBronze: count ? (sumBronze / count) : 0,
      medianTotal: median,
      bestByContinent: tops,
    };
  }, [nations]);

  // Configuration d'affichage selon le filtre de médailles
  const isMedalFiltered = medalFilter !== "all";
  const columnCount = isMedalFiltered ? 2 : 6;
  const medalHeader = medalFilter === "gold" ? "Or" : medalFilter === "silver" ? "Argent" : "Bronze";
  const medalHeaderClass = medalFilter === "gold" ? "text-gold" : medalFilter === "silver" ? "text-silver" : "text-bronze";

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
            
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-4 mt-8 flex-wrap">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-card p-6 text-center w-72 md:w-80">
                  <stat.icon className="mx-auto h-5 w-5 text-gold mb-2" />
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* KPIs */}
            <div className="flex justify-center gap-4 mt-6 flex-wrap">
              <div className="rounded-lg border border-border bg-card p-6 text-center w-64">
                <p className="text-xs text-muted-foreground mb-1">Moyenne médailles d’or</p>
                <p className="font-display text-2xl font-bold text-gold">{avgGold.toFixed(1)}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center w-64">
                <p className="text-xs text-muted-foreground mb-1">Moyenne médailles d’argent</p>
                <p className="font-display text-2xl font-bold text-silver">{avgSilver.toFixed(1)}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center w-64">
                <p className="text-xs text-muted-foreground mb-1">Moyenne médailles de bronze</p>
                <p className="font-display text-2xl font-bold text-bronze">{avgBronze.toFixed(1)}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 text-center w-64">
                <p className="text-xs text-muted-foreground mb-1">Médiane (médailles totales)</p>
                <p className="font-display text-2xl font-bold">{medianTotal}</p>
              </div>
            </div>

            {/* Top par continent */}
            {Object.keys(bestByContinent).length > 0 && (
              <div className="mt-6">
                <h3 className="font-display text-lg font-semibold mb-3 text-center">Top par continent</h3>
                <div className="flex justify-center gap-4 w-full items-stretch">
                  {Object.entries(bestByContinent).map(([continent, info]) => (
                    <div key={continent} className="rounded-lg border border-border bg-card p-4 flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{continent}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-medium truncate" title={info.name}>{info.name}</span>
                        <span className="text-sm text-muted-foreground">{info.total} médailles</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              <div className="w-[200px]">
                <Select value={medalFilter} onValueChange={(v) => setMedalFilter(v as typeof medalFilter)}>
                  <SelectTrigger aria-label="Filtrer par type de médaille">
                    <SelectValue placeholder="Type de médaille" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes médailles</SelectItem>
                    <SelectItem value="gold">Or</SelectItem>
                    <SelectItem value="silver">Argent</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                      {isMedalFiltered ? (
                        <>
                          <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Nation</th>
                          <th className={`px-6 py-4 text-center text-sm font-medium ${medalHeaderClass}`}>{medalHeader}</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Rang</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Nation</th>
                          <th className="px-6 py-4 text-center text-sm font-medium text-gold">Or</th>
                          <th className="px-6 py-4 text-center text-sm font-medium text-silver">Argent</th>
                          <th className="px-6 py-4 text-center text-sm font-medium text-bronze">Bronze</th>
                          <th className="px-6 py-4 text-center text-sm font-medium text-muted-foreground">Total</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={columnCount} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-gold" />
                            <p className="text-muted-foreground">Chargement des données depuis DBpedia...</p>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={columnCount} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <p className="text-red-500 font-medium">Erreur lors du chargement</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                          </div>
                        </td>
                      </tr>
                    ) : nations.length === 0 ? (
                      <tr>
                        <td colSpan={columnCount} className="px-6 py-12 text-center">
                          <p className="text-muted-foreground">Aucune nation trouvée</p>
                        </td>
                      </tr>
                    ) : displayedNations.length === 0 && searchQuery.trim() ? (
                      <tr>
                        <td colSpan={columnCount} className="px-6 py-12 text-center">
                          <p className="text-muted-foreground">Aucun résultat de recherche</p>
                        </td>
                      </tr>
                    ) : (
                      displayedNations.map((nation) => (
                        <tr
                          key={nation.code}
                          className="border-b border-border last:border-0 transition-colors hover:bg-secondary/20 cursor-pointer"
                        >
                          {isMedalFiltered ? (
                            <>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                                    {nation.code}
                                  </div>
                                  <span className="font-medium">{nation.name}</span>
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-center font-semibold ${medalHeaderClass}`}>
                                {medalFilter === "gold" ? nation.gold : medalFilter === "silver" ? nation.silver : nation.bronze}
                              </td>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Afficher plus */}
            {!loading && !error && !searchQuery.trim() && medalFilter === "all" && nations.length > INITIAL_DISPLAY_COUNT && (
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

        {/* Éditions Olympiques */}
        <section className="py-10">
          <div className="container">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Éditions olympiques</h2>
              <span className="text-xs text-muted-foreground">Données: DBpedia</span>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">Cliquez sur une ligne pour afficher la table des médailles.</p>
            {/* Filtres éditions */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="w-[140px]">
                <Input
                  type="number"
                  placeholder="Année min"
                  value={olyYearFrom}
                  onChange={(e) => {
                    const v = e.target.value;
                    setOlyYearFrom(v === "" ? "" : parseInt(v, 10));
                  }}
                />
              </div>
              <div className="w-[140px]">
                <Input
                  type="number"
                  placeholder="Année max"
                  value={olyYearTo}
                  onChange={(e) => {
                    const v = e.target.value;
                    setOlyYearTo(v === "" ? "" : parseInt(v, 10));
                  }}
                />
              </div>
              <div className="min-w-[200px] flex-1">
                <Input
                  placeholder="Filtrer par ville…"
                  value={olyCityQuery}
                  onChange={(e) => setOlyCityQuery(e.target.value)}
                />
              </div>
              <div className="w-[200px]">
                <Select value={olySeason} onValueChange={(v) => setOlySeason(v as typeof olySeason)}>
                  <SelectTrigger aria-label="Saison">
                    <SelectValue placeholder="Saison" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes saisons</SelectItem>
                    <SelectItem value="Summer">Été</SelectItem>
                    <SelectItem value="Winter">Hiver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => { setOlyYearFrom(""); setOlyYearTo(""); setOlyCityQuery(""); setOlySeason("all"); }}>Réinitialiser</Button>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Année</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Saison</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Ville hôte</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Pays hôte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {olympicsLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-gold" />
                            <p className="text-muted-foreground">Chargement des éditions olympiques…</p>
                          </div>
                        </td>
                      </tr>
                    ) : olympicsError ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <p className="text-red-500 font-medium">{olympicsError}</p>
                        </td>
                      </tr>
                    ) : olympics.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <p className="text-muted-foreground">Aucune édition trouvée</p>
                        </td>
                      </tr>
                    ) : (
                      (olympics
                        .filter((e) => (olySeason === "all" ? true : e.season === olySeason))
                        .filter((e) => (olyCityQuery.trim() ? e.hostCity.toLowerCase().includes(olyCityQuery.trim().toLowerCase()) : true))
                        .filter((e) => (olyYearFrom !== "" ? e.year >= (olyYearFrom as number) : true))
                        .filter((e) => (olyYearTo !== "" ? e.year <= (olyYearTo as number) : true))
                      ).map((ed) => (
                        <tr
                          key={`${ed.year}-${ed.season}`}
                          className="border-b border-border last:border-0 cursor-pointer hover:bg-secondary/20"
                          onClick={() => handleEditionClick(ed)}
                        >
                          <td className="px-6 py-3">{ed.year || '-'}</td>
                          <td className="px-6 py-3">{ed.season}</td>
                          <td className="px-6 py-3">{ed.hostCity}</td>
                          <td className="px-6 py-3">{ed.hostCountry}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Détail d'une édition sélectionnée */}
        <Dialog open={editionOpen} onOpenChange={setEditionOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle>
                {editionMeta ? `Table des médailles — ${editionMeta.year} ${editionMeta.season === 'Summer' ? 'Été' : 'Hiver'} (${editionMeta.hostCity})` : 'Table des médailles'}
              </DialogTitle>
              {editionMeta && (
                <DialogDescription className="truncate">
                  Source: {editionMeta.resource}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="mt-2 max-h-[70vh] overflow-y-auto pr-1">
              {editionLoading ? (
                <div className="py-8 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold" />
                  <p className="mt-2 text-sm text-muted-foreground">Chargement…</p>
                </div>
              ) : editionError ? (
                <div className="py-6 text-center text-red-500">{editionError}</div>
              ) : editionRows.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">Aucune donnée trouvée</div>
              ) : (
                <div className="rounded-md border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-secondary/30">
                          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nation</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gold">Or</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-silver">Argent</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-bronze">Bronze</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editionRows.map((r) => (
                          <tr key={r.code} className="border-b border-border last:border-0">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[10px] font-medium">
                                  {r.code}
                                </div>
                                <span className="font-medium">{r.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-gold">{r.gold}</td>
                            <td className="px-4 py-3 text-center font-semibold text-silver">{r.silver}</td>
                            <td className="px-4 py-3 text-center font-semibold text-bronze">{r.bronze}</td>
                            <td className="px-4 py-3 text-center font-bold">{r.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
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
