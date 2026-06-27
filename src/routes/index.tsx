import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { FORMULES_PUBLIC, FRAIS_ADHESION, formatFcfa } from "@/lib/mock-data";
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
  Building2,
  Info,
} from "lucide-react";
import logo from "@/assets/munaf-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MuNAF — Mutuelle Numérique d'Assistance Familiale" },
      { name: "description", content: "Parce qu'un décès ne devrait jamais ruiner une famille. MuNAF mutualise vos cotisations mensuelles via Mobile Money et reverse à NSIA Assurances. Zone pilote : Daloa." },
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
              Zone pilote · Daloa · Partenaire NSIA Assurances
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              Parce qu'un décès ne devrait <span className="text-gold">jamais ruiner</span> une famille.
            </h1>
            <p className="mt-6 text-white/75 text-lg max-w-xl">
              MuNAF est une mutuelle numérique d'assistance familiale. Nous collectons vos cotisations
              mensuelles via Mobile Money et les reversons à <strong>NSIA Assurances</strong>, qui porte la garantie
              décès et verse l'assistance à vos bénéficiaires.
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
              <Stat value={totalMembers.toLocaleString("fr-FR")} label="Membres" />
              <Stat value={`${dossiersTotal}`} label="Dossiers traités" />
              <Stat value="72h" label="Délai assistance" />
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

      {/* Clarification MuNAF n'est PAS une assurance */}
      <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="rounded-2xl border-2 border-gold/40 bg-card p-6 flex gap-4 shadow-lg">
          <Info className="size-6 text-gold shrink-0 mt-0.5" />
          <div>
            <div className="font-display font-bold">MuNAF n'est pas une compagnie d'assurance.</div>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              MuNAF ne vend pas d'assurance. Nous collectons les cotisations mensuelles, les reversons
              annuellement à <strong>NSIA Assurances Côte d'Ivoire</strong>, et gérons toute la traçabilité numérique
              pour le compte des membres. C'est NSIA qui porte la garantie décès et verse l'assistance.
            </p>
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
            { icon: UserPlus, t: "S'inscrire", d: "Inscription en ligne, via un délégué de quartier ou via votre association. Choisissez parmi 10 formules de 100 000 à 1 000 000 FCFA de capital." },
            { icon: Wallet, t: "Cotiser chaque mois", d: "À partir de 271 FCFA / mois via Wave, Orange Money, MTN ou Moov Money. Reçu instantané par SMS." },
            { icon: HeartHandshake, t: "Être protégé par NSIA", d: "Après 3 mois de carence, votre couverture est active. En cas de décès, NSIA verse l'assistance à vos bénéficiaires en moins de 72 heures." },
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

      {/* Membre individuel vs Association */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Pour qui ?</div>
            <h2 className="font-display font-bold text-3xl md:text-4xl">Particuliers et associations</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-card p-7">
              <Users className="size-9 text-primary mb-4" />
              <h3 className="font-display font-bold text-xl">Membre individuel</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Vous vous inscrivez directement sur MuNAF. Vous choisissez votre capital décès, cotisez chaque
                mois et désignez vos bénéficiaires. En cas de décès, NSIA verse le capital directement à vos
                bénéficiaires sur leur compte Mobile Money.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-7">
              <Building2 className="size-9 text-gold mb-4" />
              <h3 className="font-display font-bold text-xl">Association ou mutuelle communautaire</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Tontines, mutuelles villageoises, coopératives, associations religieuses ou syndicats : créez
                un compte organisation et gérez tous vos membres en un seul tableau de bord. En cas de décès,
                NSIA verse sur le compte de l'association, qui reverse 90 % à la famille (10 % de
                fonctionnement). <strong>MuNAF ne prélève aucune commission.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formules preview */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Nos formules</div>
          <h2 className="font-display font-bold text-3xl md:text-4xl">10 formules, à partir de 271 FCFA/mois</h2>
          <p className="text-muted-foreground mt-3">
            Frais d'adhésion uniques de {formatFcfa(FRAIS_ADHESION)}, inclus dans votre premier paiement.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {FORMULES_PUBLIC.map((f, i) => (
            <div
              key={f.capital}
              className={`rounded-2xl border bg-card p-5 ${i === 4 ? "ring-2 ring-gold shadow-lg" : ""}`}
            >
              {i === 4 && (
                <div className="inline-block px-2 py-0.5 rounded-full bg-gold text-primary text-[10px] font-bold uppercase tracking-wide mb-2">
                  Populaire
                </div>
              )}
              <div className="font-display font-bold text-sm">{f.nom}</div>
              <div className="mt-3 text-xl font-display font-bold text-primary">{formatFcfa(f.capital)}</div>
              <div className="text-xs text-muted-foreground">Capital décès NSIA</div>
              <div className="mt-4 text-sm">
                <span className="font-semibold">{formatFcfa(Math.round(f.prime / 12))}</span>
                <span className="text-muted-foreground"> /mois</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/formules" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
            Voir le détail des 10 formules <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Pourquoi */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Pourquoi MuNAF</div>
            <h2 className="font-display font-bold text-3xl md:text-4xl">La prévoyance, à l'échelle de la communauté.</h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Fini les collectes d'urgence dans le quartier. MuNAF mutualise les cotisations de toute une
              communauté et les confie à NSIA pour garantir une assistance digne et rapide à chaque famille
              endeuillée.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Cotisations 100 % Mobile Money — Wave, Orange, MTN, Moov",
                "Paiement en espèces possible auprès d'un délégué de quartier",
                "Garantie portée par NSIA Assurances Côte d'Ivoire",
                "Capital versé en 72h aux ayants droit",
                "Transparence totale : suivez vos paiements en temps réel",
                "Aucune commission MuNAF sur les assistances versées",
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
              { icon: Smartphone, t: "100 % Mobile", d: "Conçu pour smartphones, fonctionne en faible connexion." },
              { icon: Users, t: "Communautaire", d: "Associations, tontines et délégués locaux." },
              { icon: ShieldCheck, t: "Sécurisé", d: "Connexion par téléphone + OTP SMS, traçabilité totale." },
              { icon: HeartHandshake, t: "Solidaire", d: "Aucun bénéfice n'est pris sur les capitaux NSIA." },
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
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-brand-gradient text-white p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gold/5" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-3xl md:text-4xl">Rejoignez la communauté MuNAF</h2>
            <p className="text-white/75 mt-3">
              À partir de 271 FCFA / mois, protégez les vôtres avec la garantie NSIA.
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
