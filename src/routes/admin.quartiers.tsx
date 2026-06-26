import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useQuartiersStats } from "@/lib/api";
import { Loader2, MapPin } from "lucide-react";

export const Route = createFileRoute("/admin/quartiers")({
  head: () => ({ meta: [{ title: "Quartiers — MuNAF" }] }),
  component: () => (<AppShell><Page /></AppShell>),
});

function Page() {
  const { data, isLoading } = useQuartiersStats();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl">Quartiers & délégués</h1>
        <p className="text-sm text-muted-foreground">Répartition des membres par quartier — Daloa.</p>
      </div>
      {isLoading ? <Loader2 className="size-6 animate-spin mx-auto my-12 text-primary" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data ?? []).map((q) => (
            <div key={q.quartier} className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2"><MapPin className="size-4 text-primary" /><h3 className="font-display font-semibold">{q.quartier}</h3></div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div><div className="text-2xl font-display font-bold">{q.total}</div><div className="text-[10px] uppercase text-muted-foreground">Total</div></div>
                <div><div className="text-2xl font-display font-bold text-emerald-600">{q.actifs}</div><div className="text-[10px] uppercase text-muted-foreground">Actifs</div></div>
                <div><div className="text-2xl font-display font-bold text-slate-600">{q.decedes}</div><div className="text-[10px] uppercase text-muted-foreground">Décédés</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
