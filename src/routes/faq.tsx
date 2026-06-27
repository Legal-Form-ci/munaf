import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Questions fréquentes — MuNAF" },
      { name: "description", content: "Toutes les réponses sur MuNAF : adhésion, cotisations, carence de 3 mois, suspension, déclaration de décès et versement NSIA." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <Page />
    </PublicLayout>
  ),
});

const SECTIONS = [
  {
    title: "MuNAF & NSIA",
    items: [
      { q: "MuNAF est-elle une compagnie d'assurance ?", a: "Non. MuNAF est une mutuelle numérique qui collecte les cotisations mensuelles et les reverse à NSIA Assurances Côte d'Ivoire. C'est NSIA qui porte la garantie décès et qui verse l'assistance aux familles." },
      { q: "Qui verse réellement le capital décès ?", a: "C'est NSIA Assurances Côte d'Ivoire. MuNAF transmet le dossier validé à NSIA via API, NSIA déclenche le versement Mobile Money au bénéficiaire (ou à l'association pour les membres affiliés à une association)." },
      { q: "MuNAF prélève-t-elle une commission sur l'assistance ?", a: "Non, jamais. MuNAF se rémunère uniquement via la majoration de 30 % intégrée dans la cotisation mensuelle. Aucun prélèvement sur les capitaux versés par NSIA." },
    ],
  },
  {
    title: "Adhésion",
    items: [
      { q: "Qui peut adhérer à MuNAF ?", a: "Toute personne âgée de 18 à 70 ans résidant dans la zone pilote de Daloa et ses sous-préfectures. Les associations, tontines, mutuelles villageoises, coopératives, organisations religieuses et syndicats peuvent également s'inscrire comme compte organisation." },
      { q: "Quels documents fournir ?", a: "Une pièce d'identité scannée (CNI ou passeport — transmise à NSIA), une photo d'identité, votre numéro de téléphone Mobile Money, et la désignation de 2 ayants droit (1 principal, 1 secondaire)." },
      { q: "Combien coûte l'adhésion ?", a: "Les frais d'adhésion sont de 2 000 FCFA, payés une seule fois et inclus dans votre premier paiement. Ensuite, vous payez uniquement votre cotisation mensuelle à partir de 271 FCFA / mois." },
      { q: "Comment fonctionne une association sur MuNAF ?", a: "L'association crée un compte organisation (compte principal), puis enregistre ses membres un par un ou via un import CSV/Excel. En cas de décès, NSIA verse l'assistance sur le Mobile Money de l'association, qui retient 10 % pour son fonctionnement et reverse 90 % à la famille." },
    ],
  },
  {
    title: "Cotisations & paiements",
    items: [
      { q: "Comment payer ma cotisation ?", a: "Via Wave, Orange Money, MTN Mobile Money ou Moov Money depuis votre téléphone, ou en espèces auprès d'un délégué de votre quartier qui enregistre le paiement sur la plateforme." },
      { q: "Quand dois-je payer ?", a: "Chaque mois, avant la fin du mois. Vous recevez un rappel SMS 5 jours avant l'échéance." },
      { q: "Que se passe-t-il si je rate un mois ?", a: "Après 1 mois sans paiement : rappels SMS automatiques. Après 2 mois : avertissement urgent. Après 3 mois consécutifs : votre compte est suspendu automatiquement." },
      { q: "Comment réactiver un compte suspendu ?", a: "Vous devez régler tous les mois impayés. Une nouvelle période de carence de 3 mois repart à compter de la régularisation." },
    ],
  },
  {
    title: "Carence & couverture",
    items: [
      { q: "Qu'est-ce que la période de carence ?", a: "C'est un délai obligatoire de 3 mois à compter de votre inscription, pendant lequel la garantie NSIA n'est pas encore active. Vous cotisez normalement mais aucune assistance ne peut être versée." },
      { q: "Quels sont les statuts d'un membre ?", a: "EN CARENCE (3 premiers mois), ACTIF (couvert par NSIA), SUSPENDU (3 mois d'impayés consécutifs), RÉSILIÉ (sortie volontaire ou administrative)." },
      { q: "Comment savoir si je suis couvert ?", a: "Connectez-vous à votre espace membre ou utilisez le portail public de vérification avec votre matricule ou votre numéro de téléphone." },
    ],
  },
  {
    title: "Procédure décès",
    items: [
      { q: "Qui peut déclarer un décès ?", a: "L'ayant droit du défunt, un délégué local de la zone, l'administrateur de l'association à laquelle le défunt appartenait, ou un administrateur MuNAF." },
      { q: "Quels documents fournir ?", a: "Acte de décès, pièce d'identité du défunt, pièce d'identité de l'ayant droit bénéficiaire, photo du défunt, et numéro Mobile Money du bénéficiaire pour le versement (membre individuel)." },
      { q: "Combien de temps pour recevoir le capital ?", a: "Moins de 72 heures après validation du dossier par NSIA. Le versement est effectué directement sur Mobile Money." },
    ],
  },
  {
    title: "Sécurité",
    items: [
      { q: "Comment me connecter à la plateforme ?", a: "Les membres et délégués se connectent avec leur numéro de téléphone et un code à usage unique (OTP) reçu par SMS. Les administrateurs ont en plus un mot de passe fort." },
      { q: "Mes données sont-elles protégées ?", a: "Oui. Toutes les actions sur la plateforme sont journalisées. L'historique de paiement est immuable (aucune modification possible après enregistrement). Les documents décès sont archivés au minimum 10 ans." },
    ],
  },
];

function Page() {
  const [open, setOpen] = useState<string | null>("0-0");
  return (
    <>
      <section className="bg-brand-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">FAQ</div>
          <h1 className="font-display font-bold text-4xl md:text-5xl">Vos questions, nos réponses.</h1>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        {SECTIONS.map((sec, si) => (
          <div key={sec.title}>
            <h2 className="font-display font-bold text-xl mb-4 text-primary">{sec.title}</h2>
            <div className="space-y-2">
              {sec.items.map((item, i) => {
                const key = `${si}-${i}`;
                const isOpen = open === key;
                return (
                  <div key={key} className="rounded-xl border bg-card overflow-hidden">
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-muted/40"
                    >
                      <span className="font-medium">{item.q}</span>
                      <ChevronDown className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
