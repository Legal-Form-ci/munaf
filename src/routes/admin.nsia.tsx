import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useNsiaSync, useDossiers, useCreateNsiaSync, formatFcfa, DOSSIER_LABEL } from "@/lib/api";
import { RefreshCw, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/nsia")({
  head: () => ({ meta: [{ title: "Intégration NSIA — MuNAF" }] }),
  component: () => <AppShell><Page /></AppShell>,
});

function Page() {
  const { data: sync } = useNsiaSync();
  const { data: dossiers } = useDossiers();
  const createSync = useCreateNsiaSync();

  const aTransmettre = (dossiers ?? []).filter((d: any) => d.status === "valide");

  const transmettre = async (d: any) => {
    await createSync.mutateAsync({ type: "dossier_transmis", dossier_id: d.id, status: "success", payload: { numero: d.numero, montant: d.montant_assistance } });
    toast.success("Dossier transmis à NSIA");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl">Intégration NSIA</h1>
        <p className="text-sm text-muted-foreground">Transmission des dossiers, journal de synchronisation et statut de la connexion API.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border bg-card p-5"><div className="text-xs uppercase font-bold text-muted-foreground">Connexion API</div><div className="mt-2 flex items-center gap-2"><CheckCircle2 className="size-5 text-emerald-600" /><span className="font-display font-bold">Active</span></div><div className="text-xs text-muted-foreground mt-1">Environnement test</div></div>
        <div className="rounded-2xl border bg-card p-5"><div className="text-xs uppercase font-bold text-muted-foreground">À transmettre</div><div className="text-2xl font-display font-bold mt-1">{aTransmettre.length}</div></div>
        <div className="rounded-2xl border bg-card p-5"><div className="text-xs uppercase font-bold text-muted-foreground">Échanges (50 derniers)</div><div className="text-2xl font-display font-bold mt-1">{(sync ?? []).length}</div></div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2"><Send className="size-4 text-primary" /><h3 className="font-display font-semibold">Dossiers prêts à transmettre</h3></div>
        <div className="divide-y">
          {aTransmettre.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">Aucun dossier en attente.</div>}
          {aTransmettre.map((d: any) => (
            <div key={d.id} className="px-5 py-3 flex items-center justify-between">
              <div><div className="text-sm font-medium">{d.membres?.prenom} {d.membres?.nom}</div><div className="text-xs text-muted-foreground">{d.numero} · {formatFcfa(d.montant_assistance ?? 0)}</div></div>
              <button onClick={() => transmettre(d)} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2"><Send className="size-3" /> Transmettre</button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2"><RefreshCw className="size-4 text-primary" /><h3 className="font-display font-semibold">Journal de synchronisation</h3></div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase"><tr><th className="text-left px-4 py-2">Date</th><th className="text-left px-4 py-2">Type</th><th className="text-left px-4 py-2">Dossier</th><th className="text-left px-4 py-2">Statut</th><th className="text-left px-4 py-2">Message</th></tr></thead>
          <tbody className="divide-y">
            {(sync ?? []).map((s: any) => (
              <tr key={s.id}><td className="px-4 py-2 text-xs">{new Date(s.created_at).toLocaleString("fr-FR")}</td><td className="px-4 py-2">{s.type}</td><td className="px-4 py-2 font-mono text-xs">{s.dossiers?.numero ?? "—"}</td><td className="px-4 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{s.status}</span></td><td className="px-4 py-2 text-xs text-muted-foreground">{s.message ?? "—"}</td></tr>
            ))}
            {(sync ?? []).length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground text-sm">Journal vide.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
