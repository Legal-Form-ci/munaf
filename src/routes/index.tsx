import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { FORMULES_PUBLIC, formatFcfa } from "@/lib/mock-data";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck,
  HeartHandshake,
  Smartphone,
  Users,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Wallet,
  Sparkles,
} from "lucide-react";
import logo from "@/assets/munaf-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MuNAF — Mutuelle Numérique d'Assistance Familiale" },
      { name: "description", content: "Parce qu'un décès ne devrait jamais ruiner une famille. Adhérez à la mutuelle numérique de la zone pilote de Daloa." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <HomePage />
    </PublicLayout>
  ),
});

function HomePage() {
  const { data: stats } = useQuery({
    queryKey: ["stats-publiques"],
    queryFn: async () => {
      const { data } = await supabase.rpc("stats_publiques");
      const r: any = Array.isArray(data) ? data[0] : data;
      return {
        totalMembers: Number(r?.total_membres ?? 0),
        dossiersTotal: Number(r?.total_dossiers ?? 0),
      };
    },
  });
  const totalMembers = stats?.totalMembers ?? 0;
  const dossiersTotal = stats?.dossiersTotal ?? 0;
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-gradient text-white">
        <div className="absolute -right-32 -top-32 size-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -left-32 -bottom-32 size-96 rounded-full bg-gold/5 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-medium mb-6">
              <Sparkles className="size-3.5" />
              Zone pilote · Daloa, Haut-Sassandra
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              Parce qu'un décès ne devrait <span className="text-gold">jamais ruiner</span> une famille.
            </h1>
            <p className="mt-6 text-white/75 text-lg max-w-xl">
              MuNAF est la première mutuelle numérique d'assistance familiale de Côte d'Ivoire.
              Cotisez chaque mois via Mobile Money, et protégez vos proches avec un capital décès versé
              en moins de 72 heures.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/formules"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gold text-primary font-semibold hover:bg-gold/90 transition-colors"
              >
                Devenir membre <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/verification"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur border border-white/20 font-medium"
              >
                <ShieldCheck className="size-4" /> Vérifier un membre
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <Stat value={stats.totalMembers.toLocaleString("fr-FR")} label="Membres" />
              <Stat value={`${stats.dossiersTotal}`} label="Dossiers traités" />
              <Stat value="72h" label="Délai paiement" />
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/20 rounded-full blur-3xl" />
              <img src={logo} alt="" className="relative size-[420px] object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Comment ça marche</div>
          <h2 className="font-display font-bold text-3xl md:text-4xl">3 étapes pour protéger votre famille</h2>
          <p className="text-muted-foreground mt-3">Un système simple, transparent et accessible à tous les habitants de Daloa.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: UserPlus, t: "S'inscrire", d: "Adhérez en 5 minutes depuis votre téléphone ou auprès d'un délégué de votre quartier. Choisissez la formule adaptée à votre famille." },
            { icon: Wallet, t: "Cotiser", d: "Payez votre cotisation mensuelle via Wave, Orange Money, MTN ou Moov Money. Reçu instantané par SMS." },
            { icon: HeartHandshake, t: "Être protégé", d: "Après 90 jours de carence, vos ayants droit reçoivent un capital décès en moins de 72 heures." },
          ].map((s, i) => (
            <div key={s.t} className="relative rounded-2xl border bg-card p-6 hover:shadow-lg transition-shadow">
              <div className="absolute -top-3 -left-3 size-9 rounded-full bg-gold text-primary font-display font-bold flex items-center justify-center text-sm shadow-md">
                {i + 1}
              </div>
              <s.icon className="size-8 text-primary mb-4" />
              <h3 className="font-display font-bold text-lg">{s.t}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formules preview */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Nos formules</div>
            <h2 className="font-display font-bold text-3xl md:text-4xl">Une protection adaptée à chaque famille</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FORMULES_PUBLIC.map((f, i) => (
              <div
                key={f.capital}
                className={`rounded-2xl border bg-card p-5 ${i === 2 ? "ring-2 ring-gold shadow-lg" : ""}`}
              >
                {i === 2 && (
                  <div className="inline-block px-2 py-0.5 rounded-full bg-gold text-primary text-[10px] font-bold uppercase tracking-wide mb-2">
                    Populaire
                  </div>
                )}
                <div className="font-display font-bold">{f.nom}</div>
                <div className="mt-3 text-2xl font-display font-bold text-primary">{formatFcfa(f.capital)}</div>
                <div className="text-xs text-muted-foreground">Capital décès</div>
                <div className="mt-4 text-sm">
                  <span className="font-semibold">{formatFcfa(f.prime / 12)}</span>
                  <span className="text-muted-foreground"> /mois</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/formules" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              Voir le détail des formules <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pourquoi */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Pourquoi MuNAF</div>
            <h2 className="font-display font-bold text-3xl md:text-4xl">Une assurance pensée pour nous, par nous.</h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Fini les collectes d'urgence dans le quartier. MuNAF mutualise les cotisations de toute une
              communauté pour garantir une assistance digne et rapide à chaque famille endeuillée.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Cotisations 100% Mobile Money — pas besoin de compte bancaire",
                "Délégués de quartier pour vous accompagner",
                "Capital versé en 72h aux ayants droit",
                "Transparence totale : suivez vos paiements en temps réel",
                "Partenariat avec des assureurs agréés CIMA",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Smartphone, t: "100% Mobile", d: "Conçu pour smartphones, fonctionne en faible connexion." },
              { icon: Users, t: "Communautaire", d: "Géré avec les associations et délégués locaux." },
              { icon: ShieldCheck, t: "Sécurisé", d: "Authentification OTP, traçabilité totale des paiements." },
              { icon: HeartHandshake, t: "Solidaire", d: "Aucun bénéfice n'est pris sur les capitaux versés." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border bg-card p-5">
                <c.icon className="size-7 text-gold mb-3" />
                <div className="font-display font-bold">{c.t}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-brand-gradient text-white p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gold/5" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl">Rejoignez la communauté MuNAF</h2>
            <p className="text-white/75 mt-3">
              À partir de 209 FCFA / mois, protégez les vôtres pour toujours.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/formules" className="px-6 py-3.5 rounded-xl bg-gold text-primary font-semibold hover:bg-gold/90">
                Choisir ma formule
              </Link>
              <Link to="/contact" className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 font-medium">
                Devenir délégué
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display font-bold text-2xl md:text-3xl text-gold">{value}</div>
      <div className="text-xs text-white/60 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}
