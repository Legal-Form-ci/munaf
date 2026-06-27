import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Target, Eye, Users, Shield, Building2, HandCoins } from "lucide-react";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — MuNAF" },
      { name: "description", content: "MuNAF est une mutuelle numérique d'assistance familiale, partenaire de NSIA Assurances Côte d'Ivoire. Zone pilote : Daloa." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <AProposPage />
    </PublicLayout>
  ),
});

function AProposPage() {
  return (
    <>
      <section className="bg-brand-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">À propos de MuNAF</div>
          <h1 className="font-display font-bold text-4xl md:text-5xl">Mutualiser la prévoyance familiale, du quartier à NSIA.</h1>
          <p className="mt-5 text-white/75 text-lg max-w-2xl">
            MuNAF — Mutuelle Numérique d'Assistance Familiale — est une plateforme communautaire qui permet
            à des personnes et à des associations de cotiser chaque mois pour être couvertes en cas de décès,
            grâce à un partenariat avec <strong>NSIA Assurances Côte d'Ivoire</strong>.
          </p>
        </div>
      </section>

      {/* Ce que MuNAF est / n'est pas */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border-2 border-success/30 bg-success/5 p-6">
          <div className="text-success text-xs uppercase tracking-widest font-bold mb-3">Ce que MuNAF est</div>
          <ul className="space-y-2.5 text-sm">
            <li>• Une plateforme numérique communautaire</li>
            <li>• Un collecteur de cotisations mensuelles (Mobile Money & espèces)</li>
            <li>• Un gestionnaire de la traçabilité et des dossiers décès</li>
            <li>• Un pont entre les membres et NSIA Assurances</li>
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-6">
          <div className="text-destructive text-xs uppercase tracking-widest font-bold mb-3">Ce que MuNAF n'est PAS</div>
          <ul className="space-y-2.5 text-sm">
            <li>• Une compagnie d'assurance</li>
            <li>• Un vendeur d'assurance</li>
            <li>• Le payeur de l'assistance décès (c'est NSIA)</li>
            <li>• Une mutuelle qui prélève sur les capitaux versés</li>
          </ul>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-6">
        {[
          { icon: Target, t: "Notre mission", d: "Offrir à chaque famille de la zone pilote un filet de sécurité financier digne, accessible et rapide en cas de décès d'un proche, en s'appuyant sur la robustesse d'un assureur agréé CIMA." },
          { icon: Eye, t: "Notre vision", d: "Devenir la première plateforme africaine de prévoyance communautaire numérique, pont structuré entre les populations, les associations et les assureurs." },
          { icon: Users, t: "Pour qui", d: "Particuliers de 18 à 70 ans, mais aussi associations, tontines, mutuelles villageoises, coopératives, organisations religieuses et syndicats de la zone de Daloa." },
          { icon: Shield, t: "Notre partenaire", d: "NSIA Assurances Côte d'Ivoire porte la garantie décès. NSIA valide les dossiers, verse l'assistance et garantit la solidité financière de l'engagement." },
          { icon: HandCoins, t: "Notre rémunération", d: "Une majoration transparente de 30 % intégrée dans la cotisation mensuelle, qui finance l'équipe, les délégués, l'infrastructure et la communication. Aucune commission sur les assistances NSIA." },
          { icon: Building2, t: "Les associations", d: "Lorsqu'un membre d'une association décède, NSIA verse l'assistance sur le compte Mobile Money de l'association, qui reverse 90 % à la famille (10 % de fonctionnement)." },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border bg-card p-6">
            <c.icon className="size-9 text-gold mb-4" />
            <h2 className="font-display font-bold text-xl">{c.t}</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.d}</p>
          </div>
        ))}
      </section>

      <section className="bg-muted/40 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-3xl">Daloa, notre zone pilote</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Tous les membres, associations et délégués MuNAF sont pour l'instant situés dans la région de
            Daloa, en Côte d'Ivoire. Une fois le modèle éprouvé sur cette zone pilote, MuNAF s'étendra
            progressivement aux autres régions du pays et de la sous-région.
          </p>
        </div>
      </section>
    </>
  );
}
