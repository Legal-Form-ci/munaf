import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { FORMULES_PUBLIC, formatFcfa } from "@/lib/mock-data";
import { Check, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/formules")({
  head: () => ({
    meta: [
      { title: "Formules & cotisations — MuNAF" },
      { name: "description", content: "Découvrez les 5 formules MuNAF, de 100 000 à 1 000 000 FCFA de capital décès. Cotisations à partir de 209 FCFA / mois." },
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
          <h1 className="font-display font-bold text-4xl md:text-5xl">Choisissez la protection adaptée à votre famille.</h1>
          <p className="mt-5 text-white/75 text-lg max-w-2xl">
            5 formules transparentes. Aucun frais caché. Le capital indiqué est versé intégralement à vos ayants droit.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {FORMULES_PUBLIC.map((f, i) => {
            const popular = i === 2;
            return (
              <div
                key={f.capital}
                className={`rounded-2xl border bg-card p-6 flex flex-col ${popular ? "ring-2 ring-gold shadow-xl lg:scale-105 z-10" : ""}`}
              >
                {popular && (
                  <div className="inline-block px-2.5 py-1 rounded-full bg-gold text-primary text-[10px] font-bold uppercase tracking-wide mb-3 self-start">
                    La plus choisie
                  </div>
                )}
                <div className="font-display font-bold text-lg">{f.nom}</div>
                <div className="mt-4">
                  <div className="text-3xl font-display font-bold text-primary">{formatFcfa(f.capital)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Capital décès versé</div>
                </div>
                <div className="my-5 pt-5 border-t">
                  <div className="text-2xl font-display font-bold">
                    {formatFcfa(Math.round(f.prime / 12))}
                  </div>
                  <div className="text-xs text-muted-foreground">par mois</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ou {formatFcfa(f.prime)} / an
                  </div>
                </div>
                <ul className="space-y-2 text-sm flex-1">
                  {[
                    "Carence 90 jours",
                    "Paiement sous 72h",
                    "Mobile Money",
                    "Reçus SMS auto.",
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <Check className="size-4 text-success shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/connexion"
                  className={`mt-6 block text-center px-4 py-2.5 rounded-lg text-sm font-semibold ${
                    popular ? "bg-gold text-primary hover:bg-gold/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  Adhérer
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            { icon: Clock, t: "Carence de 90 jours", d: "Délai à compter de votre inscription avant que la garantie ne soit active. Aucune assistance ne peut être versée pendant cette période." },
            { icon: ShieldCheck, t: "Conditions d'éligibilité", d: "Être âgé de 18 à 70 ans. Résider en zone pilote (Daloa et environs). Aucune visite médicale exigée." },
            { icon: Check, t: "Modalités de paiement", d: "Mensuel, trimestriel ou annuel via Wave, Orange Money, MTN, Moov ou auprès d'un délégué local." },
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
