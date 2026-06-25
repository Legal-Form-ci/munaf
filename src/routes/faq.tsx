import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Questions fréquentes — MuNAF" },
      { name: "description", content: "Toutes les réponses sur l'adhésion, les cotisations, la carence, la suspension et la procédure décès MuNAF." },
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
    title: "Adhésion",
    items: [
      { q: "Qui peut adhérer à MuNAF ?", a: "Toute personne âgée de 18 à 70 ans résidant à Daloa ou dans les sous-préfectures de la zone pilote (Gboguhé, Zaïbo, Gonaté, Bédiala, Gadouan)." },
      { q: "Quels documents fournir ?", a: "Une pièce d'identité (CNI, passeport, attestation), votre numéro de téléphone Mobile Money et la désignation de vos ayants droit." },
      { q: "Combien coûte l'adhésion ?", a: "L'adhésion est gratuite. Vous payez uniquement votre cotisation mensuelle à partir de 209 FCFA / mois." },
    ],
  },
  {
    title: "Cotisations & paiements",
    items: [
      { q: "Comment payer ma cotisation ?", a: "Via Wave, Orange Money, MTN Money, Moov Money depuis votre téléphone, ou en espèces auprès d'un délégué de votre quartier." },
      { q: "Que se passe-t-il si je rate un mois ?", a: "Vous recevez un rappel SMS. Au bout de 60 jours d'impayé, votre compte passe en statut suspendu jusqu'à régularisation." },
      { q: "Puis-je payer en avance ?", a: "Oui, vous pouvez régler trimestriellement, semestriellement ou annuellement. C'est même recommandé pour éviter les oublis." },
    ],
  },
  {
    title: "Carence & couverture",
    items: [
      { q: "Qu'est-ce que la période de carence ?", a: "C'est un délai de 90 jours après votre inscription pendant lequel la garantie n'est pas encore active. Elle protège la mutualité." },
      { q: "Comment savoir si je suis couvert ?", a: "Connectez-vous à votre espace membre ou utilisez le portail public de vérification avec votre matricule." },
    ],
  },
  {
    title: "Procédure décès",
    items: [
      { q: "Comment déclarer un décès ?", a: "Depuis l'espace membre, depuis l'espace délégué de votre quartier, ou en appelant le standard MuNAF." },
      { q: "Quels documents fournir ?", a: "Acte de décès, pièce d'identité du défunt, pièce d'identité de l'ayant droit bénéficiaire." },
      { q: "Combien de temps pour recevoir le capital ?", a: "Moins de 72 heures après validation du dossier par l'assureur partenaire CIMA." },
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
