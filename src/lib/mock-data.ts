// Deterministic mock data generator for MuNAF demo
// Zone pilote : Daloa, région du Haut-Sassandra, Côte d'Ivoire
// 1000 membres fictifs — sera remplacé à la connexion de Lovable Cloud.

export type MemberStatus = "actif" | "carence" | "suspendu" | "expire" | "resilie" | "decede";
export type DossierStatus =
  | "declare"
  | "verification"
  | "valide"
  | "transmis"
  | "assistance_versee"
  | "cloture";
export type Formule = 100000 | 200000 | 300000 | 400000 | 500000 | 600000 | 700000 | 800000 | 900000 | 1000000;

// Quartiers urbains de Daloa + sous-préfectures rurales du Haut-Sassandra
export const QUARTIERS = [
  "Tazibouo",
  "Lobia",
  "Garage",
  "Abattoir",
  "Soleil",
  "Orly",
  "Kennedy",
  "Marais",
  "Commerce",
  "Piscine",
  "Tagbasso",
  "Dioulabougou",
  "Huberson",
  "Évêché",
  "Belleville",
  "Gbeuli",
  "Baoulé",
  // Sous-préfectures
  "Gboguhé",
  "Zaïbo",
  "Gonaté",
  "Bédiala",
  "Gadouan",
] as const;
export type Quartier = (typeof QUARTIERS)[number];

const PRENOMS_M = [
  "Konan","Koffi","Yao","Kouassi","Kouadio","Kouamé","N'Guessan","Aboubacar","Ibrahim","Moussa",
  "Mamadou","Souleymane","Ousmane","Adama","Sékou","Lassina","Drissa","Issa","Bakary","Vakaba",
  "Sylvain","Désiré","Hervé","Serge","Patrice","Émile","Jonas","Aristide","Bertin","Cyrille",
];
const PRENOMS_F = [
  "Akissi","Affoué","Adjoua","Amenan","Aya","Adjo","Affoua","Mariam","Aminata","Fatoumata",
  "Awa","Salimata","Kadiatou","Hawa","Massandjé","Korotoumou","Djénéba","Rokia","Bintou","Nafissatou",
  "Adèle","Brigitte","Clarisse","Estelle","Sylvie","Marlène","Pélagie","Reine","Solange","Yolande",
];
const NOMS = [
  "Bamba","Coulibaly","Touré","Ouattara","Bakayoko","Doumbia","Diaby","Konaté","Traoré","Kéita",
  "Diomandé","Soro","Cissé","Diakité","Fofana","Sanogo","Berté","Camara","Diallo","Konan",
  "Koffi","Yao","Kouassi","Kouadio","N'Guessan","Goué","Gnamké","Tapé","Zadi","Bohoussou",
  "Gnagne","Ziri","Béhi","Goré","Irié","Loukou","Niamké","Tia","Djédjé","Gbagbo",
];
const PROFESSIONS = [
  "Cultivateur de cacao","Cultivatrice","Commerçant·e","Couturière","Mécanicien","Chauffeur de taxi",
  "Maraîcher","Vendeuse marché","Coiffeuse","Menuisier","Maçon","Tailleur","Enseignant·e",
  "Infirmier·ère","Sage-femme","Pisteur cacao","Éleveur","Pêcheur","Chargeur (gare routière)",
  "Boutiquier","Restauratrice","Réparateur moto","Boulanger","Tisserande","Apprenti·e",
  "Fonctionnaire","Agent de santé communautaire","Pasteur","Imam","Étudiant·e",
];
const ASSOCIATIONS = [
  "Mutuelle des Cultivateurs de Tazibouo",
  "Association des Femmes du Marché Central",
  "Fraternité Évêché-Belleville",
  "Coopérative Agricole de Gonaté",
  "Union des Jeunes de Lobia",
  "Mutuelle des Transporteurs Daloa-Gare",
  "Association Ressortissants de Bédiala",
  "Solidarité Quartier Soleil",
  "Mutuelle des Couturières de Commerce",
  "Confrérie de Tagbasso",
  "Association des Pisteurs de Gboguhé",
  "Groupement Féminin de Zaïbo",
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function dateMinus(days: number): string {
  const d = new Date("2026-06-25T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

// Téléphones Côte d'Ivoire : préfixes opérateurs 07 (Orange), 05 (MTN), 01 (Moov)
function ivorianPhone(rng: () => number): string {
  const op = pick(rng, ["07", "05", "01"]);
  const a = String(Math.floor(rng() * 90) + 10);
  const b = String(Math.floor(rng() * 90) + 10);
  const c = String(Math.floor(rng() * 90) + 10);
  const d = String(Math.floor(rng() * 90) + 10);
  return `+225 ${op} ${a} ${b} ${c} ${d}`;
}

export interface Member {
  id: string;
  matricule: string;
  photo: string;
  nom: string;
  prenom: string;
  sexe: "M" | "F";
  age: number;
  telephone: string;
  profession: string;
  quartier: Quartier;
  region: "Daloa";
  association: string;
  formule: Formule;
  primeAnnuelle: number;
  dateInscription: string;
  dateFinCarence: string;
  joursCarenceRestants: number;
  status: MemberStatus;
  cotisationsAJour: boolean;
  totalCotise: number;
  ayantDroitPrincipal: string;
  ayantDroitSecondaire: string;
}

export interface Dossier {
  id: string;
  numero: string;
  memberId: string;
  memberNom: string;
  memberPhoto: string;
  formule: Formule;
  dateDeces: string;
  declareLe: string;
  declarePar: string;
  quartier: Quartier;
  status: DossierStatus;
  montantAssistance: number;
  beneficiaire: string;
}

export interface Cotisation {
  id: string;
  date: string;
  memberId: string;
  memberNom: string;
  memberPhoto: string;
  montant: number;
  mode: "Wave" | "Orange Money" | "MTN Money" | "Moov Money" | "Manuel";
  reference: string;
  statut: "réussi" | "en_attente" | "échoué";
}

const FORMULES: { capital: Formule; prime: number; nom: string }[] = [
  { capital: 100000, prime: 3252, nom: "F1 — Essentielle" },
  { capital: 200000, prime: 6504, nom: "F2 — Familiale" },
  { capital: 300000, prime: 9756, nom: "F3 — Sérénité" },
  { capital: 400000, prime: 12996, nom: "F4 — Équilibre" },
  { capital: 500000, prime: 16248, nom: "F5 — Confort" },
  { capital: 600000, prime: 19500, nom: "F6 — Prestige" },
  { capital: 700000, prime: 22752, nom: "F7 — Excellence" },
  { capital: 800000, prime: 26004, nom: "F8 — Premium" },
  { capital: 900000, prime: 29256, nom: "F9 — Élite" },
  { capital: 1000000, prime: 32496, nom: "F10 — Patrimoine" },
];

export const FORMULES_PUBLIC = FORMULES;
export const FRAIS_ADHESION = 2000;


let _members: Member[] | null = null;
let _dossiers: Dossier[] | null = null;
let _cotisations: Cotisation[] | null = null;

export function getMembers(): Member[] {
  if (_members) return _members;
  const rng = mulberry32(42);
  const arr: Member[] = [];
  for (let i = 0; i < 1000; i++) {
    const sexe: "M" | "F" = rng() < 0.55 ? "M" : "F";
    const prenom = pick(rng, sexe === "M" ? PRENOMS_M : PRENOMS_F);
    const nom = pick(rng, NOMS);
    const quartier = pick(rng, QUARTIERS);
    const formuleObj = pick(rng, FORMULES);
    const joursDepuisInscription = Math.floor(rng() * 900) + 1;
    const dateInscription = dateMinus(joursDepuisInscription);
    const dateFinCarence = dateMinus(joursDepuisInscription - 90);
    const joursCarenceRestants = 90 - joursDepuisInscription;

    const r = rng();
    let status: MemberStatus;
    if (joursDepuisInscription < 90 && r < 0.9) status = "carence";
    else if (r < 0.6) status = "actif";
    else if (r < 0.72) status = "actif";
    else if (r < 0.82) status = "carence";
    else if (r < 0.89) status = "suspendu";
    else if (r < 0.94) status = "expire";
    else if (r < 0.97) status = "resilie";
    else status = "decede";

    const moisCotises = Math.min(Math.floor(joursDepuisInscription / 30), 24);
    const totalCotise = Math.round((formuleObj.prime / 12) * moisCotises);

    const photoId = (i % 70) + 1;
    const photo = `https://i.pravatar.cc/200?img=${photoId}`;

    arr.push({
      id: `m-${i + 1}`,
      matricule: `MNF-DLA-${String(i + 1).padStart(5, "0")}`,
      photo,
      nom,
      prenom,
      sexe,
      age: 22 + Math.floor(rng() * 50),
      telephone: ivorianPhone(rng),
      profession: pick(rng, PROFESSIONS),
      quartier,
      region: "Daloa",
      association: pick(rng, ASSOCIATIONS),
      formule: formuleObj.capital,
      primeAnnuelle: formuleObj.prime,
      dateInscription,
      dateFinCarence,
      joursCarenceRestants,
      status,
      cotisationsAJour: rng() > 0.18,
      totalCotise,
      ayantDroitPrincipal: `${pick(rng, sexe === "M" ? PRENOMS_F : PRENOMS_M)} ${nom} (conjoint·e)`,
      ayantDroitSecondaire: `${pick(rng, PRENOMS_M.concat(PRENOMS_F))} ${nom} (enfant)`,
    });
  }
  _members = arr;
  return arr;
}

export function getDossiers(): Dossier[] {
  if (_dossiers) return _dossiers;
  const members = getMembers();
  const deceased = members.filter((m) => m.status === "decede");
  const rng = mulberry32(7);
  const statuts: DossierStatus[] = ["declare","verification","valide","transmis","assistance_versee","cloture"];
  const arr: Dossier[] = deceased.map((m, i) => {
    const status = statuts[Math.floor(rng() * statuts.length)];
    const jours = Math.floor(rng() * 120);
    return {
      id: `d-${i + 1}`,
      numero: `DEC-DLA-2026-${String(i + 1).padStart(4, "0")}`,
      memberId: m.id,
      memberNom: `${m.prenom} ${m.nom}`,
      memberPhoto: m.photo,
      formule: m.formule,
      dateDeces: dateMinus(jours + 5),
      declareLe: dateMinus(jours),
      declarePar: pick(rng, ["Délégué de quartier","Ayant droit","Chef de famille","Imam","Pasteur"]),
      quartier: m.quartier,
      status,
      montantAssistance: m.formule,
      beneficiaire: m.ayantDroitPrincipal,
    };
  });
  _dossiers = arr;
  return arr;
}

export function getCotisations(): Cotisation[] {
  if (_cotisations) return _cotisations;
  const members = getMembers();
  const rng = mulberry32(99);
  const modes: Cotisation["mode"][] = ["Wave","Orange Money","MTN Money","Moov Money","Manuel"];
  const arr: Cotisation[] = [];
  for (let i = 0; i < 350; i++) {
    const m = members[Math.floor(rng() * members.length)];
    const r = rng();
    const statut: Cotisation["statut"] = r < 0.86 ? "réussi" : r < 0.95 ? "en_attente" : "échoué";
    arr.push({
      id: `c-${i + 1}`,
      date: dateMinus(Math.floor(rng() * 60)),
      memberId: m.id,
      memberNom: `${m.prenom} ${m.nom}`,
      memberPhoto: m.photo,
      montant: Math.round(m.primeAnnuelle / 12),
      mode: pick(rng, modes),
      reference: `TXN${String(1000000 + i).slice(1)}`,
      statut,
    });
  }
  arr.sort((a, b) => b.date.localeCompare(a.date));
  _cotisations = arr;
  return arr;
}

export function getStats() {
  const members = getMembers();
  const dossiers = getDossiers();
  const cotisations = getCotisations();
  const cotisationsCollectees = cotisations
    .filter((c) => c.statut === "réussi")
    .reduce((s, c) => s + c.montant, 0);
  const cotisationsEnAttente = cotisations
    .filter((c) => c.statut === "en_attente")
    .reduce((s, c) => s + c.montant, 0);
  const assistancesVersees = dossiers
    .filter((d) => d.status === "assistance_versee" || d.status === "cloture")
    .reduce((s, d) => s + d.montantAssistance, 0);

  const byStatus = (s: MemberStatus) => members.filter((m) => m.status === s).length;
  const byQuartier = QUARTIERS.map((q) => ({
    quartier: q,
    count: members.filter((m) => m.quartier === q).length,
  }));

  return {
    totalMembers: members.length,
    actifs: byStatus("actif"),
    carence: byStatus("carence"),
    suspendus: byStatus("suspendu"),
    expires: byStatus("expire"),
    resilies: byStatus("resilie"),
    decedes: byStatus("decede"),
    cotisationsCollectees,
    cotisationsEnAttente,
    dossiersTotal: dossiers.length,
    dossiersEnCours: dossiers.filter((d) => !["assistance_versee","cloture"].includes(d.status)).length,
    assistancesVersees,
    byQuartier,
    // Compat
    byRegion: byQuartier.map((b) => ({ region: b.quartier, count: b.count })),
  };
}

export function formatFcfa(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export const STATUS_LABEL: Record<MemberStatus, string> = {
  actif: "Actif",
  carence: "En carence",
  suspendu: "Suspendu",
  expire: "Expiré",
  resilie: "Résilié",
  decede: "Décédé",
};

export const DOSSIER_LABEL: Record<DossierStatus, string> = {
  declare: "Déclaré",
  verification: "En vérification",
  valide: "Validé",
  transmis: "Transmis assureur",
  assistance_versee: "Assistance versée",
  cloture: "Clôturé",
};
