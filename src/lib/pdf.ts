// Génération PDF côté client : carte membre + attestation
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

const NAVY = "#1B2A6B";
const GOLD = "#C9A227";
const PUB_BASE = typeof window !== "undefined" ? window.location.origin : "https://munaf.ci";

const formatFcfa = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(n || 0) + " FCFA";

const FORMULE_CAPITAL: Record<string, number> = {
  F1: 100000, F2: 200000, F3: 300000, F4: 400000, F5: 500000,
  F6: 600000, F7: 700000, F8: 800000, F9: 900000, F10: 1000000,
  F100: 100000, F200: 200000, F300: 300000, F500: 500000, F1000: 1000000,
};

async function toDataURL(url?: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const r = await fetch(url);
    const b = await r.blob();
    return await new Promise((res) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.readAsDataURL(b);
    });
  } catch { return null; }
}

/** Carte membre — format CR80 paysage (85.6 × 53.98 mm) */
export async function generateCarteMembre(m: any) {
  const doc = new jsPDF({ unit: "mm", format: [85.6, 54], orientation: "landscape" });
  // Fond
  doc.setFillColor(NAVY); doc.rect(0, 0, 85.6, 54, "F");
  doc.setFillColor(GOLD); doc.rect(0, 0, 85.6, 8, "F");

  // Header
  doc.setTextColor("#fff"); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("MuNAF", 4, 5.6);
  doc.setFontSize(5); doc.setFont("helvetica", "normal");
  doc.text("MUTUELLE NUMÉRIQUE D'ASSISTANCE FAMILIALE", 13, 5.6);
  doc.setFontSize(4.5); doc.text("Partenaire assureur : NSIA Assurances CI", 60, 5.6);

  // Photo
  const photo = await toDataURL(m.photo_url);
  doc.setDrawColor(GOLD); doc.setLineWidth(0.4);
  doc.rect(4, 12, 18, 22);
  if (photo) {
    try { doc.addImage(photo, "JPEG", 4.2, 12.2, 17.6, 21.6); } catch {}
  } else {
    doc.setTextColor("#888"); doc.setFontSize(4); doc.text("Photo", 10, 23);
  }

  // Identité
  doc.setTextColor("#fff");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text(`${(m.prenom || "").toUpperCase()}`, 25, 14);
  doc.text(`${(m.nom || "").toUpperCase()}`, 25, 18.5);

  doc.setFont("helvetica", "normal"); doc.setFontSize(6.5);
  doc.setTextColor(GOLD);
  doc.text("MATRICULE", 25, 23);
  doc.setTextColor("#fff"); doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
  doc.text(m.matricule || "—", 25, 27);

  doc.setFont("helvetica", "normal"); doc.setFontSize(5.5);
  doc.setTextColor(GOLD); doc.text("FORMULE", 25, 31);
  doc.setTextColor("#fff"); doc.setFontSize(7);
  const cap = FORMULE_CAPITAL[m.formule] ?? 0;
  doc.text(`${m.formule || "—"} · ${formatFcfa(cap)}`, 25, 34);

  doc.setFontSize(5); doc.setTextColor("#cfd6f0");
  doc.text(`Quartier : ${m.quartier || "—"}`, 25, 38);
  doc.text(`Adhésion : ${m.date_adhesion ? new Date(m.date_adhesion).toLocaleDateString("fr-FR") : "—"}`, 25, 41);
  doc.text(`Statut : ${m.status || "—"}`, 25, 44);

  // QR
  const qrPayload = `${PUB_BASE}/verification?q=${encodeURIComponent(m.matricule || "")}`;
  try {
    const qr = await QRCode.toDataURL(qrPayload, { margin: 0, width: 160, color: { dark: "#1B2A6B", light: "#ffffff" } });
    doc.setFillColor("#fff"); doc.rect(66, 12, 16, 16, "F");
    doc.addImage(qr, "PNG", 66.5, 12.5, 15, 15);
    doc.setFontSize(4); doc.setTextColor("#cfd6f0");
    doc.text("Scanner pour vérifier", 66, 30);
  } catch {}

  // Footer
  doc.setFontSize(4); doc.setTextColor(GOLD);
  doc.text("Zone pilote : Daloa, Côte d'Ivoire · munaf.ci", 4, 51);
  doc.setTextColor("#cfd6f0");
  doc.text("Carte non transférable · valable tant que le compte est en règle", 4, 53);

  doc.save(`carte-munaf-${m.matricule || "membre"}.pdf`);
}

/** Attestation d'adhésion — A4 portrait */
export async function generateAttestation(m: any) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = 210, H = 297;

  // Bordure dorée
  doc.setDrawColor(GOLD); doc.setLineWidth(1);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.3); doc.rect(10, 10, W - 20, H - 20);

  // En-tête
  doc.setFillColor(NAVY); doc.rect(10, 10, W - 20, 28, "F");
  doc.setTextColor("#fff"); doc.setFont("helvetica", "bold"); doc.setFontSize(22);
  doc.text("MuNAF", 18, 25);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text("Mutuelle Numérique d'Assistance Familiale", 18, 31);
  doc.setTextColor(GOLD); doc.setFontSize(8);
  doc.text("Partenaire assureur : NSIA Assurances Côte d'Ivoire", 18, 35);

  // Numéro
  doc.setTextColor("#fff"); doc.setFontSize(8);
  doc.text(`N° ${m.matricule || "—"}`, W - 60, 25);
  doc.text(`Émise le ${new Date().toLocaleDateString("fr-FR")}`, W - 60, 30);

  // Titre
  doc.setTextColor(NAVY); doc.setFont("helvetica", "bold"); doc.setFontSize(20);
  doc.text("ATTESTATION D'ADHÉSION", W / 2, 60, { align: "center" });
  doc.setDrawColor(GOLD); doc.setLineWidth(0.6);
  doc.line(W / 2 - 35, 64, W / 2 + 35, 64);

  // Corps
  doc.setTextColor("#222"); doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  const cap = FORMULE_CAPITAL[m.formule] ?? 0;
  const lines = [
    "",
    "La Mutuelle Numérique d'Assistance Familiale (MuNAF), en partenariat avec",
    "NSIA Assurances Côte d'Ivoire, certifie par la présente que :",
    "",
  ];
  let y = 80;
  lines.forEach((l) => { doc.text(l, 22, y); y += 6; });

  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(NAVY);
  doc.text(`${(m.prenom || "")} ${(m.nom || "")}`.toUpperCase(), W / 2, y + 4, { align: "center" });
  y += 14;

  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor("#222");
  const detail = [
    `est régulièrement inscrit(e) en qualité de membre de la MuNAF sous le matricule`,
    `${m.matricule || "—"}, résidant à ${m.quartier || "—"}, ${m.ville || "Daloa"} (Côte d'Ivoire),`,
    `depuis le ${m.date_adhesion ? new Date(m.date_adhesion).toLocaleDateString("fr-FR") : "—"}.`,
    "",
    `Formule souscrite : ${m.formule || "—"}`,
    `Capital décès garanti par NSIA : ${formatFcfa(cap)}`,
    `Statut actuel du compte : ${(m.status || "—").toUpperCase()}`,
    "",
    "Cette attestation est délivrée à la demande de l'intéressé(e) pour servir et",
    "valoir ce que de droit. La validité du présent document peut être vérifiée à",
    "tout moment via le portail public de vérification de MuNAF.",
  ];
  detail.forEach((l) => { doc.text(l, 22, y); y += 6.2; });

  // QR
  try {
    const qr = await QRCode.toDataURL(
      `${PUB_BASE}/verification?q=${encodeURIComponent(m.matricule || "")}`,
      { margin: 0, width: 220, color: { dark: NAVY, light: "#ffffff" } },
    );
    doc.addImage(qr, "PNG", W - 55, y + 10, 30, 30);
    doc.setFontSize(7); doc.setTextColor("#666");
    doc.text("Vérification en ligne", W - 53, y + 44);
  } catch {}

  // Signature
  y = H - 60;
  doc.setDrawColor("#999"); doc.setLineWidth(0.2);
  doc.line(22, y, 80, y);
  doc.setFontSize(9); doc.setTextColor("#444");
  doc.text("La Direction MuNAF — Daloa", 22, y + 5);
  doc.text(`Fait à Daloa, le ${new Date().toLocaleDateString("fr-FR")}`, 22, y + 11);

  // Footer
  doc.setFillColor(NAVY); doc.rect(10, H - 22, W - 20, 12, "F");
  doc.setTextColor(GOLD); doc.setFontSize(7);
  doc.text("MuNAF · Zone pilote : Daloa · contact@munaf.ci · munaf.ci", W / 2, H - 15, { align: "center" });
  doc.setTextColor("#cfd6f0");
  doc.text("Document généré automatiquement — authentifiable par QR code", W / 2, H - 12, { align: "center" });

  doc.save(`attestation-munaf-${m.matricule || "membre"}.pdf`);
}
