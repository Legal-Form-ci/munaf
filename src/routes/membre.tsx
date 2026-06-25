import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { getMembers, getCotisations, formatFcfa, STATUS_LABEL } from "@/lib/mock-data";
import { MemberStatusBadge } from "@/components/StatusBadge";
import { Wallet, FileText, Bell, Download, Users, HeartPulse, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/membre")({
  head: () => ({ meta: [{ title: "Mon espace membre — MuNAF" }] }),
  component: () => (
    <PublicLayout>
      <MemberSpace />
    </PublicLayout>
  ),
});

function MemberSpace() {
  // Démo: on simule un membre connecté (le premier actif)
  const members = getMembers();
  const me = members.find((m) => m.status === "actif") ?? members[0];
  const cotisations = getCotisations().filter((c) => c.memberId === me.id).slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header card */}
      <div className="rounded-2xl bg-brand-gradient text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
        <img src={me.photo} alt="" className="size-20 rounded-2xl object-cover ring-4 ring-gold/30" />
        <div className="flex-1">
          <div className="text-gold text-xs uppercase tracking-wider font-semibold">Espace membre</div>
          <h1 className="font-display font-bold text-2xl mt-1">{me.prenom} {me.nom}</h1>
          <div className="text-white/70 text-sm mt-1">
            Matricule <code className="bg-white/10 px-2 py-0.5 rounded">{me.matricule}</code>
            {" "}· {me.quartier}, Daloa
          </div>
        </div>
        <div className="md:text-right">
          <MemberStatusBadge status={me.status} />
          <div className="text-xs text-white/60 mt-2">Formule {formatFcfa(me.formule)}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Wallet, t: "Cotiser", c: "bg-gold/15 text-gold" },
          { icon: FileText, t: "Déclarer décès", c: "bg-destructive/10 text-destructive" },
          { icon: Download, t: "Mes reçus", c: "bg-primary/10 text-primary" },
          { icon: Users, t: "Ayants droit", c: "bg-info/15 text-info" },
        ].map((a) => (
          <button key={a.t} className="rounded-2xl border bg-card p-4 hover:shadow-md transition-shadow text-left">
            <div className={`size-10 rounded-xl flex items-center justify-center ${a.c} mb-3`}>
              <a.icon className="size-5" />
            </div>
            <div className="font-medium text-sm">{a.t}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profil */}
        <div className="rounded-2xl border bg-card p-6 space-y-3">
          <h2 className="font-display font-bold">Mon profil</h2>
          {[
            ["Téléphone", me.telephone],
            ["Profession", me.profession],
            ["Âge", `${me.age} ans`],
            ["Association", me.association],
            ["Inscrit le", me.dateInscription],
            ["Fin de carence", me.dateFinCarence],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium text-right">{v}</span>
            </div>
          ))}
        </div>

        {/* Cotisations */}
        <div className="lg:col-span-2 rounded-2xl border bg-card">
          <div className="flex items-center justify-between p-5 border-b">
            <div>
              <h2 className="font-display font-bold">Mes cotisations</h2>
              <p className="text-xs text-muted-foreground">Total cotisé : <strong>{formatFcfa(me.totalCotise)}</strong></p>
            </div>
            <button className="text-sm text-primary hover:underline">Tout télécharger</button>
          </div>
          <div className="divide-y">
            {cotisations.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Aucune cotisation récente.</div>
            ) : cotisations.map((c) => (
              <div key={c.id} className="p-4 flex items-center gap-3">
                <div className="size-9 rounded-lg bg-muted flex items-center justify-center">
                  <Wallet className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{c.mode} · {c.reference}</div>
                  <div className="text-xs text-muted-foreground">{c.date}</div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{formatFcfa(c.montant)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ayants droit */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-display font-bold mb-4 flex items-center gap-2"><HeartPulse className="size-5 text-destructive" /> Mes ayants droit</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[me.ayantDroitPrincipal, me.ayantDroitSecondaire].map((a) => (
            <div key={a} className="rounded-xl border bg-muted/30 p-4 flex items-center gap-3">
              <div className="size-10 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold">
                {a.charAt(0)}
              </div>
              <div className="text-sm font-medium">{a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Bell className="size-5 text-info" /> Notifications</h2>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3"><ShieldCheck className="size-4 text-success mt-0.5" /> Votre période de carence est terminée. Vous êtes désormais protégé.</li>
          <li className="flex items-start gap-3"><Wallet className="size-4 text-gold mt-0.5" /> Prochaine échéance : le 30 du mois — {formatFcfa(me.primeAnnuelle / 12)}.</li>
          <li className="flex items-start gap-3"><Users className="size-4 text-info mt-0.5" /> Nouveau délégué dans votre quartier ({me.quartier}).</li>
        </ul>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">← Retour au site public</Link>
      </div>
    </div>
  );
}
