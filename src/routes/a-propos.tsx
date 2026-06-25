import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Target, Eye, Users, Shield } from "lucide-react";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — MuNAF" },
      { name: "description", content: "Découvrez la mission, la vision et le modèle unique de la Mutuelle Numérique d'Assistance Familiale." },
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
          <h1 className="font-display font-bold text-4xl md:text-5xl">Démocratiser la prévoyance familiale en Afrique.</h1>
          <p className="mt-5 text-white/75 text-lg max-w-2xl">
            MuNAF est née d'un constat simple : à chaque décès, les familles s'épuisent
            financièrement et émotionnellement à organiser des collectes d'urgence.
            Nous avons décidé d'inverser cette logique.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-6">
        {[
          { icon: Target, t: "Notre mission", d: "Offrir à chaque famille africaine un filet de sécurité financier digne, accessible et rapide en cas de décès d'un proche." },
          { icon: Eye, t: "Notre vision", d: "Devenir la première plateforme africaine de prévoyance communautaire connectée, pont entre les populations et les assureurs agréés." },
          { icon: Users, t: "Notre modèle", d: "Une mutuelle numérique adossée à des associations, des délégués de quartier et des partenaires assureurs CIMA. 100% Mobile Money." },
          { icon: Shield, t: "Notre différence", d: "Contrairement à une assurance classique : pas de paperasse, pas de visite médicale, pas de bénéfices sur le capital. Juste la solidarité, en mieux." },
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
          <h2 className="font-display font-bold text-3xl">Daloa, notre laboratoire</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Nous avons choisi la région du Haut-Sassandra comme zone pilote.
            1 000 premiers membres, 22 quartiers et sous-préfectures couverts, un réseau de délégués locaux.
            Une fois le modèle éprouvé à Daloa, MuNAF s'étendra à toute la Côte d'Ivoire, puis à la sous-région.
          </p>
        </div>
      </section>
    </>
  );
}
