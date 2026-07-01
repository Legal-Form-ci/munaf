import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { useAlertes, useResolveAlerte, runNsiaReconcile } from "@/lib/api";
import { AlertTriangle, CheckCircle2, RefreshCw, Filter } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/alertes")({
  head: () => ({ meta: [{ title: "Alertes — MuNAF" }] }),
  component: () => <AppShell><Page /></AppShell>,
});

const SEVERITY_STYLE: Record<string, string> = {
  info: "bg-blue-100 text-blue-800 border-blue-300",
  warning: "bg-amber-100 text-amber-800 border-amber-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

const TYPE_LABEL: Record<string, string> = {
  drift_no_response: "Sans réponse NSIA",
  status_mismatch: "Écart de statut",
  api_failure: "Échec API NSIA",
  webhook_failure: "Échec webhook",
};

function Page() {
  const [showResolved, setShowResolved] = useState(false);
  const { data: alertes, isLoading, refetch } = useAlertes(!showResolved);
  const resolve = useResolveAlerte();
  const [reconciling, setReconciling] = useState(false);

  const runReconcile = async () => {
    setReconciling(true);
    try {
      const r = await runNsiaReconcile();
      toast.success(`${r.inserted ?? 0} nouvelle(s) alerte(s) créée(s)`);
      await refetch();
    } catch (e: any) { toast.error(e.message ?? "Erreur"); }
    finally { setReconciling(false); }
  };

  const counts = {
    total: alertes?.length ?? 0,
    critical: (alertes ?? []).filter((a: any) => a.severity === "critical").length,
    warning: (alertes ?? []).filter((a: any) => a.severity === "warning").length,
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
            <AlertTriangle className="size-6 text-amber-500" /> Alertes système
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Écarts détectés par le job de réconciliation NSIA et anomalies internes.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowResolved(!showResolved)}
            className="h-10 px-4 rounded-lg border text-sm font-medium flex items-center gap-2">
            <Filter className="size-4" /> {showResolved ? "Alertes ouvertes" : "Toutes (incl. résolues)"}
          </button>
          <button onClick={runReconcile} disabled={reconciling}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
            <RefreshCw className={`size-4 ${reconciling ? "animate-spin" : ""}`} /> Analyser
          </button>
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        <Kpi label="Total" value={counts.total} />
        <Kpi label="Critiques" value={counts.critical} tone="critical" />
        <Kpi label="Avertissements" value={counts.warning} tone="warning" />
      </div>

      <div className="rounded-xl border bg-card divide-y">
        {isLoading && <div className="p-6 text-center text-muted-foreground text-sm">Chargement…</div>}
        {!isLoading && counts.total === 0 && (
          <div className="p-10 text-center">
            <CheckCircle2 className="size-10 text-emerald-500 mx-auto mb-2" />
            <div className="font-semibold">Aucune alerte {showResolved ? "" : "ouverte"}</div>
            <p className="text-sm text-muted-foreground mt-1">La synchronisation NSIA fonctionne normalement.</p>
          </div>
        )}
        {(alertes ?? []).map((a: any) => (
          <div key={a.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-start gap-3">
            <div className={`shrink-0 text-xs font-bold px-2 py-1 rounded border ${SEVERITY_STYLE[a.severity] ?? SEVERITY_STYLE.info}`}>
              {a.severity.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{a.titre}</div>
              {a.message && <div className="text-sm text-muted-foreground mt-0.5">{a.message}</div>}
              <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-3">
                <span>{TYPE_LABEL[a.type] ?? a.type}</span>
                {a.dossiers?.numero && <span>Dossier <b>{a.dossiers.numero}</b></span>}
                <span>{new Date(a.created_at).toLocaleString("fr-FR")}</span>
                {a.resolue && <span className="text-emerald-700">✓ résolue</span>}
              </div>
            </div>
            {!a.resolue && (
              <button onClick={() => resolve.mutate(a.id)}
                className="shrink-0 h-9 px-3 rounded-lg border text-xs font-semibold hover:bg-muted flex items-center gap-1.5">
                <CheckCircle2 className="size-4" /> Marquer résolue
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "critical" | "warning" }) {
  const color = tone === "critical" ? "text-red-600" : tone === "warning" ? "text-amber-600" : "text-primary";
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs uppercase text-muted-foreground font-semibold">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
