import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useParametres, useUpdateParametre } from "@/lib/api";
import { useState } from "react";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/parametres")({
  head: () => ({ meta: [{ title: "Paramètres — MuNAF" }] }),
  component: () => <AppShell><Page /></AppShell>,
});

function Page() {
  const { data } = useParametres();
  const up = useUpdateParametre();
  const [draft, setDraft] = useState<Record<string, any>>({});

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3"><Settings className="size-6 text-primary" /><div><h1 className="font-display font-bold text-2xl">Paramètres système</h1><p className="text-sm text-muted-foreground">Configuration globale de la plateforme (super-admin uniquement).</p></div></div>
      <div className="rounded-2xl border bg-card divide-y">
        {(data ?? []).map((p: any) => {
          const current = draft[p.cle] ?? JSON.stringify(p.valeur);
          return (
            <div key={p.cle} className="p-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="font-mono text-xs font-semibold">{p.cle}</div>
                {p.description && <div className="text-xs text-muted-foreground">{p.description}</div>}
              </div>
              <input value={current} onChange={(e) => setDraft({ ...draft, [p.cle]: e.target.value })} className="input w-48" />
              <button onClick={() => { try { const v = JSON.parse(current); up.mutate({ cle: p.cle, valeur: v }, { onSuccess: () => toast.success("Enregistré") }); } catch { toast.error("Valeur JSON invalide"); } }} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1"><Save className="size-3" /> OK</button>
            </div>
          );
        })}
        {(data ?? []).length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Aucun paramètre configuré.</div>}
      </div>
    </div>
  );
}
