import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { FORMULES_PUBLIC, FRAIS_ADHESION, formatFcfa } from "@/lib/mock-data";
import { Check, Clock, ShieldCheck, Info } from "lucide-react";

export const Route = createFileRoute("/formules")({
  head: () => ({
    meta: [
      { title: "Formules & cotisations — MuNAF" },
      { name: "description", content: "10 formules MuNAF, de 100 000 à 1 000 000 FCFA de capital décès NSIA. Cotisations à partir de 271 FCFA / mois. Frais d'adhésion uniques 2 000 FCFA." },
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
          <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Formules & cotisations</div>
          <h1 className="font-display font-bold text-4xl md:text-5xl">10 formules. Une seule promesse.</h1>
          <p className="mt-5 text-white/75 text-lg max-w-2xl">
            Aucun frais caché. Le capital décès indiqué est versé intégralement par <strong>NSIA Assurances</strong>
            à vos ayants droit. Frais d'adhésion uniques de {formatFcfa(FRAIS_ADHESION)}, inclus dans votre
            premier paiement.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {FORMULES_PUBLIC.map((f, i) => {
            const popular = i === 4;
            const monthly = Math.round(f.prime / 12);
            return (
              <div
                key={f.capital}
                className={`rounded-2xl border bg-card p-5 flex flex-col ${popular ? "ring-2 ring-gold shadow-xl lg:scale-105 z-10" : ""}`}
              >
                {popular && (
                  <div className="inline-block px-2.5 py-1 rounded-full bg-gold text-primary text-[10px] font-bold uppercase tracking-wide mb-3 self-start">
                    La plus choisie
                  </div>
                )}
                <div className="font-display font-bold text-sm">{f.nom}</div>
                <div className="mt-4">
                  <div className="text-2xl font-display font-bold text-primary">{formatFcfa(f.capital)}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">Capital décès versé par NSIA</div>
                </div>
                <div className="my-5 pt-5 border-t">
                  <div className="text-2xl font-display font-bold">{formatFcfa(monthly)}</div>
                  <div className="text-xs text-muted-foreground">par mois</div>
                </div>
                <ul className="space-y-1.5 text-xs flex-1">
                  {[
                    "Carence 3 mois",
                    "Versement NSIA sous 72h",
                    "Mobile Money",
                    "Reçus SMS auto.",
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <Check className="size-3.5 text-success shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/connexion"
                  className={`mt-5 block text-center px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    popular ? "bg-gold text-primary hover:bg-gold/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  Adhérer
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border-2 border-gold/40 bg-card p-6 flex gap-4 max-w-4xl mx-auto">
          <Info className="size-6 text-gold shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            La cotisation mensuelle inclut une majoration de 30 % qui finance le fonctionnement de MuNAF
            (équipe, délégués, infrastructure, communication). <strong>MuNAF ne prélève aucune commission sur
            l'assistance versée par NSIA.</strong>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            { icon: Clock, t: "Carence de 3 mois", d: "Délai à compter de votre inscription avant que la garantie NSIA ne soit active. Aucune assistance ne peut être versée pendant cette période." },
            { icon: ShieldCheck, t: "Conditions d'éligibilité", d: "Être âgé de 18 à 70 ans. Résider dans la zone pilote de Daloa et sous-préfectures. Aucune visite médicale exigée." },
            { icon: Check, t: "Modalités de paiement", d: "Mensuel via Wave, Orange Money, MTN, Moov, ou paiement en espèces auprès d'un délégué de votre quartier." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl bg-card border p-6">
              <c.icon className="size-7 text-gold mb-3" />
              <div className="font-display font-bold">{c.t}</div>
              <p className="text-sm text-muted-foreground mt-2">{c.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
