import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { UserPlus, Wallet, HeartHandshake, FileText, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche — MuNAF" },
      { name: "description", content: "Comprendre en 3 étapes le fonctionnement de la mutuelle MuNAF : inscription, cotisation, assistance décès." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <Page />
    </PublicLayout>
  ),
});

function Page() {
  return (
    <>
      <section className="bg-brand-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Le fonctionnement</div>
          <h1 className="font-display font-bold text-4xl md:text-5xl">Comment MuNAF protège votre famille.</h1>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        {[
          {
            n: 1, icon: UserPlus, t: "L'inscription",
            d: "Vous adhérez en quelques minutes depuis votre téléphone, ou auprès d'un délégué MuNAF dans votre quartier. Pas de visite médicale. Pas de paperasse. Vous choisissez votre formule (de 100 000 à 1 000 000 FCFA de capital) et désignez vos ayants droit.",
            l: ["Identité (CNI, passeport ou attestation)", "Numéro de téléphone Mobile Money", "Désignation des ayants droit", "Choix de la formule"],
          },
          {
            n: 2, icon: Wallet, t: "La cotisation",
            d: "Chaque mois, vous payez votre cotisation via Wave, Orange Money, MTN Money ou Moov Money. Vous pouvez aussi payer en espèces auprès de votre délégué de quartier. Un reçu vous est envoyé instantanément par SMS.",
            l: ["Paiement Mobile Money en 30 secondes", "Reçu SMS automatique", "Rappel automatique avant échéance", "Suivi en temps réel dans votre espace membre"],
          },
          {
            n: 3, icon: HeartHandshake, t: "L'assistance décès",
            d: "Après une période de carence de 90 jours, votre famille est couverte. En cas de décès, vos ayants droit ou le délégué de votre quartier déclarent l'événement. MuNAF vérifie le dossier, l'assureur partenaire valide, et le capital est versé en moins de 72 heures.",
            l: ["Déclaration en ligne ou via délégué", "Vérification automatique des cotisations", "Validation par l'assureur partenaire CIMA", "Paiement Mobile Money sous 72h"],
          },
        ].map((s) => (
          <div key={s.n} className="grid md:grid-cols-[auto_1fr] gap-6">
            <div className="size-16 shrink-0 rounded-2xl bg-gold-gradient text-primary font-display font-bold text-2xl flex items-center justify-center">
              {s.n}
            </div>
            <div>
              <s.icon className="size-7 text-primary mb-3" />
              <h2 className="font-display font-bold text-2xl">{s.t}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{s.d}</p>
              <ul className="mt-5 grid sm:grid-cols-2 gap-2.5">
                {s.l.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-muted/40 py-16">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            { icon: Clock, t: "Période de carence", d: "90 jours après votre inscription. Cette période protège la mutualité contre les adhésions opportunistes." },
            { icon: FileText, t: "Documents décès", d: "Acte de décès, pièce d'identité du défunt, pièce d'identité de l'ayant droit. C'est tout." },
            { icon: HeartHandshake, t: "Bénéficiaires", d: "Conjoint·e, enfants, parents ou toute personne désignée à l'inscription." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl bg-card border p-5">
              <c.icon className="size-7 text-gold mb-3" />
              <div className="font-display font-bold">{c.t}</div>
              <p className="text-sm text-muted-foreground mt-2">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display font-bold text-3xl">Prêt à adhérer ?</h2>
        <Link to="/formules" className="mt-6 inline-flex px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
          Voir les formules
        </Link>
      </section>
    </>
  );
}
