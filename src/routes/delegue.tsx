import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/PublicLayout";
import { getMembers, getCotisations, formatFcfa } from "@/lib/mock-data";
import { MemberStatusBadge } from "@/components/StatusBadge";
import { UserPlus, Wallet, FileText, Upload, Users, MapPin } from "lucide-react";

export const Route = createFileRoute("/delegue")({
  head: () => ({ meta: [{ title: "Espace délégué — MuNAF" }] }),
  component: () => (
    <PublicLayout>
      <DelegueSpace />
    </PublicLayout>
  ),
});

function DelegueSpace() {
  const QUARTIER = "Tazibouo";
  const members = getMembers().filter((m) => m.quartier === QUARTIER);
  const cotisations = getCotisations()
    .filter((c) => members.some((m) => m.id === c.memberId))
    .slice(0, 6);
  const collecte = cotisations.filter((c) => c.statut === "réussi").reduce((s, c) => s + c.montant, 0);
  const enAttente = members.filter((m) => !m.cotisationsAJour).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div className="rounded-2xl bg-brand-gradient text-white p-6 md:p-8">
        <div className="text-gold text-xs uppercase tracking-wider font-semibold">Espace délégué</div>
        <h1 className="font-display font-bold text-2xl mt-1">Bonjour, Délégué Konan K.</h1>
        <div className="text-white/70 text-sm mt-1 flex items-center gap-1.5">
          <MapPin className="size-3.5" /> Quartier {QUARTIER} — Daloa
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Mes membres", v: members.length, c: "text-primary" },
          { l: "À jour", v: members.filter((m) => m.cotisationsAJour).length, c: "text-success" },
          { l: "En retard", v: enAttente, c: "text-destructive" },
          { l: "Collecté ce mois", v: formatFcfa(collecte), c: "text-gold" },
        ].map((k) => (
          <div key={k.l} className="rounded-2xl border bg-card p-5">
            <div className="text-xs text-muted-foreground">{k.l}</div>
            <div className={`text-2xl font-display font-bold mt-1 ${k.c}`}>{k.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: UserPlus, t: "Inscrire un membre" },
          { icon: Wallet, t: "Encaisser cotisation" },
          { icon: FileText, t: "Déclarer un décès" },
          { icon: Upload, t: "Uploader document" },
          { icon: Users, t: "Voir mes membres" },
        ].map((a) => (
          <button key={a.t} className="rounded-2xl border bg-card p-4 text-left hover:shadow-md transition-shadow">
            <a.icon className="size-6 text-gold mb-2" />
            <div className="text-sm font-medium">{a.t}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-display font-bold">Membres de {QUARTIER}</h2>
            <span className="text-xs text-muted-foreground">{members.length} membres</span>
          </div>
          <div className="divide-y max-h-[450px] overflow-y-auto">
            {members.slice(0, 12).map((m) => (
              <div key={m.id} className="p-3 flex items-center gap-3">
                <img src={m.photo} alt="" className="size-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.prenom} {m.nom}</div>
                  <div className="text-xs text-muted-foreground">{m.profession}</div>
                </div>
                <MemberStatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-display font-bold">Paiements récents</h2>
          </div>
          <div className="divide-y">
            {cotisations.map((c) => (
              <div key={c.id} className="p-3 flex items-center gap-3">
                <img src={c.memberPhoto} alt="" className="size-9 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.memberNom}</div>
                  <div className="text-xs text-muted-foreground">{c.mode} · {c.date}</div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{formatFcfa(c.montant)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">← Retour au site public</Link>
      </div>
    </div>
  );
}
