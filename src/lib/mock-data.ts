// Deterministic mock data generator for MuNAF demo (1000 members)
// All data is fictitious — to be removed once Lovable Cloud is connected.

export type MemberStatus = "actif" | "carence" | "suspendu" | "expire" | "resilie" | "decede";
export type DossierStatus =
  | "declare"
  | "verification"
  | "valide"
  | "transmis"
  | "assistance_versee"
  | "cloture";
export type Formule = 100000 | 200000 | 300000 | 500000 | 1000000;
export type Region =
  | "Dakar"
  | "Thiès"
  | "Saint-Louis"
  | "Diourbel"
  | "Kaolack"
  | "Ziguinchor"
  | "Tambacounda"
  | "Louga"
  | "Fatick"
  | "Matam";

const PRENOMS_M = ["Mamadou","Ibrahima","Ousmane","Moussa","Cheikh","Abdoulaye","Modou","Aliou","Babacar","Pape","Lamine","Souleymane","Amadou","Demba","Bocar","Saliou","Ndiaga","Serigne","Assane","El Hadji"];
const PRENOMS_F = ["Awa","Fatou","Aminata","Mariama","Aïssatou","Ndèye","Khady","Bineta","Rokhaya","Coumba","Astou","Sokhna","Adji","Mame","Diarra","Yacine","Maguette","Penda","Anta","Salimata"];
const NOMS = ["Diop","Ndiaye","Fall","Sow","Ba","Sarr","Faye","Diallo","Mbaye","Sy","Gueye","Cissé","Sène","Thiam","Niang","Kane","Diagne","Camara","Touré","Dieng","Sakho","Lo","Ndoye","Wade"];
const PROFESSIONS = ["Commerçant","Agriculteur","Enseignant","Couturière","Mécanicien","Chauffeur","Infirmière","Pêcheur","Maçon","Coiffeuse","Eleveur","Restauratrice","Tailleur","Vendeuse","Menuisier","Artisan","Fonctionnaire","Étudiant","Sage-femme","Boulanger"];
const VILLAGES: Record<Region, string[]> = {
  Dakar: ["Yoff","Ouakam","Pikine","Guédiawaye","Parcelles","Médina","Liberté"],
  Thiès: ["Mbour","Tivaouane","Joal","Khombole","Pout","Notto"],
  "Saint-Louis": ["Richard-Toll","Dagana","Podor","Sor","Ross-Béthio"],
  Diourbel: ["Touba","Mbacké","Bambey","Ndindy"],
  Kaolack: ["Nioro","Guinguinéo","Kaffrine","Médina Sabakh"],
  Ziguinchor: ["Bignona","Oussouye","Cap Skirring","Diouloulou"],
  Tambacounda: ["Bakel","Goudiry","Kédougou","Kidira"],
  Louga: ["Kébémer","Linguère","Dahra","Sakal"],
  Fatick: ["Foundiougne","Gossas","Sokone","Passy"],
  Matam: ["Kanel","Ranérou","Ourossogui","Thilogne"],
};
const REGIONS = Object.keys(VILLAGES) as Region[];
const ASSOCIATIONS = ["Mutuelle Touba Solidarité","Association des Ressortissants de Pikine","Coopérative Agricole de Mbour","Mutuelle Sainte-Famille","Confrérie de Tivaouane","Association Villageoise de Bambey","Groupement des Pêcheurs de Joal","Union des Femmes de Kaolack","Cercle des Anciens de Saint-Louis","Solidarité Bignona"];

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
  village: string;
  region: Region;
  association: string;
  formule: Formule;
  primeAnnuelle: number;
  dateInscription: string;
  dateFinCarence: string;
  joursCarenceRestants: number; // negative if finished
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
  region: Region;
  village: string;
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

const FORMULES: { capital: Formule; prime: number }[] = [
  { capital: 100000, prime: 2500 },
  { capital: 200000, prime: 5000 },
  { capital: 300000, prime: 7500 },
  { capital: 500000, prime: 12500 },
  { capital: 1000000, prime: 25000 },
];

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
    const region = pick(rng, REGIONS);
    const village = pick(rng, VILLAGES[region]);
    const formuleObj = pick(rng, FORMULES);
    const joursDepuisInscription = Math.floor(rng() * 900) + 1;
    const dateInscription = dateMinus(joursDepuisInscription);
    const dateFinCarence = dateMinus(joursDepuisInscription - 90);
    const joursCarenceRestants = 90 - joursDepuisInscription;

    // Status distribution
    const r = rng();
    let status: MemberStatus;
    if (joursDepuisInscription < 90 && r < 0.85) status = "carence";
    else if (r < 0.62) status = "actif";
    else if (r < 0.72) status = "actif";
    else if (r < 0.82) status = "carence";
    else if (r < 0.88) status = "suspendu";
    else if (r < 0.93) status = "expire";
    else if (r < 0.96) status = "resilie";
    else status = "decede";

    const moisCotises = Math.min(Math.floor(joursDepuisInscription / 30), 24);
    const totalCotise = Math.round((formuleObj.prime / 12) * moisCotises);

    // Photo: use deterministic pravatar
    const photoId = (i % 70) + 1;
    const photo = `https://i.pravatar.cc/200?img=${photoId}`;

    arr.push({
      id: `m-${i + 1}`,
      matricule: `MNF-${String(2024).slice(2)}-${String(i + 1).padStart(5, "0")}`,
      photo,
      nom,
      prenom,
      sexe,
      age: 22 + Math.floor(rng() * 50),
      telephone: `+221 ${77 + Math.floor(rng() * 3)} ${String(Math.floor(rng() * 900) + 100)} ${String(Math.floor(rng() * 90) + 10)} ${String(Math.floor(rng() * 90) + 10)}`,
      profession: pick(rng, PROFESSIONS),
      village,
      region,
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
      numero: `DEC-2026-${String(i + 1).padStart(4, "0")}`,
      memberId: m.id,
      memberNom: `${m.prenom} ${m.nom}`,
      memberPhoto: m.photo,
      formule: m.formule,
      dateDeces: dateMinus(jours + 5),
      declareLe: dateMinus(jours),
      declarePar: pick(rng, ["Délégué local","Ayant droit","Administrateur"]),
      region: m.region,
      village: m.village,
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
  const byRegion = REGIONS.map((r) => ({
    region: r,
    count: members.filter((m) => m.region === r).length,
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
    byRegion,
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
