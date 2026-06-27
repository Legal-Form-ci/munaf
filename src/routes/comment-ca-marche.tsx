import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { UserPlus, Wallet, HeartHandshake, FileText, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => ({
    meta: [
      { title: "Comment ça marche — MuNAF" },
      { name: "description", content: "Comprendre en 3 étapes le fonctionnement de MuNAF : inscription, cotisation mensuelle Mobile Money, 3 mois de carence, puis assistance décès versée par NSIA en 72h." },
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
          <p className="mt-5 text-white/75 text-lg max-w-2xl">
            MuNAF collecte vos cotisations mensuelles et les reverse à NSIA Assurances, qui porte la
            garantie décès et verse l'assistance à vos bénéficiaires.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        {[
          {
            n: 1, icon: UserPlus, t: "L'inscription",
            d: "Vous adhérez en quelques minutes depuis votre téléphone, auprès d'un délégué MuNAF dans votre quartier, ou via votre association. Pas de visite médicale, pas de paperasse. Vous choisissez votre formule parmi 10 niveaux de capital (100 000 à 1 000 000 FCFA) et désignez vos ayants droit.",
            l: [
              "Identité (CNI ou passeport, scannée — transmise à NSIA)",
              "Photo d'identité obligatoire",
              "Numéro de téléphone Mobile Money",
              "1 ayant droit principal + 1 secondaire",
              "Frais d'adhésion uniques : 2 000 FCFA (inclus dans le 1er paiement)",
              "Matricule unique généré automatiquement",
            ],
          },
          {
            n: 2, icon: Wallet, t: "La cotisation mensuelle",
            d: "Chaque mois, avant la fin du mois, vous payez votre cotisation via Wave, Orange Money, MTN Mobile Money ou Moov Money depuis votre téléphone. Vous pouvez aussi payer en espèces auprès de votre délégué de quartier qui enregistre le paiement sur la plateforme. Un reçu vous est envoyé instantanément par SMS.",
            l: [
              "Paiement Mobile Money en 30 secondes",
              "Paiement en espèces via délégué possible",
              "Reçu SMS automatique + notification",
              "Rappel SMS 5 jours avant l'échéance",
              "Historique de paiement immuable",
            ],
          },
          {
            n: 3, icon: HeartHandshake, t: "L'assistance décès (NSIA)",
            d: "Après 3 mois de carence, votre couverture NSIA est active. En cas de décès, vos ayants droit, votre délégué de quartier ou votre association déclarent l'événement sur la plateforme. MuNAF transmet le dossier à NSIA via API, NSIA valide, et l'assistance est versée en moins de 72 heures sur le Mobile Money du bénéficiaire (ou de l'association).",
            l: [
              "Déclaration en ligne, par délégué ou par l'association",
              "Vérification automatique des cotisations",
              "Validation par NSIA Assurances Côte d'Ivoire",
              "Versement Mobile Money sous 72 h",
              "Notifications SMS à chaque étape",
            ],
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
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display font-bold text-2xl mb-8 text-center">Les statuts de votre compte</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { c: "bg-warning/15 text-warning border-warning/30", t: "EN CARENCE", d: "Les 3 premiers mois. Vous cotisez mais n'êtes pas encore couvert par NSIA." },
              { c: "bg-success/15 text-success border-success/30", t: "ACTIF", d: "Carence passée, cotisations à jour. Vous êtes couvert par NSIA." },
              { c: "bg-destructive/15 text-destructive border-destructive/30", t: "SUSPENDU", d: "3 mois consécutifs d'impayés. Couverture suspendue jusqu'à régularisation." },
              { c: "bg-muted text-muted-foreground border-border", t: "RÉSILIÉ", d: "Sortie volontaire ou résiliation administrative." },
            ].map((s) => (
              <div key={s.t} className="rounded-2xl bg-card border p-5">
                <div className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${s.c}`}>{s.t}</div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: Clock, t: "Carence de 3 mois", d: "Délai obligatoire à compter de votre inscription. Aucune assistance NSIA ne peut être versée pendant cette période. Vous cotisez normalement." },
          { icon: FileText, t: "Documents décès", d: "Acte de décès, pièce d'identité du défunt, pièce d'identité de l'ayant droit, photo du défunt. Tout est uploadé depuis la plateforme." },
          { icon: ShieldCheck, t: "Sécurité", d: "Connexion par numéro de téléphone + code SMS à usage unique (OTP). Les administrateurs ont en plus un mot de passe fort." },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl bg-card border p-6">
            <c.icon className="size-7 text-gold mb-3" />
            <div className="font-display font-bold">{c.t}</div>
            <p className="text-sm text-muted-foreground mt-2">{c.d}</p>
          </div>
        ))}
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <h2 className="font-display font-bold text-3xl">Prêt à adhérer ?</h2>
        <Link to="/formules" className="mt-6 inline-flex px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
          Voir les 10 formules
        </Link>
      </section>
    </>
  );
}
