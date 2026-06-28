import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { Building2, Users, Upload, HandCoins, FileText, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/associations")({
  head: () => ({
    meta: [
      { title: "Associations & mutuelles — MuNAF" },
      { name: "description", content: "Tontines, mutuelles villageoises, coopératives, organisations religieuses et syndicats de la région de Daloa : gérez la prévoyance décès de tous vos membres sur un seul tableau de bord, avec NSIA Assurances." },
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
          <div className="text-gold text-xs uppercase tracking-widest font-bold mb-3">Associations & mutuelles</div>
          <h1 className="font-display font-bold text-4xl md:text-5xl">Une seule plateforme pour toute votre communauté.</h1>
          <p className="mt-5 text-white/75 text-lg max-w-2xl">
            Tontines, mutuelles villageoises, coopératives, associations religieuses, syndicats : inscrivez
            votre organisation et offrez à tous vos membres la garantie décès NSIA, en un seul tableau de bord.
          </p>
        </div>
      </section>

      {/* Le principe */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-6">
          <Building2 className="size-9 text-gold mb-4" />
          <h2 className="font-display font-bold text-xl">Le compte association</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Votre association crée un <strong>compte organisation</strong> qui devient le compte principal.
            Depuis ce compte, l'administrateur voit et gère tous les membres affiliés, leurs cotisations et
            leurs dossiers, en un clic.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <HandCoins className="size-9 text-gold mb-4" />
          <h2 className="font-display font-bold text-xl">Le mécanisme 90 / 10</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            En cas de décès, NSIA verse l'assistance sur le <strong>Mobile Money de l'association</strong>.
            L'association retient <strong>10 %</strong> pour son fonctionnement et reverse <strong>90 %</strong> à
            la famille. Tout est tracé sur la plateforme. <strong>MuNAF ne prélève rien.</strong>
          </p>
        </div>
      </section>

      {/* Documents à fournir */}
      <section className="bg-muted/40 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display font-bold text-2xl mb-8">Inscription de votre association — informations à fournir</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Nom officiel de l'association ou de la mutuelle",
              "Type d'organisation (tontine, mutuelle villageoise, coopérative, religieuse, syndicat…)",
              "Localité principale et zones couvertes (région de Daloa)",
              "Nom, téléphone et photo CNI du responsable principal",
              "Nom et téléphone du responsable financier",
              "Numéro Mobile Money de l'association (compte de versement NSIA)",
              "Statuts ou document officiel de l'association (PDF ou photo)",
              "Liste initiale des membres (un par un ou import CSV/Excel)",
            ].map((p) => (
              <div key={p} className="flex items-start gap-3 bg-card rounded-xl border p-4">
                <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                <span className="text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modes d'inscription des membres */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-display font-bold text-2xl mb-8 text-center">4 façons d'enregistrer vos membres</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, t: "Auto-inscription", d: "Chaque membre s'inscrit lui-même en ligne et est rattaché à votre association via un code." },
            { icon: ShieldCheck, t: "Par un délégué", d: "Un délégué local MuNAF inscrit le membre depuis le terrain lors d'une rencontre physique." },
            { icon: Building2, t: "Par l'association", d: "L'administrateur de l'association saisit les informations depuis son tableau de bord." },
            { icon: Upload, t: "Import groupé", d: "Importez la liste complète de vos membres via un fichier CSV ou Excel, en un seul fichier." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border bg-card p-5">
              <c.icon className="size-7 text-primary mb-3" />
              <div className="font-display font-bold">{c.t}</div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ce que l'admin association peut faire */}
      <section className="bg-muted/40 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display font-bold text-2xl mb-8">Votre espace administrateur d'association</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Vue d'ensemble : nombre de membres, cotisations à jour, dossiers en cours",
              "Liste complète et fiche détaillée de chaque membre de l'association",
              "Enregistrement de nouveaux membres (un par un ou import groupé)",
              "Suivi des cotisations mensuelles de chaque membre",
              "Relance automatique des membres en retard",
              "Déclaration et suivi des dossiers décès des membres",
              "Traçabilité du versement NSIA et du reversement 90 % à la famille",
              "Export PDF ou CSV pour la comptabilité de l'association",
            ].map((p) => (
              <div key={p} className="flex items-start gap-3 bg-card rounded-xl border p-4">
                <FileText className="size-5 text-gold shrink-0 mt-0.5" />
                <span className="text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schéma versement */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-display font-bold text-2xl mb-8 text-center">Versement d'une assistance — étape par étape</h2>
        <div className="space-y-4">
          {[
            { n: 1, t: "Décès déclaré", d: "L'admin de l'association (ou un ayant droit, ou un délégué) déclare le décès et joint les pièces obligatoires : acte de décès, CNI du défunt, CNI du bénéficiaire, photo du défunt." },
            { n: 2, t: "Validation MuNAF", d: "Un administrateur MuNAF vérifie la complétude du dossier et le transmet à NSIA via API sécurisée." },
            { n: 3, t: "Validation & versement NSIA", d: "NSIA Assurances Côte d'Ivoire valide le dossier et verse l'assistance sur le compte Mobile Money de l'association sous 72 h." },
            { n: 4, t: "Reversement 90 / 10", d: "L'association retient 10 % pour son fonctionnement et reverse 90 % à la famille du défunt. Le reversement est tracé sur la plateforme." },
          ].map((s) => (
            <div key={s.n} className="grid grid-cols-[auto_1fr] gap-5 rounded-2xl border bg-card p-5">
              <div className="size-12 rounded-xl bg-gold-gradient text-primary font-display font-bold text-lg flex items-center justify-center shrink-0">
                {s.n}
              </div>
              <div>
                <div className="font-display font-bold">{s.t}</div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-brand-gradient text-white p-10 md:p-14 text-center">
          <h2 className="font-display font-bold text-2xl md:text-3xl">Inscrivez votre association sur MuNAF</h2>
          <p className="text-white/75 mt-3 max-w-xl mx-auto">
            Donnez à tous vos membres la garantie décès NSIA, sans paperasse et avec une transparence totale.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="px-6 py-3.5 rounded-xl bg-gold text-primary font-semibold hover:bg-gold/90 inline-flex items-center gap-2">
              Demander l'inscription <ArrowRight className="size-4" />
            </Link>
            <Link to="/comment-ca-marche" className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 font-medium">
              Voir le fonctionnement
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
