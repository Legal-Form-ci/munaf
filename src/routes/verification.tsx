import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { getMembers, STATUS_LABEL } from "@/lib/mock-data";
import { MemberStatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";

export const Route = createFileRoute("/verification")({
  head: () => ({ meta: [{ title: "Vérification publique — MuNAF" }] }),
  component: () => (
    <AppShell>
      <VerificationPage />
    </AppShell>
  ),
});

function VerificationPage() {
  const [q, setQ] = useState("");
  const members = getMembers();
  const matches = q.trim().length >= 3
    ? members.filter(
        (m) =>
          m.matricule.toLowerCase().includes(q.toLowerCase()) ||
          m.telephone.includes(q) ||
          `${m.prenom} ${m.nom}`.toLowerCase().includes(q.toLowerCase()),
      ).slice(0, 8)
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl bg-brand-gradient text-white p-8 text-center">
        <div className="inline-flex size-14 rounded-2xl bg-gold/20 text-gold items-center justify-center mb-4">
          <ShieldCheck className="size-7" />
        </div>
        <h1 className="text-2xl font-display font-bold">Portail public de vérification</h1>
        <p className="text-white/70 mt-2 text-sm max-w-md mx-auto">
          Vérifiez qu'un membre est enregistré et à jour de ses cotisations.
          Recherche par matricule ou numéro de téléphone.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <label className="text-sm font-medium block mb-2">Recherche</label>
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex. MNF-24-00042 ou +221 77 123 45 67"
            className="w-full h-12 pl-10 pr-3 rounded-xl bg-muted text-sm border border-transparent focus:border-ring focus:bg-card outline-none"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Saisissez au moins 3 caractères. Les informations sensibles ne sont jamais divulguées.
        </p>
      </div>

      {matches.length > 0 && (
        <div className="space-y-3">
          {matches.map((m) => (
            <div key={m.id} className="rounded-2xl border bg-card p-5 flex items-center gap-4">
              <img src={m.photo} alt="" className="size-14 rounded-full object-cover ring-2 ring-gold/40" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{m.prenom} {m.nom.charAt(0)}.</div>
                <div className="text-xs text-muted-foreground">
                  {m.village}, {m.region} · Matricule <code className="bg-muted px-1.5 py-0.5 rounded">{m.matricule}</code>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Statut : <strong className="text-foreground">{STATUS_LABEL[m.status]}</strong>
                </div>
              </div>
              <MemberStatusBadge status={m.status} />
            </div>
          ))}
        </div>
      )}

      {q.length >= 3 && matches.length === 0 && (
        <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Aucun membre trouvé pour « {q} ».
        </div>
      )}
    </div>
  );
}
